// Studio owns project settings and test generation. Model output is data, never build commands.
import { createHash } from "node:crypto";
export const swiftString = (s) =>
  '"' +
  Array.from(s, (c) => {
    if (c === '"') return '\\"';
    if (c === "\\") return "\\\\";
    const cp = c.codePointAt(0);
    if (cp < 32 || cp === 127 || cp === 0x2028 || cp === 0x2029)
      return "\\u{" + cp.toString(16) + "}";
    return c;
  }).join("") +
  '"';
const id = (s) =>
  createHash("sha256").update(s).digest("hex").slice(0, 24).toUpperCase();
const quote = (s) => JSON.stringify(s);
export function projectText(files, name, bundle) {
  const objects = [];
  const add = (key, body) => {
    objects.push(`${id(key)} = { ${body} };`);
    return id(key);
  };
  const refs = files.map((f) =>
    add(
      f,
      `isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ${quote(f)}; sourceTree = SOURCE_ROOT;`,
    ),
  );
  const builds = files.map((f) =>
    add("build" + f, `isa = PBXBuildFile; fileRef = ${id(f)};`),
  );
  const test = "UITests/AcceptanceTests.swift";
  const testRef = add(
    test,
    `isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ${quote(test)}; sourceTree = SOURCE_ROOT;`,
  );
  const testBuild = add(
    "buildtest",
    `isa = PBXBuildFile; fileRef = ${testRef};`,
  );
  const appRef = add(
    "product",
    "isa = PBXFileReference; explicitFileType = wrapper.application; path = AppProject.app; sourceTree = BUILT_PRODUCTS_DIR;",
  );
  const testProduct = add(
    "testproduct",
    "isa = PBXFileReference; explicitFileType = wrapper.cfbundle; path = AppProjectUITests.xctest; sourceTree = BUILT_PRODUCTS_DIR;",
  );
  const group = add(
    "group",
    `isa = PBXGroup; children = (${[...refs, testRef, id("products")].join(",")},); sourceTree = "<group>";`,
  );
  add(
    "products",
    `isa = PBXGroup; children = (${appRef},${testProduct},); name = Products; sourceTree = "<group>";`,
  );
  for (const [target, sources] of [
    ["app", builds],
    ["tests", [testBuild]],
  ]) {
    add(
      target + "sources",
      `isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (${sources.join(",")},); runOnlyForDeploymentPostprocessing = 0;`,
    );
    add(
      target + "frameworks",
      "isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;",
    );
    add(
      target + "resources",
      "isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;",
    );
  }
  const common =
    'SDKROOT = iphoneos; IPHONEOS_DEPLOYMENT_TARGET = 17.0; SWIFT_VERSION = 6.0; CLANG_ENABLE_MODULES = YES; CODE_SIGNING_ALLOWED = NO; GENERATE_INFOPLIST_FILE = YES; TARGETED_DEVICE_FAMILY = "1,2"; PRODUCT_NAME = "$(TARGET_NAME)";';
  for (const kind of ["project", "app", "tests"]) {
    for (const config of ["Debug", "Release"]) {
      const extra =
        kind === "app"
          ? `PRODUCT_BUNDLE_IDENTIFIER = ${quote(bundle)}; INFOPLIST_KEY_CFBundleDisplayName = ${quote(name)}; INFOPLIST_KEY_UILaunchScreen_Generation = YES; INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;`
          : kind === "tests"
            ? `PRODUCT_BUNDLE_IDENTIFIER = ${quote(bundle + ".uitests")}; TEST_TARGET_NAME = AppProject;`
            : "";
      add(
        kind + config,
        `isa = XCBuildConfiguration; name = ${config}; buildSettings = { ${common} ${extra} ${config === "Debug" ? 'SWIFT_OPTIMIZATION_LEVEL = "-Onone"; ENABLE_TESTABILITY = YES;' : 'SWIFT_OPTIMIZATION_LEVEL = "-O";'} };`,
      );
    }
    add(
      kind + "config",
      `isa = XCConfigurationList; buildConfigurations = (${id(kind + "Debug")},${id(kind + "Release")},); defaultConfigurationIsVisible = 0; defaultConfigurationName = Debug;`,
    );
  }
  add(
    "proxy",
    `isa = PBXContainerItemProxy; containerPortal = ${id("project")}; proxyType = 1; remoteGlobalIDString = ${id("app")}; remoteInfo = AppProject;`,
  );
  add(
    "dependency",
    `isa = PBXTargetDependency; target = ${id("app")}; targetProxy = ${id("proxy")};`,
  );
  for (const target of ["app", "tests"])
    add(
      target,
      `isa = PBXNativeTarget; buildConfigurationList = ${id(target + "config")}; buildPhases = (${id(target + "sources")},${id(target + "frameworks")},${id(target + "resources")},); buildRules = (); dependencies = (${target === "tests" ? id("dependency") + "," : ""}); name = ${target === "app" ? "AppProject" : "AppProjectUITests"}; productName = ${target === "app" ? "AppProject" : "AppProjectUITests"}; productReference = ${target === "app" ? appRef : testProduct}; productType = "com.apple.product-type.${target === "app" ? "application" : "bundle.ui-testing"}";`,
    );
  add(
    "project",
    `isa = PBXProject; attributes = { LastUpgradeCheck = 1600; }; buildConfigurationList = ${id("projectconfig")}; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en, Base,); mainGroup = ${group}; productRefGroup = ${id("products")}; projectDirPath = ""; projectRoot = ""; targets = (${id("app")},${id("tests")},);`,
  );
  return (
    "// !$*UTF8*$!\n{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n" +
    objects.join("\n") +
    `\n}; rootObject = ${id("project")}; }\n`
  );
}
export function schemeText() {
  const ref = (target, product, name) =>
    `<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id(target)}" BuildableName="${product}" BlueprintName="${name}" ReferencedContainer="container:AppProject.xcodeproj"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?><Scheme LastUpgradeVersion="1600" version="1.3"><BuildAction parallelizeBuildables="NO" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">${ref("app", "AppProject.app", "AppProject")}</BuildActionEntry></BuildActionEntries></BuildAction><TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO">${ref("tests", "AppProjectUITests.xctest", "AppProjectUITests")}</TestableReference></Testables></TestAction><LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">${ref("app", "AppProject.app", "AppProject")}</BuildableProductRunnable></LaunchAction></Scheme>`;
}
export function validateCustomPlan(value) {
  if (
    !value ||
    typeof value.summary !== "string" ||
    !value.summary.trim() ||
    value.summary.length > 2000
  )
    throw Error("Plan needs a summary.");
  for (const key of ["screens", "criteria"])
    if (
      !Array.isArray(value[key]) ||
      !value[key].length ||
      value[key].length > 15 ||
      value[key].some(
        (s) => typeof s !== "string" || !s.trim() || s.length > 1000,
      )
    )
      throw Error("Invalid " + key);
  const manual = value.manualCriteria ?? [];
  if (
    !Array.isArray(manual) ||
    manual.some(
      (n) => !Number.isInteger(n) || n < 0 || n >= value.criteria.length,
    )
  )
    throw Error("Invalid manual criteria");
  if (
    !Array.isArray(value.journeys) ||
    value.journeys.length < 2 ||
    value.journeys.length > 8
  )
    throw Error("Plan needs 2–8 UI journeys.");
  const covered = new Set(manual);
  const journeys = value.journeys.map((j, i) => {
    if (
      typeof j.name !== "string" ||
      !j.name.trim() ||
      j.name.length > 160 ||
      !Array.isArray(j.criteria) ||
      !j.criteria.length ||
      j.criteria.some(
        (n) => !Number.isInteger(n) || n < 0 || n >= value.criteria.length,
      )
    )
      throw Error("Journey needs valid criterion indexes.");
    j.criteria.forEach((n) => covered.add(n));
    if (
      !Array.isArray(j.steps) ||
      j.steps.length < 2 ||
      j.steps.length > 20 ||
      !j.steps.some((s) => ["exists", "absent", "text"].includes(s.action))
    )
      throw Error("Every journey needs observable assertions.");
    const steps = j.steps.map((s) => {
      if (
        !["tap", "type", "exists", "absent", "text", "relaunch"].includes(
          s.action,
        )
      )
        throw Error("Unsupported UI action");
      if (s.action === "relaunch") return { action: "relaunch" };
      if (
        !["button", "textField", "secureTextField", "text", "any"].includes(
          s.role,
        ) ||
        typeof s.target !== "string" ||
        !s.target.trim() ||
        s.target.length > 200
      )
        throw Error("Invalid UI target");
      if (
        ["type", "text"].includes(s.action) &&
        (typeof s.value !== "string" || !s.value.length || s.value.length > 500)
      )
        throw Error("Invalid UI value");
      if (
        s.action === "type" &&
        !["textField", "secureTextField"].includes(s.role)
      )
        throw Error("Type requires a field");
      return {
        action: s.action,
        role: s.role,
        target: s.target,
        ...(["type", "text"].includes(s.action) ? { value: s.value } : {}),
      };
    });
    return {
      name: j.name,
      criteria: j.criteria,
      steps,
      screen: "journey-" + (i + 1),
    };
  });
  if (covered.size !== value.criteria.length)
    throw Error("Every criterion needs a journey or an explicit manual check.");
  return {
    summary: value.summary,
    screens: value.screens,
    criteria: value.criteria,
    manualCriteria: manual,
    journeys,
  };
}
export function acceptanceSwift(plan) {
  const query = (s) =>
    `app.${{ button: "buttons", textField: "textFields", secureTextField: "secureTextFields", text: "staticTexts", any: "descendants(matching: .any)" }[s.role]}.matching(identifier: ${swiftString(s.target)}).firstMatch`;
  return (
    `import XCTest\n\n@MainActor\nfinal class AcceptanceTests: XCTestCase {\n` +
    plan.journeys
      .map(
        (j, i) => `func testJourney${i + 1}() throws {
continueAfterFailure = false
let app = XCUIApplication()
app.launchArguments = ["--studio-reset", "--studio-testing"]
app.launch()
${j.steps
  .map((s, n) => {
    if (s.action === "relaunch")
      return 'app.terminate()\napp.launchArguments = ["--studio-testing"]\napp.launch()';
    const v = "element" + n;
    let result = `let ${v} = ${query(s)}\n`;
    if (s.action === "absent")
      return (
        result +
        `XCTAssertTrue(${v}.waitForNonExistence(timeout: 5), ${swiftString("Should be absent: " + s.target)})`
      );
    result += `XCTAssertTrue(${v}.waitForExistence(timeout: 8), ${swiftString("Missing: " + s.target)})\n`;
    if (s.action === "tap")
      result += `XCTAssertTrue(${v}.isHittable)\n${v}.tap()`;
    if (s.action === "type")
      result += `${v}.tap()\n${v}.typeText(${swiftString(s.value)})`;
    if (s.action === "text")
      result += `XCTAssertEqual(${v}.label, ${swiftString(s.value)})`;
    return result;
  })
  .join("\n")}
let capture = XCTAttachment(screenshot: app.screenshot())
capture.name = ${swiftString(j.screen)}
capture.lifetime = .keepAlways
add(capture)
app.terminate()
}`,
      )
      .join("\n\n") +
    "\n}\n"
  );
}
