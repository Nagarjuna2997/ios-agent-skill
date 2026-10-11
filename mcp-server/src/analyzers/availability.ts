import { Finding, SourceFile } from "./types.js";

import { availabilityScopes, compare } from '../availability/scopes.js';

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

export interface AvailabilitySymbol { name: string; version: string; kind?: string; framework?: string; pattern?: RegExp }
export interface AvailabilityOptions { deploymentTarget?: string | null; symbols?: AvailabilitySymbol[] }

export function analyzeAvailability(file: SourceFile, input?: AvailabilityOptions | number): Finding[] {
  // Array.flatMap supplies an index as the second argument for older internal callers.
  const options = typeof input === 'object' && input ? input : {};
  const {code,ranges}=availabilityScopes(file.content);
  const findings: Finding[] = [];
  const symbols:AvailabilitySymbol[]=options.symbols ?? INTRODUCED.map(e=>({...e,version:String(e.version)}));
  // No project target is represented explicitly by null, never an invented iOS minimum.
  if(options.deploymentTarget !== null) for(const entry of symbols){
    if(options.deploymentTarget && compare(options.deploymentTarget,entry.version)>=0)continue;
    if(new RegExp('\\b(?:struct|class|enum|actor|protocol|typealias|func|var|let)\\s+'+entry.name+'\\b').test(code))continue;
    const pattern=entry.pattern ? new RegExp(entry.pattern.source,'g') : new RegExp('\\b'+entry.name+'\\b'+(entry.kind==='func'?'(?=\\s*(?:<[^>]*>)?\\s*\\()':''),'g');
    for(const match of code.matchAll(pattern)){
      const index=match.index!;
      if(/\bimport\s+[^;\n]*$/.test(code.slice(0,index)))continue;
      const enclosing=ranges.filter(r=>r.start<=index && index<r.end);
      const strongest=enclosing.map(r=>r.version).sort(compare).at(-1);
      const line=code.slice(0,index).split('\n').length;
      const common={file:file.path,line,doc:DOC,excerpt:file.content.split('\n')[line-1].trim()};
      if(!strongest || compare(strongest,entry.version)<0) findings.push({...common,
        severity:'serious',rule:'missing-availability-guard',
        message:`[static] ${entry.name} requires iOS ${entry.version}; no sufficient enclosing guard was found${options.deploymentTarget ? ` for target iOS ${options.deploymentTarget}` : ' (deployment target not supplied to legacy helper)'}.`,
        consequence:'Static candidate: confirm symbol resolution with the compiler before changing code.',
        fix:`Use if #available(iOS ${entry.version}, *) with a fallback, or annotate the enclosing declaration. Suggested repairs must be reviewed using the developer’s own tools/model.`});
      else if(compare(strongest,entry.version)>0 && enclosing.some(r=>r.kind!=='declaration'&&r.version===strongest)) findings.push({...common,
        severity:'minor',rule:'over-restrictive-guard',
        message:`[static] ${entry.name} was introduced in iOS ${entry.version} but is guarded at iOS ${strongest}.`,
        consequence:'Review only: other APIs or intentional behavior in this branch may require the higher version.',
        fix:`Consider iOS ${entry.version} only after checking every API and behavior in this branch; do not mechanically lower its guard.`});
    }
  }

  // Foundation Models used without the RUNTIME availability check.
  const usesFoundationModels = /\bLanguageModelSession\s*\(/.test(code);
  const hasRuntimeCheck = /SystemLanguageModel[^\n]*\.availability|case\s+\.available/.test(
    code,
  );
  if (usesFoundationModels && !hasRuntimeCheck) {
    const line =
      file.content.split("\n").findIndex((l) => /\bLanguageModelSession\s*\(/.test(l)) + 1;
    findings.push({
      file: file.path,
      line,
      severity: "blocker",
      rule: "missing-runtime-model-check",
      message: "[static] Foundation Models used without a runtime availability check.",
      consequence:
        "An @available guard proves the symbol exists; it does not prove the model is usable on this device, in this region, with Apple Intelligence enabled. The feature fails at tap time.",
      fix: "Check `SystemLanguageModel.default.availability` and show a real unavailable state before the entry point renders.",
      doc: "docs/frameworks/foundation-models.md",
      excerpt: "LanguageModelSession(...)",
    });
  }

  return findings;
}
