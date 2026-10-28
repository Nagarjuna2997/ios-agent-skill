import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { Studio } from "../engine.mjs";
import { installWorkspace, sourceTree } from "../workspace.mjs";
import { providerEvent, eventParser } from "../providers.mjs";
installWorkspace(Studio);
async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-ws-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const s = new Studio(root, process.cwd());
  await s.init();
  const p = await s.create("Example", "A sample", "codex", "agent");
  await fs.writeFile(
    path.join(s.dir(p.id), "project/View.swift"),
    "struct View {}",
  );
  return { s, p, root };
}
test("source inspection rejects traversal and symlinks; excludes secret names", async (t) => {
  const { s, p } = await setup(t);
  await fs.writeFile(path.join(s.dir(p.id), "project/Secrets.json"), "private");
  assert.equal((await s.inspectSource(p.id)).files.length, 1);
  await assert.rejects(s.inspectSource(p.id, "../state.json"), /outside/);
  await fs.symlink("/etc/hosts", path.join(s.dir(p.id), "project/Link.swift"));
  await assert.rejects(s.inspectSource(p.id), /Symbolic/);
});
test("project settings preserve source; deletion requires exact name and is recoverable", async (t) => {
  const { s, p, root } = await setup(t);
  await s.updateProject(p.id, {
    name: "Renamed",
    pinned: true,
    provider: "claude",
  });
  assert.equal((await s.get(p.id)).pinned, true);
  await assert.rejects(s.deleteProject(p.id, "Example"), /exact/);
  const result = await s.deleteProject(p.id, "Renamed");
  assert.equal(result.recoverable, true);
  assert.equal((await fs.readdir(path.join(root, "trash"))).length, 1);
});
test("attachments reject mislabeled binary and preserve local-only status", async (t) => {
  const { s, p } = await setup(t);
  await assert.rejects(
    s.attach(p.id, {
      name: "a.png",
      type: "image/png",
      data: Buffer.from("bad").toString("base64"),
    }),
    /Invalid PNG/,
  );
  const result = await s.attach(p.id, {
    name: "log.txt",
    type: "text/plain",
    data: Buffer.from("Build failed").toString("base64"),
  });
  assert.equal(result.providerSent, false);
});
test("provider parser handles fragmented JSONL and ignores reasoning or unknown events", () => {
  const events = [];
  const parser = eventParser("codex", (e) => events.push(e));
  parser('{"type":"item.comp');
  parser('leted","item":{"type":"agent_message","text":"Hello"}}\n');
  assert.equal(events[0].text, "Hello");
  assert.equal(
    providerEvent("codex", {
      type: "item.completed",
      item: { type: "reasoning", text: "private" },
    }),
    null,
  );
  assert.equal(
    providerEvent("claude", { type: "result", is_error: true }).type,
    "provider_error",
  );
});
test("oversized provider stream rejects owned process instead of crashing Studio", async () => {
  const { run } = await import("../engine.mjs");
  await assert.rejects(
    run(
      process.execPath,
      [
        "-e",
        'process.stdout.write("x".repeat(2100000));setInterval(()=>{},1000)',
      ],
      { onText: eventParser("codex"), timeout: 10000 },
    ),
    /Output handler failed|output limit/,
  );
});
test("source inspection refuses a symbolic project root", async (t) => {
  const { s, p } = await setup(t);
  const project = path.join(s.dir(p.id), "project");
  await fs.rename(project, project + "-real");
  await fs.symlink(project + "-real", project);
  await assert.rejects(s.inspectSource(p.id), /Symbolic project roots/);
});

test('capture archive survives replacement, labels stale source, and rejects tampering', async t => {
  const { s, p } = await setup(t);
  p.template = 'imported';
  await s.save(p);
  const { artifacts, artifactImage } = await import('../artifacts.mjs');
  const { digest } = await import('../engine.mjs');
  const folder = path.join(s.dir(p.id), 'project/.ios-agent/screenshots');
  await fs.mkdir(folder, { recursive: true });
  const image = Buffer.from('capture-fixture');
  await fs.writeFile(path.join(folder, 'launch.png'), image);
  p.evidence = { sourceHash: await s.fingerprint(p.id), date: new Date().toISOString(), screens: { launch: digest(image) }, paths: { launch: '.ios-agent/screenshots/launch.png' }, scope: 'synthetic test' };
  await s.save(p);
  await s.save(p);
  let records = await artifacts(s, p.id);
  assert.equal(records.length, 1);
  assert.equal(records[0].stale, false);
  await fs.writeFile(path.join(folder, 'launch.png'), 'replacement');
  assert.deepEqual(await artifactImage(s, p.id, records[0].id, 'launch'), image);
  await fs.writeFile(path.join(s.dir(p.id), 'project/View.swift'), 'struct Changed {}');
  records = await artifacts(s, p.id);
  assert.equal(records[0].stale, true);
  await fs.rename(path.join(s.dir(p.id), 'project'), path.join(s.dir(p.id), 'project-away'));
  assert.equal((await artifacts(s, p.id))[0].stale, null);
  assert.deepEqual(await artifactImage(s, p.id, records[0].id, 'launch'), image);
  await fs.rename(path.join(s.dir(p.id), 'project-away'), path.join(s.dir(p.id), 'project'));
  await assert.rejects(artifactImage(s, p.id, records[0].id, '../state'), /Invalid/);
  await fs.writeFile(path.join(s.dir(p.id), 'artifacts', records[0].id, 'launch.png'), 'tampered');
  await assert.rejects(artifactImage(s, p.id, records[0].id, 'launch'), /hash mismatch/);
});

test('release drafts reject credentials and do not claim preparation', async t => {
  const { s, p } = await setup(t);
  const { releaseDraft, saveReleaseDraft, releaseFiles } = await import('../release.mjs');
  const draft = await releaseDraft(s, p.id);
  assert.equal(draft.allowProvisioningUpdates, false);
  await assert.rejects(saveReleaseDraft(s, p.id, { ...draft, apiKey: 'forbidden' }));
  await assert.rejects(releaseFiles(s, p.id), /Prepare a release/);
  assert.equal((await s.get(p.id)).release, undefined);
});

test('release approval is operation-specific and cannot authorize a changed plan', async () => {
  const { validateReleaseApproval } = await import('../release.mjs');
  const p = { release: { id: 'a'.repeat(64) } };
  const approval = { approved: true, confirmation: `archive:${p.release.id}` };
  assert.doesNotThrow(() => validateReleaseApproval(p, 'archive', approval));
  assert.throws(() => validateReleaseApproval(p, 'upload', approval), /explicitly confirm/);
  assert.throws(() => validateReleaseApproval(p, 'archive', { ...approval, approved: false }), /explicitly confirm/);
  assert.throws(() => validateReleaseApproval({ release: { id: 'b'.repeat(64) } }, 'archive', approval), /explicitly confirm/);
});

test('product evidence detects binary replacement and refuses symbolic products', async t => {
  const {productHash}=await import('../product-evidence.mjs');
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-product-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.writeFile(path.join(root,'Executable'),Buffer.from([0,1,2]));const first=await productHash(root);
  await fs.writeFile(path.join(root,'Executable'),Buffer.from([0,1,3]));assert.notEqual(await productHash(root),first);
  await fs.symlink('/etc/hosts',path.join(root,'outside'));await assert.rejects(productHash(root),/Symbolic/);
});

test('stderr is bounded before it reaches persistent output handlers', async () => {
  const {run}=await import('../engine.mjs');let received=0;
  await assert.rejects(run(process.execPath,['-e','process.stderr.write("x".repeat(2200000));setInterval(()=>{},1000)'],{timeout:10000,onText:chunk=>{received+=Buffer.byteLength(chunk);}}),/output limit/);
  assert.ok(received<=2000000);
});

test('legacy HTTP actions cannot bypass queued approval', async t => {
  const {serve}=await import('../server.mjs');const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-legacy-'));
  const app=await serve({root,port:0,repo:process.cwd()});
  t.after(async()=>{await app.tasks.close();await new Promise(r=>app.server.close(r));await fs.rm(root,{recursive:true,force:true});});
  const p=await app.studio.create('Sample','Sample app','codex','agent');
  const html=await (await fetch(app.origin)).text();const token=/name="studio-token" content="([a-f0-9]+)"/.exec(html)[1];
  const response=await fetch(`${app.origin}/api/projects/${p.id}/action`,{method:'POST',headers:{'content-type':'application/json','x-studio-token':token},body:JSON.stringify({kind:'build'})});
  assert.equal(response.status,202);assert.equal((await response.json()).status,'awaiting_approval');assert.equal(app.studio.jobs.size,0);
});

test('old settings migrate with bounded capture retention and simulator defaults', async () => {
  const {validateSettings}=await import('../settings.mjs');
  const old=validateSettings({version:1,taskTimeoutMinutes:20,repairLimit:1});
  assert.equal(old.captureLimit,200);assert.equal(old.defaultSimulator,'');
  assert.throws(()=>validateSettings({...old,captureLimit:0}));
  assert.throws(()=>validateSettings({...old,defaultSimulator:'not-a-device'}));
});
