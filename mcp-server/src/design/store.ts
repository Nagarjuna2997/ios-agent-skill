// Project-local storage for design contracts.
//
//   <project>/.ios-agent/design/<id>/          durable, suitable for version control
//     DESIGN.json  DESIGN.md  workflow.json  verification.json  revisions/<n>.json
//   <project>/.ios-agent/design-private/<id>/  private execution state, gitignored, 0o700
//     runs/<runId>/  request packages, raw reviewer output, logs, metrics
//
// Writes are atomic (temp file + rename) and serialised per design by a lock file that
// is never stolen from a live writer. Reads refuse symlinks and oversized files.
import { mkdir, lstat, readFile, open, rename, rm, readdir, realpath } from "node:fs/promises";
import { join, isAbsolute, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { DESIGN_ID } from "./contract.js";

export const DESIGN_DIR = "design";
export const PRIVATE_DIR = "design-private";
const MAX_FILE_BYTES = 2_000_000;
const DEFAULT_KEEP_REVISIONS = 20;
const DEFAULT_KEEP_RUNS = 10;

export function requireProjectDir(dir: string): string {
  if (!dir || !isAbsolute(dir)) throw new Error("projectDir must be an absolute path.");
  const root = resolve(dir);
  if (root === sep || root.split(sep).filter(Boolean).length < 2) throw new Error("projectDir is too broad; choose a dedicated folder for the app.");
  return root;
}

export function requireDesignId(id: string): string {
  if (!DESIGN_ID.test(id)) throw new Error(`Invalid design id ${JSON.stringify(id)}: use a lowercase slug such as "offline-sync".`);
  return id;
}

async function safeDir(path: string, mode: number): Promise<void> {
  await mkdir(path, { recursive: true, mode });
  const st = await lstat(path);
  if (st.isSymbolicLink() || !st.isDirectory()) throw new Error(`Unsafe state directory: ${path}`);
}

async function readBounded(path: string): Promise<string | undefined> {
  try {
    const st = await lstat(path);
    if (st.isSymbolicLink() || !st.isFile()) throw new Error(`Unsafe state file: ${path}`);
    if (st.size > MAX_FILE_BYTES) throw new Error(`State file exceeds ${MAX_FILE_BYTES} bytes: ${path}`);
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function atomicWrite(path: string, text: string, mode = 0o644): Promise<void> {
  if (Buffer.byteLength(text) > MAX_FILE_BYTES) throw new Error(`Refusing to write more than ${MAX_FILE_BYTES} bytes to ${path}`);
  const temp = `${path}.${randomUUID()}.tmp`;
  const handle = await open(temp, "wx", mode);
  try {
    await handle.writeFile(text);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temp, path);
  } finally {
    await rm(temp, { force: true });
  }
}

export interface DesignPaths {
  root: string;
  id: string;
  durable: string;
  privateRoot: string;
  privateDir: string;
  contract: string;
  markdown: string;
  workflow: string;
  verification: string;
  revisions: string;
  runs: string;
  lock: string;
}

export function designPaths(projectDir: string, id: string): DesignPaths {
  const root = requireProjectDir(projectDir);
  requireDesignId(id);
  const durable = join(root, ".ios-agent", DESIGN_DIR, id);
  const privateRoot = join(root, ".ios-agent", PRIVATE_DIR);
  const privateDir = join(privateRoot, id);
  return {
    root, id, durable, privateRoot, privateDir,
    contract: join(durable, "DESIGN.json"),
    markdown: join(durable, "DESIGN.md"),
    workflow: join(durable, "workflow.json"),
    verification: join(durable, "verification.json"),
    revisions: join(durable, "revisions"),
    runs: join(privateDir, "runs"),
    lock: join(privateDir, "lock"),
  };
}

export class DesignStore {
  readonly paths: DesignPaths;
  constructor(projectDir: string, id: string) {
    this.paths = designPaths(projectDir, id);
  }

  /** Create directories and the private .gitignore. Idempotent. */
  async prepare(): Promise<void> {
    const p = this.paths;
    await safeDir(join(p.root, ".ios-agent"), 0o755);
    await safeDir(p.durable, 0o755);
    await safeDir(p.revisions, 0o755);
    await safeDir(p.privateRoot, 0o700);
    await safeDir(p.privateDir, 0o700);
    await safeDir(p.runs, 0o700);
    const ignore = join(p.privateRoot, ".gitignore");
    const handle = await open(ignore, "wx", 0o600).catch((e: NodeJS.ErrnoException) => { if (e.code !== "EEXIST") throw e; return null; });
    if (handle) { try { await handle.writeFile("*\n"); } finally { await handle.close(); } }
    else {
      const text = (await readBounded(ignore)) ?? "";
      if (!text.split(/\r?\n/).includes("*")) throw new Error(`Add "*" to ${ignore} before storing private review state.`);
    }
  }

  async exists(): Promise<boolean> {
    return (await readBounded(this.paths.contract)) !== undefined;
  }

  async readJSON<T>(file: string): Promise<T | undefined> {
    const text = await readBounded(file);
    if (text === undefined) return undefined;
    try { return JSON.parse(text) as T; }
    catch { throw new Error(`Corrupt JSON in ${file}; preserve it for diagnosis and restore from revisions/ or re-create the design.`); }
  }

  async writeJSON(file: string, value: unknown, mode = 0o644): Promise<void> {
    await atomicWrite(file, JSON.stringify(value, null, 2) + "\n", mode);
  }

  async writeText(file: string, text: string, mode = 0o644): Promise<void> {
    await atomicWrite(file, text, mode);
  }

  /**
   * Run `fn` while holding the design's lock. A lock whose owner has exited is reported,
   * not stolen; the caller decides whether to remove it after diagnosis.
   */
  async locked<T>(fn: () => Promise<T>): Promise<T> {
    await this.prepare();
    const lock = this.paths.lock;
    let handle: Awaited<ReturnType<typeof open>> | undefined;
    for (let i = 0; i < 150; i++) {
      try { handle = await open(lock, "wx", 0o600); break; }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        await new Promise((r) => setTimeout(r, 20));
      }
    }
    if (!handle) {
      const owner = await readBounded(lock).catch(() => undefined);
      throw new Error(`Design ${this.paths.id} is busy (lock held by ${owner?.trim() || "unknown"}). If that writer crashed, remove ${lock} after confirming the process has exited.`);
    }
    try {
      await handle.writeFile(JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
      return await fn();
    } finally {
      await handle.close();
      await rm(lock, { force: true });
    }
  }

  /** Snapshot a revision of the contract into revisions/, pruning the oldest beyond the bound. */
  async snapshotRevision(revision: number, text: string, keep = DEFAULT_KEEP_REVISIONS): Promise<void> {
    await atomicWrite(join(this.paths.revisions, `${revision}.json`), text);
    const names = (await readdir(this.paths.revisions)).filter((n) => /^[0-9]+\.json$/.test(n)).map((n) => Number(n.replace(".json", ""))).sort((a, b) => a - b);
    for (const n of names.slice(0, Math.max(0, names.length - keep))) await rm(join(this.paths.revisions, `${n}.json`), { force: true });
  }

  async readRevision(revision: number): Promise<string | undefined> {
    return readBounded(join(this.paths.revisions, `${revision}.json`));
  }

  /** Private run directory; the id is validated so a reviewer response cannot steer the path. */
  runDir(runId: string): string {
    if (!/^[a-z0-9-]{8,64}$/.test(runId)) throw new Error(`Invalid run id ${JSON.stringify(runId)}`);
    return join(this.paths.runs, runId);
  }

  async createRun(runId: string): Promise<string> {
    const dir = this.runDir(runId);
    await safeDir(dir, 0o700);
    return dir;
  }

  async writePrivate(runId: string, name: string, text: string): Promise<string> {
    if (!/^[a-z0-9][a-z0-9._-]{0,80}$/i.test(name)) throw new Error(`Invalid private file name ${JSON.stringify(name)}`);
    const dir = await this.createRun(runId);
    const file = join(dir, name);
    await atomicWrite(file, text, 0o600);
    return file;
  }

  async readPrivate(runId: string, name: string): Promise<string | undefined> {
    return readBounded(join(this.runDir(runId), name));
  }

  async listRuns(): Promise<string[]> {
    try { return (await readdir(this.paths.runs)).filter((n) => /^[a-z0-9-]{8,64}$/.test(n)).sort(); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }

  /** Remove old private runs, keeping the most recent `keep`; never touches durable files. */
  async cleanup(keep = DEFAULT_KEEP_RUNS, protect: ReadonlySet<string> = new Set()): Promise<string[]> {
    const runs = await this.listRuns();
    const removable = runs.filter((r) => !protect.has(r));
    const victims = removable.slice(0, Math.max(0, removable.length - keep));
    for (const v of victims) await rm(this.runDir(v), { recursive: true, force: true });
    return victims;
  }

  /** Delete every private file for this design. Durable files stay. */
  async purgePrivate(): Promise<void> {
    await rm(this.paths.privateDir, { recursive: true, force: true });
  }
}

export async function listDesigns(projectDir: string): Promise<string[]> {
  const root = requireProjectDir(projectDir);
  const dir = join(root, ".ios-agent", DESIGN_DIR);
  try {
    const names = await readdir(dir);
    const out: string[] = [];
    for (const n of names) {
      if (!DESIGN_ID.test(n)) continue;
      const st = await lstat(join(dir, n));
      if (st.isDirectory() && !st.isSymbolicLink()) out.push(n);
    }
    return out.sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/** Resolve a project-relative path for reading, refusing traversal, absolute paths and symlinks. */
export async function containedReadPath(root: string, relativePath: string): Promise<string> {
  if (!relativePath || isAbsolute(relativePath) || relativePath.includes("\\") || relativePath.includes("\0")) {
    throw new Error(`Refusing path ${JSON.stringify(relativePath)}: use a relative path with forward slashes.`);
  }
  const segments = relativePath.split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..")) throw new Error(`Refusing path ${JSON.stringify(relativePath)}: empty or relative segments are not allowed.`);
  const target = resolve(root, relativePath);
  if (!target.startsWith(root + sep)) throw new Error(`Refusing path outside the project: ${relativePath}`);
  const canonicalRoot = await realpath(root);
  let canonical: string;
  try { canonical = await realpath(target); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`Evidence path does not exist: ${relativePath}`); throw error; }
  if (!canonical.startsWith(canonicalRoot + sep)) throw new Error(`Refusing path that resolves outside the project: ${relativePath}`);
  return canonical;
}

export { atomicWrite as atomicWriteText, readBounded };
