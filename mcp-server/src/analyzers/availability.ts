import { Finding, SourceFile, eachLine } from "./types.js";

const DOC = "docs/compatibility-matrix.md";

/**
 * Symbols and the iOS version in which they were INTRODUCED.
 *
 * The rule this enforces: guard on the version where a symbol became available,
 * never on the newest SDK you happen to be building with. Writing
 * `#available(iOS 27, *)` around an iOS 26 API silently drops every iOS 26
 * device to the fallback path — invisible when testing on a current device.
 */
const INTRODUCED: Array<{ pattern: RegExp; version: number; name: string }> = [
  // iOS 26
  { pattern: /\.glassEffect\s*\(/, version: 26, name: "glassEffect" },
  { pattern: /\bGlassEffectContainer\b/, version: 26, name: "GlassEffectContainer" },
  { pattern: /\.glassEffectID\s*\(/, version: 26, name: "glassEffectID" },
  { pattern: /\.buttonStyle\(\s*\.glass(Prominent)?\s*\)/, version: 26, name: "glass button style" },
  { pattern: /\bSystemLanguageModel\b/, version: 26, name: "SystemLanguageModel" },
  { pattern: /\bLanguageModelSession\b/, version: 26, name: "LanguageModelSession" },
  { pattern: /@Generable\b/, version: 26, name: "@Generable" },
  // iOS 27
  { pattern: /\bPrivateCloudComputeLanguageModel\b/, version: 27, name: "PrivateCloudComputeLanguageModel" },
  { pattern: /\bDynamicProfile\b/, version: 27, name: "DynamicProfile" },
  { pattern: /\bOCRTool\b|\bBarcodeReaderTool\b/, version: 27, name: "built-in system tools" },
  // iOS 18
  { pattern: /\bMeshGradient\b/, version: 18, name: "MeshGradient" },
  { pattern: /\bTextRenderer\b/, version: 18, name: "TextRenderer" },
];

/** Highest iOS version mentioned in an availability guard on or above a line. */
function guardedVersions(content: string): number[] {
  const versions: number[] = [];
  const guard = /#available\(\s*iOS\s+(\d+)|@available\([^)]*iOS\s+(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = guard.exec(content)) !== null) {
    versions.push(Number(match[1] ?? match[2]));
  }
  return versions;
}

export function analyzeAvailability(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  const guards = guardedVersions(file.content);

  eachLine(file, (text, number) => {
    for (const entry of INTRODUCED) {
      if (!entry.pattern.test(text)) continue;

      // Unguarded use of a version-gated symbol.
      if (guards.length === 0) {
        findings.push({
          file: file.path,
          line: number,
          severity: "blocker",
          rule: "missing-availability-guard",
          message: `${entry.name} requires iOS ${entry.version} but the file has no availability guard.`,
          consequence:
            "The app fails to compile against an older deployment target, or crashes on launch if the symbol is weakly linked.",
          fix: `Wrap in \`if #available(iOS ${entry.version}.0, *)\` or annotate with \`@available(iOS ${entry.version}.0, *)\`, and provide a fallback.`,
          doc: DOC,
          excerpt: text.trim(),
        });
        continue;
      }

      // Over-guarded: guarded at a HIGHER version than the symbol needs.
      const tightest = Math.min(...guards);
      if (tightest > entry.version) {
        findings.push({
          file: file.path,
          line: number,
          severity: "serious",
          rule: "over-restrictive-guard",
          message: `${entry.name} was introduced in iOS ${entry.version} but is guarded at iOS ${tightest}.`,
          consequence: `Every device on iOS ${entry.version}–${tightest - 1} falls back unnecessarily, losing the feature for a large installed base. This is invisible when testing on a current device.`,
          fix: `Guard on iOS ${entry.version}, the version where the symbol was introduced — not the newest SDK.`,
          doc: DOC,
          excerpt: text.trim(),
        });
      }
    }
  });

  // Foundation Models used without the RUNTIME availability check.
  const usesFoundationModels = /\bLanguageModelSession\s*\(/.test(file.content);
  const hasRuntimeCheck = /SystemLanguageModel[^\n]*\.availability|case\s+\.available/.test(
    file.content,
  );
  if (usesFoundationModels && !hasRuntimeCheck) {
    const line =
      file.content.split("\n").findIndex((l) => /\bLanguageModelSession\s*\(/.test(l)) + 1;
    findings.push({
      file: file.path,
      line,
      severity: "blocker",
      rule: "missing-runtime-model-check",
      message: "Foundation Models used without a runtime availability check.",
      consequence:
        "An @available guard proves the symbol exists; it does not prove the model is usable on this device, in this region, with Apple Intelligence enabled. The feature fails at tap time.",
      fix: "Check `SystemLanguageModel.default.availability` and show a real unavailable state before the entry point renders.",
      doc: "docs/frameworks/foundation-models.md",
      excerpt: "LanguageModelSession(...)",
    });
  }

  return findings;
}
