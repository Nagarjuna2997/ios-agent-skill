import { releaseDraft, saveReleaseDraft, prepareStudioRelease, releaseFiles, startReleaseOperation, releaseImage } from "./release.mjs";
import { artifacts, artifactImage, deleteArtifact } from "./artifacts.mjs";
import { loadSettings, saveSettings } from "./settings.mjs";
import { importFolder } from "./imported.mjs";
import { TaskManager } from "./tasks.mjs";
import { installWorkspace } from "./workspace.mjs";
installWorkspace(Studio);
import { UniversalStudio } from "./universal.mjs";
import { LocalBackend } from "./backend.mjs";
import { LivePreview } from "./live.mjs";
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { Studio, run } from "./engine.mjs";
import { resolveToolPath } from "./environment.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
export async function serve({
  port = 8844,
  root = path.join(
    os.homedir(),
    "Library/Application Support/iOS Agent Studio",
  ),
  repo = path.dirname(here),
} = {}) {
  const studio = new Studio(root, repo);
  await studio.init();
  studio.settings = await loadSettings(root);
  const tasks = new TaskManager(studio);
  studio.tasks = tasks;
  await tasks.init();
  const universal = new UniversalStudio(root, repo, () => {
    if (studio.jobs.size || studio.reserved)
      throw Error("Stop the active Studio task or live preview first");
    studio.reserved = true;
    return () => {
      studio.reserved = false;
    };
  });
  await universal.init();
  studio.backend = new LocalBackend(root);
  const live = new LivePreview(studio);
  const token = randomBytes(32).toString("hex");
  let origin;
  const server = http.createServer(async (req, res) => {
    const send = (status, value, type = "application/json") => {
      res.writeHead(status, {
        "Content-Type": type,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy":
          "default-src 'self'; style-src 'self'; img-src 'self' data: blob:; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      });
      res.end(type === "application/json" ? JSON.stringify(value) : value);
    };
    try {
      if (req.headers.host !== new URL(origin).host)
        return send(403, { error: "Invalid host" });
      if (req.headers.origin && req.headers.origin !== origin)
        return send(403, { error: "Invalid origin" });
      const u = new URL(req.url, origin);
      const parts = u.pathname.split("/").filter(Boolean);
      const readBody = async (limit) => {
        const chunks = [];
        let size = 0;
        for await (const b of req) {
          size += b.length;
          if (size > limit) throw Error("Request too large");
          chunks.push(b);
        }
        return Buffer.concat(chunks);
      };
      if (u.pathname === "/_studio" && req.method === "GET")
        return send(200, { product: "iOS Agent Studio", protocol: 1 });
      if (parts[0] === "driver") {
        if (!live.authorize(parts[1], req.headers["x-preview-token"]))
          return send(403, { error: "Preview authorization failed" });
        if (parts[2] === "command" && req.method === "GET")
          return send(200, live.command());
        if (parts[2] === "frame" && req.method === "POST") {
          live.frame(
            await readBody(8000000),
            req.headers["x-command-completed"],
            req.headers["x-input-error"],
          );
          return send(200, { ok: true });
        }
        return send(404, { error: "Unknown preview route" });
      }
      if (parts[0] === "backend") {
        const p = await studio.get(parts[1]);
        if (
          p.backend !== "local" ||
          !(await studio.backend.authorized(
            p.id,
            req.headers.authorization?.replace(/^Bearer /, ""),
          ))
        )
          return send(403, { error: "Backend authorization failed" });
        const ns = req.headers["x-workspace"];
        if (parts[2] !== "records") return send(404, { error: "Not found" });
        if (req.method === "GET" && !parts[3])
          return send(200, await studio.backend.records(p.id, ns));
        if (req.method === "PUT" && parts[3]) {
          const body = JSON.parse((await readBody(64000)).toString());
          return send(
            200,
            await studio.backend.mutate(p.id, ns, parts[3], body.fields),
          );
        }
        if (req.method === "DELETE" && parts[3]) {
          await studio.backend.mutate(p.id, ns, parts[3], null);
          res.writeHead(204);
          return res.end();
        }
        return send(405, { error: "Method not allowed" });
      }
      if (parts[0] !== "api") {
        const files = {
          "/": "index.html",
          "/universal": "universal.html",
          "/universal.js": "universal.js",
          "/app.js": "app.js",
          "/style.css": "style.css",
        };
        const f = files[u.pathname];
        if (!f) return send(404, { error: "Not found" });
        let b = await fs.readFile(path.join(here, "public", f));
        if (f === "index.html" || f === "universal.html")
          b = Buffer.from(b.toString().replace("__TOKEN__", token));
        return send(
          200,
          b,
          {
            "index.html": "text/html; charset=utf-8",
            "universal.html": "text/html; charset=utf-8",
            "universal.js": "text/javascript",
            "app.js": "text/javascript",
            "style.css": "text/css",
          }[f],
        );
      }
      if (req.headers["x-studio-token"] !== token)
        return send(403, { error: "Reload Studio to reconnect." });
      if (parts[1] === "import-project" && req.method === "POST") {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return send(415, { error: "JSON required" });
        const body = JSON.parse((await readBody(1000)).toString());
        return send(201, await importFolder(studio, body.provider));
      }
      if (parts[1] === "settings") {
        if (req.method === "GET") return send(200, studio.settings);
        if (
          req.method === "POST" &&
          req.headers["content-type"]?.startsWith("application/json")
        ) {
          if (studio.jobs.size)
            throw Error(
              "Wait for the active task before changing execution limits",
            );
          studio.settings = await saveSettings(
            root,
            JSON.parse((await readBody(2000)).toString()),
          );
          return send(200, studio.settings);
        }
        return send(405, { error: "Method not allowed" });
      }
      if (parts[1] === "capabilities" && req.method === "GET") {
        let base = path.join(repo, "capabilities");
        try {
          await fs.access(base);
        } catch {
          base = path.join(repo, "mcp-server/data/capabilities");
        }
        const rows = [];
        for (const e of await fs.readdir(base, { withFileTypes: true })) {
          if (!e.isDirectory() || e.name.startsWith("_")) continue;
          try {
            rows.push(
              JSON.parse(
                await fs.readFile(
                  path.join(base, e.name, "manifest.json"),
                  "utf8",
                ),
              ),
            );
          } catch {}
        }
        return send(200, rows);
      }
      if (
        parts[1] === "tasks" &&
        parts[2] &&
        parts[3] === "stream" &&
        req.method === "GET"
      ) {
        let cursor = Number(u.searchParams.get("after") || 0);
        tasks.replay(parts[2], cursor);
        res.writeHead(200, {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        const tick = () => {
          try {
            const batch = tasks.replay(parts[2], cursor);
            for (const event of batch.events) {
              res.write(JSON.stringify(event) + "\n");
              cursor = event.sequence;
            }
            if (
              ["completed", "failed", "cancelled", "interrupted"].includes(
                batch.task.status,
              )
            ) {
              clearInterval(timer);
              res.end();
            }
          } catch {
            clearInterval(timer);
            res.end();
          }
        };
        const timer = setInterval(tick, 250);
        req.on("close", () => clearInterval(timer));
        tick();
        return;
      }
      if (parts[1] === "tasks") {
        if (req.method === "GET")
          return send(
            200,
            parts[2]
              ? tasks.replay(parts[2], Number(u.searchParams.get("after") || 0))
              : tasks
                  .list(u.searchParams.get("project"))
                  .slice(-100)
                  .map((t) => ({ ...t, events: t.events.slice(-10) })),
          );
        if (
          req.method !== "POST" ||
          !req.headers["content-type"]?.startsWith("application/json")
        )
          return send(415, { error: "JSON required" });
        const body = JSON.parse((await readBody(20000)).toString());
        if (parts[2] === "clear") return send(200, await tasks.clear());
        if (!parts[2])
          return send(202, await tasks.enqueue(body.project, body));
        if (parts[3] === "retry") return send(202, await tasks.retry(parts[2]));
        if (parts[3] === "approve")
          return send(200, await tasks.approve(parts[2]));
        if (parts[3] === "cancel")
          return send(200, await tasks.cancel(parts[2]));
        return send(404, { error: "Unknown task route" });
      }
      if (
        parts[1] === "projects" &&
        parts[2] &&
        ["settings", "delete", "source", "revisions", "attachment", "artifacts", "release"].includes(
          parts[3],
        )
      ) {
        const id = parts[2];
        if (req.method === "GET" && parts[3] === "release" && parts[4] === "image") return send(200, await releaseImage(studio, id, u.searchParams.get("path")), "image/png");
        if (req.method === "GET" && parts[3] === "release") return send(200, parts[4] === "files" ? await releaseFiles(studio, id) : await releaseDraft(studio, id));
        if (req.method === "GET" && parts[3] === "artifacts")
          return parts[4] ? send(200, await artifactImage(studio, id, parts[4], u.searchParams.get("name")), "image/png") : send(200, await artifacts(studio, id));
        if (req.method === "GET" && parts[3] === "source")
          return send(
            200,
            await studio.inspectSource(
              id,
              u.searchParams.get("path") ?? undefined,
            ),
          );
        if (req.method === "GET" && parts[3] === "revisions")
          return send(
            200,
            parts[4]
              ? await studio.revisionDiff(id, parts[4])
              : await studio.revisions(id),
          );
        if (
          req.method !== "POST" ||
          !req.headers["content-type"]?.startsWith("application/json")
        )
          return send(415, { error: "JSON required" });
        const body = JSON.parse(
          (
            await readBody(parts[3] === "attachment" ? 11500000 : 20000)
          ).toString(),
        );
        if (parts[3] === "artifacts") return send(200, await deleteArtifact(studio, id, parts[4], body.confirmation));
        if (parts[3] === "release" && ["archive", "upload"].includes(parts[4])) return send(202, await startReleaseOperation(studio, id, parts[4], body));
        if (parts[3] === "release") return send(200, parts[4] === "prepare" ? await prepareStudioRelease(studio, id, body) : await saveReleaseDraft(studio, id, body));
        if (parts[3] === "settings")
          return send(200, await studio.updateProject(id, body));
        if (parts[3] === "delete")
          return send(200, await studio.deleteProject(id, body.confirmation));
        if (parts[3] === "attachment")
          return send(201, await studio.attach(id, body));
      }
      if (parts[1] === "universal") {
        if (req.method === "GET" && parts.length === 2)
          return send(200, await universal.list());
        if (
          req.method === "GET" &&
          parts.length === 3 &&
          parts[2] === "simulators"
        )
          return send(200, await universal.simulators());
        if (req.method === "GET" && parts.length === 3)
          return send(200, await universal.get(parts[2]));
        if (
          req.method === "GET" &&
          parts.length === 4 &&
          parts[3] === "capture-comparison"
        )
          return send(200, await universal.compareCaptures(parts[2]));
        if (
          req.method === "GET" &&
          parts.length === 4 &&
          parts[3] === "reconciliation"
        )
          return send(200, await universal.compareRevision(parts[2]));
        if (req.method === "GET" && parts.length === 4 && parts[3] === "source")
          return send(200, await universal.source(parts[2]));
        if (
          req.method === "GET" &&
          parts.length === 6 &&
          parts[3] === "captures" &&
          parts[5] === "source"
        )
          return send(200, await universal.capturedSource(parts[2], parts[4]));
        if (
          req.method === "GET" &&
          parts.length === 5 &&
          parts[3] === "captures"
        )
          return send(
            200,
            await universal.image(parts[2], parts[4]),
            "image/png",
          );
        if (req.method === "GET" && parts.length === 4 && parts[3] === "image")
          return send(200, await universal.image(parts[2]), "image/png");
        if (req.method !== "POST")
          return send(405, { error: "Method not allowed" });
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return send(415, { error: "JSON required" });
        const body = JSON.parse((await readBody(1600000)).toString("utf8"));
        if (parts.length === 2) return send(201, await universal.create(body));
        if (parts.length === 3 && parts[2] === "project")
          return send(201, await universal.createProject(body));
        if (parts.length === 4 && parts[3] === "revision")
          return send(201, await universal.createRevision(parts[2], body));
        if (parts.length === 4 && parts[3] === "generate")
          return send(200, await universal.generate(parts[2]));
        if (parts.length === 4 && parts[3] === "export")
          return send(
            200,
            await universal.exportProject(parts[2]),
            "application/zip",
          );
        if (parts.length === 4 && parts[3] === "build")
          return send(202, await universal.startBuild(parts[2], body));
        if (parts.length === 4 && parts[3] === "cancel") {
          universal.cancel(parts[2]);
          return send(200, { ok: true });
        }
        return send(404, { error: "Unknown conversion route" });
      }
      if (req.method === "GET") {
        if (parts[1] === "live") {
          if (parts[2] === "frame") {
            if (!live.session?.frame)
              return send(404, { error: "No live frame" });
            return send(200, live.session.frame, "image/png");
          }
          return send(200, live.status());
        }
        if (parts[1] === "projects" && !parts[2])
          return send(200, await studio.list());
        if (parts[1] === "health") {
          const check = async (c, a) => {
            try {
              return (await run(c, a, { timeout: 15000 })).trim();
            } catch {
              return null;
            }
          };
          const [xcode, client, codex, devices, xcodegen] = await Promise.all([
            check("xcodebuild", ["-version"]),
            check("claude", ["--version"]),
            check("codex", ["--version"]),
            check("xcrun", [
              "simctl",
              "list",
              "devices",
              "available",
              "--json",
            ]),
            check("xcodegen", ["--version"]),
          ]);
          const authentication = {};
          for (const [provider, args] of [
            ["codex", ["login", "status"]],
            ["claude", ["auth", "status"]],
          ]) {
            try {
              const status = await run(provider, args, { timeout: 10000 });
              authentication[provider] =
                provider === "claude"
                  ? JSON.parse(status).loggedIn
                    ? "signed-in"
                    : "signed-out"
                  : "signed-in";
            } catch {
              authentication[provider] = "unavailable-or-signed-out";
            }
          }
          return send(200, {
            authentication,
            xcodegen,
            xcode,
            client,
            codex,
            simulator: devices
              ? Object.values(JSON.parse(devices).devices)
                  .flat()
                  .some(
                    (d) =>
                      d.isAvailable &&
                      d.deviceTypeIdentifier?.includes("iPhone"),
                  )
              : false,
          });
        }
        if (parts[1] === "projects" && parts[2]) {
          if (parts[3] === "backend") {
            const p = await studio.get(parts[2]);
            return send(200, {
              enabled: p.backend === "local",
              records:
                p.backend === "local"
                  ? await studio.backend.records(p.id, "preview")
                  : [],
            });
          }
          if (parts[3] === "screen")
            return send(
              200,
              await studio.screenshot(parts[2], u.searchParams.get("name")),
              "image/png",
            );
          if (parts[3] === "log") {
            let s = "No build output yet.";
            try {
              s = (
                await fs.readFile(
                  path.join(studio.dir(parts[2]), "verification.log"),
                  "utf8",
                )
              ).slice(-24000);
            } catch {}
            return send(200, { text: s });
          }
          return send(200, await studio.get(parts[2]));
        }
      }
      if (req.method !== "POST")
        return send(405, { error: "Method not allowed" });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return send(415, { error: "JSON required" });
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 20000)
          return send(413, { error: "Request too large" });
      }
      const body = JSON.parse(raw || "{}");
      if (parts[1] === "projects" && !parts[2])
        return send(
          201,
          await studio.create(
            body.name,
            body.brief,
            body.provider,
            body.template,
            body.backend,
          ),
        );
      if (parts[1] === "projects" && parts[2]) {
        const id = parts[2];
        await studio.get(id);
        if (parts[3] === "live-start") return send(202, await live.start(id));
        if (parts[3] === "live-stop") {
          if (live.session?.project !== id) throw Error("Wrong live project");
          return send(200, await live.stop());
        }
        if (parts[3] === "live-input") return send(202, live.input(id, body));
        if (parts[3] === "restore") return send(200, await studio.restore(id));
        if (parts[3] === "export") {
          const archive = await studio.exportProject(id);
          const folder = path.join(studio.dir(id), "exports");
          await fs.mkdir(folder, { recursive: true });
          const filename = "AppProject-" + Date.now() + ".zip";
          await fs.writeFile(path.join(folder, filename), archive, {
            flag: "wx",
          });
          return send(200, { filename });
        }
        if (parts[3] === "cancel") {
          studio.cancel(id);
          return send(200, { ok: true });
        }
        if (parts[3] === "reveal") {
          await run("open", [studio.dir(id)]);
          return send(200, { ok: true });
        }
        if (parts[3] === "xcode") {
          await run("open", [
            path.join(
              studio.dir(id),
              (await studio.get(id)).template === "imported"
                ? `project/${(await studio.get(id)).importInfo.project}`
                : (await studio.get(id)).template === "agent"
                  ? `project/${(await studio.get(id)).agentPlan?.appName}.xcodeproj`
                  : (await studio.get(id)).template === "custom"
                    ? "project/AppProject.xcodeproj"
                    : "project/ReadingList.xcodeproj",
            ),
          ]);
          return send(200, { ok: true });
        }
        if (parts[3] === "action")
          return send(202, await tasks.enqueue(id, { kind: body.kind, message: body.message ?? "", requestId: body.requestId ?? `legacy_${randomBytes(16).toString("hex")}` }));
      }
      send(404, { error: "Not found" });
    } catch (e) {
      send(400, { error: e.message });
    }
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  studio.origin = origin;
  server.on("close", () => void tasks.close());
  return { server, studio, universal, live, tasks, origin };
}
if (process.argv[1] && await fs.realpath(process.argv[1]).catch(() => null) === await fs.realpath(fileURLToPath(import.meta.url))) {
  // Finder and the Mac launcher start Studio with a minimal PATH; use the
  // login shell PATH so installed Codex/Claude CLIs and Xcode tools resolve.
  if (process.platform === "darwin") process.env.PATH = await resolveToolPath();
  const app = await serve({
    port: Number(process.env.STUDIO_PORT || 8844),
    ...(process.env.STUDIO_HOME ? { root: process.env.STUDIO_HOME } : {}),
  });
  console.log(
    `iOS Agent Studio · ${app.origin}\nProjects stay in ${app.studio.root}`,
  );
  for (const s of ["SIGINT", "SIGTERM"])
    process.on(s, async () => {
      await app.tasks.close();
      for (const id of app.studio.jobs.keys()) app.studio.cancel(id);
      await app.live.stop();
      for (const id of app.universal.controllers.keys())
        app.universal.cancel(id);
      await Promise.allSettled(
        [...app.universal.jobs.values()].filter((v) => v instanceof Promise),
      );
      app.server.close();
      while (app.studio.jobs.size) await new Promise((r) => setTimeout(r, 50));
      process.exit();
    });
}
