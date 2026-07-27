import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { analyzeConcurrency } from "../dist/analyzers/concurrency.js";
import { analyzeArchitecture } from "../dist/analyzers/architecture.js";
import { analyzeSwiftUI } from "../dist/analyzers/swiftui.js";
import { analyzeAvailability } from "../dist/analyzers/availability.js";
import { analyzeAppStore, analyzeProjectLevelAppStore } from "../dist/analyzers/appstore.js";
import { sortFindings } from "../dist/analyzers/types.js";
import { renderFindings } from "../dist/report.js";

const file = (path, content) => ({ path, content });
const rules = (findings) => findings.map((f) => f.rule);

describe("concurrency", () => {
  test("flags @Observable without @MainActor", () => {
    const found = analyzeConcurrency(
      file("Sources/FeedModel.swift", "@Observable\nfinal class FeedModel {\n  var posts: [Post] = []\n}\n"),
    );
    assert.ok(rules(found).includes("observable-without-mainactor"));
    assert.equal(found[0].severity, "blocker");
  });

  test("accepts @MainActor @Observable", () => {
    const found = analyzeConcurrency(
      file("Sources/FeedModel.swift", "@MainActor\n@Observable\nfinal class FeedModel {\n  var posts: [Post] = []\n}\n"),
    );
    assert.ok(!rules(found).includes("observable-without-mainactor"));
  });

  test("exempts test and mock files", () => {
    const found = analyzeConcurrency(
      file("Tests/MockFeedModel.swift", "@Observable\nfinal class MockFeedModel {}\n"),
    );
    assert.ok(!rules(found).includes("observable-without-mainactor"));
  });

  test("flags Task.detached, DispatchQueue.main.async, @unchecked Sendable", () => {
    const found = analyzeConcurrency(
      file(
        "Sources/Loader.swift",
        [
          "final class Loader: @unchecked Sendable {",
          "  func run() {",
          "    Task.detached { await self.load() }",
          "    DispatchQueue.main.async { self.done = true }",
          "  }",
          "}",
        ].join("\n"),
      ),
    );
    const found_rules = rules(found);
    assert.ok(found_rules.includes("task-detached"));
    assert.ok(found_rules.includes("dispatchqueue-main-async"));
    assert.ok(found_rules.includes("unchecked-sendable"));
  });

  test("flags a type named Task", () => {
    const found = analyzeConcurrency(file("Sources/Task.swift", "struct Task: Identifiable {\n  let id: UUID\n}\n"));
    assert.ok(rules(found).includes("type-named-task"));
  });

  test("flags empty catch", () => {
    const found = analyzeConcurrency(
      file("Sources/S.swift", "func f() {\n  do { try g() } catch { }\n}\n"),
    );
    assert.ok(rules(found).includes("empty-catch"));
  });

  test("does not flag `catch { }` mentioned inside a doc comment", () => {
    // Regression: this check used a raw regex over the whole file, so a doc
    // comment describing the anti-pattern was reported as the anti-pattern.
    const found = analyzeConcurrency(
      file(
        "Sources/M.swift",
        "/// - no `catch { }` and no `error = nil` — every failure surfaces\nfinal class M {}\n",
      ),
    );
    assert.ok(!rules(found).includes("empty-catch"));
  });

  test("ignores commented-out code", () => {
    const found = analyzeConcurrency(
      file("Sources/S.swift", "// Task.detached { }\n/* DispatchQueue.main.async { } */\nfunc f() {}\n"),
    );
    assert.deepEqual(rules(found), []);
  });
});

describe("architecture", () => {
  test("flags a live-implementation default argument", () => {
    const found = analyzeArchitecture(
      file("Sources/VM.swift", "init(repository: any Repo = LiveRepo()) {}\n"),
    );
    assert.ok(rules(found).includes("live-default-dependency"));
  });

  test("flags presentation naming a concrete data type", () => {
    const found = analyzeArchitecture(
      file("Sources/Views/FeedView.swift", "let client = APIClient()\n"),
    );
    assert.ok(rules(found).includes("presentation-names-data-type"));
  });

  test("flags the domain layer importing SwiftUI", () => {
    const found = analyzeArchitecture(
      file("Sources/Domain/Order.swift", "import SwiftUI\nstruct Order {}\n"),
    );
    assert.ok(rules(found).includes("domain-imports-ui"));
  });

  test("flags deprecated NavigationView", () => {
    const found = analyzeArchitecture(
      file("Sources/Views/Root.swift", "var body: some View { NavigationView { List {} } }\n"),
    );
    assert.ok(rules(found).includes("deprecated-navigationview"));
  });

  test("clean architecture file produces nothing", () => {
    const found = analyzeArchitecture(
      file(
        "Sources/Views/FeedView.swift",
        "struct FeedView: View {\n  let model: FeedModel\n  var body: some View { Text(model.title) }\n}\n",
      ),
    );
    assert.deepEqual(rules(found), []);
  });
});

describe("swiftui", () => {
  test("skips files that do not import SwiftUI", () => {
    const found = analyzeSwiftUI(file("Sources/M.swift", "let x = AnyView(Text(\"hi\"))\n"));
    assert.deepEqual(found, []);
  });

  test("flags fixed font size, AnyView, cornerRadius, try!", () => {
    const found = analyzeSwiftUI(
      file(
        "Sources/V.swift",
        [
          "import SwiftUI",
          "struct V: View {",
          "  var body: some View {",
          "    AnyView(Text(\"x\").font(.system(size: 17)).cornerRadius(8))",
          "  }",
          "  func f() { try! g() }",
          "}",
        ].join("\n"),
      ),
    );
    const found_rules = rules(found);
    assert.ok(found_rules.includes("fixed-font-size"));
    assert.ok(found_rules.includes("any-view"));
    assert.ok(found_rules.includes("deprecated-corner-radius"));
    assert.ok(found_rules.includes("force-try"));
  });

  test("accepts a relative custom font", () => {
    const found = analyzeSwiftUI(
      file("Sources/V.swift", "import SwiftUI\nlet f = Font.custom(\"Inter\", size: 17, relativeTo: .headline)\n"),
    );
    assert.ok(!rules(found).includes("fixed-font-size"));
  });

  test("flags @EnvironmentObject as serious", () => {
    const found = analyzeSwiftUI(
      file("Sources/V.swift", "import SwiftUI\nstruct V: View { @EnvironmentObject var a: Auth }\n"),
    );
    const finding = found.find((f) => f.rule === "environmentobject");
    assert.ok(finding);
    assert.equal(finding.severity, "serious");
  });
});

describe("availability", () => {
  test("flags an unguarded iOS 26 API", () => {
    const found = analyzeAvailability(
      file("Sources/V.swift", "let v = Text(\"x\").glassEffect()\n"),
    );
    assert.ok(rules(found).includes("missing-availability-guard"));
  });

  test("accepts a guard at the introduction version", () => {
    const found = analyzeAvailability(
      file("Sources/V.swift", "if #available(iOS 26.0, *) {\n  let v = Text(\"x\").glassEffect()\n}\n"),
    );
    assert.deepEqual(rules(found), []);
  });

  test("flags an over-restrictive guard — iOS 26 API guarded at 27", () => {
    const found = analyzeAvailability(
      file("Sources/V.swift", "if #available(iOS 27.0, *) {\n  let v = Text(\"x\").glassEffect()\n}\n"),
    );
    const finding = found.find((f) => f.rule === "over-restrictive-guard");
    assert.ok(finding, "expected an over-restrictive-guard finding");
    assert.match(finding.message, /introduced in iOS 26 but is guarded at iOS 27/);
  });

  test("reports a real line NUMBER, not the source text", () => {
    // Regression test: `line` was previously the matched source string, which
    // type-checked only because of an unsafe cast.
    const found = analyzeAvailability(
      file("Sources/V.swift", "import SwiftUI\n\nlet v = Text(\"x\").glassEffect()\n"),
    );
    assert.equal(found.length, 1);
    assert.equal(typeof found[0].line, "number");
    assert.equal(found[0].line, 3);
  });

  test("flags Foundation Models without a runtime availability check", () => {
    const found = analyzeAvailability(
      file("Sources/M.swift", "@available(iOS 26.0, *)\nlet s = LanguageModelSession(instructions: \"hi\")\n"),
    );
    assert.ok(rules(found).includes("missing-runtime-model-check"));
  });

  test("accepts Foundation Models with a runtime check", () => {
    const found = analyzeAvailability(
      file(
        "Sources/M.swift",
        [
          "@available(iOS 26.0, *)",
          "func make() -> LanguageModelSession? {",
          "  guard case .available = SystemLanguageModel.default.availability else { return nil }",
          "  return LanguageModelSession(instructions: \"hi\")",
          "}",
        ].join("\n"),
      ),
    );
    assert.ok(!rules(found).includes("missing-runtime-model-check"));
  });
});

describe("app store", () => {
  const noManifest = { infoPlist: "", hasPrivacyManifest: false, isApp: true };

  test("flags a missing privacy manifest in an app", () => {
    assert.ok(rules(analyzeProjectLevelAppStore(noManifest)).includes("missing-privacy-manifest"));
  });

  test("accepts a present privacy manifest", () => {
    assert.deepEqual(analyzeProjectLevelAppStore({ infoPlist: "", hasPrivacyManifest: true, isApp: true }), []);
  });

  test("does not require a privacy manifest for a library", () => {
    // Regression: an SPM library has no Info.plist and is never submitted to
    // App Review, so this rule must not fire on one.
    assert.deepEqual(
      analyzeProjectLevelAppStore({ infoPlist: "", hasPrivacyManifest: false, isApp: false }),
      [],
    );
  });

  test("flags a permission framework with no purpose string", () => {
    const found = analyzeAppStore(
      file("Sources/L.swift", "import CoreLocation\nlet m = CLLocationManager()\n"),
      noManifest,
    );
    assert.ok(rules(found).includes("missing-purpose-string"));
  });

  test("accepts a permission framework when the purpose string exists", () => {
    const found = analyzeAppStore(
      file("Sources/L.swift", "import CoreLocation\nlet m = CLLocationManager()\n"),
      { infoPlist: "<key>NSLocationWhenInUseUsageDescription</key><string>To show nearby stores.</string>", hasPrivacyManifest: true, isApp: true },
    );
    assert.ok(!rules(found).includes("missing-purpose-string"));
  });

  test("flags print() and an unlabeled icon button", () => {
    const found = analyzeAppStore(
      file(
        "Sources/V.swift",
        "print(\"debug\")\nButton { tap() } label: { Image(systemName: \"trash\") }\n",
      ),
      { infoPlist: "", hasPrivacyManifest: true, isApp: true },
    );
    const found_rules = rules(found);
    assert.ok(found_rules.includes("print-logging"));
    assert.ok(found_rules.includes("unlabeled-icon-button"));
  });
});

describe("reporting", () => {
  test("sorts blockers before serious before minor", () => {
    const make = (severity, line) => ({
      file: "A.swift", line, severity, rule: "r", message: "m",
      consequence: "c", fix: "f", doc: "d", excerpt: "e",
    });
    const sorted = sortFindings([make("minor", 1), make("blocker", 2), make("serious", 3)]);
    assert.deepEqual(sorted.map((f) => f.severity), ["blocker", "serious", "minor"]);
  });

  test("empty result states it explicitly rather than rendering nothing", () => {
    const output = renderFindings("Test", [], 12);
    assert.match(output, /No findings/);
    assert.match(output, /Scanned \*\*12\*\* Swift files/);
  });

  test("renders counts, location, and the fix", () => {
    const output = renderFindings("Test", [
      {
        file: "A.swift", line: 42, severity: "blocker", rule: "some-rule",
        message: "Something is wrong.", consequence: "It breaks.",
        fix: "Do this instead.", doc: "docs/x.md", excerpt: "let x = 1",
      },
    ], 1);
    assert.match(output, /A\.swift:42/);
    assert.match(output, /Do this instead\./);
    assert.match(output, /some-rule/);
    assert.match(output, /1 blocker/);
  });
});
