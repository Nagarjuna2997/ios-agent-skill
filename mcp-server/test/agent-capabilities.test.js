// Tests for the capability system: loading and validating modules, resolving
// requests (ids, category defaults, dependencies, catalog-only entries) and
// applying every module to a project with the fake toolchain.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { CapabilityError, capabilitiesDir, loadCapabilities, loadCatalog, resolveCapabilities } from "../dist/agent/capabilities.js";
import { createProject } from "../dist/agent/workspace.js";
import { ProcessRunner } from "../dist/agent/runner.js";
import { verifyCapability } from "../dist/agent/verify.js";
import { fakeXcode } from "./helpers/fake-xcode.js";

const sourceDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "capabilities");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function walk(dir, base = dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, base, out);
    else out.push(full.slice(base.length + 1));
  }
  return out;
}

async function copyModules(t) {
  const dir = await mkdtemp(join(tmpdir(), "caps-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await cp(sourceDir, dir, { recursive: true });
  return dir;
}

async function editManifest(dir, id, edit) {
  const file = join(dir, id, "manifest.json");
  const manifest = JSON.parse(await readFile(file, "utf8"));
  edit(manifest);
  await writeFile(file, JSON.stringify(manifest, null, 2));
}

describe("capability modules", () => {
  test("the source and bundled folders load and agree", async () => {
    const source = await loadCapabilities(sourceDir);
    const bundled = await loadCapabilities(capabilitiesDir());
    assert.deepEqual([...bundled.keys()].sort(), [...source.keys()].sort());
    assert.ok(source.size >= 13, `expected at least 13 modules, found ${source.size}`);
    for (const capability of bundled.values()) {
      assert.match(capability.applyModule, /apply\.js$/, `${capability.manifest.id} apply hook is compiled`);
      assert.match(capability.verifyModule, /verify\.js$/, `${capability.manifest.id} verify hook is compiled`);
    }
    for (const capability of source.values()) {
      assert.match(capability.applyModule, /apply\.ts$/);
      assert.ok(capability.templateFiles.length > 0 || capability.manifest.id === "app-icon", `${capability.manifest.id} has template files`);
    }
  });

  test("no module claims verified without a verification record, and every module is in the catalog", async () => {
    const loaded = await loadCapabilities(sourceDir);
    const catalog = await loadCatalog(sourceDir);
    for (const { manifest, dir } of loaded.values()) {
      if (manifest.status === "verified") assert.ok(existsSync(join(dir, "verification.json")), manifest.id);
      const entry = catalog.find((e) => e.id === manifest.id);
      assert.ok(entry, `${manifest.id} is listed in catalog.json`);
      assert.equal(entry.category, manifest.category);
      for (const amount of manifest.cost.amounts) {
        assert.equal(amount.verified, true, `${manifest.id}: only verified amounts are recorded`);
        assert.match(amount.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
      }
    }
    for (const id of catalog.filter((e) => e.priority === "P0").map((e) => e.id)) {
      assert.ok(loaded.has(id), `P0 catalog entry ${id} has a module`);
    }
  });

  test("templates use only declared placeholders", async () => {
    const loaded = await loadCapabilities(sourceDir);
    for (const capability of loaded.values()) {
      for (const file of capability.templateFiles) {
        const text = await readFile(join(capability.dir, "template", file), "utf8").catch(() => "");
        const tokens = text.match(/__[A-Z_]+__/g) ?? [];
        for (const token of tokens) assert.ok(["__APP_NAME__", "__BUNDLE_ID__", "__DISPLAY_NAME__"].includes(token), `${capability.manifest.id}/${file}: ${token}`);
        if (file.endsWith(".swift")) assert.doesNotMatch(text, /@Previewable/, `${capability.manifest.id}/${file} must not need iOS 18 preview macros`);
      }
    }
  });

  test("the loader rejects inconsistent modules", async (t) => {
    const cases = [
      ["verified without a record", (dir) => editManifest(dir, "swiftdata", (m) => (m.status = "verified")), /requires verification\.json/],
      ["two defaults in a category", (dir) => editManifest(dir, "email-password-auth", (m) => (m.default = true)), /more than one default/],
      ["unknown dependency", (dir) => editManifest(dir, "mapkit-map", (m) => (m.requires = { capabilities: ["no-such-module"] })), /requires unknown capability no-such-module/],
      ["id and folder differ", (dir) => editManifest(dir, "swiftdata", (m) => (m.id = "swift-data")), /must match its folder name/],
      ["bad category", (dir) => editManifest(dir, "swiftdata", (m) => (m.category = "databases")), /swiftdata\/manifest\.json/],
      ["missing recipe", (dir) => rm(join(dir, "swiftdata", "recipe.md")), /recipe\.md is missing/],
    ];
    for (const [name, mutate, message] of cases) {
      const dir = await copyModules(t);
      await mutate(dir);
      await assert.rejects(loadCapabilities(dir), (error) => error instanceof CapabilityError && message.test(error.message), name);
    }
  });
});

describe("capability resolution", () => {
  test("orders dependencies first and reports why they were added", async () => {
    const loaded = await loadCapabilities(sourceDir);
    const { ordered, added, unavailable } = resolveCapabilities(["email-password-auth", "sign-in-with-apple"], loaded);
    assert.deepEqual(ordered.map((c) => c.manifest.id), ["keychain-storage", "email-password-auth", "sign-in-with-apple"]);
    assert.deepEqual(added, [{ id: "keychain-storage", because: "required by email-password-auth" }]);
    assert.deepEqual(unavailable, []);
  });

  test("a category name selects the Apple-native default", async () => {
    const loaded = await loadCapabilities(sourceDir);
    const { ordered, added } = resolveCapabilities(["Authentication", "charts", "payments"], loaded);
    assert.deepEqual(ordered.map((c) => c.manifest.id), ["keychain-storage", "sign-in-with-apple", "swift-charts-dashboard", "storekit2-paywall"]);
    assert.ok(added.some((a) => a.id === "sign-in-with-apple" && a.because === "default for authentication"));
    for (const capability of ordered) if (capability.manifest.default) assert.equal(capability.manifest.appleNative, true);
  });

  test("catalog-only and unknown requests are reported, not applied", async () => {
    const loaded = await loadCapabilities(sourceDir);
    const catalog = await loadCatalog(sourceDir);
    const plannedOnly = catalog.find((e) => !loaded.has(e.id));
    const { ordered, unavailable } = resolveCapabilities([plannedOnly.id, "teleportation", "animation"], loaded, catalog);
    assert.deepEqual(ordered, []);
    assert.equal(unavailable[0].catalog.id, plannedOnly.id);
    assert.match(unavailable[0].reason, /no module is implemented yet/);
    assert.match(unavailable[1].reason, /Unknown capability id/);
    // Lottie is an alternative, not the animation default, so the category is not satisfied by it.
    assert.match(unavailable[2].reason, /No capability module is the default for category animation/);
  });
});

describe("applying every module", () => {
  test("produces a consistent XcodeGen project, assets, credentials and scheme", async (t) => {
    const { env } = await fakeXcode(t);
    const work = await mkdtemp(join(tmpdir(), "apply-all-"));
    t.after(() => rm(work, { recursive: true, force: true }));
    const root = join(work, "FoodRun");
    const all = await loadCapabilities(capabilitiesDir());
    const ids = [...all.keys()].sort();
    const clientKeys = [...new Set([...all.values()].flatMap((c) => c.manifest.credentialsNeeded.filter((k) => k.kind === "client").map((k) => k.key)))].sort();
    const created = await createProject({ projectDir: root, name: "FoodRun", bundleId: "com.example.foodrun", capabilities: ids }, new ProcessRunner({ ...process.env, ...env }));

    assert.equal(created.generated, true, created.generateError);
    assert.deepEqual(created.capabilities.unavailable, []);
    assert.deepEqual(created.capabilities.applied.map((a) => a.id).sort(), ids);
    // RealityKit's RealityView camera API raises the floor to iOS 18.
    assert.equal(created.deploymentTarget, "18.0");
    assert.ok(clientKeys.includes("SUPABASE_URL"));
    assert.deepEqual(created.missingSecrets.sort(), clientKeys);

    const yml = YAML.parse(await readFile(join(root, "project.yml"), "utf8"));
    const target = yml.targets.FoodRun;
    assert.equal(target.deploymentTarget, "18.0");
    assert.deepEqual(target.entitlements.properties["com.apple.developer.applesignin"], ["Default"]);
    assert.deepEqual(target.info.properties.UILaunchScreen, { UIColorName: "LaunchBackground", UIImageName: "LaunchLogo", UIImageRespectsSafeAreaInsets: true });
    assert.equal(target.info.properties.SUPABASE_URL, "$(SUPABASE_URL)");
    assert.equal(target.settings.base.ASSETCATALOG_COMPILER_APPICON_NAME, "AppIcon");
    for (const excluded of ["Capabilities/Storekit2Paywall/Products.storekit", "Resources/IconLayers/**"]) assert.ok(target.sources[0].excludes.includes(excluded), excluded);
    assert.deepEqual(yml.packages["lottie-spm"], { url: "https://github.com/airbnb/lottie-spm.git", from: "4.5.0" });
    assert.ok(target.dependencies.some((d) => d.package === "lottie-spm" && d.product === "Lottie"));
    assert.equal(yml.schemes.FoodRun.run.storeKitConfiguration, "FoodRun/Capabilities/Storekit2Paywall/Products.storekit");

    // Widgets and Live Activities share one WidgetKit extension, embedded in the app.
    assert.ok(target.dependencies.some((d) => d.target === "FoodRunWidgets"));
    const widgets = yml.targets.FoodRunWidgets;
    assert.equal(widgets.type, "app-extension");
    assert.equal(widgets.settings.base.PRODUCT_BUNDLE_IDENTIFIER, "com.example.foodrun.widgets");
    assert.equal(widgets.info.properties.NSExtension.NSExtensionPointIdentifier, "com.apple.widgetkit-extension");
    assert.deepEqual(widgets.sources.map((s) => s.path).sort(), [
      "FoodRun/Capabilities/HomeScreenWidget/Shared",
      "FoodRun/Capabilities/HomeScreenWidget/Widget",
      "FoodRun/Capabilities/LiveActivity/Shared",
      "FoodRun/Capabilities/LiveActivity/Widget",
      "FoodRunWidgets",
    ]);
    for (const extensionOnly of ["Capabilities/HomeScreenWidget/Widget/**", "Capabilities/LiveActivity/Widget/**"]) assert.ok(target.sources[0].excludes.includes(extensionOnly));
    const group = ["group.com.example.foodrun"];
    assert.deepEqual(target.entitlements.properties["com.apple.security.application-groups"], group);
    assert.deepEqual(widgets.entitlements.properties["com.apple.security.application-groups"], group);
    assert.equal(target.info.properties.NSSupportsLiveActivities, true);
    const info = target.info.properties;
    assert.deepEqual(info.CFBundleURLTypes, [{ CFBundleURLName: "com.example.foodrun", CFBundleURLSchemes: ["foodrun"] }]);
    assert.deepEqual(info.BGTaskSchedulerPermittedIdentifiers, ["com.example.foodrun.refresh"]);
    assert.deepEqual(info.UIBackgroundModes, ["fetch"]);
    for (const usage of ["NSLocationWhenInUseUsageDescription", "NSFaceIDUsageDescription"]) assert.ok(info[usage]?.length > 10, usage);
    const base = await readFile(join(root, "Config", "Base.xcconfig"), "utf8");
    assert.match(base, /^SWIFT_EMIT_LOC_STRINGS = YES$/m);
    assert.match(base, /^OTHER_LDFLAGS = \$\(inherited\) -weak_framework FoundationModels$/m);
    const { contrast } = await import("../data/capabilities/_sdk/brand.js");
    const colorsetHex = async (name) => {
      const set = JSON.parse(await readFile(join(root, "FoodRun", "Resources", "Assets.xcassets", `${name}.colorset`, "Contents.json"), "utf8"));
      return set.colors.map(({ color: { components: c } }) => "#" + [c.red, c.green, c.blue].map((v) => Math.round(Number(v) * 255).toString(16).padStart(2, "0")).join(""));
    };
    const [onLight, onDark] = await colorsetHex("BrandOnPrimary");
    for (const name of ["BrandPrimary", "BrandSecondary"]) {
      const [light, dark] = await colorsetHex(name);
      assert.ok(contrast(light, onLight) >= 4.5, `${name} light ${light} on ${onLight}`);
      assert.ok(contrast(dark, onDark) >= 4.5, `${name} dark ${dark} on ${onDark}`);
    }
    const bundle = await readFile(join(root, "FoodRunWidgets", "FoodRunWidgetsBundle.swift"), "utf8");
    assert.match(bundle, /@main\s+struct FoodRunWidgetsBundle: WidgetBundle/);
    assert.match(bundle, /SummaryWidget\(\)\n\s+ProgressLiveActivity\(\)|ProgressLiveActivity\(\)\n\s+SummaryWidget\(\)/);

    // Secrets stay out of tracked files: placeholders in the gitignored xcconfig, instructions in .env.example.
    assert.match(await readFile(join(root, "Config", "Secrets.xcconfig"), "utf8"), /^SUPABASE_URL = REPLACE_ME$/m);
    assert.match(await readFile(join(root, ".gitignore"), "utf8"), /Secrets\.xcconfig/);
    assert.match(await readFile(join(root, ".env.example"), "utf8"), /SUPABASE_ANON_KEY=/);

    const app = join(root, "FoodRun");
    const files = await walk(app);
    for (const expected of [
      "Capabilities/LottieAnimation/pulse.json",
      "Capabilities/Realitykit3d/ModelViewer.swift",
      "Capabilities/Storekit2Paywall/Products.storekit",
      "Capabilities/SignInWithApple/AppleSignIn.swift",
      "Resources/IconLayers/background.svg",
      "Resources/Assets.xcassets/AppIcon.appiconset/Contents.json",
      "Resources/Assets.xcassets/LaunchBackground.colorset/Contents.json",
      "Resources/Assets.xcassets/LaunchLogo.imageset/LaunchLogo@3x.png",
      "Resources/PrivacyInfo.xcprivacy",
      "Resources/Localization/Localizable.xcstrings",
      "Resources/Assets.xcassets/BrandPrimary.colorset/Contents.json",
    ]) {
      assert.ok(files.includes(expected), `${expected} was written`);
    }
    for (const png of files.filter((f) => f.endsWith(".png"))) {
      assert.deepEqual((await readFile(join(app, png))).subarray(0, 8), PNG_SIGNATURE, `${png} is a PNG`);
    }
    const iconContents = JSON.parse(await readFile(join(app, "Resources/Assets.xcassets/AppIcon.appiconset/Contents.json"), "utf8"));
    const iconFile = iconContents.images.find((i) => i.filename)?.filename;
    assert.ok(iconFile && files.includes(`Resources/Assets.xcassets/AppIcon.appiconset/${iconFile}`));
    const lottie = JSON.parse(await readFile(join(app, "Capabilities/LottieAnimation/pulse.json"), "utf8"));
    assert.equal(lottie.layers.length, 1);
    assert.ok(lottie.op > lottie.ip);

    for (const swift of files.filter((f) => f.endsWith(".swift") || f.endsWith(".storekit"))) {
      assert.doesNotMatch(await readFile(join(app, swift), "utf8"), /__(APP_NAME|BUNDLE_ID|DISPLAY_NAME)__/, `${swift} placeholders were substituted`);
    }
    assert.match(await readFile(join(app, "Capabilities/Storekit2Paywall/Products.storekit"), "utf8"), /com\.example\.foodrun\.premium\.monthly/);

    // Applying again is a no-op for capabilities already in the spec.
    const spec = JSON.parse(await readFile(join(root, ".ios-agent", "spec.json"), "utf8"));
    assert.deepEqual([...spec.capabilities].sort(), ids);
  });
});

describe("brand colors", () => {
  test("primary and secondary reach 4.5:1 against their text color for every hue", async () => {
    const { readable, contrast } = await import("../data/capabilities/_sdk/brand.js");
    for (let hue = 0; hue < 360; hue++) {
      assert.ok(contrast(readable(hue, 70, 45, "#FFFFFF", "darker"), "#FFFFFF") >= 4.5, `light primary ${hue}`);
      assert.ok(contrast(readable(hue, 75, 62, "#111111", "lighter"), "#111111") >= 4.5, `dark primary ${hue}`);
    }
    assert.equal(contrast("#FFFFFF", "#000000"), 21);
  });
});

describe("widget extension", () => {
  test("addWidget rejects unsafe paths and non-initializer widget names", async (t) => {
    const dir = await copyModules(t);
    const { applyCapabilities } = await import("../dist/agent/capabilities.js");
    const { newAppSpec } = await import("../dist/agent/spec.js");
    const writer = { writeSourceFile: async () => "written" };
    // Each probe gets its own file: ES modules are cached by URL.
    for (const [index, [body, message]] of [
      ['ctx.addWidget({ widget: "Foo", sources: [] })', /type initializer/],
      ['ctx.addWidget({ widget: "Foo()", sources: ["../Elsewhere"] })', /relative path inside the sources folder/],
      ['ctx.addWidget({ widget: "Foo()", sources: ["/abs"] })', /relative path inside the sources folder/],
    ].entries()) {
      const probe = join(dir, `probe-${index}.js`);
      await writeFile(probe, `export default (ctx) => { ${body}; };`);
      const capability = { manifest: { id: "probe", name: "Probe", status: "untested", minOS: "17.0", requires: { infoPlist: {}, entitlements: {}, buildSettings: {}, packages: [], capabilities: [] }, credentialsNeeded: [], cost: { model: "free", note: "", amounts: [] } }, dir, templateFiles: [], applyModule: probe };
      await assert.rejects(applyCapabilities(newAppSpec({ name: "Probe" }), [capability], writer), message);
    }
  });
});

describe("capability verification", () => {
  test("is blocked, not failed, without a Mac toolchain", async () => {
    const record = await verifyCapability("swiftdata", new ProcessRunner({ ...process.env, PATH: "/nonexistent" }), { dir: capabilitiesDir() });
    assert.equal(record.status, "blocked");
    assert.match(record.reason, /Preflight failed: .*xcode/);
  });

  test("builds the module into a minimal app with its usage file", async (t) => {
    const fake = await fakeXcode(t);
    const record = await verifyCapability("sign-in-with-apple", new ProcessRunner({ ...process.env, ...fake.env }), { dir: capabilitiesDir() });
    // The fake toolchain accepts any source, so this checks the pipeline, not the Swift.
    assert.equal(record.status, "verified");
    assert.equal(record.toolchain, "Xcode 27.0 (27A266a)");
    const generated = (await fake.calls()).find((c) => c.tool === "xcodegen" && c.args[0] !== "--version");
    assert.ok(generated, "XcodeGen ran for the minimal app");
    assert.ok((await fake.calls()).some((c) => c.tool === "xcodebuild" && c.args.includes("-project")));
  });
});
