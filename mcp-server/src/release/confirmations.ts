/** Optional local developer assertions. They never certify App Store readiness. */
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { analyzeApp, canonical, digest, type Analysis, type Options } from './model.js';

const definitions = [
  { id: 'review.login-required', question: 'Does the release require a login or restricted access for its main functionality?' },
  { id: 'privacy.practices-reviewed', question: 'Have you reviewed collection purposes, retention, linkage, and third-party practices for this release?' },
  { id: 'metadata.draft-reviewed', question: 'Have you reviewed the proposed store metadata against the actual release?' },
] as const;
const Id = z.enum(['review.login-required', 'privacy.practices-reviewed', 'metadata.draft-reviewed']);
const Hash = z.string().regex(/^[a-f0-9]{64}$/);
const RecordSchema = z.object({ id: Id, identityHash: Hash, fingerprint: Hash, answer: z.boolean(), at: z.string().datetime() }).strict();
const StoreSchema = z.object({ schemaVersion: z.literal(1), records: z.array(RecordSchema).max(120) }).strict().superRefine((s, ctx) => {
  const keys = new Set<string>();
  for (const r of s.records) { const k = r.identityHash + ':' + r.id; if (keys.has(k)) ctx.addIssue({code: 'custom', message: 'duplicate confirmation'}); keys.add(k); }
});
type Store = z.infer<typeof StoreSchema>;
type IdType = z.infer<typeof Id>;
export type ConfirmationView = { id: IdType; question: string; fingerprint: string; status: 'UNANSWERED' | 'CONFIRMED' | 'RECONFIRMATION_REQUIRED'; answer: boolean | null; at: string | null };

async function safeDirectory(p: string, create: boolean) {
  try { const s = await lstat(p); if (s.isSymbolicLink() || !s.isDirectory()) throw Error('Unsafe confirmation directory'); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT' || !create) throw e; await mkdir(p, { mode: 0o700 }); }
}
async function readRegular(p: string) {
  // O_NOFOLLOW protects the final component even if it changes after inspection.
  const before = await lstat(p);
  if (before.isSymbolicLink() || !before.isFile()) throw Error('Unsafe confirmation file');
  const f = await open(p, constants.O_RDONLY | (constants.O_NOFOLLOW || 0) | (constants.O_NONBLOCK || 0));
  try { const s = await f.stat(); if (!s.isFile() || s.nlink !== 1 || s.size > 128 * 1024 || (process.platform !== 'win32' && ((s.mode & 0o077) || s.dev !== before.dev || s.ino !== before.ino))) throw Error('Unsafe confirmation file'); return await f.readFile('utf8'); }
  finally { await f.close(); }
}
async function location(root: string, create: boolean) {
  const actual = await realpath(resolve(root));
  const local = join(actual, '.ios-agent'), dir = join(local, 'confirmations');
  if (create) {
    await safeDirectory(local, true); await safeDirectory(dir, true);
    const ignore = join(dir, '.gitignore');
    try { await writeFile(ignore, '*\n', { flag: 'wx', mode: 0o600 }); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e; if (await readRegular(ignore) !== '*\n') throw Error('Unsafe confirmation ignore file'); }
  } else {
    for (const p of [local, dir]) { try { await safeDirectory(p, false); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') break; throw e; } }
  }
  try { const s = await lstat(dir); if (process.platform !== 'win32' && (s.mode & 0o077)) throw Error('Unsafe confirmation directory permissions'); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  return { root: actual, dir, file: join(dir, 'state.json') };
}
async function load(file: string): Promise<Store> {
  try { return StoreSchema.parse(JSON.parse(await readRegular(file))); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1, records: [] }; throw Error('Confirmation storage is malformed or unsafe; preserve it for local inspection.'); }
}
function identity(root: string, analysis: Analysis) {
  if (analysis.model.status === 'BLOCKED' || !analysis.model.selection.project || !analysis.model.selection.target) throw Error('Resolve project, target and configuration before using confirmations');
  const bundle = analysis.model.claims.find(c => c.id === 'bundleIdentifier');
  if (!bundle || bundle.status !== 'OBSERVED' || typeof bundle.value !== 'string') throw Error('Resolve application identity before using confirmations');
  return digest(canonical({ root: digest(root), selection: analysis.model.selection, bundle: bundle.value }));
}
function fingerprint(analysis: Analysis, identityHash: string, q: typeof definitions[number]) {
  // Conservative binding: any selected evidence or interpretation change requires
  // an explicit new answer. Neither source text nor paths are stored in the file.
  return digest(canonical({ protocol: 1, identityHash, model: digest(canonical(analysis.model)), source: analysis.sourceFingerprint, question: q }));
}
function view(analysis: Analysis, root: string, state: Store): ConfirmationView[] {
  const idHash = identity(root, analysis);
  return definitions.map(q => {
    const current = fingerprint(analysis, idHash, q);
    const saved = state.records.find(r => r.identityHash === idHash && r.id === q.id);
    const status = !saved ? 'UNANSWERED' : saved.fingerprint === current ? 'CONFIRMED' : 'RECONFIRMATION_REQUIRED';
    return { ...q, fingerprint: current, status, answer: status === 'CONFIRMED' ? saved!.answer : null, at: saved?.at ?? null };
  });
}
export async function listReleaseConfirmations(options: Options) {
  const loc = await location(options.root, false);
  const analysis = await analyzeApp({ ...options, root: loc.root });
  return { schemaVersion: 1 as const, status: 'DEVELOPER_ASSERTIONS_ONLY' as const, questions: view(analysis, loc.root, await load(loc.file)), note: 'Save only an explicit developer yes/no answer to the displayed question and fingerprint. Inference or tests cannot authorize an answer. Assertions do not prove runtime behavior, build, privacy compliance, signing or App Store approval. Existing release package questions are unchanged.' };
}
async function update(options: Options, idInput: string, operation: { answer: boolean; expectedFingerprint: string } | null) {
  const id = Id.parse(idInput);
  // Reject invalid or stale requests before creating project-local state.
  const existing = await location(options.root, false);
  const initial = await analyzeApp({ ...options, root: existing.root });
  const initialIdentity = identity(existing.root, initial);
  const definition = definitions.find(q => q.id === id)!;
  if (operation && (typeof operation.answer !== 'boolean' || !Hash.safeParse(operation.expectedFingerprint).success || operation.expectedFingerprint !== fingerprint(initial, initialIdentity, definition))) throw Error('Question evidence changed; inspect current confirmations before saving.');
  const loc = await location(options.root, true);
  const lock = join(loc.dir, '.lock');
  try { await mkdir(lock, { mode: 0o700 }); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw Error('Confirmation storage is locked; inspect any stale lock before removing it.'); throw e; }
  let tmp: string | undefined;
  try {
    const analysis = await analyzeApp({ ...options, root: loc.root });
    const idHash = identity(loc.root, analysis);
    const question = definitions.find(q => q.id === id)!;
    const current = fingerprint(analysis, idHash, question);
    if (operation && (typeof operation.answer !== 'boolean' || !Hash.safeParse(operation.expectedFingerprint).success || operation.expectedFingerprint !== current)) throw Error('Question evidence changed; inspect current confirmations before saving.');
    const state = await load(loc.file);
    const records = state.records.filter(r => !(r.identityHash === idHash && r.id === id));
    if (operation) records.push({ id, identityHash: idHash, fingerprint: current, answer: operation.answer, at: new Date().toISOString() });
    const next = StoreSchema.parse({ schemaVersion: 1, records });
    const fresh = await analyzeApp({ ...options, root: loc.root });
    if (identity(loc.root, fresh) !== idHash || fingerprint(fresh, idHash, question) !== current) throw Error('Project evidence changed during confirmation; inspect and retry.');
    tmp = join(loc.dir, '.state-' + randomUUID());
    await writeFile(tmp, canonical(next) + '\n', { flag: 'wx', mode: 0o600 });
    // Refuse to replace a symlink, hard-linked, oversized or malformed file.
    if (canonical(await load(loc.file)) !== canonical(state)) throw Error('Confirmation state changed during write; retry.');
    await rename(tmp, loc.file); tmp = undefined;
  } finally { if (tmp) await rm(tmp, { force: true }); await rm(lock, { recursive: true, force: true }); }
  return listReleaseConfirmations(options);
}
export async function saveReleaseConfirmation(options: Options, id: string, answer: boolean, expectedFingerprint: string) { return update(options, id, { answer, expectedFingerprint }); }
export async function resetReleaseConfirmation(options: Options, id: string) { return update(options, id, null); }
