import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const DOC = "patterns/clean-architecture.md";

/** Concrete data-layer types that must not appear in the presentation layer. */
const DATA_LAYER_TYPES = /\b(URLSession|APIClient|ModelContext|NSManagedObjectContext|NSPersistentContainer)\b/;

/** Heuristic: does this path look like presentation-layer code? */
function isPresentationLayer(path: string): boolean {
  return /(Views?|Presentation|Screens?|UI)\//i.test(path) ||
    /(View|ViewModel|Screen)\.swift$/.test(path);
}

/** Heuristic: does this path look like domain-layer code? */
function isDomainLayer(path: string): boolean {
  return /(Domain|Entities|UseCases)\//i.test(path);
}

export function analyzeArchitecture(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  const support = isSupportFile(file.path);
  if (support) return findings;

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc = DOC,
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
    // A dependency defaulting to a live implementation.
    if (
      /\binit\s*\(/.test(line) &&
      /:\s*(any\s+)?\w+\s*=\s*(Live|Remote|Default|URLSession|\w*APIClient)\w*\s*[.(]/.test(line)
    ) {
      push(
        number,
        line,
        "live-default-dependency",
        "blocker",
        "Initializer parameter defaults to a live implementation.",
        "Any call site that forgets to inject silently hits the real network or disk, including tests and previews, with no signal that it happened.",
        "Make the parameter required. The composition root supplies it.",
      );
    }

    // Presentation naming concrete data-layer types.
    if (isPresentationLayer(file.path) && DATA_LAYER_TYPES.test(line) && !/^\s*import\b/.test(line)) {
      push(
        number,
        line,
        "presentation-names-data-type",
        "serious",
        "Presentation layer names a concrete data-layer type.",
        "The screen cannot be unit-tested or previewed without a real client, so previews need a network and tests become integration tests.",
        "Depend on a protocol declared in the domain layer, injected through `init`.",
      );
    }

    // Singleton resolution inside a view model.
    if (/\bViewModel\b/.test(file.path) || /class\s+\w*(ViewModel|Model)\b/.test(file.content)) {
      if (/=\s*\w+\s*\.\s*shared\b/.test(line)) {
        push(
          number,
          line,
          "singleton-in-viewmodel",
          "serious",
          "View model resolves a dependency from a global singleton.",
          "Not injectable, not overridable in previews, and shared mutable state leaks between parallel tests.",
          "Inject the dependency through `init`, from a composition root.",
        );
      }
    }

    // Domain layer importing UI frameworks.
    if (isDomainLayer(file.path) && /^\s*import\s+(SwiftUI|UIKit|AppKit)\b/.test(line)) {
      push(
        number,
        line,
        "domain-imports-ui",
        "blocker",
        "Domain layer imports a UI framework.",
        "The dependency rule is inverted: business logic can no longer be tested, reused on another platform, or extracted into a package.",
        "Remove the import. Move anything genuinely UI-shaped into the presentation layer.",
      );
    }

    // A screen owning its own NavigationStack.
    if (/NavigationStack\s*[({]/.test(line) && !/^\s*(\/\/|\*)/.test(line)) {
      if (/Detail|Row|Cell|Section/.test(file.path)) {
        push(
          number,
          line,
          "nested-navigation-stack",
          "serious",
          "A pushed screen appears to own its own NavigationStack.",
          "A nested stack renders a second navigation bar and breaks programmatic navigation.",
          "Only the root of each tab owns a NavigationStack.",
          "docs/swiftui/deep-linking-and-routing.md",
        );
      }
    }

    // Deprecated navigation API.
    if (/\bNavigationView\s*\{/.test(line)) {
      push(
        number,
        line,
        "deprecated-navigationview",
        "serious",
        "NavigationView is deprecated.",
        "Programmatic navigation and deep linking do not work reliably, and behavior differs across OS versions.",
        "Use `NavigationStack` with `NavigationPath` and `.navigationDestination(for:)`.",
        "docs/swiftui/navigation.md",
      );
    }
  });

  return findings;
}
