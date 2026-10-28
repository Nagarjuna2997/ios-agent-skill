import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
const terminal = new Set(["completed", "failed", "cancelled", "interrupted"]);
const kinds = new Set([
  "plan",
  "build",
  "refine",
  "verify",
  "ask",
  "review",
  "readiness",
]);
export class TaskManager {
  constructor(studio) {
    this.studio = studio;
    this.file = path.join(studio.root, "tasks-v1.json");
    this.data = { version: 1, tasks: [] };
    this.chain = Promise.resolve();
    this.active = null;
    this.closed = false;
  }
  async init() {
    try {
      this.data = JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    if (this.data.version !== 1 || !Array.isArray(this.data.tasks))
      throw Error("Unsupported task storage version");
    for (const t of this.data.tasks)
      if (!terminal.has(t.status)) {
        t.status = "interrupted";
        this.event(t, "interrupted", {
          message:
            "Studio restarted; retry explicitly. Completed evidence is retained.",
        });
      }
    await this.persist();
    this.timer = setInterval(() => void this.pump().catch(() => {}), 250);
    this.timer.unref();
  }
  event(t, type, data = {}) {
    t.sequence = (t.sequence || 0) + 1;
    t.updated = new Date().toISOString();
    t.events.push({
      id: `${t.id}:${t.sequence}`,
      sequence: t.sequence,
      time: t.updated,
      type,
      data,
    });
    t.events = t.events.slice(-1000);
    while (
      t.events.length > 1 &&
      Buffer.byteLength(JSON.stringify(t.events)) > 512000
    )
      t.events.shift();
  }
  async persist() {
    const tmp = this.file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(this.data), { mode: 0o600 });
    await fs.rename(tmp, this.file);
  }
  mutate(fn) {
    const next = this.chain.then(async () => {
      const result = await fn();
      await this.persist();
      return result;
    });
    this.chain = next.catch(() => {});
    return next;
  }
  snapshot(t) {
    return structuredClone(t);
  }
  list(project) {
    return this.data.tasks
      .filter((t) => !project || t.project === project)
      .map((t) => this.snapshot(t));
  }
  get(id) {
    const t = this.data.tasks.find((t) => t.id === id);
    if (!t) throw Error("Unknown task");
    return t;
  }
  replay(id, after = 0) {
    if (!Number.isSafeInteger(after) || after < 0)
      throw Error("Invalid event cursor");
    const t = this.get(id);
    return {
      task: this.snapshot({ ...t, events: [] }),
      events: t.events.filter((e) => e.sequence > after),
      truncated: after > 0 && after < (t.events[0]?.sequence ?? 1) - 1,
    };
  }
  async retry(id) {
    const previous = this.get(id);
    if (!["failed", "cancelled", "interrupted"].includes(previous.status))
      throw Error("Only failed, cancelled or interrupted tasks may be retried");
    return this.enqueue(previous.project, {
      kind: previous.kind, message: previous.message, preset: previous.preset,
      attachments: previous.attachments ?? [], requestId: `retry_${id}`,
    });
  }
  async enqueue(
    project,
    { kind, message = "", requestId, preset = "builder", attachments = [] },
  ) {
    if (
      !kinds.has(kind) ||
      typeof message !== "string" ||
      message.length > 10000 ||
      typeof requestId !== "string" ||
      !/^[a-zA-Z0-9_-]{8,80}$/.test(requestId)
    )
      throw Error("Invalid task request");
    if (
      !["builder", "debugger", "reviewer", "designer", "release"].includes(
        preset,
      )
    )
      throw Error("Unknown preset");
    if (
      (preset === "reviewer" && !["ask", "review"].includes(kind)) ||
      (preset === "release" && !["ask", "readiness"].includes(kind))
    )
      throw Error("This preset cannot edit source");
    if (
      !Array.isArray(attachments) ||
      attachments.length > 6 ||
      attachments.some(
        (id) => typeof id !== "string" || !/^([a-f0-9]{64})$/.test(id),
      )
    )
      throw Error("Invalid attachments");
    const p = await this.studio.get(project);
    if (p.archived) throw Error("Unarchive the project first");
    return this.mutate(() => {
      const prior = this.data.tasks.find((t) => t.requestId === requestId);
      if (prior) {
        if (
          prior.project !== project ||
          prior.kind !== kind ||
          prior.message !== message ||
          prior.preset !== preset ||
          JSON.stringify(prior.attachments ?? []) !==
            JSON.stringify(attachments)
        )
          throw Error("Idempotency key conflicts with an earlier request");
        return this.snapshot(prior);
      }
      if (this.data.tasks.length >= 500)
        throw Error(
          "Task retention limit reached; clear completed task history in Settings",
        );
      const t = {
        id: randomUUID(),
        requestId,
        project,
        kind,
        message,
        preset,
        attachments,
        provider: p.provider,
        status:
          ["build", "refine"].includes(kind) ||
          (p.template === "imported" && kind === "verify")
            ? "awaiting_approval"
            : "queued",
        created: new Date().toISOString(),
        sequence: 0,
        events: [],
      };
      this.event(t, t.status, { kind });
      this.data.tasks.push(t);
      return this.snapshot(t);
    });
  }
  async approvalHash(project) {
    if (this.studio.approvalFingerprint) return this.studio.approvalFingerprint(project);
    return createHash("sha256").update(JSON.stringify(await this.studio.get(project))).digest("hex");
  }
  approve(id) {
    return this.mutate(async () => {
      const t = this.get(id);
      if (t.status !== "awaiting_approval")
        throw Error("Task is not awaiting approval");
      t.approvedHash = await this.approvalHash(t.project);
      t.status = "queued";
      t.approvedAt = new Date().toISOString();
      this.event(t, "approved");
      return this.snapshot(t);
    });
  }
  async cancel(id) {
    return this.mutate(() => {
      const t = this.get(id);
      if (terminal.has(t.status)) return this.snapshot(t);
      if (t.status === "running") {
        t.cancelRequested = true;
        this.studio.cancel(t.project);
        this.event(t, "cancellation_requested");
      } else {
        t.status = "cancelled";
        this.event(t, "cancelled");
      }
      return this.snapshot(t);
    });
  }
  async record(project, type, data) {
    if (!this.active || this.get(this.active).project !== project) return;
    await this.mutate(() => this.event(this.get(this.active), type, data));
  }
  async pump() {
    if (
      this.closed ||
      this.active ||
      this.pumping ||
      this.studio.jobs.size ||
      this.studio.reserved
    )
      return;
    this.pumping = true;
    let next, timer;
    try {
      await this.mutate(() => {
        if (this.closed || this.studio.jobs.size || this.studio.reserved)
          return;
        next = this.data.tasks.find((t) => t.status === "queued");
        if (!next) return;
        this.active = next.id;
        next.status = "running";
        next.started = new Date().toISOString();
        this.event(next, "started");
      });
      if (!next) return;
      const p = await this.studio.get(next.project);
      if (p.provider !== next.provider)
        throw Error(
          "Provider changed since task was queued; submit a new task",
        );
      await this.mutate(async () => {
        if (this.closed || next.cancelRequested)
          throw Error("Cancelled before dispatch");
        if (next.approvedAt && next.approvedHash !== await this.approvalHash(next.project))
          throw Error("Project inputs changed after approval; retry and review again");
        await this.studio.action(next.project, next.kind, next.message);
      });
      timer = setTimeout(
        () => {
          next.timedOut = true;
          this.studio.cancel(next.project);
        },
        (this.studio.settings?.taskTimeoutMinutes ?? 20) * 60000,
      );
      while (this.studio.jobs.has(next.project))
        await new Promise((r) => setTimeout(r, 50));
      const done = await this.studio.get(next.project);
      await this.mutate(() => {
        next.status = next.timedOut
          ? "failed"
          : next.cancelRequested || done.status === "cancelled"
            ? "cancelled"
            : [
                  "planned",
                  "verified",
                  "complete",
                  "answered",
                  "reviewed",
                  "readiness",
                ].includes(done.status)
              ? "completed"
              : "failed";
        next.finished = new Date().toISOString();
        this.event(next, next.status, {
          projectStatus: done.status,
          error: done.error || null,
          evidence: done.evidence || null,
        });
      });
    } catch (e) {
      if (next)
        await this.mutate(() => {
          next.status =
            next.cancelRequested || this.closed ? "cancelled" : "failed";
          next.finished = new Date().toISOString();
          this.event(next, next.status, { message: e.message });
        });
    } finally {
      clearTimeout(timer);
      this.active = null;
      this.pumping = false;
    }
  }
  async clear() {
    return this.mutate(() => {
      this.data.tasks = this.data.tasks.filter((t) => !terminal.has(t.status));
      return { remaining: this.data.tasks.length };
    });
  }
  async close() {
    this.closed = true;
    clearInterval(this.timer);
    if (this.active) await this.cancel(this.active);
    await this.chain;
  }
}
