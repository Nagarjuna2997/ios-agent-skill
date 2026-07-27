import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const DOC = "checklists/app-store-submission.md";

/** Frameworks whose use requires a purpose string in Info.plist. */
const PERMISSION_FRAMEWORKS: Array<{ pattern: RegExp; key: string; what: string }> = [
  { pattern: /\bCLLocationManager\b|import\s+CoreLocation/, key: "NSLocationWhenInUseUsageDescription", what: "location" },
  { pattern: /\bAVCaptureDevice\b|import\s+AVFoundation/, key: "NSCameraUsageDescription", what: "camera" },
  { pattern: /\bPHPhotoLibrary\b|import\s+Photos\b/, key: "NSPhotoLibraryUsageDescription", what: "the photo library" },
  { pattern: /\bHKHealthStore\b|import\s+HealthKit/, key: "NSHealthShareUsageDescription", what: "health data" },
  { pattern: /\bCNContactStore\b|import\s+Contacts\b/, key: "NSContactsUsageDescription", what: "contacts" },
  { pattern: /\bCBCentralManager\b|import\s+CoreBluetooth/, key: "NSBluetoothAlwaysUsageDescription", what: "Bluetooth" },
  { pattern: /\bSFSpeechRecognizer\b|import\s+Speech\b/, key: "NSSpeechRecognitionUsageDescription", what: "speech recognition" },
  { pattern: /\bEKEventStore\b|import\s+EventKit/, key: "NSCalendarsUsageDescription", what: "calendars" },
];

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

  // Permission-gated framework used with no purpose string.
  for (const framework of PERMISSION_FRAMEWORKS) {
    if (!framework.pattern.test(file.content)) continue;
    if (context.infoPlist.includes(framework.key)) continue;

    const line =
      file.content.split("\n").findIndex((l) => framework.pattern.test(l)) + 1;
    push(
      Math.max(line, 1),
      framework.key,
      "missing-purpose-string",
      "blocker",
      `Uses ${framework.what} but Info.plist has no ${framework.key}.`,
      "iOS terminates the app the moment the permission is requested, and App Review rejects the submission.",
      `Add ${framework.key} to Info.plist with a specific sentence explaining why the app needs ${framework.what}.`,
    );
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
