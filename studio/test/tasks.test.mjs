import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { TaskManager } from "../tasks.mjs";
async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-tasks-"));
  const p = { provider: "codex", status: "draft" };
  const studio = {
    root,
    jobs: new Map(),
    reserved: false,
    get: async () => p,
    action: async () => {
      p.status = "verified";
    },
    cancel() {
      p.status = "cancelled";
    },
  };
  const tasks = new TaskManager(studio);
  await tasks.init();
  clearInterval(tasks.timer);
  t.after(async () => {
    await tasks.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  return { tasks, studio, p, root };
}
test("task approval, idempotency, successful terminal event and replay", async (t) => {
  const { tasks } = await setup(t);
  const input = { kind: "build", requestId: "request_123" };
  const first = await tasks.enqueue("project", input);
  assert.equal(first.status, "awaiting_approval");
  assert.equal((await tasks.enqueue("project", input)).id, first.id);
  await assert.rejects(tasks.enqueue("other", input), /conflicts/);
  await tasks.pump();
  assert.equal(tasks.get(first.id).status, "awaiting_approval");
  await tasks.approve(first.id);
  await tasks.pump();
  const result = tasks.replay(first.id, 2);
  assert.equal(result.task.status, "completed");
  assert.deepEqual(
    result.events.map((e) => e.type),
    ["started", "completed"],
  );
});
test("restart never reports interrupted work as success", async (t) => {
  const { tasks, studio } = await setup(t);
  const first = await tasks.enqueue("project", {
    kind: "plan",
    requestId: "request_123",
  });
  const restarted = new TaskManager(studio);
  await restarted.init();
  clearInterval(restarted.timer);
  t.after(() => restarted.close());
  assert.equal(restarted.get(first.id).status, "interrupted");
});
test("native reservation and cancellation prevent execution; unknown outcomes fail closed", async (t) => {
  const { tasks, studio, p } = await setup(t);
  const first = await tasks.enqueue("project", {
    kind: "plan",
    requestId: "request_123",
  });
  studio.reserved = true;
  await tasks.pump();
  assert.equal(tasks.get(first.id).status, "queued");
  await tasks.cancel(first.id);
  studio.reserved = false;
  await tasks.pump();
  assert.equal(tasks.get(first.id).status, "cancelled");
  studio.action = async () => {
    p.status = "running";
  };
  const second = await tasks.enqueue("project", {
    kind: "plan",
    requestId: "request_456",
  });
  await tasks.pump();
  assert.equal(tasks.get(second.id).status, "failed");
});
test("provider changes and read-only presets cannot silently execute a different operation", async (t) => {
  const { tasks, p } = await setup(t);
  await assert.rejects(
    tasks.enqueue("p", {
      kind: "refine",
      requestId: "request_123",
      preset: "reviewer",
    }),
    /cannot edit/,
  );
  const task = await tasks.enqueue("p", {
    kind: "plan",
    requestId: "request_456",
  });
  p.provider = "claude";
  await tasks.pump();
  assert.equal(tasks.get(task.id).status, "failed");
  assert.match(
    tasks.get(task.id).events.at(-1).data.message,
    /Provider changed/,
  );
});
test("queued cancellation cannot race pump into resurrecting execution", async (t) => {
  const { tasks, studio } = await setup(t);
  let calls = 0;
  studio.action = async () => {
    calls++;
  };
  const task = await tasks.enqueue("p", {
    kind: "ask",
    requestId: "cancel_race",
  });
  const c = tasks.cancel(task.id);
  await tasks.pump();
  await c;
  assert.equal(calls, 0);
  assert.equal(tasks.get(task.id).status, "cancelled");
});
test("cancellation while project lookup waits prevents dispatch", async (t) => {
  const { tasks, studio } = await setup(t);
  const task = await tasks.enqueue("p", {
    kind: "ask",
    requestId: "cancel_lookup",
  });
  let release,
    calls = 0;
  studio.get = () =>
    new Promise((r) => {
      release = () => r({ provider: "codex" });
    });
  studio.action = async () => {
    calls++;
  };
  const pump = tasks.pump();
  while (!release) await new Promise((r) => setTimeout(r, 5));
  await tasks.cancel(task.id);
  release();
  await pump;
  assert.equal(calls, 0);
  assert.equal(tasks.get(task.id).status, "cancelled");
});

test('retry preserves context, requires new edit approval, and deduplicates repeat clicks', async t => {
  const { tasks } = await setup(t);
  const first = await tasks.enqueue('project', { kind: 'build', message: 'Original request', requestId: 'retry_test_original' });
  await assert.rejects(tasks.retry(first.id), /Only failed/);
  await tasks.cancel(first.id);
  const second = await tasks.retry(first.id);
  assert.notEqual(second.id, first.id);
  assert.equal(second.message, 'Original request');
  assert.equal(second.status, 'awaiting_approval');
  assert.equal((await tasks.retry(first.id)).id, second.id);
  assert.equal(tasks.get(first.id).status, 'cancelled');
});

test('changed approved inputs fail before dispatch', async t => {
  const {tasks,studio}=await setup(t);let hash='first',calls=0;
  studio.approvalFingerprint=async()=>hash;studio.action=async()=>{calls++;};
  const task=await tasks.enqueue('project',{kind:'build',requestId:'approval_hash_test'});await tasks.approve(task.id);
  hash='changed';await tasks.pump();assert.equal(calls,0);assert.equal(tasks.get(task.id).status,'failed');
});
