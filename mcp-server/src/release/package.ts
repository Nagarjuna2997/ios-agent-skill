/** Local immutable packages. No Apple, AI, browser or network client is imported. */
import { mkdir, lstat, readFile, writeFile, rename, rm, realpath, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { analyzeApp, canonical, digest, Options, AppModelSchema } from './model.js';
import { VERSION } from '../version.js';
const files = ['app-model.json', 'requirements.json', 'questions.json', 'change-plan.json', 'manifest.json'];
async function directory(p: string) { try {
    const s = await lstat(p);
    if (!s.isDirectory() || s.isSymbolicLink())
        throw Error('Unsafe release directory');
}
catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
        throw e;
    await mkdir(p, { mode: 0o700 });
} }
async function regular(p: string) { const s = await lstat(p); if (!s.isFile() || s.isSymbolicLink() || s.size > 16 * 1024 * 1024)
    throw Error('Unsafe package artifact'); return readFile(p, 'utf8'); }
export async function verifyPackage(dir: string) {
    const s = await lstat(dir);
    if (!s.isDirectory() || s.isSymbolicLink())
        throw Error('Unsafe package directory');
    const integrity = JSON.parse(await regular(join(dir, 'integrity.json')));
    if (canonical(Object.keys(integrity).sort()) !== canonical([...files].sort()))
        throw Error('Invalid package integrity manifest');
    for (const f of files)
        if (digest(await regular(join(dir, f))) !== integrity[f])
            throw Error('Package evidence changed; preserve it for inspection and use a new release directory.');
    const model = JSON.parse(await regular(join(dir, 'app-model.json'))), manifest = JSON.parse(await regular(join(dir, 'manifest.json')));
    if (model.schemaVersion !== 1 || manifest.packageSchemaVersion !== 1 || digest(canonical(model)) !== manifest.appModelHash)
        throw Error('Invalid release package schema or model hash');
    AppModelSchema.parse(model);
    const {generatedAt: _at, semanticHash, ...semantic}=manifest;
    if(digest(canonical(semantic))!==semanticHash)throw Error('Invalid semantic manifest hash');
    return { model, manifest, integrity };
}
export async function prepareRelease(options: Options) {
    const analysis = await analyzeApp(options), root = await realpath(resolve(options.root));
    const local = join(root, '.ios-agent'), releases = join(local, 'releases');
    await directory(local);
    await directory(releases);
    const lock = join(releases, '.prepare-lock');
    try {
        await mkdir(lock, { mode: 0o700 });
    }
    catch {
        throw Error('Preparation already locked. If interrupted, inspect and remove .ios-agent/releases/.prepare-lock before resuming.');
    }
    let stage: string | undefined;
    try {
        const ignore = join(releases, '.gitignore');
        try {
            if ((await regular(ignore)) !== '*\n')
                throw Error('Release ignore file differs; refusing to write private artifacts.');
        }
        catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
                throw e;
            await writeFile(ignore, '*\n', { flag: 'wx', mode: 0o600 });
        }
        let revision: string | null = null;
        try {
            const r = await promisify(execFile)('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: root, timeout: 2000, maxBuffer: 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
            if (/^[a-f0-9]{40,64}$/.test(r.stdout.trim()))
                revision = r.stdout.trim();
        }
        catch { /* An untracked project still produces a package. */ }
        const modelHash = digest(canonical(analysis.model));
        const implementationHash=digest((await Promise.all(['./model.js','./package.js','./project.js','../analyzers/launch-screen.js'].map(p=>readFile(new URL(p,import.meta.url))))).map(b=>digest(b)).join(':'));
        const identity = { protocol: 1, implementationHash, sourceFingerprint: analysis.sourceFingerprint, modelHash, tool: VERSION, revision };
        const releaseId = 'local-' + digest(canonical(identity)).slice(0, 24), dest = join(releases, releaseId);
        try {
            await lstat(dest);
            const saved = await verifyPackage(dest);
            return { releaseId, path: dest, status: saved.manifest.status, reused: true, reusedSections: Object.keys(analysis.model.sectionHashes), model: analysis.model, questions: analysis.questions };
        }
        catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
                throw e;
        }
        // Reuse is evidence-level, not skipping input verification. Preserve unrelated stage objects.
        const reusedSections: string[] = [];
        const prior = (await readdir(releases)).filter(n => /^local-[a-f0-9]{24}$/.test(n)).sort();
        for (const name of prior) {
            const prev = await verifyPackage(join(releases, name));
            if (canonical(prev.model.selection) !== canonical(analysis.model.selection))
                continue;
            for (const [section, hash] of Object.entries(analysis.model.sectionHashes))
                if (prev.model.sectionHashes[section] === hash && !reusedSections.includes(section))
                    reusedSections.push(section);
        }
        // A second collection prevents packaging evidence from inputs changed during preparation.
        if ((await analyzeApp(options)).sourceFingerprint !== analysis.sourceFingerprint)
            throw Error('Project changed during analysis; rerun preparation.');
        const manifest = { packageSchemaVersion: 1, appModelSchemaVersion: 1, releaseId, selection: analysis.model.selection, identity: analysis.model.claims.filter(c => ['bundleIdentifier', 'version', 'build'].includes(c.id)), sourceFingerprint: analysis.sourceFingerprint, repositoryRevision: revision, tools: { iosAgent: VERSION, implementationHash, node: process.version, xcode: 'NOT_CHECKED', swift: 'NOT_CHECKED' }, generatedAt: new Date().toISOString(), appModelHash: modelHash, sectionHashes: analysis.model.sectionHashes, evidenceHashes: Object.fromEntries(analysis.model.evidence.map(e => [e.id, e.sha256])), unresolvedBlockers: [...analysis.questions.filter(q => q.priority === 1).map(q => q.id), ...analysis.model.claims.filter(c => c.id.startsWith('launch-finding:')).map(c => c.id)], status: analysis.model.status === 'BLOCKED' ? 'BLOCKED' : 'DRAFT_LOCAL_ONLY', remoteState: 'NOT_CHECKED', buildTestsSigning: 'NOT_CHECKED' };
        const { generatedAt: _timestamp, ...semanticManifest } = manifest;
        const manifestWithHash = { ...manifest, semanticHash: digest(canonical(semanticManifest)) };
        const artifacts: Record<string, unknown> = { 'app-model.json': analysis.model, 'requirements.json': analysis.requirements, 'questions.json': analysis.questions, 'change-plan.json': analysis.changePlan, 'manifest.json': manifestWithHash };
        stage = join(releases, '.staging-' + randomUUID());
        await mkdir(stage, { mode: 0o700 });
        for (const dir of ['metadata', 'privacy', 'review', 'icons', 'screenshots', 'screenshots/raw', 'screenshots/composed', 'validation', 'evidence', 'approvals', 'operations'])
            await mkdir(join(stage, dir), { recursive: true, mode: 0o700 });
        const integrity: Record<string, string> = {};
        for (const [f, v] of Object.entries(artifacts)) {
            const content = canonical(v) + '\n';
            await writeFile(join(stage, f), content, { flag: 'wx', mode: 0o600 });
            integrity[f] = digest(content);
        }
        await writeFile(join(stage, 'integrity.json'), canonical(integrity) + '\n', { flag: 'wx', mode: 0o600 });
        await rename(stage, dest);
        stage = undefined;
        await verifyPackage(dest);
        return { releaseId, path: dest, status: manifest.status, reused: false, reusedSections: reusedSections.sort(), model: analysis.model, questions: analysis.questions };
    }
    finally {
        if (stage)
            await rm(stage, { recursive: true, force: true });
        await rm(lock, { recursive: true, force: true });
    }
}
export async function appleCLI(args: string[]) {
    const command = args.shift();
    if (!['analyze', 'prepare'].includes(command || ''))
        throw Error('Usage: ios-agent-mcp apple analyze|prepare --project ROOT [--xcodeproj FILE] [--workspace FILE] [--target NAME] [--configuration Release] [--prompt TEXT] [--json]');
    const options: Options = { root: process.cwd() };
    let json = false;
    const keys: Record<string, keyof Options> = { '--project': 'root', '--xcodeproj': 'project', '--workspace': 'workspace', '--target': 'target', '--configuration': 'configuration', '--prompt': 'prompt' };
    while (args.length) {
        const a = args.shift()!;
        if (a === '--json') {
            json = true;
            continue;
        }
        if (!keys[a] || !args.length || args[0]!.startsWith('--'))
            throw Error('Unknown option or missing argument');
        options[keys[a]!] = args.shift()!;
    }
    const result = command === 'prepare' ? await prepareRelease(options) : await analyzeApp(options);
    if (json)
        console.log(canonical(result));
    else {
        console.log('TARGET ' + (result.model.selection.target || 'NEEDS SELECTION') + ' / ' + result.model.selection.configuration);
        console.log('STATUS ' + result.model.status);
        for (const c of result.model.claims.filter(c => ['bundleIdentifier', 'version', 'build', 'info-plist', 'launch-screen', 'app-icon-name'].includes(c.id)))
            console.log(c.status + ' ' + c.id + ': ' + (c.value ?? 'not established'));
        console.log('INFERRED ' + result.model.features.length + ' API-based feature candidates; ' + result.model.screens.length + ' screen candidates. Runtime NOT CHECKED.');
        if ('releaseId' in result)
            console.log((result.reused ? 'REUSED' : 'GENERATED') + ' local package: ' + result.path);
        for (const q of result.questions)
            console.log('NEEDS CONFIRMATION [' + q.priority + '] ' + q.question);
        console.log('Build/signing NOT CHECKED. No credentials, AI provider or remote changes.');
    }
    if (result.model.status === 'BLOCKED')
        process.exitCode = 2;
}
