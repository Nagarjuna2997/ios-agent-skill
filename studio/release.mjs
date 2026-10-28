import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { atomic } from './engine.mjs';
const shipModule = studio => import(pathToFileURL(path.join(studio.repo, 'mcp-server/dist/release/ship.js')).href);
export async function releaseDraft(studio, id) {
  const p = await studio.get(id);
  try { return JSON.parse(await fs.readFile(path.join(studio.dir(id), 'release-draft.json'), 'utf8')); }
  catch(e) { if(e.code !== 'ENOENT') throw e; }
  return { schemaVersion: 1, project: p.importInfo?.project ?? 'App.xcodeproj', scheme: p.scheme ?? p.agentPlan?.name ?? 'App', target: p.scheme ?? 'App', configuration: 'Release', bundleId: '', teamId: '', version: '1.0', build: '1', signing: 'automatic', allowProvisioningUpdates: false,
    metadata: { name: p.name, subtitle: '', description: '', keywords: '', supportURL: '', privacyURL: '', locale: 'en-US' },
    screenshots: [{ templates: ['minimal'], profile: 'iphone-portrait', locale: 'en-US', screens: Object.entries(p.evidence?.screens ?? {}).slice(0, 10).map(([name]) => ({ image: p.evidence.paths?.[name] ?? `.ios-agent/evidence/${name}.png`, headline: name })) }] };
}
export async function saveReleaseDraft(studio, id, input) {
  return studio.exclusive(async () => {
    await studio.get(id);
    const { ShipConfig } = await shipModule(studio);
    const config = ShipConfig.parse(input);
    // The strict schema excludes passwords, API keys and arbitrary command fields.
    await atomic(path.join(studio.dir(id), 'release-draft.json'), config);
    return { saved: true, config, status: 'DRAFT_NOT_APPROVED' };
  });
}
export async function prepareStudioRelease(studio, id, input) {
  return studio.exclusive(async () => {
    const p = await studio.get(id);
    const { prepareShip } = await shipModule(studio);
    const result = await prepareShip(path.join(studio.dir(id), 'project'), input);
    p.release = { id: result.id, status: result.status, prepared: new Date().toISOString() };
    await studio.save(p);
    return { ...p.release, message: 'Local preparation only. Review metadata, screenshot sets and readiness. Nothing signed or uploaded.' };
  });
}
export async function releaseFiles(studio, id) {
  const p = await studio.get(id);
  if (!/^[a-f0-9]{64}$/.test(p.release?.id ?? '')) throw Error('Prepare a release first');
  const { verifyShip } = await shipModule(studio);
  const root = path.join(studio.dir(id), 'project');
  const manifest = await verifyShip(root, p.release.id);
  const folder = path.join(root, '.ios-agent/ship', p.release.id);
  const documents = {};
  for (const name of ['metadata.json','readiness.json','analysis.json','SHIP_PLAN.md'])
    documents[name] = await fs.readFile(path.join(folder, name), 'utf8');
  return { id: p.release.id, status: manifest.status, documents, files: Object.keys(manifest.files) };
}

export function validateReleaseApproval(p, action, body) {
  if (!['archive', 'upload'].includes(action) || !/^[a-f0-9]{64}$/.test(p.release?.id ?? '') ||
      body?.approved !== true || body?.confirmation !== `${action}:${p.release.id}`)
    throw Error('Review the prepared release and explicitly confirm this specific operation and approval ID');
}
export async function startReleaseOperation(studio, id, action, body) {
  return studio.exclusive(async () => {
    const p = await studio.get(id);
    validateReleaseApproval(p, action, body);
    const { verifyShip, executeShip } = await shipModule(studio);
    const root = path.join(studio.dir(id), 'project');
    await verifyShip(root, p.release.id);
    const { ProcessRunner } = await import(pathToFileURL(path.join(studio.repo, 'mcp-server/dist/agent/runner.js')).href);
    const controller = new AbortController(), base = new ProcessRunner();
    const runner = { run: (command, args, options = {}) => {
      if (controller.signal.aborted) throw Error('Cancelled');
      return base.run(command, args, { ...options, signal: controller.signal });
    }};
    p.busy = true;
    p.release.operation = { action, approval: p.release.id, status: 'running', started: new Date().toISOString() };
    await studio.save(p);
    studio.jobs.set(id, controller);
    // Never replay this operation automatically after restart, including uncertain uploads.
    executeShip(root, p.release.id, action, runner).then(result => {
      p.release.operation.status = 'completed';
      p.release.operation.result = result;
    }).catch(() => {
      p.release.operation.status = controller.signal.aborted ? 'cancelled' : 'failed';
      p.release.operation.message = action === 'upload'
        ? 'Upload not confirmed. Inspect the local receipt and App Store Connect before retrying; automatic resubmission is disabled.'
        : 'Archive not confirmed. Inspect private signing diagnostics in the prepared release folder.';
    }).finally(async () => {
      p.busy = false;
      p.release.operation.finished = new Date().toISOString();
      try { await studio.save(p); } finally { studio.jobs.delete(id); }
    }).catch(error => console.error('Could not persist release state:', error.message));
    return p.release.operation;
  });
}

export async function releaseImage(studio, id, name) {
  const p = await studio.get(id);
  if (!/^[a-f0-9]{64}$/.test(p.release?.id ?? '') || !/^screenshots-[0-9]+\/(?:[a-zA-Z0-9-]+\/){0,3}[a-zA-Z0-9_.-]+\.png$/.test(name ?? ''))
    throw Error('Choose a prepared screenshot');
  const root = path.join(studio.dir(id), 'project');
  const { verifyShip } = await shipModule(studio);
  const manifest = await verifyShip(root, p.release.id);
  if (!Object.hasOwn(manifest.files, name)) throw Error('Unknown prepared screenshot');
  const bytes = await fs.readFile(path.join(root, '.ios-agent/ship', p.release.id, name));
  const { digest } = await import('./engine.mjs');
  if (digest(bytes) !== manifest.files[name]) throw Error('Prepared screenshot changed');
  return bytes;
}
