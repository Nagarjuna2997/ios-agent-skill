import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { analyzeMemory } from "../dist/analyzers/memory.js";
import { analyzeSecurity } from "../dist/analyzers/security.js";
import { analyzeTesting, analyzeTestCoverage } from "../dist/analyzers/testing.js";
import { analyzePerformance } from "../dist/analyzers/performance.js";
import { buildReviewOutput, scoreFor } from "../dist/result.js";

const file = (path, lines) => ({ path, content: lines.join("\n") });
const rules = (findings) => findings.map((f) => f.rule);
const severityOf = (findings, rule) => findings.find((f) => f.rule === rule)?.severity;

describe("memory", () => {
  test("flags a repeating Timer capturing self strongly", () => {
    const found = analyzeMemory(
      file("Sources/ClockModel.swift", [
        "final class ClockModel {",
        "    func start() {",
        "        Timer.scheduledTimer(withTimeInterval: 1,",
        "                             repeats: true) { _ in",
        "            self.tick()",
        "        }",
        "    }",
        "}",
      ]),
    );
    assert.ok(rules(found).includes("timer-retain-cycle"));
    assert.equal(severityOf(found, "timer-retain-cycle"), "serious");
  });

  test("accepts the same Timer with a weak capture", () => {
    const found = analyzeMemory(
      file("Sources/ClockModel.swift", [
        "final class ClockModel {",
        "    func start() {",
        "        Timer.scheduledTimer(withTimeInterval: 1,",
        "                             repeats: true) { [weak self] _ in",
        "            self?.tick()",
        "        }",
        "    }",
        "}",
      ]),
    );
    assert.ok(!rules(found).includes("timer-retain-cycle"));
  });

  test("does not flag a non-repeating Timer", () => {
    const found = analyzeMemory(
      file("Sources/Once.swift", [
        "Timer.scheduledTimer(withTimeInterval: 1, repeats: false) { _ in",
        "    self.tick()",
        "}",
      ]),
    );
    assert.ok(!rules(found).includes("timer-retain-cycle"));
  });

  test("flags a strong delegate and unowned self", () => {
    const found = analyzeMemory(
      file("Sources/Picker.swift", [
        "final class Picker {",
        "    var delegate: (any PickerDelegate)?",
        "    func run() {",
        "        service.onDone { [unowned self] in self.finish() }",
        "    }",
        "}",
      ]),
    );
    assert.ok(rules(found).includes("strong-delegate"));
    assert.ok(rules(found).includes("unowned-self"));
  });

  test("accepts a weak delegate", () => {
    const found = analyzeMemory(
      file("Sources/Picker.swift", ["weak var delegate: (any PickerDelegate)?"]),
    );
    assert.ok(!rules(found).includes("strong-delegate"));
  });

  test("flags a Combine sink capturing self", () => {
    const found = analyzeMemory(
      file("Sources/Feed.swift", [
        "publisher.sink { value in",
        "    self.items = value",
        "}.store(in: &cancellables)",
      ]),
    );
    assert.ok(rules(found).includes("sink-retain-cycle"));
  });

  test("exempts test and mock files", () => {
    const found = analyzeMemory(
      file("Tests/MockClock.swift", ["var delegate: (any D)?"]),
    );
    assert.deepEqual(found, []);
  });
});

describe("security", () => {
  test("flags a hardcoded API key", () => {
    const found = analyzeSecurity(
      file("Sources/API.swift", ['let apiKey = "sk_live_9d8f7a6b5c4e3f2a1b0c"']),
    );
    assert.ok(rules(found).includes("hardcoded-secret"));
    assert.equal(severityOf(found, "hardcoded-secret"), "blocker");
  });

  test("does not flag an obvious placeholder", () => {
    for (const value of ["YOUR_API_KEY", "<your-key>", "changeme", "TODO"]) {
      const found = analyzeSecurity(
        file("Sources/API.swift", [`let apiKey = "${value}"`]),
      );
      assert.ok(
        !rules(found).includes("hardcoded-secret"),
        `${value} should not be reported`,
      );
    }
  });

  test("does not flag a short value", () => {
    const found = analyzeSecurity(file("Sources/API.swift", ['let token = "abc"']));
    assert.ok(!rules(found).includes("hardcoded-secret"));
  });

  test("flags a credential in UserDefaults", () => {
    const found = analyzeSecurity(
      file("Sources/Session.swift", [
        'UserDefaults.standard.set(authToken, forKey: "authToken")',
      ]),
    );
    assert.equal(severityOf(found, "secret-in-userdefaults"), "blocker");
  });

  test("flags disabled ATS and cleartext http", () => {
    const found = analyzeSecurity(
      file("Sources/Config.swift", [
        'let allow = "NSAllowsArbitraryLoads"',
        'let base = "http://api.example.com"',
      ]),
    );
    assert.ok(rules(found).includes("ats-disabled"));
    assert.ok(rules(found).includes("cleartext-http"));
  });

  test("allows http to localhost", () => {
    const found = analyzeSecurity(
      file("Sources/Config.swift", ['let base = "http://localhost:8080"']),
    );
    assert.ok(!rules(found).includes("cleartext-http"));
  });

  test("flags weak hashes and over-permissive Keychain accessibility", () => {
    const found = analyzeSecurity(
      file("Sources/Crypto.swift", [
        "let digest = Insecure.MD5.hash(data: data)",
        "query[kSecAttrAccessible as String] = kSecAttrAccessibleAlways",
      ]),
    );
    assert.ok(rules(found).includes("weak-hash"));
    assert.equal(severityOf(found, "keychain-always-accessible"), "blocker");
  });

  test("flags non-cryptographic randomness used for a nonce", () => {
    const found = analyzeSecurity(
      file("Sources/Auth.swift", ["let nonce = UUID().uuidString"]),
    );
    assert.ok(rules(found).includes("non-cryptographic-randomness"));
  });

  test("does not flag UUID used as an ordinary identifier", () => {
    const found = analyzeSecurity(
      file("Sources/Model.swift", ["let id = UUID()"]),
    );
    assert.ok(!rules(found).includes("non-cryptographic-randomness"));
  });
});

describe("testing", () => {
  test("only runs on test files", () => {
    const found = analyzeTesting(
      file("Sources/Model.swift", ["Thread.sleep(forTimeInterval: 2)"]),
    );
    assert.deepEqual(found, []);
  });

  test("flags sleeping in a test", () => {
    const found = analyzeTesting(
      file("Tests/FeedTests.swift", [
        "func testLoads() async {",
        "    try? await Task.sleep(for: .seconds(2))",
        "    XCTAssertTrue(model.isLoaded)",
        "}",
      ]),
    );
    assert.ok(rules(found).includes("test-sleeps"));
  });

  test("flags a test with no assertion", () => {
    const found = analyzeTesting(
      file("Tests/FeedTests.swift", [
        "func testItRuns() {",
        "    let model = FeedModel()",
        "    model.load()",
        "}",
      ]),
    );
    assert.ok(rules(found).includes("test-without-assertion"));
  });

  test("accepts a test that asserts", () => {
    const found = analyzeTesting(
      file("Tests/FeedTests.swift", [
        "func testItRuns() {",
        "    let model = FeedModel()",
        "    XCTAssertEqual(model.count, 0)",
        "}",
      ]),
    );
    assert.ok(!rules(found).includes("test-without-assertion"));
  });

  test("flags await inside an XCTAssert autoclosure", () => {
    const found = analyzeTesting(
      file("Tests/FeedTests.swift", [
        "func testEmpty() async throws {",
        "    XCTAssertFalse(try await useCase.execute().isEmpty)",
        "}",
      ]),
    );
    assert.equal(severityOf(found, "await-inside-xctassert"), "blocker");
  });

  test("flags a live URLSession in a test", () => {
    const found = analyzeTesting(
      file("Tests/APITests.swift", [
        "func testFetch() async throws {",
        "    let (data, _) = try await URLSession.shared.data(from: url)",
        "    XCTAssertFalse(data.isEmpty)",
        "}",
      ]),
    );
    assert.ok(rules(found).includes("network-in-test"));
  });

  test("reports a project with no tests at all", () => {
    const found = analyzeTestCoverage([
      file("Sources/A.swift", ["struct A {}"]),
      file("Sources/B.swift", ["struct B {}"]),
    ]);
    assert.ok(rules(found).includes("no-tests"));
  });

  test("says nothing when tests exist in proportion", () => {
    const found = analyzeTestCoverage([
      file("Sources/A.swift", ["struct A {}"]),
      file("Tests/ATests.swift", ["func testA() { XCTAssertTrue(true) }"]),
    ]);
    assert.deepEqual(found, []);
  });
});

describe("performance", () => {
  const view = (body) =>
    file("Sources/FeedView.swift", [
      "import SwiftUI",
      "struct FeedView: View {",
      "    var body: some View {",
      ...body,
      "    }",
      "}",
    ]);

  test("flags a formatter allocated inside body", () => {
    const found = analyzePerformance(view(["        Text(DateFormatter().string(from: date))"]));
    assert.equal(severityOf(found, "formatter-allocated-in-body"), "serious");
  });

  test("flags a sort feeding a ForEach inside body", () => {
    const found = analyzePerformance(
      view([
        "        ForEach(items.sorted { $0.date > $1.date }) { item in",
        "            Text(item.title)",
        "        }",
      ]),
    );
    assert.ok(rules(found).includes("collection-work-in-body"));
  });

  test("flags ForEach over indices", () => {
    const found = analyzePerformance(
      view(["        ForEach(0..<items.count, id: \\.self) { i in Text(items[i].title) }"]),
    );
    assert.equal(severityOf(found, "foreach-over-indices"), "serious");
  });

  test("flags a non-lazy stack inside a ScrollView", () => {
    const found = analyzePerformance(
      view([
        "        ScrollView {",
        "            VStack {",
        "                ForEach(items) { item in Text(item.title) }",
        "            }",
        "        }",
      ]),
    );
    assert.ok(rules(found).includes("eager-stack-in-scrollview"));
  });

  test("accepts a LazyVStack inside a ScrollView", () => {
    const found = analyzePerformance(
      view([
        "        ScrollView {",
        "            LazyVStack {",
        "                ForEach(items) { item in Text(item.title) }",
        "            }",
        "        }",
      ]),
    );
    assert.ok(!rules(found).includes("eager-stack-in-scrollview"));
  });

  test("flags blocking I/O on the render path", () => {
    const found = analyzePerformance(
      view(["        Text(try! String(contentsOf: url))"]),
    );
    assert.equal(severityOf(found, "blocking-io-in-body"), "blocker");
  });

  test("does not flag a formatter outside body as serious", () => {
    const found = analyzePerformance(
      file("Sources/Model.swift", [
        "final class Model {",
        "    func format() -> String { DateFormatter().string(from: Date()) }",
        "}",
      ]),
    );
    assert.ok(!rules(found).includes("formatter-allocated-in-body"));
    assert.equal(severityOf(found, "formatter-allocated-repeatedly"), "minor");
  });
});

describe("structured output", () => {
  const finding = (severity, rule = "some-rule") => ({
    file: "A.swift",
    line: 1,
    severity,
    rule,
    message: "m",
    consequence: "c",
    fix: "f",
    doc: "d",
    excerpt: "e",
  });

  test("a clean scan scores 100", () => {
    assert.equal(scoreFor([], 10), 100);
  });

  test("the score follows the documented formula", () => {
    // penalty 10, capacity 10*10 = 100 -> 100 * (1 - 0.1) = 90
    assert.equal(scoreFor([finding("blocker")], 10), 90);
    // 3 + 1 = 4 over capacity 100 -> 96
    assert.equal(scoreFor([finding("serious"), finding("minor")], 10), 96);
  });

  test("the score floors at zero rather than going negative", () => {
    const many = Array.from({ length: 100 }, () => finding("blocker"));
    assert.equal(scoreFor(many, 1), 0);
  });

  test("output carries counts, issues, and files_checked", () => {
    const output = buildReviewOutput(
      "Test",
      [finding("blocker"), finding("minor")],
      4,
    );
    assert.equal(output.counts.blocker, 1);
    assert.equal(output.counts.total, 2);
    assert.equal(output.files_checked, 4);
    assert.equal(output.issues.length, 2);
    assert.match(output.summary, /1 blocker/);
  });

  test("suggestions deduplicate by rule instead of repeating every fix", () => {
    const output = buildReviewOutput(
      "Test",
      Array.from({ length: 40 }, () => finding("minor", "literal-spacing")),
      10,
    );
    assert.equal(output.suggestions.length, 1);
    assert.match(output.suggestions[0], /40 occurrences/);
  });

  test("an empty scan produces an explicit summary, not an empty string", () => {
    const output = buildReviewOutput("Test", [], 7);
    assert.match(output.summary, /no findings/i);
    assert.deepEqual(output.suggestions, []);
  });
});

describe("comment stripping", () => {
  // Regression: stripComment truncated at the first "//", so
  // `let base = "http://..."` became `let base = "http:` and every rule went
  // blind to the rest of the line. The cleartext-HTTP check could never fire.
  test("a URL in a string literal does not truncate the line", () => {
    const found = analyzeSecurity(
      file("Sources/Config.swift", [
        'let base = "http://api.example.com" // production',
      ]),
    );
    assert.ok(rules(found).includes("cleartext-http"));
  });

  test("a real trailing comment is still stripped", () => {
    const found = analyzeSecurity(
      file("Sources/Config.swift", ['let ok = true // let apiKey = "sk_live_abcdefghij"']),
    );
    assert.ok(!rules(found).includes("hardcoded-secret"));
  });

  test("an escaped quote does not end the literal early", () => {
    const found = analyzeSecurity(
      file("Sources/Config.swift", ['let s = "say \\" then" // let token = "sk_live_abcdefghij"']),
    );
    assert.ok(!rules(found).includes("hardcoded-secret"));
  });
});

describe("string-literal awareness", () => {
  // Regression, found by dogfooding against this repo's own test suite:
  // the rule fired on `XCTAssertTrue(x, "set before the await, not after it")`
  // because the word appeared in the assertion MESSAGE, not the expression.
  test("await in an assertion message is not a finding", () => {
    const found = analyzeTesting(
      file("Tests/StateTests.swift", [
        'XCTAssertTrue(model.isLoading, "must be set before the await, not after")',
      ]),
    );
    assert.ok(!rules(found).includes("await-inside-xctassert"));
  });

  test("await in the actual expression still is", () => {
    const found = analyzeTesting(
      file("Tests/StateTests.swift", [
        'XCTAssertFalse(try await useCase.execute().isEmpty, "should have items")',
      ]),
    );
    assert.ok(rules(found).includes("await-inside-xctassert"));
  });
});
