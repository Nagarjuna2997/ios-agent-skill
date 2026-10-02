#!/usr/bin/env node
// Build a "CapCheck" Xcode project that contains every capability module's
// template Swift and its verify usage file in ONE app target, so a single
// Xcode build shows whether all module code compiles.
//
//   (cd mcp-server && npm run build)
//   node scripts/capability-compile-check.mjs --out /path/to/CapCheck
//   then open CapCheck.xcodeproj in Xcode and choose Product > Build, or run
//   xcodebuild -project CapCheck.xcodeproj -scheme CapCheck \
//     -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
//
// It needs no XcodeGen: the project uses a folder-synchronized group (Xcode 16
// or later), so every file under CapCheck/ is part of the target. It is a
// compile check only. Entitlements, the widget extension target, XcodeGen
// generation and runtime behavior are covered by each module's verify run.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(repo, "mcp-server", "dist", "agent");
if (!existsSync(join(dist, "workspace.js"))) {
  console.error("Build mcp-server first: (cd mcp-server && npm run build)");
  process.exit(1);
}
const outIndex = process.argv.indexOf("--out");
if (outIndex < 0 || !process.argv[outIndex + 1]) {
  console.error("Usage: node scripts/capability-compile-check.mjs --out <new folder>");
  process.exit(1);
}
const out = resolve(process.argv[outIndex + 1]);
const { createProject } = await import(join(dist, "workspace.js"));
const { loadCapabilities, capabilitiesDir } = await import(join(dist, "capabilities.js"));

const NAME = "CapCheck";
const all = await loadCapabilities(capabilitiesDir());
const ids = [...all.keys()].sort();

// XcodeGen is not needed here; the synchronized project below replaces it.
const runner = {
  async run(command, args) {
    return { command, args, exitCode: 0, stdout: "", stderr: "", durationMs: 0, timedOut: false };
  },
};
await rm(out, { recursive: true, force: true });
const created = await createProject({ projectDir: out, name: NAME, bundleId: "com.example.capcheck", capabilities: ids }, runner);
const spec = JSON.parse(await readFile(join(out, ".ios-agent", "spec.json"), "utf8"));

// Each module's verify usage file, renamed so they can share one target.
const pascal = (id) => id.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
await mkdir(join(out, NAME, "Verify"), { recursive: true });
for (const id of ids) {
  const source = await readFile(join(repo, "capabilities", id, "verify.ts"), "utf8");
  const match = source.match(/buildMinimalApp\(\{\n([\s\S]*?)\n {2}\}\)/);
  if (!match) continue;
  const files = JSON.parse(`{${match[1].replace(/,\s*$/, "")}}`);
  const swift = Object.values(files)
    .join("\n")
    .replace(/\bVerifyUsage\b/g, `VerifyUsage${pascal(id)}`)
    .replace(/\bItem\b/g, `VerifyItem${pascal(id)}`);
  await writeFile(join(out, NAME, "Verify", `Verify${pascal(id)}.swift`), swift);
}

// Info.plist keys the modules declare, as generated-Info.plist build settings.
const infoSettings = { INFOPLIST_KEY_UILaunchScreen_Generation: "YES", INFOPLIST_KEY_UIApplicationSceneManifest_Generation: "YES" };
for (const [key, value] of Object.entries(spec.infoPlist)) {
  if (typeof value === "string") infoSettings[`INFOPLIST_KEY_${key}`] = JSON.stringify(value);
  else if (typeof value === "boolean") infoSettings[`INFOPLIST_KEY_${key}`] = value ? "YES" : "NO";
}

let counter = 0;
const ids24 = new Map();
const oid = (key) => {
  if (!ids24.has(key)) ids24.set(key, `AA${(++counter).toString(16).toUpperCase().padStart(22, "0")}`);
  return ids24.get(key);
};
const list = (items) => `(${items.map((i) => `${i}, `).join("")})`;
const settings = (values) => `{\n${Object.entries(values).map(([k, v]) => `\t\t\t\t${k} = ${v};\n`).join("")}\t\t\t}`;
const quote = (v) => (/^[A-Za-z0-9_.]+$/.test(v) ? v : JSON.stringify(v));

const target = {
  ASSETCATALOG_COMPILER_APPICON_NAME: spec.appIconName ?? "AppIcon",
  CODE_SIGN_STYLE: "Automatic",
  CURRENT_PROJECT_VERSION: "1",
  ENABLE_PREVIEWS: "YES",
  GENERATE_INFOPLIST_FILE: "YES",
  ...infoSettings,
  IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget,
  LD_RUNPATH_SEARCH_PATHS: quote("$(inherited) @executable_path/Frameworks"),
  MARKETING_VERSION: "1.0",
  PRODUCT_BUNDLE_IDENTIFIER: spec.bundleId,
  PRODUCT_NAME: quote("$(TARGET_NAME)"),
  SDKROOT: "iphoneos",
  SWIFT_VERSION: spec.swiftVersion,
  TARGETED_DEVICE_FAMILY: "1",
  ...Object.fromEntries(Object.entries(spec.buildSettings).map(([k, v]) => [k, quote(v)])),
};
const projectDebug = { ALWAYS_SEARCH_USER_PATHS: "NO", CLANG_ENABLE_MODULES: "YES", DEBUG_INFORMATION_FORMAT: "dwarf", ENABLE_TESTABILITY: "YES", IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget, ONLY_ACTIVE_ARCH: "YES", SDKROOT: "iphoneos", SWIFT_ACTIVE_COMPILATION_CONDITIONS: quote("DEBUG $(inherited)"), SWIFT_OPTIMIZATION_LEVEL: quote("-Onone") };
const projectRelease = { ALWAYS_SEARCH_USER_PATHS: "NO", CLANG_ENABLE_MODULES: "YES", DEBUG_INFORMATION_FORMAT: quote("dwarf-with-dsym"), IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget, SDKROOT: "iphoneos", SWIFT_COMPILATION_MODE: "wholemodule", VALIDATE_PRODUCT: "YES" };

const objects = [];
const frameworkFiles = [];
const productDeps = [];
const packageRefs = [];
for (const pkg of spec.packages) {
  const ref = oid(`pkg:${pkg.name}`);
  packageRefs.push(ref);
  const requirement = pkg.version.from ? `kind = upToNextMajorVersion; minimumVersion = ${pkg.version.from};` : `kind = exactVersion; version = ${pkg.version.exactVersion};`;
  objects.push(`\t\t${ref} = {isa = XCRemoteSwiftPackageReference; repositoryURL = ${JSON.stringify(pkg.url)}; requirement = {${requirement} }; };`);
  for (const product of pkg.products) {
    const dep = oid(`dep:${product}`);
    const file = oid(`file:${product}`);
    productDeps.push(dep);
    frameworkFiles.push(file);
    objects.push(`\t\t${dep} = {isa = XCSwiftPackageProductDependency; package = ${ref}; productName = ${product}; };`);
    objects.push(`\t\t${file} = {isa = PBXBuildFile; productRef = ${dep}; };`);
  }
}
const [P, T, SYNC, MAIN, PRODUCTS, APP, SOURCES, FRAMEWORKS, RESOURCES, PCL, TCL, PD, PR, TD, TR] = ["P", "T", "SYNC", "MAIN", "PRODUCTS", "APP", "SOURCES", "FRAMEWORKS", "RESOURCES", "PCL", "TCL", "PD", "PR", "TD", "TR"].map(oid);
objects.push(
  `\t\t${APP} = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = ${NAME}.app; sourceTree = BUILT_PRODUCTS_DIR; };`,
  `\t\t${SYNC} = {isa = PBXFileSystemSynchronizedRootGroup; path = ${NAME}; sourceTree = "<group>"; };`,
  `\t\t${FRAMEWORKS} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = ${list(frameworkFiles)}; runOnlyForDeploymentPostprocessing = 0; };`,
  `\t\t${SOURCES} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`,
  `\t\t${RESOURCES} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`,
  `\t\t${MAIN} = {isa = PBXGroup; children = (${SYNC}, ${PRODUCTS}, ); sourceTree = "<group>"; };`,
  `\t\t${PRODUCTS} = {isa = PBXGroup; children = (${APP}, ); name = Products; sourceTree = "<group>"; };`,
  `\t\t${T} = {isa = PBXNativeTarget; buildConfigurationList = ${TCL}; buildPhases = (${SOURCES}, ${FRAMEWORKS}, ${RESOURCES}, ); buildRules = (); dependencies = (); fileSystemSynchronizedGroups = (${SYNC}, ); name = ${NAME}; packageProductDependencies = ${list(productDeps)}; productName = ${NAME}; productReference = ${APP}; productType = "com.apple.product-type.application"; };`,
  `\t\t${P} = {isa = PBXProject; attributes = {BuildIndependentTargetsInParallel = 1; LastSwiftUpdateCheck = 1600; LastUpgradeCheck = 1600; TargetAttributes = {${T} = {CreatedOnToolsVersion = 16.0; }; }; }; buildConfigurationList = ${PCL}; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en, Base, ); mainGroup = ${MAIN}; minimizedProjectReferenceProxies = 1; packageReferences = ${list(packageRefs)}; preferredProjectObjectVersion = 77; productRefGroup = ${PRODUCTS}; projectDirPath = ""; projectRoot = ""; targets = (${T}, ); };`,
  `\t\t${PD} = {isa = XCBuildConfiguration; buildSettings = ${settings(projectDebug)}; name = Debug; };`,
  `\t\t${PR} = {isa = XCBuildConfiguration; buildSettings = ${settings(projectRelease)}; name = Release; };`,
  `\t\t${TD} = {isa = XCBuildConfiguration; buildSettings = ${settings(target)}; name = Debug; };`,
  `\t\t${TR} = {isa = XCBuildConfiguration; buildSettings = ${settings(target)}; name = Release; };`,
  `\t\t${PCL} = {isa = XCConfigurationList; buildConfigurations = (${PD}, ${PR}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`,
  `\t\t${TCL} = {isa = XCConfigurationList; buildConfigurations = (${TD}, ${TR}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`,
);
const pbxproj = `// !$*UTF8*$!\n{\n\tarchiveVersion = 1;\n\tclasses = {\n\t};\n\tobjectVersion = 77;\n\tobjects = {\n${objects.join("\n")}\n\t};\n\trootObject = ${P};\n}\n`;
const projectDir = join(out, `${NAME}.xcodeproj`);
await rm(projectDir, { recursive: true, force: true });
await mkdir(projectDir, { recursive: true });
await writeFile(join(projectDir, "project.pbxproj"), pbxproj);
// The generated project.yml would describe a different (XcodeGen) project; keep only the synchronized one.
await rm(join(out, "project.yml"), { force: true });

const swiftFiles = [];
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".swift")) swiftFiles.push(full);
  }
};
await walk(join(out, NAME));
console.log(`Wrote ${projectDir}: ${created.capabilities.applied.length} capabilities, ${swiftFiles.length} Swift files, iOS ${spec.deploymentTarget}`);
