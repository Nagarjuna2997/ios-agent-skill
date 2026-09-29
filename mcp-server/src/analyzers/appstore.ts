import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const DOC = "checklists/app-store-submission.md";

import { permissionEvidence } from "../integrations/permissions.js";

export interface ProjectContext {
  /** Contents of Info.plist files found in the project, concatenated. */
  infoPlist: string;
  /** Whether a PrivacyInfo.xcprivacy exists anywhere. */
  hasPrivacyManifest: boolean;
  /**
   * Whether this looks like a shippable app rather than a library.
   *
   * An SPM library has no Info.plist and is never submitted to App Review, so
   * App-Store-only rules must not fire on one.
   */
  isApp: boolean;
}

export function analyzeAppStore(
  file: SourceFile,
  context: ProjectContext,
): Finding[] {
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

  // Reuse concrete operation evidence. Imports and picker-only use are not permission requests.
  for (const evidence of permissionEvidence(file.content)) {
    if (context.infoPlist.includes(evidence.key)) continue;
    push(evidence.line, evidence.operation, "missing-purpose-string", "serious",
      `Detected ${evidence.key} requirement; key not found in scanned configuration.`,
      "The operation may be denied or terminate if the effective app configuration lacks this key.",
      `Verify selected-target generated settings, then add ${evidence.key} with a specific purpose if absent.`);
  }

  eachLine(file, (line, number) => {
    // Hardcoded user-facing strings.
    const text = /\bText\(\s*"([^"]{4,})"\s*\)/.exec(line);
    if (text && !/String\(localized:/.test(line) && !/LocalizedStringKey/.test(line)) {
      push(
        number,
        line,
        "hardcoded-string",
        "minor",
        "User-facing string is not localized.",
        "The string cannot be translated, and a screen reader announces it in the wrong language.",
        'Use `String(localized: "…", comment: "…")` or a String Catalog key.',
        "docs/design/interaction-standards.md",
      );
    }

    // Icon-only button with no accessibility label.
    if (
      /Button\s*\{/.test(line) &&
      /Image\(\s*systemName:/.test(line) &&
      !/accessibilityLabel|Label\(/.test(line)
    ) {
      push(
        number,
        line,
        "unlabeled-icon-button",
        "serious",
        "Icon-only button has no accessibility label.",
        'VoiceOver announces it as just "button", making the control unusable without sight.',
        "Use `Label(\"…\", systemImage:)` with `.labelStyle(.iconOnly)`, or add `.accessibilityLabel(…)`.",
        "docs/frameworks/accessibility.md",
      );
    }

    // print() is not structured logging and ships in release.
    if (/^\s*print\s*\(/.test(line)) {
      push(
        number,
        line,
        "print-logging",
        "minor",
        "print() used for diagnostics.",
        "Not structured, not filterable, not redacted, and not stripped from release builds.",
        "Use `Logger` from OSLog.",
        "docs/frameworks/oslog.md",
      );
    }
  });

  return findings;
}

/** Project-level checks that are not tied to a single source file. */
export function analyzeProjectLevelAppStore(context: ProjectContext): Finding[] {
  // A library is not submitted to App Review — this rule does not apply.
  if (!context.isApp) return [];
  if (context.hasPrivacyManifest) return [];
  return [
    {
      file: "PrivacyInfo.xcprivacy",
      line: 1,
      severity: "blocker",
      rule: "missing-privacy-manifest",
      message: "No PrivacyInfo.xcprivacy found in the project.",
      consequence:
        "App Store Connect rejects submissions that use required-reason APIs without a privacy manifest.",
      fix: "Add a PrivacyInfo.xcprivacy declaring collected data types and required-reason API usage.",
      doc: "docs/design/interaction-standards.md",
      excerpt: "(project-level)",
    },
  ];
}
