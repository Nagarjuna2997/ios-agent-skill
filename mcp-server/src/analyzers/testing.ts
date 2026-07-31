import { Finding, SourceFile, eachLine, withoutStringLiterals } from "./types.js";

const TESTING_DOC = "checklists/testing.md";
const MOCKING_DOC = "docs/testing/mocking-strategy.md";

const TEST_FILE = /Tests?\.swift$|Tests?\/|Spec\.swift$/i;

/**
 * Test-suite quality.
 *
 * This is the one analyzer that runs ONLY on test files — the inverse of every
 * other rule here, which skips them. A flaky or vacuous test is worse than a
 * missing one: it costs the same to run, and it reports success either way.
 */
export function analyzeTesting(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  if (!TEST_FILE.test(file.path)) return findings;

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc = TESTING_DOC,
  ) =>
    findings.push({
      file: file.path,
      line,
      severity,
      rule,
      message,
      consequence,
      fix,
      doc,
      excerpt: excerpt.trim(),
    });

  const lines = file.content.split("\n");

  eachLine(file, (line, number) => {
    const index = number - 1;

    // Sleeping to wait for async work.
    if (
      /Thread\.sleep|usleep\s*\(|sleep\s*\(\s*\d/.test(line) ||
      /Task\.sleep\s*\(/.test(line)
    ) {
      push(
        number,
        line,
        "test-sleeps",
        "serious",
        "Test waits by sleeping.",
        "The duration is guesswork. It passes on a fast machine, fails under CI load, and the fix people reach for is a longer sleep — so the suite gets slower and stays flaky. A flaky test teaches the team to re-run until green, which is worse than no test.",
        "Await the work directly, or gate it: an actor with a continuation, `XCTestExpectation` with `await fulfillment(of:)`, or a controllable clock.",
      );
    }

    // waitForExpectations with a long timeout is the same problem.
    if (/waitForExpectations\s*\(\s*timeout:\s*(\d+)/.test(line)) {
      const timeout = Number(/timeout:\s*(\d+)/.exec(line)?.[1] ?? 0);
      if (timeout >= 5) {
        push(
          number,
          line,
          "long-test-timeout",
          "minor",
          `Expectation timeout of ${timeout}s.`,
          "A timeout this long is usually covering for a race rather than a slow operation. It turns a deterministic failure into a slow, intermittent one.",
          "Reduce it and make the wait deterministic. If the work genuinely takes seconds, it belongs behind a protocol seam with a fake.",
        );
      }
    }

    // A test with no assertion cannot fail for the reason it claims.
    if (/^\s*func\s+test\w*\s*\(/.test(line)) {
      let depth = 0;
      let started = false;
      let body = "";
      for (let cursor = index; cursor < Math.min(index + 60, lines.length); cursor += 1) {
        const current = lines[cursor];
        depth += (current.match(/\{/g) ?? []).length;
        depth -= (current.match(/\}/g) ?? []).length;
        if (!started && depth > 0) started = true;
        body += `${current}\n`;
        if (started && depth <= 0) break;
      }
      if (
        !/XCTAssert|XCTFail|XCTUnwrap|#expect|#require|\.expect\(/.test(body) &&
        !/throws/.test(line)
      ) {
        push(
          number,
          line,
          "test-without-assertion",
          "serious",
          "Test contains no assertion.",
          "It passes as long as nothing throws, so it reports success whether the behaviour is right or wrong. It costs CI time and buys a false sense of coverage.",
          "Assert the outcome, or delete the test. A test that cannot fail is not a test.",
        );
      }
    }

    // XCTAssert with an await inside — does not compile, but people write it.
    //
    // String literals are blanked first: the assertion MESSAGE regularly
    // contains the word "await" ("set before the await, not after it"), and
    // matching that reports a defect in correct code.
    if (/XCTAssert\w*\s*\([^)]*\bawait\b/.test(withoutStringLiterals(line))) {
      push(
        number,
        line,
        "await-inside-xctassert",
        "blocker",
        "`await` inside an XCTAssert autoclosure.",
        "XCTAssert takes an autoclosure, which cannot contain an await — this does not compile.",
        "Hoist it: `let value = try await subject.run()` then assert on `value`.",
      );
    }

    // Real network in a test.
    if (
      /URLSession\.shared|URLSession\(configuration:\s*\.default\)/.test(line) &&
      !/mock|stub|fake/i.test(file.path)
    ) {
      push(
        number,
        line,
        "network-in-test",
        "serious",
        "Test uses a live URLSession.",
        "The suite now depends on the network, a server, and its data. It fails offline, fails in CI sandboxes, and fails when someone else changes a fixture — none of which are bugs in the code under test.",
        "Inject the dependency behind a protocol and pass a fake. If a screen cannot be tested without the network, the seam is missing.",
        MOCKING_DOC,
      );
    }

    // Force-unwrap in a test turns a failed assertion into a crashed run.
    if (/\btry!\s/.test(line)) {
      push(
        number,
        line,
        "force-try-in-test",
        "minor",
        "`try!` in a test.",
        "A throw crashes the whole test run instead of failing one test, so you lose every other result in the suite and the report says nothing about which case broke.",
        "Mark the test `throws` and use `try`, or `XCTUnwrap`.",
      );
    }

    // Order-dependent state.
    if (/^\s*(static\s+var|static\s+let)\s+\w+/.test(line) && !/\blet\b.*=\s*"/.test(line)) {
      push(
        number,
        line,
        "shared-mutable-test-state",
        "minor",
        "Static mutable state in a test case.",
        "XCTest does not guarantee test order and may run classes in parallel. State that survives between tests makes results depend on execution order, which is the hardest kind of flake to reproduce.",
        "Move it into `setUp()` as instance state, so each test gets a fresh value.",
      );
    }

    // Asserting on a bare Bool loses the values on failure.
    if (/XCTAssertTrue\s*\(\s*\w+\s*==\s*/.test(line)) {
      push(
        number,
        line,
        "assert-true-on-equality",
        "minor",
        "`XCTAssertTrue(a == b)` hides the values.",
        "On failure the report says only 'expected true'. `XCTAssertEqual` prints both sides, which is usually the whole diagnosis.",
        "Use `XCTAssertEqual(a, b)`.",
      );
    }
  });

  return findings;
}

/**
 * Project-level: is anything tested at all?
 *
 * Reported once per scan rather than per file, because "no tests" is a property
 * of the project and repeating it would drown the file-level findings.
 */
export function analyzeTestCoverage(files: SourceFile[]): Finding[] {
  const testFiles = files.filter((file) => TEST_FILE.test(file.path));
  const sourceFiles = files.filter((file) => !TEST_FILE.test(file.path));

  if (sourceFiles.length === 0) return [];

  if (testFiles.length === 0) {
    return [
      {
        file: "(project)",
        line: 0,
        severity: "serious",
        rule: "no-tests",
        message: `No test files found alongside ${sourceFiles.length} source files.`,
        consequence:
          "Every change is verified by hand or not at all, and no refactor can be proven behaviour-preserving.",
        fix: "Add a test target. Start with the view models — they are pure logic once dependencies cross a protocol boundary.",
        doc: TESTING_DOC,
        excerpt: "",
      },
    ];
  }

  // A ratio, not a coverage percentage — this counts files, not lines.
  const ratio = testFiles.length / sourceFiles.length;
  if (ratio < 0.1) {
    return [
      {
        file: "(project)",
        line: 0,
        severity: "minor",
        rule: "sparse-tests",
        message: `${testFiles.length} test file(s) for ${sourceFiles.length} source files.`,
        consequence:
          "Most of the codebase has no automated check, so regressions surface in review or in production rather than in CI.",
        fix: "Prioritize view models and pure functions — the parts that are cheapest to test and most likely to hold a bug.",
        doc: TESTING_DOC,
        excerpt: "",
      },
    ];
  }

  return [];
}
