import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { Studio, run } from "./engine.mjs";
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
      if (parts[0] !== "api") {
        const files = {
          "/": "index.html",
          "/app.js": "app.js",
          "/style.css": "style.css",
        };
        const f = files[u.pathname];
        if (!f) return send(404, { error: "Not found" });
        let b = await fs.readFile(path.join(here, "public", f));
        if (f === "index.html")
          b = Buffer.from(b.toString().replace("__TOKEN__", token));
        return send(
          200,
          b,
          {
            "index.html": "text/html; charset=utf-8",
            "app.js": "text/javascript",
            "style.css": "text/css",
          }[f],
        );
      }
      if (req.headers["x-studio-token"] !== token)
        return send(403, { error: "Reload Studio to reconnect." });
      if (req.method === "GET") {
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
          const [xcode, client, codex, devices] = await Promise.all([
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
          ]);
          return send(200, {
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
          ),
        );
      if (parts[1] === "projects" && parts[2]) {
        const id = parts[2];
        await studio.get(id);
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
              (await studio.get(id)).template === "custom"
                ? "project/AppProject.xcodeproj"
                : "project/ReadingList.xcodeproj",
            ),
          ]);
          return send(200, { ok: true });
        }
        if (parts[3] === "action")
          return send(202, await studio.action(id, body.kind, body.message));
      }
      send(404, { error: "Not found" });
    } catch (e) {
      send(400, { error: e.message });
    }
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  return { server, studio, origin };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await serve({
    port: Number(process.env.STUDIO_PORT || 8844),
    ...(process.env.STUDIO_HOME ? { root: process.env.STUDIO_HOME } : {}),
  });
  console.log(
    `iOS Agent Studio · ${app.origin}\nProjects stay in ${app.studio.root}`,
  );
  for (const s of ["SIGINT", "SIGTERM"])
    process.on(s, async () => {
      for (const id of app.studio.jobs.keys()) app.studio.cancel(id);
      app.server.close();
      while (app.studio.jobs.size) await new Promise((r) => setTimeout(r, 50));
      process.exit();
    });
}
