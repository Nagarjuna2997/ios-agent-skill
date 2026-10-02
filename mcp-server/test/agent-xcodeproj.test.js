// The built-in Xcode project writer, used when XcodeGen is not installed.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { globMatch, renderPlist } from "../dist/agent/xcodeproj.js";
import { createProject } from "../dist/agent/workspace.js";
import { loadCapabilities, capabilitiesDir } from "../dist/agent/capabilities.js";
import { ProcessRunner } from "../dist/agent/runner.js";

describe("built-in project writer", () => {
  test("globs match the exclude patterns capabilities use", () => {
    assert.ok(globMatch("Resources/IconLayers/**", "Resources/IconLayers/background.svg"));
    assert.ok(globMatch("Resources/IconLayers/**", "Resources/IconLayers/deep/a.svg"));
    assert.ok(!globMatch("Resources/IconLayers/**", "Resources/IconLayersX/a.svg"));
    assert.ok(globMatch("Capabilities/Storekit2Paywall/Products.storekit", "Capabilities/Storekit2Paywall/Products.storekit"));
    assert.ok(!globMatch("Capabilities/*.swift", "Capabilities/A/B.swift"));
    assert.ok(globMatch("Capabilities/*.swift", "Capabilities/B.swift"));
  });

  test("property lists escape text and keep value types", () => {
    const plist = renderPlist({ A: "x < y & z", B: true, C: 3, D: ["one"], E: { F: false }, G: [] });
    assert.match(plist, /<key>A<\/key>\n\t<string>x &lt; y &amp; z<\/string>/);
    assert.match(plist, /<key>B<\/key>\n\t<true\/>/);
    assert.match(plist, /<integer>3<\/integer>/);
    assert.match(plist, /<array>\n\t\t<string>one<\/string>\n\t<\/array>/);
    assert.match(plist, /<key>F<\/key>\n\t\t<false\/>/);
    assert.match(plist, /<key>G<\/key>\n\t<array\/>/);
  });

  test("without XcodeGen, every capability renders into a synchronized project with the widget extension", async (t) => {
    const work = await mkdtemp(join(tmpdir(), "builtin-"));
    t.after(() => rm(work, { recursive: true, force: true }));
    const root = join(work, "FoodRun");
    const ids = [...(await loadCapabilities(capabilitiesDir())).keys()];
    const created = await createProject({ projectDir: root, name: "FoodRun", bundleId: "com.example.foodrun", capabilities: ids }, new ProcessRunner({ PATH: "/nonexistent" }));
    assert.equal(created.generated, true, created.generateError);

    const pbx = await readFile(join(root, "FoodRun.xcodeproj", "project.pbxproj"), "utf8");
    assert.match(pbx, /objectVersion = 77;/);
    assert.equal((pbx.match(/{/g) ?? []).length, (pbx.match(/}/g) ?? []).length, "braces balance");
    assert.equal((pbx.match(/\(/g) ?? []).length, (pbx.match(/\)/g) ?? []).length, "parentheses balance");
    assert.match(pbx, /productType = "com\.apple\.product-type\.application"/);
    assert.match(pbx, /productType = "com\.apple\.product-type\.app-extension"/);
    assert.match(pbx, /name = "Embed Foundation Extensions"/);
    assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.example\.foodrun\.widgets;/);
    assert.match(pbx, /repositoryURL = "https:\/\/github\.com\/airbnb\/lottie-spm\.git"/);
    assert.match(pbx, /CODE_SIGN_ENTITLEMENTS = Config\/FoodRun\.entitlements;/);
    assert.match(pbx, /ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/);

    // The app target leaves out extension-only and excluded files; the
    // extension target takes only its own sources from the app folder.
    const exceptionSets = [...pbx.matchAll(/isa = PBXFileSystemSynchronizedBuildFileExceptionSet; membershipExceptions = \(([^)]*)\); target = (\w+);/g)];
    assert.equal(exceptionSets.length, 2);
    const [appSet, extSet] = exceptionSets.map((m) => m[1]).sort((a, b) => a.length - b.length);
    assert.match(appSet, /"Capabilities\/LiveActivity\/Widget\/ProgressLiveActivity\.swift"/);
    assert.match(appSet, /"Resources\/IconLayers\/background\.svg"/);
    assert.match(appSet, /"Capabilities\/Storekit2Paywall\/Products\.storekit"/);
    assert.doesNotMatch(appSet, /ProgressActivityAttributes/);
    assert.match(extSet, /"App\/FoodRunApp\.swift"/);
    assert.match(extSet, /"Resources\/Assets\.xcassets"/);
    assert.doesNotMatch(extSet, /"Capabilities\/LiveActivity\/Shared\/ProgressActivityAttributes\.swift"/);
    assert.doesNotMatch(extSet, /"Capabilities\/LiveActivity\/Widget\/ProgressLiveActivity\.swift"/);

    const info = await readFile(join(root, "Config", "Info.plist"), "utf8");
    assert.match(info, /<key>CFBundleIdentifier<\/key>\n\t<string>\$\(PRODUCT_BUNDLE_IDENTIFIER\)<\/string>/);
    assert.match(info, /<key>NSSupportsLiveActivities<\/key>\n\t<true\/>/);
    assert.match(info, /<key>SUPABASE_URL<\/key>\n\t<string>\$\(SUPABASE_URL\)<\/string>/);
    assert.match(await readFile(join(root, "Config", "FoodRunWidgets-Info.plist"), "utf8"), /com\.apple\.widgetkit-extension/);
    assert.match(await readFile(join(root, "Config", "FoodRun.entitlements"), "utf8"), /com\.apple\.developer\.applesignin/);
    assert.match(await readFile(join(root, "Config", "FoodRunWidgets.entitlements"), "utf8"), /group\.com\.example\.foodrun/);
    const scheme = await readFile(join(root, "FoodRun.xcodeproj", "xcshareddata", "xcschemes", "FoodRun.xcscheme"), "utf8");
    assert.match(scheme, /StoreKitConfigurationFileReference identifier = "\.\.\/\.\.\/FoodRun\/Capabilities\/Storekit2Paywall\/Products\.storekit"/);
    assert.ok(existsSync(join(root, "FoodRunWidgets", "FoodRunWidgetsBundle.swift")));
  });

  test("IOS_AGENT_PROJECT_GENERATOR=xcodegen keeps the XcodeGen failure instead of falling back", async (t) => {
    const work = await mkdtemp(join(tmpdir(), "builtin-"));
    t.after(() => rm(work, { recursive: true, force: true }));
    const previous = process.env.IOS_AGENT_PROJECT_GENERATOR;
    process.env.IOS_AGENT_PROJECT_GENERATOR = "xcodegen";
    t.after(() => (previous === undefined ? delete process.env.IOS_AGENT_PROJECT_GENERATOR : (process.env.IOS_AGENT_PROJECT_GENERATOR = previous)));
    const created = await createProject({ projectDir: join(work, "Plain"), name: "Plain", capabilities: [] }, new ProcessRunner({ PATH: "/nonexistent" }));
    assert.equal(created.generated, false);
    assert.match(created.generateError, /xcodegen/);
  });
});
