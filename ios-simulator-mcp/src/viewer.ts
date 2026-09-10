import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Runner } from "./runner.js";

/** The random URL is a local read-only bearer capability; never share it publicly. */
export async function startViewer(runner: Runner, udid: string): Promise<{ url: string; close: () => Promise<void> }> {
  if (!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(udid)) throw new Error("A concrete simulator UDID is required");
  const directory = await mkdtemp(join(tmpdir(), "ios-agent-viewer-"));
  const screenshotPath = join(directory, "screen.png");
  const token = randomBytes(32).toString("hex");
  let origin = "", closed = false, lastCapture = 0, failed = false;
  let capture: Promise<Buffer> | undefined, cached: Buffer | undefined;
  async function frame(): Promise<Buffer> {
    if (closed) throw new Error("Viewer closed");
    if (capture) return capture;
    if (Date.now() - lastCapture < 1000) {
      if (failed || !cached) throw new Error("Capture unavailable");
      return cached;
    }
    lastCapture = Date.now();
    capture = (async () => {
      try {
        const result = await runner.run("xcrun", ["simctl", "io", udid, "screenshot", "--type=png", screenshotPath], { timeoutMs: 15_000 });
        if (result.exitCode !== 0) throw new Error("Capture failed");
        const bytes = await readFile(screenshotPath);
        if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error("Invalid screenshot");
        cached = bytes; failed = false;
        return bytes;
      } catch (error) { failed = true; throw error; }
      finally { capture = undefined; }
    })();
    return capture;
  }
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    response.setHeader("X-Frame-Options", "DENY");
    const reject = (status: number, message: string) => { response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }); response.end(message); };
    if (request.headers.host !== origin.slice(7) || (request.headers.origin && request.headers.origin !== origin) || request.headers["sec-fetch-site"] === "cross-site") return reject(403, "Forbidden");
    if (request.method !== "GET") { response.setHeader("Allow", "GET"); return reject(405, "GET required"); }
    const path = request.url?.split("?")[0];
    if (path !== `/${token}/` && path !== `/${token}/frame.png`) return reject(404, "Not found");
    if (closed) return reject(503, "Viewer closed");
    if (path.endsWith("frame.png")) {
      try { const bytes = await frame(); response.writeHead(200, { "Content-Type": "image/png" }); response.end(bytes); }
      catch { reject(503, "Screenshot unavailable. Check that this simulator is booted."); }
      return;
    }
    const nonce = randomBytes(18).toString("base64");
    response.setHeader("Content-Security-Policy", `default-src 'none'; img-src 'self'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Simulator preview</title><style nonce="${nonce}">body{margin:0;background:#17191e;color:#f5f5f7;font:15px system-ui}header{padding:16px}h1{font-size:20px;margin:0}p{line-height:1.5;overflow-wrap:anywhere}button{padding:8px 12px;margin-right:8px}main{text-align:center}img{max-width:100%;height:auto}img.fit{max-height:70vh;object-fit:contain}#status{font-size:13px}</style><header><h1>Simulator preview</h1><p>Read-only preview. Interact with your app in the native Simulator window.</p><p>Device: ${udid}</p><button id="pause" type="button">Pause</button><button id="fit" type="button" aria-pressed="true">Fit: on</button><p id="status" role="status">Loading screenshot…</p></header><main><img id="screen" class="fit" alt="Current simulator screen"></main><script nonce="${nonce}">const screen=document.getElementById('screen'),status=document.getElementById('status'),pause=document.getElementById('pause'),fit=document.getElementById('fit');let paused=false,timer;function next(){if(!paused){clearTimeout(timer);timer=setTimeout(refresh,1100)}}function refresh(){if(paused)return;screen.src='frame.png?t='+Date.now()}screen.onload=()=>{status.textContent='Updated '+new Date().toLocaleTimeString();next()};screen.onerror=()=>{status.textContent='Screenshot unavailable. Check that the simulator is booted.';next()};pause.onclick=()=>{paused=!paused;clearTimeout(timer);pause.textContent=paused?'Resume':'Pause';if(!paused)refresh()};fit.onclick=()=>{const on=screen.classList.toggle('fit');fit.textContent='Fit: '+(on?'on':'off');fit.setAttribute('aria-pressed',String(on))};refresh();</script></html>`);
  });
  server.requestTimeout = 20_000;
  server.headersTimeout = 10_000;
  try { await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", () => { server.removeListener("error", reject); resolve(); }); }); }
  catch (error) { await rm(directory, { recursive: true, force: true }); throw error; }
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Viewer did not bind a TCP port");
  origin = `http://127.0.0.1:${address.port}`;
  let closing: Promise<void> | undefined;
  return { url: `${origin}/${token}/`, close: () => {
    closing ??= (async () => {
      closed = true;
      const stopped = new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      server.closeIdleConnections();
      await capture?.catch(() => undefined);
      await stopped;
      await rm(directory, { recursive: true, force: true });
    })();
    return closing;
  } };
}
