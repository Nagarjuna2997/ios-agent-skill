import {referenceApproved} from './reference-approval.js';
import {VisualEvidenceSchema,GatePolicySchema,evaluateVisualRepair,type VisualEvidence,type GatePolicy} from './visual-gate.js';
/** Immutable known-good baseline. Callers persist this value in the hashed run journal.
 * Rejected/review candidates never replace it; no comparison against a failed attempt.
 */
export function seedKnownGood(value:unknown,policyValue:unknown,approval?:unknown):VisualEvidence {
 const v=VisualEvidenceSchema.parse(value),p=GatePolicySchema.parse(policyValue);
 if(!referenceApproved(approval,v))throw Error('Reference fixture lacks matching manual approval');
 if(['build','functionality','accessibility','layout','typography'].some(k=>v[k as keyof VisualEvidence]!=='passed')||v.testsPassed<1||v.accessibilityIssues!==0||v.clippedElements!==0||v.lineBreakMismatches===null||v.lineBreakMismatches>p.maxLineBreakMismatches||v.meanError>p.maxMeanError||v.changedFraction>p.maxChangedFraction)throw Error('Baseline is not verified good');
 return structuredClone(v);
}
export function advanceKnownGood(current:VisualEvidence,candidate:VisualEvidence,policy:GatePolicy,approval?:unknown){
 const baseline=seedKnownGood(current,policy,approval),decision=evaluateVisualRepair(baseline,candidate,policy,approval);
 return {decision,baseline:decision.outcome==='accepted'?seedKnownGood(candidate,policy,approval):baseline};
}
