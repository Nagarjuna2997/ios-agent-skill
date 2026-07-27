import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const DESIGN_DOC = "docs/design/design-tokens.md";
const STATE_DOC = "docs/swiftui/state-and-data-flow.md";

export function analyzeSwiftUI(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  if (isSupportFile(file.path)) return findings;
  if (!/import\s+SwiftUI/.test(file.content)) return findings;

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc: string,
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

  eachLine(file, (line, number) => {
    // Fixed font size breaks Dynamic Type.
    if (/\.font\(\s*\.system\(\s*size:\s*\d+/.test(line) && !/relativeTo:/.test(line)) {
      push(
        number,
        line,
        "fixed-font-size",
        "serious",
        "Fixed font size ignores Dynamic Type.",
        "Text stays the same size at every accessibility setting, making the app unusable for low-vision users.",
        "Use a semantic style (`.body`, `.headline`) or `.custom(_:size:relativeTo:)`.",
        DESIGN_DOC,
      );
    }

    // Fixed height on a text container clips at large sizes.
    if (/\.frame\(\s*height:\s*\d+/.test(line)) {
      push(
        number,
        line,
        "fixed-height",
        "minor",
        "Fixed height clips content at large Dynamic Type sizes.",
        "Text is cut off at accessibility text sizes rather than growing.",
        "Use `minHeight:` so the container can grow.",
        DESIGN_DOC,
      );
    }

    // AnyView defeats structural diffing.
    if (/\bAnyView\s*\(/.test(line)) {
      push(
        number,
        line,
        "any-view",
        "minor",
        "AnyView erases the view type.",
        "SwiftUI loses structural identity, so it cannot diff efficiently and animations may break.",
        "Restructure with `@ViewBuilder` or `some View`.",
        "docs/swiftui/views-and-controls.md",
      );
    }

    // Deprecated modifier.
    if (/\.cornerRadius\(/.test(line)) {
      push(
        number,
        line,
        "deprecated-corner-radius",
        "minor",
        ".cornerRadius is deprecated.",
        "Clips without antialiasing control and does not compose with shape-based backgrounds.",
        "Use `.clipShape(.rect(cornerRadius:))` or the `in:` parameter of `.background`.",
        DESIGN_DOC,
      );
    }

    // Literal design values at a call site.
    const padding = /\.padding\(\s*(\d+)\s*\)/.exec(line);
    if (padding) {
      push(
        number,
        line,
        "literal-spacing",
        "minor",
        `Literal spacing value (${padding[1]}) at a call site.`,
        "Changing the spacing rhythm means finding every literal by hand, and values drift apart over time.",
        "Use a spacing token (`Space.contentInset`).",
        DESIGN_DOC,
      );
    }

    // Material with nothing behind it renders as flat gray.
    if (/\.background\(\s*\.(ultraThin|thin|regular|thick)Material\s*\)/.test(line)) {
      push(
        number,
        line,
        "material-possibly-on-solid",
        "minor",
        "Material effect — verify there is content behind it.",
        "Applied over a solid background a material renders as flat gray mud, which is the most common way a SwiftUI screen looks unfinished.",
        "Use materials only over scrolling or layered content. Otherwise use a solid surface token.",
        DESIGN_DOC,
      );
    }

    // Transient UI state on an observable model.
    if (/^\s*var\s+(show|is)\w*(Sheet|Alert|Presented|Expanded)\b/.test(line)) {
      if (/@Observable/.test(file.content) && !/struct\s+\w+\s*:\s*View/.test(file.content)) {
        push(
          number,
          line,
          "view-state-on-model",
          "minor",
          "Transient presentation state lives on an observable model.",
          "Sheet flags and draft text are view-local; storing them on a model couples unrelated screens and survives longer than the view.",
          "Move it to `@State` on the view.",
          STATE_DOC,
        );
      }
    }

    // Legacy observation in new code.
    if (/:\s*ObservableObject\b/.test(line)) {
      push(
        number,
        line,
        "legacy-observableobject",
        "minor",
        "ObservableObject is legacy on iOS 17+.",
        "Coarser invalidation — any published change re-renders every observing view — and requires @Published on every property.",
        "Use `@MainActor @Observable final class` (Observation framework).",
        STATE_DOC,
      );
    }

    if (/@EnvironmentObject\b/.test(line)) {
      push(
        number,
        line,
        "environmentobject",
        "serious",
        "@EnvironmentObject crashes at runtime when the object is missing.",
        "A missing injection is a crash in production rather than a compile error.",
        "Use `@Environment(Type.self)` with an `@Observable` type.",
        STATE_DOC,
      );
    }

    // try! is a crash waiting to happen.
    if (/\btry!\s/.test(line)) {
      push(
        number,
        line,
        "force-try",
        "serious",
        "try! crashes the app on any thrown error.",
        "Any failure — a malformed response, a full disk — terminates the process instead of surfacing.",
        "Use `try` with `do`/`catch`, or `try?` where a nil result is genuinely correct.",
        "patterns/error-handling.md",
      );
    }
  });

  return findings;
}
