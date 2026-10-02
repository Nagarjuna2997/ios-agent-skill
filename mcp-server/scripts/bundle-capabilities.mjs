#!/usr/bin/env node
// Bundle the repository's capabilities/ folder into mcp-server/data/capabilities:
// manifests, recipes, templates and catalog are copied; apply.ts, verify.ts and
// _sdk are compiled to JavaScript so the published package needs no TypeScript.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "capabilities");
const target = join(here, "..", "data", "capabilities");
if (!existsSync(source)) throw new Error(`capabilities folder not found at ${source}`);
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, {
  recursive: true,
  // _evidence holds build screenshots for the repository docs; the package does not need them.
  filter: (path) =>
    !path.endsWith(".ts") &&
    !path.endsWith("tsconfig.json") &&
    !path.includes(`${join("capabilities", "node_modules")}`) &&
    !path.includes(`${join("capabilities", "_evidence")}`),
});
const tsc = createRequire(import.meta.url).resolve("typescript/bin/tsc");
execFileSync(process.execPath, [tsc, "-p", join(source, "tsconfig.json")], { stdio: "inherit" });
const commands = join(here, "..", "data", "commands");
mkdirSync(commands, { recursive: true });
cpSync(join(here, "..", "..", ".claude", "commands", "ios-build.md"), join(commands, "ios-build.md"));
console.log(`Bundled capabilities into ${target} and the /ios-build command`);
