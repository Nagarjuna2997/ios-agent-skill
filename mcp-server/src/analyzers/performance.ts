import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const PERF_DOC = "checklists/performance.md";
const SWIFTUI_DOC = "docs/swiftui/views-and-controls.md";
const CONCURRENCY_DOC = "docs/swift/swift-concurrency.md";

/**
 * Runtime cost that shows up as dropped frames.
 *
 * The unifying rule: `body` can run many times per second, on the main actor,
 * for reasons you do not control. Anything expensive inside it is multiplied by
 * a number nobody measured. These rules look for work that does not belong on
 * that path.
 */
export function analyzePerformance(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  if (isSupportFile(file.path)) return findings;

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc = PERF_DOC,
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
  const isSwiftUI = /import\s+SwiftUI/.test(file.content);

  /** Line ranges of `var body: some View { ... }`, so rules can scope to them. */
  const bodyRanges: Array<[number, number]> = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!/\bvar\s+body\s*:\s*some\s+View\b/.test(lines[index])) continue;
    let depth = 0;
    let started = false;
    for (let cursor = index; cursor < lines.length; cursor += 1) {
      depth += (lines[cursor].match(/\{/g) ?? []).length;
      depth -= (lines[cursor].match(/\}/g) ?? []).length;
      if (!started && depth > 0) started = true;
      if (started && depth <= 0) {
        bodyRanges.push([index + 1, cursor + 1]);
        break;
      }
    }
  }

  const inBody = (line: number) =>
    bodyRanges.some(([start, end]) => line >= start && line <= end);

  eachLine(file, (line, number) => {
    const index = number - 1;

    // Formatters are famously expensive to construct — and this is inside body.
    if (
      /\b(DateFormatter|NumberFormatter|ISO8601DateFormatter|DateComponentsFormatter|JSONDecoder|JSONEncoder)\s*\(\s*\)/.test(
        line,
      )
    ) {
      const scoped = inBody(number);
      push(
        number,
        line,
        scoped ? "formatter-allocated-in-body" : "formatter-allocated-repeatedly",
        scoped ? "serious" : "minor",
        `${scoped ? "Formatter allocated inside `body`" : "Formatter allocated inline"}.`,
        scoped
          ? "`body` re-runs on every state change, and constructing a DateFormatter is one of the most expensive routine operations on the platform. In a scrolling list this is the hitch."
          : "Constructing a formatter costs orders of magnitude more than using one. Inside a loop or a row builder it dominates the work.",
        "Hoist it to a `static let`, or use `Date.FormatStyle` / `.formatted()`, which is cached by the system.",
        scoped ? SWIFTUI_DOC : PERF_DOC,
      );
    }

    if (!inBody(number)) return;

    // Sorting or filtering a collection on every render.
    if (/\.(sorted|filter|map|reduce|compactMap|flatMap)\s*(\(|\{)/.test(line)) {
      // Only flag when it is feeding a ForEach — that is the O(n) × every-frame case.
      const window = lines.slice(Math.max(0, index - 2), index + 2).join(" ");
      if (/ForEach\s*\(/.test(window)) {
        push(
          number,
          line,
          "collection-work-in-body",
          "serious",
          "Collection transformed inside `body`.",
          "The sort or filter runs on every render of this view, on the main actor. With a list of any size this is visible as scroll stutter, and the cost scales with both list length and render frequency.",
          "Compute it once in the model — a `private(set)` property updated when the source changes, or a cached derived value. `body` should read, not compute.",
          SWIFTUI_DOC,
        );
      }
    }

    // ForEach without stable identity re-creates every row.
    if (/ForEach\s*\(\s*(?:0\s*\.\.[.<]|\w+\.indices)/.test(line)) {
      push(
        number,
        line,
        "foreach-over-indices",
        "serious",
        "`ForEach` over indices rather than identity.",
        "Identity is positional, so any insertion or reorder invalidates every row after it. SwiftUI rebuilds and re-animates the whole list instead of the one row that changed.",
        "Iterate the elements and give them stable `Identifiable` conformance.",
        SWIFTUI_DOC,
      );
    }

    // Eager stacks inside a ScrollView build every child up front.
    if (/\bScrollView\s*(\(|\{)/.test(line)) {
      const window = lines.slice(index, Math.min(index + 6, lines.length)).join(" ");
      if (/\b(VStack|HStack)\s*(\(|\{)/.test(window) && !/Lazy/.test(window)) {
        push(
          number,
          line,
          "eager-stack-in-scrollview",
          "serious",
          "`ScrollView` containing a non-lazy stack.",
          "VStack builds every child immediately, including the thousands below the fold. Launch time and memory scale with the whole collection rather than what is visible.",
          "Use `LazyVStack` / `LazyHStack`, or a `List`.",
          SWIFTUI_DOC,
        );
      }
    }

    // AsyncImage with no size is a layout thrash plus an unbounded decode.
    if (/AsyncImage\s*\(/.test(line)) {
      const window = lines.slice(index, Math.min(index + 8, lines.length)).join(" ");
      if (!/\.frame\s*\(/.test(window)) {
        push(
          number,
          line,
          "asyncimage-without-frame",
          "minor",
          "`AsyncImage` with no frame.",
          "The view resizes when the image arrives, which reflows everything around it — and a full-resolution remote image is decoded at its native size regardless of how small it renders.",
          "Give it a `.frame` and `.resizable().scaledToFill()`, so layout is stable before the load completes.",
          SWIFTUI_DOC,
        );
      }
    }

    // UIImage(named:) in body — repeated lookups, and it caches unboundedly.
    if (/UIImage\s*\(\s*contentsOfFile:/.test(line)) {
      push(
        number,
        line,
        "image-decode-in-body",
        "serious",
        "Image decoded from disk inside `body`.",
        "Disk I/O and decode happen on the main actor, every render. This blocks the frame outright.",
        "Load it in the model, off the main actor, and pass the decoded image in.",
        CONCURRENCY_DOC,
      );
    }

    // Synchronous file or network access on the render path.
    if (/\b(Data\s*\(\s*contentsOf:|String\s*\(\s*contentsOf:|FileManager\.\w+\.contents)/.test(line)) {
      push(
        number,
        line,
        "blocking-io-in-body",
        "blocker",
        "Blocking I/O inside `body`.",
        "This runs synchronously on the main actor while the frame is being built. A slow disk or a remote URL freezes the UI outright — `Data(contentsOf:)` on an http URL is a network request with no timeout.",
        "Move it into the model behind `async`, and render from state.",
        CONCURRENCY_DOC,
      );
    }
  });

  // A GeometryReader wrapping the whole body forces a layout pass per change.
  if (isSwiftUI) {
    for (const [start] of bodyRanges) {
      const first = lines[start] ?? "";
      if (/^\s*GeometryReader\s*\{/.test(first)) {
        push(
          start + 1,
          first,
          "geometryreader-wraps-body",
          "minor",
          "`GeometryReader` wraps the entire body.",
          "It takes all available space and invalidates its content on every geometry change, so the whole subtree re-lays-out during any resize, rotation, or keyboard animation.",
          "Scope it to the subview that needs the measurement, or use `.containerRelativeFrame` / `onGeometryChange`.",
          SWIFTUI_DOC,
        );
      }
    }
  }

  return findings;
}
