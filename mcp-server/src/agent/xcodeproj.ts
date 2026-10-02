// A built-in Xcode project writer, used when XcodeGen is not installed.
//
// It renders the same AppSpec that project.yml describes into an
// .xcodeproj that uses folder-synchronized groups (objectVersion 77, Xcode
// 16 or later): every file under the app folder belongs to the app target
// unless it is listed as an exception, so writing Swift files needs no
// project edits. Info.plist properties and entitlements are written as plist
// files next to the xcconfig, exactly where project.yml puts them.
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { infoPlistProperties, type AppSpec, type ExtensionSpec } from "./spec.js";

// ---------------------------------------------------------------------------
// Property lists

const xmlEscape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function plistValue(value: unknown, indent: string): string {
  if (typeof value === "string") return `${indent}<string>${xmlEscape(value)}</string>\n`;
  if (typeof value === "boolean") return `${indent}<${value}/>\n`;
  if (typeof value === "number") return Number.isInteger(value) ? `${indent}<integer>${value}</integer>\n` : `${indent}<real>${value}</real>\n`;
  if (Array.isArray(value)) {
    return value.length ? `${indent}<array>\n${value.map((v) => plistValue(v, `${indent}\t`)).join("")}${indent}</array>\n` : `${indent}<array/>\n`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    if (!entries.length) return `${indent}<dict/>\n`;
    return `${indent}<dict>\n${entries.map(([k, v]) => `${indent}\t<key>${xmlEscape(k)}</key>\n${plistValue(v, `${indent}\t`)}`).join("")}${indent}</dict>\n`;
  }
  throw new Error(`Unsupported property list value: ${String(value)}`);
}

export function renderPlist(value: Record<string, unknown>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n${plistValue(value, "")}</plist>\n`;
}

/** Info.plist keys every bundle needs; Xcode's generated Info.plist adds the rest. */
const BUNDLE_KEYS = {
  CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
  CFBundleExecutable: "$(EXECUTABLE_NAME)",
  CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
  CFBundleInfoDictionaryVersion: "6.0",
  CFBundleName: "$(PRODUCT_NAME)",
  CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
};

export function appInfoPlist(spec: AppSpec): Record<string, unknown> {
  return { ...BUNDLE_KEYS, LSRequiresIPhoneOS: true, ...infoPlistProperties(spec) };
}

export function extensionInfoPlist(spec: AppSpec): Record<string, unknown> {
  return {
    ...BUNDLE_KEYS,
    CFBundleDisplayName: spec.displayName,
    CFBundleShortVersionString: "$(MARKETING_VERSION)",
    CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
    NSExtension: { NSExtensionPointIdentifier: "com.apple.widgetkit-extension" },
  };
}

// ---------------------------------------------------------------------------
// Files on disk, for synchronized-group exceptions

async function listFiles(dir: string, base = dir): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    // Bundles such as .xcassets are one membership unit, like Xcode treats them.
    if (entry.isDirectory() && !/\.(xcassets|xcstrings|bundle|lproj|storekit)$/i.test(entry.name)) out.push(...(await listFiles(full, base)));
    else out.push(relative(base, full).split("\\").join("/"));
  }
  return out.sort();
}

/** Glob match for the patterns used in sourceExcludes: `**` (any depth), `*` (one segment), literal paths. */
export function globMatch(pattern: string, path: string): boolean {
  const regex = new RegExp(
    "^" +
      pattern
        .split("/")
        .map((part) => (part === "**" ? "(?:.*)" : part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")))
        .join("/")
        .replace(/\/\(\?:\.\*\)$/, "(?:/.*)?") +
      "$",
  );
  return regex.test(path);
}

const underAny = (path: string, folders: string[]) => folders.some((f) => path === f || path.startsWith(`${f}/`));

// ---------------------------------------------------------------------------
// project.pbxproj

class Ids {
  private count = 0;
  private readonly map = new Map<string, string>();
  get(key: string): string {
    let id = this.map.get(key);
    if (!id) {
      id = `1A${(++this.count).toString(16).toUpperCase().padStart(22, "0")}`;
      this.map.set(key, id);
    }
    return id;
  }
}

const quote = (value: string) => (/^[A-Za-z0-9_./]+$/.test(value) ? value : JSON.stringify(value));
const list = (items: string[]) => `(${items.map((i) => `${i}, `).join("")})`;
const settingsBlock = (values: Record<string, string>) =>
  `{\n${Object.entries(values)
    .map(([k, v]) => `\t\t\t\t${k} = ${quote(v)};\n`)
    .join("")}\t\t\t}`;

export interface ProjectFiles {
  /** Path relative to the project root -> content. */
  files: Record<string, string>;
}

/**
 * Render `<Name>.xcodeproj/project.pbxproj`, a shared scheme, Info.plist and
 * entitlements files for the spec. `root` is read to compute membership
 * exceptions for excluded and extension-only files.
 */
export async function renderXcodeProject(root: string, spec: AppSpec): Promise<ProjectFiles> {
  const ids = new Ids();
  const appFiles = await listFiles(join(root, spec.name));
  const extensions: ExtensionSpec[] = spec.extensions ?? [];
  const objects: string[] = [];
  const add = (line: string) => objects.push(`\t\t${line}`);

  const P = ids.get("project");
  const APP = ids.get("target:app");
  const MAIN = ids.get("group:main");
  const PRODUCTS = ids.get("group:products");
  const CONFIG = ids.get("group:config");
  const XCCONFIG = ids.get("file:xcconfig");
  const APP_SYNC = ids.get("sync:app");
  const APP_PRODUCT = ids.get("product:app");
  const files: Record<string, string> = {};

  // Packages
  const appFrameworkFiles: string[] = [];
  const appProductDeps: string[] = [];
  const packageRefs: string[] = [];
  for (const pkg of spec.packages) {
    const ref = ids.get(`pkg:${pkg.name}`);
    packageRefs.push(ref);
    const requirement = pkg.version.from ? `kind = upToNextMajorVersion; minimumVersion = ${pkg.version.from};` : `kind = exactVersion; version = ${pkg.version.exactVersion};`;
    add(`${ref} = {isa = XCRemoteSwiftPackageReference; repositoryURL = ${JSON.stringify(pkg.url)}; requirement = {${requirement} }; };`);
    for (const product of pkg.products) {
      const dep = ids.get(`dep:${pkg.name}:${product}`);
      const buildFile = ids.get(`bf:${pkg.name}:${product}`);
      appProductDeps.push(dep);
      appFrameworkFiles.push(buildFile);
      add(`${dep} = {isa = XCSwiftPackageProductDependency; package = ${ref}; productName = ${product}; };`);
      add(`${buildFile} = {isa = PBXBuildFile; productRef = ${dep}; };`);
    }
  }

  // App target membership exceptions: build excludes, which include the
  // extension-only folders that ApplyContext.addWidget registers.
  const appExcluded = appFiles.filter((f) => (spec.sourceExcludes ?? []).some((p) => globMatch(p, f)));
  const appSyncExceptions: string[] = [];
  if (appExcluded.length) {
    const exc = ids.get("exc:app");
    appSyncExceptions.push(exc);
    add(`${exc} = {isa = PBXFileSystemSynchronizedBuildFileExceptionSet; membershipExceptions = ${list(appExcluded.map((f) => JSON.stringify(f)))}; target = ${APP}; };`);
  }

  // Extensions
  const embedFiles: string[] = [];
  const appDependencies: string[] = [];
  const extensionTargets: string[] = [];
  const productRefs = [APP_PRODUCT];
  const extensionSyncGroups: string[] = [];
  for (const ext of extensions) {
    const T = ids.get(`target:${ext.name}`);
    const PRODUCT = ids.get(`product:${ext.name}`);
    const SYNC = ids.get(`sync:${ext.name}`);
    const SOURCES = ids.get(`sources:${ext.name}`);
    const FRAMEWORKS = ids.get(`frameworks:${ext.name}`);
    const RESOURCES = ids.get(`resources:${ext.name}`);
    const CL = ids.get(`cl:${ext.name}`);
    const DEBUG = ids.get(`debug:${ext.name}`);
    const RELEASE = ids.get(`release:${ext.name}`);
    const EMBED = ids.get(`embed:${ext.name}`);
    const PROXY = ids.get(`proxy:${ext.name}`);
    const DEP = ids.get(`dependency:${ext.name}`);
    extensionTargets.push(T);
    productRefs.push(PRODUCT);
    extensionSyncGroups.push(SYNC);
    embedFiles.push(EMBED);
    appDependencies.push(DEP);
    add(`${PRODUCT} = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = ${ext.name}.appex; sourceTree = BUILT_PRODUCTS_DIR; };`);
    add(`${SYNC} = {isa = PBXFileSystemSynchronizedRootGroup; path = ${ext.name}; sourceTree = "<group>"; };`);
    add(`${EMBED} = {isa = PBXBuildFile; fileRef = ${PRODUCT}; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };`);
    add(`${PROXY} = {isa = PBXContainerItemProxy; containerPortal = ${P}; proxyType = 1; remoteGlobalIDString = ${T}; remoteInfo = ${ext.name}; };`);
    add(`${DEP} = {isa = PBXTargetDependency; target = ${T}; targetProxy = ${PROXY}; };`);
    add(`${SOURCES} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`);
    add(`${FRAMEWORKS} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`);
    add(`${RESOURCES} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`);
    // The extension also uses the app folder, minus everything outside its sources.
    const outside = appFiles.filter((f) => !underAny(f, ext.sources));
    const extExceptions: string[] = [];
    if (outside.length) {
      const exc = ids.get(`exc:${ext.name}`);
      extExceptions.push(exc);
      add(`${exc} = {isa = PBXFileSystemSynchronizedBuildFileExceptionSet; membershipExceptions = ${list(outside.map((f) => JSON.stringify(f)))}; target = ${T}; };`);
    }
    // The exception set for the extension is attached to the shared app group.
    appSyncExceptions.push(...extExceptions);
    const extSettings: Record<string, string> = {
      CODE_SIGN_STYLE: "Automatic",
      CURRENT_PROJECT_VERSION: "1",
      GENERATE_INFOPLIST_FILE: "YES",
      INFOPLIST_FILE: `Config/${ext.name}-Info.plist`,
      IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget,
      LD_RUNPATH_SEARCH_PATHS: "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
      MARKETING_VERSION: "1.0",
      PRODUCT_BUNDLE_IDENTIFIER: `${spec.bundleId}.${ext.bundleIdSuffix}`,
      PRODUCT_NAME: "$(TARGET_NAME)",
      SDKROOT: "iphoneos",
      SKIP_INSTALL: "YES",
      SWIFT_VERSION: spec.swiftVersion,
      TARGETED_DEVICE_FAMILY: "1",
      ...(Object.keys(ext.entitlements).length ? { CODE_SIGN_ENTITLEMENTS: `Config/${ext.name}.entitlements` } : {}),
    };
    add(`${DEBUG} = {isa = XCBuildConfiguration; baseConfigurationReference = ${XCCONFIG}; buildSettings = ${settingsBlock(extSettings)}; name = Debug; };`);
    add(`${RELEASE} = {isa = XCBuildConfiguration; baseConfigurationReference = ${XCCONFIG}; buildSettings = ${settingsBlock(extSettings)}; name = Release; };`);
    add(`${CL} = {isa = XCConfigurationList; buildConfigurations = (${DEBUG}, ${RELEASE}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`);
    add(
      `${T} = {isa = PBXNativeTarget; buildConfigurationList = ${CL}; buildPhases = (${SOURCES}, ${FRAMEWORKS}, ${RESOURCES}, ); buildRules = (); dependencies = (); fileSystemSynchronizedGroups = (${SYNC}, ${APP_SYNC}, ); name = ${ext.name}; productName = ${ext.name}; productReference = ${PRODUCT}; productType = "com.apple.product-type.app-extension"; };`,
    );
    files[`Config/${ext.name}-Info.plist`] = renderPlist(extensionInfoPlist(spec));
    if (Object.keys(ext.entitlements).length) files[`Config/${ext.name}.entitlements`] = renderPlist(ext.entitlements);
  }

  // App target
  const SOURCES = ids.get("sources:app");
  const FRAMEWORKS = ids.get("frameworks:app");
  const RESOURCES = ids.get("resources:app");
  const EMBED_PHASE = ids.get("embedphase:app");
  const APP_CL = ids.get("cl:app");
  const APP_DEBUG = ids.get("debug:app");
  const APP_RELEASE = ids.get("release:app");
  const PROJECT_CL = ids.get("cl:project");
  const PROJECT_DEBUG = ids.get("debug:project");
  const PROJECT_RELEASE = ids.get("release:project");
  add(`${APP_PRODUCT} = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = ${spec.name}.app; sourceTree = BUILT_PRODUCTS_DIR; };`);
  add(`${XCCONFIG} = {isa = PBXFileReference; lastKnownFileType = text.xcconfig; path = Base.xcconfig; sourceTree = "<group>"; };`);
  add(`${APP_SYNC} = {isa = PBXFileSystemSynchronizedRootGroup; ${appSyncExceptions.length ? `exceptions = ${list(appSyncExceptions)}; ` : ""}path = ${spec.name}; sourceTree = "<group>"; };`);
  add(`${SOURCES} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`);
  add(`${FRAMEWORKS} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = ${list(appFrameworkFiles)}; runOnlyForDeploymentPostprocessing = 0; };`);
  add(`${RESOURCES} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`);
  const appPhases = [SOURCES, FRAMEWORKS, RESOURCES];
  if (embedFiles.length) {
    add(`${EMBED_PHASE} = {isa = PBXCopyFilesBuildPhase; buildActionMask = 2147483647; dstPath = ""; dstSubfolderSpec = 13; files = ${list(embedFiles)}; name = "Embed Foundation Extensions"; runOnlyForDeploymentPostprocessing = 0; };`);
    appPhases.push(EMBED_PHASE);
  }
  add(`${CONFIG} = {isa = PBXGroup; children = (${XCCONFIG}, ); path = Config; sourceTree = "<group>"; };`);
  add(`${MAIN} = {isa = PBXGroup; children = (${APP_SYNC}, ${extensionSyncGroups.map((g) => `${g}, `).join("")}${CONFIG}, ${PRODUCTS}, ); sourceTree = "<group>"; };`);
  add(`${PRODUCTS} = {isa = PBXGroup; children = ${list(productRefs)}; name = Products; sourceTree = "<group>"; };`);

  const appSettings: Record<string, string> = {
    CODE_SIGN_STYLE: "Automatic",
    CURRENT_PROJECT_VERSION: "1",
    ENABLE_PREVIEWS: "YES",
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_FILE: "Config/Info.plist",
    IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget,
    LD_RUNPATH_SEARCH_PATHS: "$(inherited) @executable_path/Frameworks",
    MARKETING_VERSION: "1.0",
    PRODUCT_BUNDLE_IDENTIFIER: spec.bundleId,
    PRODUCT_NAME: spec.name,
    SDKROOT: "iphoneos",
    SWIFT_VERSION: spec.swiftVersion,
    TARGETED_DEVICE_FAMILY: "1",
    ...(spec.appIconName ? { ASSETCATALOG_COMPILER_APPICON_NAME: spec.appIconName } : {}),
    ...(Object.keys(spec.entitlements).length ? { CODE_SIGN_ENTITLEMENTS: `Config/${spec.name}.entitlements` } : {}),
  };
  add(`${APP_DEBUG} = {isa = XCBuildConfiguration; baseConfigurationReference = ${XCCONFIG}; buildSettings = ${settingsBlock(appSettings)}; name = Debug; };`);
  add(`${APP_RELEASE} = {isa = XCBuildConfiguration; baseConfigurationReference = ${XCCONFIG}; buildSettings = ${settingsBlock(appSettings)}; name = Release; };`);
  add(`${APP_CL} = {isa = XCConfigurationList; buildConfigurations = (${APP_DEBUG}, ${APP_RELEASE}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`);
  add(
    `${APP} = {isa = PBXNativeTarget; buildConfigurationList = ${APP_CL}; buildPhases = ${list(appPhases)}; buildRules = (); dependencies = ${list(appDependencies)}; fileSystemSynchronizedGroups = (${APP_SYNC}, ); name = ${spec.name}; packageProductDependencies = ${list(appProductDeps)}; productName = ${spec.name}; productReference = ${APP_PRODUCT}; productType = "com.apple.product-type.application"; };`,
  );
  const projectBase: Record<string, string> = {
    ALWAYS_SEARCH_USER_PATHS: "NO",
    CLANG_ENABLE_MODULES: "YES",
    IPHONEOS_DEPLOYMENT_TARGET: spec.deploymentTarget,
    SDKROOT: "iphoneos",
    SWIFT_VERSION: spec.swiftVersion,
  };
  add(
    `${PROJECT_DEBUG} = {isa = XCBuildConfiguration; buildSettings = ${settingsBlock({ ...projectBase, DEBUG_INFORMATION_FORMAT: "dwarf", ENABLE_TESTABILITY: "YES", ONLY_ACTIVE_ARCH: "YES", SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG $(inherited)", SWIFT_OPTIMIZATION_LEVEL: "-Onone" })}; name = Debug; };`,
  );
  add(
    `${PROJECT_RELEASE} = {isa = XCBuildConfiguration; buildSettings = ${settingsBlock({ ...projectBase, DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym", SWIFT_COMPILATION_MODE: "wholemodule", VALIDATE_PRODUCT: "YES" })}; name = Release; };`,
  );
  add(`${PROJECT_CL} = {isa = XCConfigurationList; buildConfigurations = (${PROJECT_DEBUG}, ${PROJECT_RELEASE}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`);
  const targetAttributes = [APP, ...extensionTargets].map((t) => `${t} = {CreatedOnToolsVersion = 16.0; }; `).join("");
  add(
    `${P} = {isa = PBXProject; attributes = {BuildIndependentTargetsInParallel = 1; LastSwiftUpdateCheck = 1600; LastUpgradeCheck = 1600; TargetAttributes = {${targetAttributes}}; }; buildConfigurationList = ${PROJECT_CL}; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en, Base, ); mainGroup = ${MAIN}; minimizedProjectReferenceProxies = 1; packageReferences = ${list(packageRefs)}; preferredProjectObjectVersion = 77; productRefGroup = ${PRODUCTS}; projectDirPath = ""; projectRoot = ""; targets = ${list([APP, ...extensionTargets])}; };`,
  );

  files[`${spec.name}.xcodeproj/project.pbxproj`] = `// !$*UTF8*$!\n{\n\tarchiveVersion = 1;\n\tclasses = {\n\t};\n\tobjectVersion = 77;\n\tobjects = {\n${objects.sort().join("\n")}\n\t};\n\trootObject = ${P};\n}\n`;
  files[`${spec.name}.xcodeproj/xcshareddata/xcschemes/${spec.name}.xcscheme`] = renderScheme(spec, APP);
  files["Config/Info.plist"] = renderPlist(appInfoPlist(spec));
  if (Object.keys(spec.entitlements).length) files[`Config/${spec.name}.entitlements`] = renderPlist(spec.entitlements);
  return { files };
}

function renderScheme(spec: AppSpec, appTarget: string): string {
  const ref = `<BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "${appTarget}" BuildableName = "${spec.name}.app" BlueprintName = "${spec.name}" ReferencedContainer = "container:${spec.name}.xcodeproj"></BuildableReference>`;
  const storeKit = spec.storeKitConfiguration ? `\n      <StoreKitConfigurationFileReference identifier = "../../${xmlEscape(spec.storeKitConfiguration)}"></StoreKitConfigurationFileReference>` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1600" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            ${ref}
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES">
   </TestAction>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         ${ref}
      </BuildableProductRunnable>${storeKit}
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         ${ref}
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
`;
}
