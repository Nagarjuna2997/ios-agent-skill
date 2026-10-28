import { chromium } from "../benchmarks/universal/fidelity/node_modules/playwright/index.mjs";
import { serve } from "./server.mjs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const root = await mkdtemp(path.join(os.tmpdir(), "studio-workspace-ui-"));
const app = await serve({ port: 0, root, repo: process.cwd() });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_BIN ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1000 },
  });
  page.on(
    "pageerror",
    (e) => (errors.push(e.message), console.error("PAGE", e.message)),
  );
  await page.goto(app.origin);
  await page.locator("#name").fill("Workspace smoke");
  await page.locator("#brief").fill("Synthetic UI test workspace");
  await page.locator("#template").selectOption("reading-list");
  await page.locator("#provider").selectOption("codex");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await page.waitForFunction(
    () => document.getElementById("title").textContent === "Workspace smoke",
  );
  await page.locator("#source-inspector summary").click();
  await page.locator("#refresh-source").click();
  await page.locator("#source-file").selectOption("App/ReadingStore.swift");
  await page.waitForFunction(() =>
    document.getElementById("source-text").textContent.includes("import"),
  );
  await page.locator("#project-settings summary").click();
  await page.locator("#project-name").fill("Renamed workspace");
  await page.locator("#save-project").click();
  await page.waitForFunction(
    () => document.getElementById("title").textContent === "Renamed workspace",
  );
  await page.locator("#pin-project").click();
  await page.waitForFunction(() =>
    document.getElementById("projects").textContent.includes("★"),
  );
  // Synthetic frozen plan only for approval UI: never call a provider or simulate a build pass.
  const [project] = await app.studio.list();
  project.plan = {
    summary: "Synthetic approval check",
    screens: ["List"],
    criteria: ["Build not executed"],
  };
  await app.studio.save(project);
  await page.waitForTimeout(2200);
  await page.locator("#build").click();
  await page.waitForFunction(() =>
    document
      .getElementById("task-queue")
      .textContent.includes("awaiting_approval"),
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.waitForFunction(() =>
    document.getElementById("task-queue").textContent.includes("cancelled"),
  );
  await page.locator("#project-search").fill("not-found");
  await page.waitForFunction(
    () => document.querySelectorAll("#projects button").length === 0,
  );
  await page.locator("#project-search").fill("Renamed");
  await page.waitForTimeout(250);
  assert.equal(await page.locator("#projects button").count(), 1);
  await page.screenshot({
    path: "/tmp/studio-workspace-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/studio-workspace-narrow.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "narrow window overflows",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real HTTP/browser creation, settings, source inspection, search, pinning, approval cancellation, desktop/narrow layout; synthetic plan, no simulated provider/build success.",
  );
} finally {
  await browser.close();
  await app.tasks.close();
  await new Promise((r) => app.server.close(r));
  await rm(root, { recursive: true, force: true });
}
