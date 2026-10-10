import { createHash } from 'node:crypto';
import { readFile, realpath, stat, writeFile, rename } from 'node:fs/promises';
import { join, relative, isAbsolute } from 'node:path';
export const hash = data => createHash('sha256').update(data).digest('hex');
export function validatePins(pins) {
  for (const field of ['commit', 'model', 'xcode', 'sdk', 'runtime', 'claude']) if (!pins[field]) throw new Error(`Missing pin: ${field}`);
  if (!/^[a-f0-9]{40}$/.test(pins.commit)) throw new Error('Commit must be a full SHA');
  if (!/^claude-[a-z0-9-]+-\d{8}$/.test(pins.model)) throw new Error('Model must be a dated Claude model ID, not an alias');
  for (const field of ['xcode','sdk','claude']) if (!/^\d+\.\d+(?:\.\d+)?$/.test(pins[field])) throw new Error(`Invalid ${field} version`);
  if (!/^com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+$/.test(pins.runtime)) throw new Error('Pin an iOS simulator runtime identifier');
}
export function validatePlan(plan) {
  if (!plan?.screens?.some(s => s.topLevel)) throw new Error('Plan has no top-level screens');
  // Keep the nightly experiment local and free of external SDKs/accounts.
  const allowed = new Set(['color-assets','app-icon','launch-screen','design-system']);
  const ids = [...(plan.capabilities ?? []).map(c => typeof c === 'string' ? c : c.id), ...plan.screens.flatMap(s => s.capabilities ?? [])];
  if (ids.some(id => !allowed.has(id))) throw new Error(`Plan requested capabilities outside the regression allowlist: ${ids.join(', ')}`);
}
export function classify(state, exitCode, timedOut = false) {
  if (timedOut) return 'timeout';
  if (/Provider returned HTTP|claude exited|claude returned no result|rate.limit|authentication|API.key/i.test(state?.failure ?? '')) return 'provider_failure';
  if (/Missing:|not installed|tool itself failed|could not start/i.test(state?.failure ?? '')) return 'infrastructure_failure';
  return state?.status === 'complete' && exitCode === 0 ? 'candidate_pass' : 'regression';
}
export async function artifact(root, path) {
  if (typeof path !== 'string' || isAbsolute(path)) throw new Error('Evidence must use a relative path');
  const base = await realpath(root), full = await realpath(join(base, path));
  const rel = relative(base, full);
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) throw new Error('Evidence escapes run directory');
  if (!(await stat(full)).isFile()) throw new Error(`Evidence is not a file: ${path}`);
  return readFile(full);
}
export async function verifyEvidence(root, state, plan, sourceHash) {
  if (state.status !== 'complete' || !state.run || !state.builds?.at(-1)?.success) throw new Error('Incomplete build/launch evidence');
  if (!sourceHash || state.buildSourceHash !== sourceHash || state.captureSourceHash !== sourceHash) throw new Error('Stale source/build/capture evidence');
  const t = state.tests?.at(-1);
  if (t?.status !== 'passed' || t.sourceHash !== sourceHash || !(t.passed > 0) || t.failed !== 0 || t.skipped !== 0) throw new Error('Missing, stale, failed or skipped tests');
  await artifact(root, t.logPath);
  // xcresult bundles are directories; require their metadata, not just the directory name.
  await artifact(root, `${t.resultBundle}/Info.plist`);
  await artifact(root, 'PLAN.md'); await artifact(root, 'RUN_REPORT.md');
  const screenshots = [];
  for (const screen of plan.screens.filter(s => s.topLevel)) {
    for (const variant of ['light','dark','xxl']) {
      const matching = state.screenshots.filter(s => s.screen === screen.id && s.variant === variant && (s.device ?? 'iphone') === 'iphone');
      if (matching.length !== 1) throw new Error(`Missing/duplicate capture: ${screen.id}/${variant}`);
      const bytes = await artifact(root, matching[0].path);
      if (bytes.length < 24 || bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG evidence');
      screenshots.push({screen: screen.id, variant, path: matching[0].path, sha256: hash(bytes)});
    }
  }
  const review = state.visualReviews?.at(-1);
  if (review?.status !== 'pass' || review.cycle !== state.cycle) throw new Error('Visual review did not pass');
  for (const shot of screenshots) {
    const rows = review.screens?.filter(s => s.screen === shot.screen) ?? [];
    if (rows.length !== 1 || rows[0].assessment?.verdict !== 'pass' || rows[0].assessment?.findings?.length || !rows[0].images?.some(i => i.variant === shot.variant && i.sha256 === shot.sha256)) throw new Error('Visual review does not match captured pixels');
  }
  return screenshots;
}

// Identity rejection must not turn an interrupted run into a terminal failure.
export async function finalizeResult(root, result, identityAccepted) {
  const exists = async p => {try {await stat(join(root,p));return true;} catch(e) {if(e.code === 'ENOENT') return false;throw e;}};
  if (await exists('result.json') || (!identityAccepted && await exists('identity.json'))) return false;
  await writeFile(join(root,'result.json.tmp'), JSON.stringify(result,null,2)+'\n');
  await rename(join(root,'result.json.tmp'),join(root,'result.json'));
  return true;
}
