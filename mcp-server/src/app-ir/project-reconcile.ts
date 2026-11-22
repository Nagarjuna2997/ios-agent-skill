// Review three bounded local project trees. Never invoke a project build or edit an input.
import { constants as flags } from 'node:fs';
import { lstat, mkdir, mkdtemp, open, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sha256 } from './schema.js';
const run = promisify(execFile);
const privateNames = /^(?:\.env(?:\..*)?|Secrets\.xcconfig|credentials\.json|GoogleService-Info\.plist|google-services\.json|id_(?:rsa|dsa|ecdsa|ed25519)|\.npmrc|\.netrc|\.pypirc|\.ssh|\.aws|\.gnupg|\.keychain)$|\.(?:p12|p8|pem|key|pfx|keychain-db|mobileprovision|provisionprofile)$/i;
const ignored = new Set(['.git', '.svn', '.DS_Store', '.build', 'build', 'DerivedData', 'node_modules', 'xcuserdata', 'Pods', 'Carthage']);
const metadata = new Set(['spec.json', 'plan.json', 'app-ir.json', 'source-map.json']);
type File = {
    bytes: Buffer;
    mode: number;
};
export type Tree = Map<string, File>;
type Change = 'unchanged' | 'keep-local' | 'use-generated' | 'converged' | 'merged' | 'invalidate-source-map' | 'conflict';
type FileChange = {
    path: string;
    change: Change;
    base: string | null;
    local: string | null;
    generated: string | null;
    candidate: string | null;
};
function fingerprint(f?: File) { return f ? sha256(Buffer.concat([Buffer.from(f.mode + ':'), f.bytes])) : null; }
const sorted = (paths: Iterable<string>) => [...paths].sort();
export function projectTreeHash(files: Tree) {
    return sha256(JSON.stringify(sorted(files.keys()).map(p => [p, fingerprint(files.get(p))])));
}
// Exclude credentials and build products regardless of which input tree supplied them.
export async function readProjectTree(directory: string): Promise<Tree> {
    if (!(await lstat(directory)).isDirectory())
        throw Error('Project root must be a directory, not a symlink');
    const root = await realpath(directory), files: Tree = new Map();
    let total = 0, entries = 0;
    async function walk(dir: string, prefix: string) {
        const names = new Set<string>();
        for (const name of sorted(await readdir(dir))) {
            if (++entries > 10000 || prefix.length > 900)
                throw Error('Project exceeds path or entry limit');
            if (ignored.has(name) || (privateNames.test(name) && name !== '.env.example') || (prefix === '.ios-agent/' && !metadata.has(name)))
                continue;
            if (/[\\:\x00-\x1f\x7f]/.test(name))
                throw Error('Unsupported project filename');
            const folded = name.normalize('NFC').toLowerCase();
            if (names.has(folded))
                throw Error('Project contains ambiguous filenames');
            names.add(folded);
            const path = prefix + name, full = join(dir, name), stat = await lstat(full);
            if (stat.isSymbolicLink() || await realpath(full) !== full)
                throw Error('Project refuses symlink: ' + path);
            if (stat.isDirectory()) {
                await walk(full, path + '/');
                continue;
            }
            if (!stat.isFile() || stat.size > 8 * 1024 * 1024 || files.size >= 1500 || (total += stat.size) > 32 * 1024 * 1024)
                throw Error('Project exceeds source file/size limits or contains a special file');
            const handle = await open(full, flags.O_RDONLY | flags.O_NOFOLLOW);
            try {
                const before = await handle.stat();
                if (before.ino !== stat.ino || before.dev !== stat.dev || before.size !== stat.size)
                    throw Error('File changed during snapshot: ' + path);
                const bytes = await handle.readFile();
                const after = await handle.stat();
                if (bytes.length !== stat.size || after.mtimeMs !== before.mtimeMs)
                    throw Error('File changed during snapshot: ' + path);
                files.set(path, { bytes, mode: (before.mode & 0o111) ? 0o755 : 0o644 });
            }
            finally {
                await handle.close();
            }
        }
    }
    await walk(root, '');
    return files;
}
export async function writeProjectTree(files: Tree, directory: string) {
    await mkdir(directory, { recursive: false });
    try {
        for (const [path, f] of files) {
            if (!path || path.split('/').some(part => !part || part === '.' || part === '..' || /[\\:\x00-\x1f]/.test(part)))
                throw Error('Unsafe project snapshot path');
            const target = join(directory, path);
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, f.bytes, { flag: 'wx', mode: f.mode });
        }
    }
    catch (error) {
        await rm(directory, { recursive: true, force: true });
        throw error;
    }
}
function text(f?: File): string | null {
    if (!f || f.bytes.length > 256 * 1024 || f.bytes.includes(0))
        return null;
    try {
        return new TextDecoder('utf8', { fatal: true }).decode(f.bytes);
    }
    catch {
        return null;
    }
}
async function mergeSwift(base: File, local: File, next: File): Promise<File | undefined> {
    if (base.mode !== local.mode || base.mode !== next.mode || [base, local, next].some(f => text(f) === null))
        return;
    const dir = await mkdtemp(join(tmpdir(), 'ios-revision-'));
    try {
        for (const [name, f] of [['base', base], ['local', local], ['next', next]] as const)
            await writeFile(join(dir, name), f.bytes);
        try {
            const { stdout } = await run('git', ['merge-file', '-p', '--', 'local', 'base', 'next'], { cwd: dir, encoding: 'buffer', timeout: 10000, maxBuffer: 1024 * 1024 });
            return { bytes: stdout, mode: base.mode };
        }
        catch (error) {
            const code = (error as {
                code?: number;
            }).code;
            if (typeof code === 'number' && code > 0 && code <= 127)
                return;
            throw Error('Could not run git merge-file for Swift source');
        }
    }
    finally {
        await rm(dir, { recursive: true, force: true });
    }
}
export async function reviewTrees(base: Tree, local: Tree, generated: Tree) {
    const files: FileChange[] = [], candidate: Tree = new Map();
    for (const path of sorted(new Set([...base.keys(), ...local.keys(), ...generated.keys()]))) {
        const b = base.get(path), l = local.get(path), n = generated.get(path);
        const bh = fingerprint(b), lh = fingerprint(l), nh = fingerprint(n);
        let value: File | undefined, change: Change;
        if (lh === nh) {
            value = l;
            change = lh === bh ? 'unchanged' : 'converged';
        }
        else if (lh === bh) {
            value = n;
            change = 'use-generated';
        }
        else if (nh === bh) {
            value = l;
            change = 'keep-local';
        }
        else {
            value = b && l && n && path.endsWith('.swift') ? await mergeSwift(b, l, n) : undefined;
            change = value ? 'merged' : 'conflict';
        }
        files.push({ path, change, base: bh, local: lh, generated: nh, candidate: fingerprint(value) });
        if (value)
            candidate.set(path, value);
    }
    const mapPath = '.ios-agent/source-map.json', mapFile = candidate.get(mapPath);
    if (mapFile) {
        const map = JSON.parse(mapFile.bytes.toString('utf8'));
        if (!Array.isArray(map.files))
            throw Error('Invalid generated source map');
        const valid = map.files.filter((record: {
            path: string;
            sha256: string;
        }) => {
            const source = candidate.get(record.path);
            return source && sha256(source.bytes) === record.sha256;
        });
        if (valid.length !== map.files.length) {
            const replacement = { ...mapFile, bytes: Buffer.from(JSON.stringify({ ...map, files: valid }, null, 2) + '\n') };
            candidate.set(mapPath, replacement);
            const entry = files.find(file => file.path === mapPath)!;
            entry.change = 'invalidate-source-map';
            entry.candidate = fingerprint(replacement);
        }
    }
    // A case/Unicode collision or a file colliding with a directory can emerge only after combining trees.
    const nodeTypes = new Map<string, {
        name: string;
        leaf: boolean;
    }>();
    for (const path of candidate.keys()) {
        const parts = path.split('/');
        for (let i = 1; i <= parts.length; i++) {
            const name = parts.slice(0, i).join('/'), key = name.normalize('NFC').toLowerCase(), leaf = i === parts.length, prev = nodeTypes.get(key);
            if (prev && (prev.name !== name || prev.leaf !== leaf))
                throw Error('Conflicting output paths: ' + prev.name + ' and ' + name);
            nodeTypes.set(key, { name, leaf });
        }
    }
    const blockers = files.filter(f => f.change === 'conflict').map(f => f.path);
    const inputs = { base: projectTreeHash(base), local: projectTreeHash(local), generated: projectTreeHash(generated) };
    const reviewId = sha256(JSON.stringify({ version: 1, inputs, files }));
    return { report: { version: 1, reviewId, inputs, files, blockers, status: blockers.length ? 'conflict' : 'requires-review' }, candidate };
}
export async function reviewProjectDirectories(base: string, local: string, next: string) {
    const dirs = [base, local, next];
    const trees = await Promise.all(dirs.map(readProjectTree));
    const [b, l, n] = trees as [
        Tree,
        Tree,
        Tree
    ];
    return { ...await reviewTrees(b, l, n), base: b, local: l, generated: n };
}
export function reviewProjectFile(review: Awaited<ReturnType<typeof reviewProjectDirectories>>, path: string) {
    const entry = review.report.files.find(f => f.path === path);
    if (!entry)
        throw Error('Unknown review file');
    return { entry, base: text(review.base.get(path)), local: text(review.local.get(path)), generated: text(review.generated.get(path)), candidate: text(review.candidate.get(path)) };
}
export async function applyReviewedProject(review: Awaited<ReturnType<typeof reviewProjectDirectories>>, approval: string, out: string, inputDirs: string[]) {
    if (approval !== review.report.reviewId)
        throw Error('Stale approval. Review the current project files again.');
    if (review.report.blockers.length)
        throw Error('Resolve conflicting paths before applying a project revision');
    const parent = await realpath(dirname(resolve(out)));
    const target = join(parent, basename(resolve(out)));
    for (const input of inputDirs) {
        const root = await realpath(input);
        if (target === root || target.startsWith(root + sep))
            throw Error('Use a new project directory outside all inputs');
    }
    await writeProjectTree(review.candidate, target);
    return { directory: target, reviewId: approval, status: 'applied-unverified', files: review.candidate.size };
}
