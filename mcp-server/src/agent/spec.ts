// The app specification is the single source of truth for a generated
// project. `project.yml` (XcodeGen), Info.plist properties, entitlements and
// xcconfig files are all derived from it, so capabilities and packages are
// added by changing the spec and re-rendering, never by editing generated files.
import { z } from "zod";

export const SWIFT_IDENTIFIER = /^[A-Z][A-Za-z0-9]{0,39}$/;
export const BUNDLE_ID = /^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z0-9-]+){2,}$/;
export const OS_VERSION = /^\d{2}\.\d$/;
const RESERVED = new Set(["Self", "Type", "Protocol", "Any", "Swift", "SwiftUI", "Foundation", "UIKit", "App", "View", "Scene", "Test", "Tests"]);

export const PackageSchema = z
  .object({
    name: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/),
    url: z.string().url().refine((u) => u.startsWith("https://"), "Package URLs must use https"),
    version: z
      .object({
        from: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
        exactVersion: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
      })
      .strict()
      .refine((v) => Boolean(v.from) !== Boolean(v.exactVersion), "Give exactly one of from or exactVersion"),
    products: z.array(z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/)).min(1),
  })
  .strict();
export type PackageDependency = z.infer<typeof PackageSchema>;

export const SecretSchema = z
  .object({
    key: z.string().regex(/^[A-Z][A-Z0-9_]{1,63}$/),
    description: z.string().min(1),
    whereToGet: z.string().min(1),
    /** client: safe to ship inside the app bundle (publishable keys). server: must never be embedded. */
    kind: z.enum(["client", "server"]),
    capability: z.string().optional(),
  })
  .strict();
export type SecretSpec = z.infer<typeof SecretSchema>;

export interface AppSpec {
  version: 1;
  name: string;
  displayName: string;
  bundleId: string;
  deploymentTarget: string;
  swiftVersion: "6.0";
  entitlements: Record<string, unknown>;
  infoPlist: Record<string, unknown>;
  packages: PackageDependency[];
  /** Non-secret build settings written to Config/Base.xcconfig. */
  buildSettings: Record<string, string>;
  /** Credentials read from .env into the gitignored Config/Secrets.xcconfig. */
  secrets: SecretSpec[];
  capabilities: string[];
  /** Asset catalog app icon name, set by the app-icon capability once an icon exists. */
  appIconName?: string;
}

export function validateAppName(name: string): void {
  if (!SWIFT_IDENTIFIER.test(name) || RESERVED.has(name)) {
    throw new Error("App name must be an UpperCamelCase Swift identifier (letters and digits, 1-40 characters) and not a reserved type name.");
  }
}

export function newAppSpec(input: { name: string; bundleId?: string; displayName?: string; deploymentTarget?: string }): AppSpec {
  validateAppName(input.name);
  const bundleId = input.bundleId ?? `com.example.${input.name.toLowerCase()}`;
  if (!BUNDLE_ID.test(bundleId)) throw new Error("Bundle identifier must look like com.example.app (reverse DNS, at least three parts).");
  const deploymentTarget = input.deploymentTarget ?? "17.0";
  if (!OS_VERSION.test(deploymentTarget) || Number(deploymentTarget) < 17) {
    throw new Error("Deployment target must be an iOS version such as 17.0 or newer.");
  }
  return {
    version: 1,
    name: input.name,
    displayName: (input.displayName ?? input.name).slice(0, 30),
    bundleId,
    deploymentTarget,
    swiftVersion: "6.0",
    entitlements: {},
    infoPlist: {},
    packages: [],
    buildSettings: {},
    secrets: [],
    capabilities: [],
  };
}

const compareOS = (a: string, b: string) => {
  const [am, an] = a.split(".").map(Number);
  const [bm, bn] = b.split(".").map(Number);
  return (am! - bm!) || (an! - bn!);
};
export const maxOS = (a: string, b: string) => (compareOS(a, b) >= 0 ? a : b);

// ---------------------------------------------------------------------------
// YAML: a deliberately small emitter. Every string is double-quoted with JSON
// escaping, which is valid YAML, so names such as "Yes" or "On" stay strings.

const SIMPLE_KEY = /^[A-Za-z_$][A-Za-z0-9_.$()-]*$/;
const key = (k: string) => (SIMPLE_KEY.test(k) ? k : JSON.stringify(k));
const scalar = (v: unknown): string => {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v === null) return "null";
  throw new Error(`Unsupported YAML value: ${typeof v}`);
};
const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function toYaml(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]\n`;
    return value
      .map((item) => {
        if (isPlainObject(item) || Array.isArray(item)) {
          if (isPlainObject(item) && !Object.keys(item).length) return `${pad}- {}\n`;
          if (Array.isArray(item) && !item.length) return `${pad}- []\n`;
          return `${pad}-\n${toYaml(item, indent + 2)}`;
        }
        return `${pad}- ${scalar(item)}\n`;
      })
      .join("");
  }
  if (isPlainObject(value)) {
    return Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        if (isPlainObject(v)) return Object.keys(v).length ? `${pad}${key(k)}:\n${toYaml(v, indent + 2)}` : `${pad}${key(k)}: {}\n`;
        if (Array.isArray(v)) return v.length ? `${pad}${key(k)}:\n${toYaml(v, indent + 2)}` : `${pad}${key(k)}: []\n`;
        return `${pad}${key(k)}: ${scalar(v)}\n`;
      })
      .join("");
  }
  return `${pad}${scalar(value)}\n`;
}

// ---------------------------------------------------------------------------

export function infoPlistProperties(spec: AppSpec): Record<string, unknown> {
  const exposed = Object.fromEntries(spec.secrets.filter((s) => s.kind === "client").map((s) => [s.key, `$(${s.key})`]));
  return {
    CFBundleDisplayName: spec.displayName,
    CFBundleShortVersionString: "$(MARKETING_VERSION)",
    CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
    UILaunchScreen: {},
    UIApplicationSceneManifest: { UIApplicationSupportsMultipleScenes: false },
    UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
    ...spec.infoPlist,
    ...exposed,
  };
}

export function renderProjectYml(spec: AppSpec): string {
  const target: Record<string, unknown> = {
    type: "application",
    platform: "iOS",
    deploymentTarget: spec.deploymentTarget,
    sources: [{ path: spec.name }],
    configFiles: { Debug: "Config/Base.xcconfig", Release: "Config/Base.xcconfig" },
    info: { path: "Config/Info.plist", properties: infoPlistProperties(spec) },
    settings: {
      base: {
        PRODUCT_BUNDLE_IDENTIFIER: spec.bundleId,
        PRODUCT_NAME: spec.name,
        MARKETING_VERSION: "1.0",
        CURRENT_PROJECT_VERSION: "1",
        TARGETED_DEVICE_FAMILY: "1",
        GENERATE_INFOPLIST_FILE: "NO",
        ENABLE_PREVIEWS: "YES",
        CODE_SIGN_STYLE: "Automatic",
        ...(spec.appIconName ? { ASSETCATALOG_COMPILER_APPICON_NAME: spec.appIconName } : {}),
      },
    },
  };
  if (Object.keys(spec.entitlements).length) {
    target.entitlements = { path: `Config/${spec.name}.entitlements`, properties: spec.entitlements };
  }
  if (spec.packages.length) {
    target.dependencies = spec.packages.flatMap((p) => p.products.map((product) => ({ package: p.name, product })));
  }
  const project: Record<string, unknown> = {
    name: spec.name,
    options: { deploymentTarget: { iOS: spec.deploymentTarget }, createIntermediateGroups: true },
    settings: { base: { SWIFT_VERSION: spec.swiftVersion } },
    ...(spec.packages.length
      ? {
          packages: Object.fromEntries(
            spec.packages.map((p) => [p.name, { url: p.url, ...(p.version.from ? { from: p.version.from } : { exactVersion: p.version.exactVersion }) }]),
          ),
        }
      : {}),
    targets: { [spec.name]: target },
    schemes: { [spec.name]: { build: { targets: { [spec.name]: "all" } }, run: { config: "Debug" } } },
  };
  return `# Generated by ios-agent from .ios-agent/spec.json. Edit the spec or use the agent tools, then regenerate.\n${toYaml(project)}`;
}

/** xcconfig treats `//` as a comment, so URLs are written with the documented `/$()/` escape. */
export const xcconfigValue = (value: string) => value.replace(/\r?\n/g, " ").replace(/\/\//g, "/$()/");

export function renderBaseXcconfig(spec: AppSpec): string {
  const lines = [
    "// Generated by ios-agent. Non-secret build settings only.",
    "// Credentials live in Secrets.xcconfig, generated from the gitignored .env file.",
    '#include? "Secrets.xcconfig"',
    "",
    ...Object.entries(spec.buildSettings).map(([k, v]) => `${k} = ${xcconfigValue(v)}`),
  ];
  return lines.join("\n") + "\n";
}

export function parseDotEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2]!.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    out[match[1]!] = value;
  }
  return out;
}

export const PLACEHOLDER = "REPLACE_ME";

/** Client credentials only; server secrets are never written into the app. Missing values become placeholders. */
export function renderSecretsXcconfig(spec: AppSpec, env: Record<string, string>): { text: string; missing: string[] } {
  const missing: string[] = [];
  const lines = ["// Generated by ios-agent from .env. Do not commit this file.", ""];
  for (const secret of spec.secrets.filter((s) => s.kind === "client")) {
    const value = env[secret.key];
    if (!value || value === PLACEHOLDER) missing.push(secret.key);
    lines.push(`${secret.key} = ${xcconfigValue(value || PLACEHOLDER)}`);
  }
  return { text: lines.join("\n") + "\n", missing };
}

export function renderEnvExample(spec: AppSpec): string {
  if (!spec.secrets.length) return "# This app needs no credentials yet.\n";
  return (
    spec.secrets
      .map((s) => `# ${s.description}\n# Get it: ${s.whereToGet}\n# ${s.kind === "server" ? "SERVER-SIDE ONLY: never shipped in the app; configure it on your backend." : "Client key: embedded in the app bundle through Secrets.xcconfig."}\n${s.key}=`)
      .join("\n\n") + "\n"
  );
}

export const GITIGNORE = `# Generated by ios-agent
.env
Config/Secrets.xcconfig
.ios-agent/DerivedData/
.ios-agent/logs/
xcuserdata/
*.xcuserstate
.DS_Store
`;
