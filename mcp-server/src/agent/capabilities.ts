// Capability system: every app capability (sign-in, payments, maps, charts,
// launch screen, ...) is a self-contained folder with the same contract:
//
//   capabilities/<id>/manifest.json  declarative requirements, credentials, cost, status
//   capabilities/<id>/recipe.md      implementation guidance, linking the knowledge base
//   capabilities/<id>/template/      Swift and resource files copied into the app
//   capabilities/<id>/apply.ts       optional extra project mutations
//   capabilities/<id>/verify.ts      builds the capability into a minimal app
//
// The agent never special-cases a capability: adding one is adding a folder.
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";
import { PackageSchema, SecretSchema, maxOS, type AppSpec, type PackageDependency } from "./spec.js";

export const CATEGORIES = [
  "app-structure",
  "authentication",
  "backend",
  "persistence",
  "payments",
  "maps-location",
  "media-camera",
  "notifications",
  "launch-screen",
  "app-icon",
  "assets",
  "animation",
  "3d-ar",
  "charts",
  "networking",
  "ai-ml",
  "analytics",
  "localization",
  "accessibility",
  "widgets",
  "app-clips",
  "sharing-deep-links",
  "background",
  "security",
  "distribution",
  "health-fitness",
  "device-hardware",
  "web-content",
  "communication",
  "productivity",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["verified", "untested", "blocked"] as const;
export const COST_MODELS = ["free", "one-time", "subscription", "usage-based"] as const;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CostSchema = z
  .object({
    model: z.enum(COST_MODELS),
    note: z.string().min(1),
    link: z.string().url().optional(),
    /** Only amounts confirmed on the vendor's page carry verified: true and checkedOn. */
    amounts: z
      .array(
        z
          .object({
            label: z.string().min(1),
            usd: z.number().nonnegative(),
            period: z.enum(["once", "month", "year"]),
            verified: z.boolean(),
            checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            source: z.string().url().optional(),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();
export type Cost = z.infer<typeof CostSchema>;

export const ManifestSchema = z
  .object({
    id: z.string().regex(ID),
    name: z.string().min(1).max(80),
    category: z.enum(CATEGORIES),
    description: z.string().min(1).max(400),
    default: z.boolean(),
    appleNative: z.boolean(),
    alternatives: z.array(z.string().regex(ID)).default([]),
    requires: z
      .object({
        capabilities: z.array(z.string().regex(ID)).default([]),
        entitlements: z.record(z.unknown()).default({}),
        infoPlist: z.record(z.unknown()).default({}),
        packages: z.array(PackageSchema).default([]),
        buildSettings: z.record(z.string()).default({}),
        frameworks: z.array(z.string()).default([]),
      })
      .strict()
      .default({}),
    credentialsNeeded: z.array(SecretSchema.omit({ capability: true })).default([]),
    cost: CostSchema,
    platforms: z.array(z.enum(["iOS", "iPadOS", "macOS", "watchOS", "tvOS", "visionOS"])).min(1),
    minOS: z.string().regex(/^\d{2}\.\d$/),
    status: z.enum(STATUSES),
    statusNote: z.string().min(1),
    docs: z.array(z.string()).default([]),
    /** Instructions for code generation: the types the template provides and how to wire them into screens. */
    usage: z.string().min(1).max(2000),
    /** Folder (under the app sources) that receives template/. */
    destination: z.string().regex(/^[A-Za-z][A-Za-z0-9/]*$/).optional(),
  })
  .strict();
export type Manifest = z.infer<typeof ManifestSchema>;

export interface LoadedCapability {
  manifest: Manifest;
  dir: string;
  templateFiles: string[];
  applyModule?: string;
  verifyModule?: string;
}

const here = dirname(fileURLToPath(import.meta.url));

/** Bundled capabilities (built from the repository's capabilities/ folder) unless overridden. */
export function capabilitiesDir(): string {
  return process.env.IOS_AGENT_CAPABILITIES ?? join(here, "..", "..", "data", "capabilities");
}

async function listFiles(dir: string, base = dir): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else if (entry.isFile()) out.push(relative(base, full).split("\\").join("/"));
  }
  return out.sort();
}

export class CapabilityError extends Error {}

/**
 * Load and validate every capability folder. Source folders carry apply.ts and
 * verify.ts; the bundled copy carries their compiled .js. Either form passes.
 */
export async function loadCapabilities(dir = capabilitiesDir()): Promise<Map<string, LoadedCapability>> {
  if (!existsSync(dir)) throw new CapabilityError(`Capability folder not found: ${dir}. Build mcp-server (npm run build) to bundle capabilities.`);
  const loaded = new Map<string, LoadedCapability>();
  const problems: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const folder = join(dir, entry.name);
    if (!existsSync(join(folder, "manifest.json"))) continue;
    let manifest: Manifest;
    try {
      manifest = ManifestSchema.parse(JSON.parse(await readFile(join(folder, "manifest.json"), "utf8")));
    } catch (error) {
      problems.push(`${entry.name}/manifest.json: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    if (manifest.id !== entry.name) problems.push(`${entry.name}: manifest id ${manifest.id} must match its folder name`);
    if (!existsSync(join(folder, "recipe.md"))) problems.push(`${entry.name}: recipe.md is missing`);
    const applyModule = ["apply.js", "apply.ts"].map((f) => join(folder, f)).find(existsSync);
    const verifyModule = ["verify.js", "verify.ts"].map((f) => join(folder, f)).find(existsSync);
    if (!applyModule) problems.push(`${entry.name}: apply.ts is missing`);
    if (!verifyModule) problems.push(`${entry.name}: verify.ts is missing`);
    if (manifest.status === "verified" && !existsSync(join(folder, "verification.json"))) {
      problems.push(`${entry.name}: status verified requires verification.json from a passing verify run`);
    }
    const templateFiles = await listFiles(join(folder, "template"));
    loaded.set(manifest.id, {
      manifest,
      dir: folder,
      templateFiles,
      ...(applyModule ? { applyModule } : {}),
      ...(verifyModule ? { verifyModule } : {}),
    });
  }
  for (const capability of loaded.values()) {
    for (const dependency of capability.manifest.requires.capabilities) {
      if (!loaded.has(dependency)) problems.push(`${capability.manifest.id}: requires unknown capability ${dependency}`);
    }
  }
  const defaults = new Map<string, string[]>();
  for (const capability of loaded.values()) {
    if (capability.manifest.default) defaults.set(capability.manifest.category, [...(defaults.get(capability.manifest.category) ?? []), capability.manifest.id]);
  }
  for (const [category, ids] of defaults) if (ids.length > 1) problems.push(`category ${category} has more than one default: ${ids.join(", ")}`);
  if (problems.length) throw new CapabilityError(`Invalid capabilities:\n${problems.join("\n")}`);
  return loaded;
}

export interface CatalogEntry {
  id: string;
  name: string;
  category: Category;
  appleNative: boolean;
  defaultInCategory: boolean;
  cost: { model: (typeof COST_MODELS)[number]; note: string };
  credentials: string[];
  docs: string[];
  priority: "P0" | "P1" | "P2" | "P3";
  status: "verified" | "untested" | "blocked" | "planned";
}

export async function loadCatalog(dir = capabilitiesDir()): Promise<CatalogEntry[]> {
  const file = join(dir, "catalog.json");
  if (!existsSync(file)) return [];
  return (JSON.parse(await readFile(file, "utf8")) as { entries: CatalogEntry[] }).entries;
}

export interface Resolution {
  ordered: LoadedCapability[];
  /** Capabilities added because another one, or a category default, required them. */
  added: Array<{ id: string; because: string }>;
  /** Requested capabilities that have no module yet (catalog-only) or are unknown. */
  unavailable: Array<{ id: string; reason: string; catalog?: CatalogEntry }>;
}

/**
 * Map requested capability ids (or category names, which select that
 * category's Apple-native default) to an ordered, dependency-first list.
 */
export function resolveCapabilities(requested: string[], loaded: Map<string, LoadedCapability>, catalog: CatalogEntry[] = []): Resolution {
  const added: Resolution["added"] = [];
  const unavailable: Resolution["unavailable"] = [];
  const roots: string[] = [];
  for (const raw of requested) {
    const id = raw.trim().toLowerCase();
    if (loaded.has(id)) {
      roots.push(id);
      continue;
    }
    if ((CATEGORIES as readonly string[]).includes(id)) {
      const fallback = [...loaded.values()].find((c) => c.manifest.category === id && c.manifest.default);
      if (fallback) {
        roots.push(fallback.manifest.id);
        added.push({ id: fallback.manifest.id, because: `default for ${id}` });
      } else unavailable.push({ id, reason: `No capability module is the default for category ${id} yet.` });
      continue;
    }
    const entry = catalog.find((e) => e.id === id);
    unavailable.push(
      entry
        ? { id, reason: `Listed in the catalog (status ${entry.status}) but no module is implemented yet.`, catalog: entry }
        : { id, reason: "Unknown capability id. Use ios_capabilities to search the catalog." },
    );
  }
  const ordered: LoadedCapability[] = [];
  const state = new Map<string, "visiting" | "done">();
  const visit = (id: string, parent?: string) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") throw new CapabilityError(`Capability dependency cycle through ${id}`);
    state.set(id, "visiting");
    const capability = loaded.get(id)!;
    for (const dependency of capability.manifest.requires.capabilities) {
      if (state.get(dependency) !== "done" && !roots.includes(dependency) && !added.some((a) => a.id === dependency)) {
        added.push({ id: dependency, because: `required by ${id}` });
      }
      visit(dependency, id);
    }
    state.set(id, "done");
    ordered.push(capability);
    void parent;
  };
  for (const id of roots) visit(id);
  return { ordered, added, unavailable };
}

// ---------------------------------------------------------------------------
// Applying capabilities to a spec and project.

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function mergeValue(target: Record<string, unknown>, key: string, value: unknown, owner: string, where: string): void {
  const current = target[key];
  if (current === undefined) {
    target[key] = structuredClone(value);
  } else if (Array.isArray(current) && Array.isArray(value)) {
    target[key] = [...current, ...value.filter((v) => !current.some((c) => JSON.stringify(c) === JSON.stringify(v)))];
  } else if (isObject(current) && isObject(value)) {
    for (const [k, v] of Object.entries(value)) mergeValue(current, k, v, owner, `${where}.${key}`);
  } else if (JSON.stringify(current) !== JSON.stringify(value)) {
    throw new CapabilityError(`${owner} sets ${where}.${key} to ${JSON.stringify(value)}, which conflicts with ${JSON.stringify(current)}.`);
  }
}

export interface ApplyContext {
  readonly id: string;
  readonly appName: string;
  readonly bundleId: string;
  readonly displayName: string;
  readonly sourcesDir: string;
  readonly capabilities: readonly string[];
  setInfoPlist(key: string, value: unknown): void;
  addEntitlement(key: string, value: unknown): void;
  addBuildSetting(key: string, value: string): void;
  addPackage(pkg: PackageDependency): void;
  setAppIcon(name: string): void;
  /** Write a file relative to the app sources folder (e.g. "Resources/Assets.xcassets/AppIcon.appiconset/Contents.json"). */
  writeFile(path: string, content: string | Uint8Array): Promise<void>;
  note(message: string): void;
}

export interface AppliedCapability {
  id: string;
  name: string;
  status: Manifest["status"];
  files: string[];
  placeholders: string[];
  notes: string[];
  credentialsNeeded: Manifest["credentialsNeeded"];
  cost: Cost;
}

export const pascal = (id: string) => id.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

export function substitute(text: string, spec: AppSpec): string {
  return text.replaceAll("__APP_NAME__", spec.name).replaceAll("__BUNDLE_ID__", spec.bundleId).replaceAll("__DISPLAY_NAME__", spec.displayName);
}

const TEXT_TEMPLATE = /\.(swift|json|strings|xcstrings|md|txt|html|css|js|svg|storekit|xcprivacy|plist)$/i;

/**
 * Apply capabilities in order: merge each manifest's requirements into the
 * spec, copy its template into `<App>/<destination>/`, then run its apply hook.
 * Existing files are never overwritten with different content.
 */
export async function applyCapabilities(
  spec: AppSpec,
  ordered: LoadedCapability[],
  io: { writeSourceFile(path: string, content: string | Uint8Array): Promise<"written" | "unchanged" | "kept"> },
  env: Record<string, string> = {},
): Promise<{ spec: AppSpec; applied: AppliedCapability[] }> {
  const next: AppSpec = structuredClone(spec);
  const applied: AppliedCapability[] = [];
  for (const capability of ordered) {
    const { manifest } = capability;
    if (next.capabilities.includes(manifest.id)) continue;
    const owner = `Capability ${manifest.id}`;
    const record: AppliedCapability = {
      id: manifest.id,
      name: manifest.name,
      status: manifest.status,
      files: [],
      placeholders: [],
      notes: [],
      credentialsNeeded: manifest.credentialsNeeded,
      cost: manifest.cost,
    };
    next.deploymentTarget = maxOS(next.deploymentTarget, manifest.minOS);
    for (const [k, v] of Object.entries(manifest.requires.infoPlist)) mergeValue(next.infoPlist, k, v, owner, "Info.plist");
    for (const [k, v] of Object.entries(manifest.requires.entitlements)) mergeValue(next.entitlements, k, v, owner, "entitlements");
    for (const [k, v] of Object.entries(manifest.requires.buildSettings)) {
      if (next.buildSettings[k] !== undefined && next.buildSettings[k] !== v) throw new CapabilityError(`${owner} build setting ${k} conflicts with ${next.buildSettings[k]}.`);
      next.buildSettings[k] = v;
    }
    const addPackage = (pkg: PackageDependency) => {
      const parsed = PackageSchema.parse(pkg);
      const existing = next.packages.find((p) => p.name === parsed.name);
      if (existing && existing.url !== parsed.url) throw new CapabilityError(`${owner} package ${parsed.name} conflicts with ${existing.url}.`);
      next.packages = existing
        ? next.packages.map((p) => (p.name === parsed.name ? { ...p, products: [...new Set([...p.products, ...parsed.products])] } : p))
        : [...next.packages, parsed];
    };
    manifest.requires.packages.forEach(addPackage);
    for (const credential of manifest.credentialsNeeded) {
      if (!next.secrets.some((s) => s.key === credential.key)) next.secrets.push({ ...credential, capability: manifest.id });
      if (credential.kind === "client" && (!env[credential.key] || env[credential.key] === "REPLACE_ME")) record.placeholders.push(credential.key);
    }
    const destination = manifest.destination ?? `Capabilities/${pascal(manifest.id)}`;
    for (const file of capability.templateFiles) {
      const source = join(capability.dir, "template", file);
      const raw = await readFile(source);
      const content = TEXT_TEMPLATE.test(file) ? substitute(raw.toString("utf8"), next) : raw;
      const path = `${destination}/${file}`;
      const outcome = await io.writeSourceFile(path, content);
      if (outcome === "kept") record.notes.push(`Kept existing ${path}; it differs from the template.`);
      record.files.push(path);
    }
    if (capability.applyModule?.endsWith(".js")) {
      const module = (await import(pathToFileURL(capability.applyModule).href)) as { default?: (ctx: ApplyContext) => void | Promise<void> };
      if (typeof module.default === "function") {
        const ctx: ApplyContext = {
          id: manifest.id,
          appName: next.name,
          bundleId: next.bundleId,
          displayName: next.displayName,
          sourcesDir: next.name,
          capabilities: [...next.capabilities],
          setInfoPlist: (k, v) => mergeValue(next.infoPlist, k, v, owner, "Info.plist"),
          addEntitlement: (k, v) => mergeValue(next.entitlements, k, v, owner, "entitlements"),
          addBuildSetting: (k, v) => {
            next.buildSettings[k] = v;
          },
          addPackage,
          setAppIcon: (name) => {
            next.appIconName = name;
          },
          writeFile: async (path, content) => {
            const outcome = await io.writeSourceFile(path, content);
            if (outcome === "kept") record.notes.push(`Kept existing ${path}; it differs from the generated file.`);
            record.files.push(path);
          },
          note: (message) => record.notes.push(message),
        };
        await module.default(ctx);
      }
    }
    next.capabilities.push(manifest.id);
    applied.push(record);
  }
  return { spec: next, applied };
}

export async function capabilityRecipe(capability: LoadedCapability): Promise<string> {
  return readFile(join(capability.dir, "recipe.md"), "utf8");
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
