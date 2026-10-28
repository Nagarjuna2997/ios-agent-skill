import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const hash = b => createHash('sha256').update(b).digest('hex');
const validID = value => /^[a-f0-9]{64}$/.test(value ?? '');
async function confined(root, relative) {
  const base = await fs.realpath(root);
  const file = await fs.realpath(path.join(base, relative));
  if (!file.startsWith(base + path.sep)) throw Error('Artifact escapes storage');
  return file;
}
export async function archiveEvidence(studio, p) {
  if (!p.evidence || !validID(p.evidence.sourceHash)) return;
  const id = hash(JSON.stringify(p.evidence));
  const folder = path.join(studio.dir(p.id), 'artifacts');
  const target = path.join(folder, id);
  try { await fs.access(path.join(target, 'record.json')); return; }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (p.evidence.sourceHash !== await studio.fingerprint(p.id)) return;
  await fs.mkdir(folder, { recursive: true });
  if ((await fs.readdir(folder)).filter(validID).length >= (studio.settings?.captureLimit ?? 200))
    throw Error('Capture history reached the configured retention limit. Export or remove archived records before capturing again.');
  const staging = await fs.mkdtemp(path.join(folder, '.pending-'));
  try {
    let bytes = 0;
    const screens = Object.entries(p.evidence.screens ?? {});
    if (screens.length > 100) throw Error('Too many capture artifacts');
    for (const [name, expected] of screens) {
      if (!/^[a-zA-Z0-9_-]+$/.test(name) || !validID(expected)) throw Error('Invalid capture artifact');
      const relative = ['agent', 'imported'].includes(p.template)
        ? p.evidence.paths?.[name] : `.ios-agent/evidence/${name}.png`;
      if (typeof relative !== 'string' || !/^\.ios-agent\/(screenshots|evidence)\/[a-zA-Z0-9_.-]+\.png$/.test(relative)) throw Error('Invalid capture artifact path');
      const file = await confined(path.join(studio.dir(p.id), 'project'), relative);
      const stat = await fs.stat(file);
      bytes += stat.size;
      if (bytes > 80000000) throw Error('Capture archive exceeds 80 MB');
      const data = await fs.readFile(file);
      if (hash(data) !== expected) throw Error('Capture changed before archiving');
      await fs.writeFile(path.join(staging, `${name}.png`), data);
    }
    if (p.evidence.sourceHash !== await studio.fingerprint(p.id)) throw Error('Source changed before archiving');
    const record = { version: 1, id, project: p.id, task: studio.tasks?.data.tasks.find(t => t.id === studio.tasks.active && t.project === p.id)?.id ?? null,
      evidence: p.evidence, verification: p.verification ?? null, status: p.status,
      device: p.evidence.device ?? p.simulator ?? null, revision: p.lastRevision ?? null };
    await fs.writeFile(path.join(staging, 'record.json'), JSON.stringify(record, null, 2));
    await fs.rename(staging, target);
  } finally { await fs.rm(staging, { recursive: true, force: true }); }
}
export async function artifacts(studio, id) {
  const folder = path.join(studio.dir(id), 'artifacts');
  let entries;
  try { entries = await fs.readdir(folder); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  const current = await studio.fingerprint(id).catch(() => null);
  const records = [];
  for (const entry of entries.filter(validID)) {
    const file = await confined(folder, `${entry}/record.json`);
    const record = JSON.parse(await fs.readFile(file, 'utf8'));
    if (record.id !== entry || record.project !== id || hash(JSON.stringify(record.evidence)) !== entry) throw Error('Invalid artifact record');
    records.push({ ...record, stale: current === null ? null : record.evidence.sourceHash !== current });
  }
  return records.sort((a,b) => b.evidence.date.localeCompare(a.evidence.date));
}
export async function artifactImage(studio, project, id, name) {
  if (!validID(id) || !/^[a-zA-Z0-9_-]+$/.test(name ?? '')) throw Error('Invalid artifact selection');
  const record = (await artifacts(studio, project)).find(r => r.id === id);
  if (!record?.evidence.screens[name]) throw Error('Unknown capture');
  const file = await confined(path.join(studio.dir(project), 'artifacts'), `${id}/${name}.png`);
  const data = await fs.readFile(file);
  if (hash(data) !== record.evidence.screens[name]) throw Error('Archived capture hash mismatch');
  return data;
}
export async function deleteArtifact(studio, project, id, confirmation) {
  if (!validID(id) || confirmation !== id) throw Error('Confirm the exact capture record before deleting');
  return studio.exclusive(async () => {
    const record = (await artifacts(studio, project)).find(r => r.id === id);
    if (!record) throw Error('Unknown capture');
    const folder = path.join(studio.dir(project), 'artifacts', id);
    if ((await fs.lstat(folder)).isSymbolicLink()) throw Error('Unsafe artifact folder');
    await fs.rm(folder, { recursive: true });
    return { deleted: true };
  });
}
