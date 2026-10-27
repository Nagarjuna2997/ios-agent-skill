import {referenceApproved} from './reference-approval.js';
import { z } from 'zod';
import { mkdir, readFile, writeFile, rename, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { sha256 } from './schema.js';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const check = z.enum(['passed', 'failed', 'unavailable']);
export const CapturePinsSchema = z.object({
  device: z.string().min(1), os: z.string().min(1), xcode: z.string().min(1),
  appearance: z.enum(['light','dark']), contentSize: z.string().min(1), locale: z.string().min(1),
  orientation: z.enum(['portrait','landscape']), state: z.string().min(1),
  width: z.number().int().positive(), height: z.number().int().positive(),
  scale: z.number().positive(), fontConfiguration: z.string().min(1),
  referenceRenderer: z.string().min(1), normalizationHash: hash,
}).strict();
export const VisualEvidenceSchema = z.object({
  version: z.literal(1), sourceHash: hash, referenceHash: hash, screenshotHash: hash,
  pins: CapturePinsSchema,
  build: check, functionality: check, accessibility: check, layout: check, typography: check,
  testsPassed: z.number().int().nonnegative(), accessibilityIssues: z.number().int().nonnegative().nullable(),
  clippedElements: z.number().int().nonnegative().nullable(), lineBreakMismatches: z.number().int().nonnegative().nullable(),
  meanError: z.number().min(0).max(1), changedFraction: z.number().min(0).max(1),
  artifactsHash: hash,
}).strict();
export type VisualEvidence = z.infer<typeof VisualEvidenceSchema>;
export const GatePolicySchema = z.object({
  version: z.literal(1), maxMeanError: z.number().min(0).max(1), maxChangedFraction: z.number().min(0).max(1),
  maxLineBreakMismatches: z.number().int().nonnegative(), minimumImprovement: z.number().positive().max(1),
}).strict();
export type GatePolicy = z.infer<typeof GatePolicySchema>;
export interface Decision { outcome: 'accepted'|'rejected'|'requires-review'; reasons: string[] }
const equal = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Framework-independent gate. Evidence must be produced by trusted verifiers, never model self-ratings. */
export function evaluateVisualRepair(baselineValue: unknown, candidateValue: unknown, policyValue: unknown, referenceApproval?:unknown): Decision {
  const a=VisualEvidenceSchema.parse(baselineValue),b=VisualEvidenceSchema.parse(candidateValue),p=GatePolicySchema.parse(policyValue);
  if (!equal(a.pins,b.pins) || a.referenceHash!==b.referenceHash) return {outcome:'requires-review',reasons:['Capture conditions or reference changed; results are not comparable']};
  const failed=['build','functionality','accessibility','layout','typography'].filter(k=>b[k as keyof VisualEvidence]==='failed');
  const reasons=failed.map(k=>`${k} failed`);
  if(b.testsPassed===0) reasons.push('No passing functional tests');
  if(b.testsPassed<a.testsPassed) reasons.push('Functional test coverage decreased');
  if(b.accessibilityIssues!==null && b.accessibilityIssues>0) reasons.push('Accessibility issues remain');
  if(b.clippedElements!==null && b.clippedElements>0) reasons.push('Unintended clipping remains');
  if(b.lineBreakMismatches!==null && (b.lineBreakMismatches>p.maxLineBreakMismatches || (a.lineBreakMismatches!==null && b.lineBreakMismatches>a.lineBreakMismatches))) reasons.push('Text wrapping exceeds tolerance or regressed');
  if(b.meanError>a.meanError || b.changedFraction>a.changedFraction) reasons.push('A visual metric regressed');
  if(reasons.length)return {outcome:'rejected',reasons};
  const missing=['build','functionality','accessibility','layout','typography'].filter(k=>b[k as keyof VisualEvidence]==='unavailable');
  for(const key of ['accessibilityIssues','clippedElements','lineBreakMismatches'] as const) if(b[key]===null) missing.push(key);
  if(missing.length)return {outcome:'requires-review',reasons:missing.map(k=>`${k} evidence unavailable`)};
  if(b.sourceHash===a.sourceHash)return {outcome:'requires-review',reasons:['Source is unchanged; pixel changes may be capture noise']};
  if(b.meanError>p.maxMeanError || b.changedFraction>p.maxChangedFraction)return {outcome:'requires-review',reasons:['Visual difference exceeds the predeclared acceptance thresholds']};
  if(a.meanError-b.meanError<p.minimumImprovement)return {outcome:'requires-review',reasons:['Improvement is below the predeclared noise tolerance']};
  if(!referenceApproved(referenceApproval,a))return {outcome:'requires-review',reasons:['Reference fixture lacks matching manual approval']};
  if(['build','functionality','accessibility','layout','typography'].some(k=>a[k as keyof VisualEvidence]!=='passed')||a.accessibilityIssues!==0||a.clippedElements!==0||a.lineBreakMismatches===null||a.lineBreakMismatches>p.maxLineBreakMismatches||a.testsPassed<1||a.meanError>p.maxMeanError||a.changedFraction>p.maxChangedFraction)return {outcome:'requires-review',reasons:['Baseline does not qualify as known-good']};
  return {outcome:'accepted',reasons:['All required checks passed, no measured regression, and visual thresholds met']};
}

const SavedAttemptSchema = z.object({number:z.number().int().min(1).max(3),status:z.literal('finished'),decision:z.object({outcome:z.enum(['accepted','rejected','requires-review']),reasons:z.array(z.string().min(1).max(1000)).min(1).max(30)}).strict(),evidence:VisualEvidenceSchema.optional(),error:z.literal('verification-failed').optional()}).strict();
interface Attempt { number: number; status: 'reserved'|'finished'; decision?: Decision; evidence?: VisualEvidence; error?: string }
/** At most three isolated candidates. Callback implementations own generation and verification, never promotion.
 * A reserved/interrupted attempt is not rerun or counted as a pass. Completed attempts are hash-checked on resume.
 * The caller must use a dedicated local directory; only this coordinator writes its ledger.
 */
export async function repairWithGate(options: {
  directory: string; referenceApproval?:unknown; baseline: VisualEvidence; policy: GatePolicy; maxAttempts?: number; resumeInterrupted?: boolean;
  verifySavedEvidence?: (evidence: VisualEvidence, attempt: number) => Promise<void>;
  verifyCandidate: (attempt: number, baseline: VisualEvidence) => Promise<VisualEvidence>;
}): Promise<{outcome: Decision['outcome']; attempts: Attempt[]; acceptedAttempt?: number}> {
  const baseline=VisualEvidenceSchema.parse(options.baseline),policy=GatePolicySchema.parse(options.policy);
  const maxAttempts=z.number().int().min(1).max(3).parse(options.maxAttempts ?? 3);
  await mkdir(options.directory,{recursive:true});
  if((await lstat(options.directory)).isSymbolicLink())throw Error('Repair ledger cannot be a symlink');
  const contract=sha256(JSON.stringify({baseline,policy,maxAttempts,referenceApproval:options.referenceApproval??null}));
  const attempts: Attempt[]=[];
  for(let number=1;number<=maxAttempts;number++) {
    const dir=join(options.directory,`attempt-${number}`),file=join(dir,'result.json');
    let fresh=false;
    try{await mkdir(dir);fresh=true;}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
    if((await lstat(dir)).isSymbolicLink())throw Error('Attempt directory cannot be a symlink');
    if(!fresh){
      let record;
      try { const bytes=await readFile(file,'utf8'); if(bytes.length>100000)throw Error('Oversized ledger'); record=JSON.parse(bytes); }
      catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT'){if(!options.resumeInterrupted)return {outcome:'requires-review',attempts:[...attempts,{number,status:'reserved'}]};}else throw error;}
      if(record){
      if(record.contract!==contract || record.hash!==sha256(JSON.stringify(record.attempt)))throw Error('Repair evidence or contract changed');
      const row=SavedAttemptSchema.parse(record.attempt);
      if(row.number!==number || row.status!=='finished' || !row.decision)throw Error('Invalid repair ledger');
      if(!row.evidence && (row.decision.outcome!=='requires-review'||row.error!=='verification-failed'))throw Error('Missing verifier evidence');
      if(row.evidence && !equal(row.decision,evaluateVisualRepair(baseline,row.evidence,policy,options.referenceApproval)))throw Error('Decision does not match evidence');
      if(row.evidence && options.verifySavedEvidence)await options.verifySavedEvidence(row.evidence,number);
      attempts.push(row);
      if(row.decision.outcome!=='rejected')return {outcome:row.decision.outcome,attempts,...(row.decision.outcome==='accepted'?{acceptedAttempt:number}:{})};
      continue;
      }
    }
    let attempt: Attempt;
    try {
      const evidence=VisualEvidenceSchema.parse(await options.verifyCandidate(number,structuredClone(baseline)));
      attempt={number,status:'finished',evidence,decision:evaluateVisualRepair(baseline,evidence,policy,options.referenceApproval)};
    }catch{
      // Provider/build failures must remain visible; do not persist raw exceptions containing credentials.
      attempt={number,status:'finished',decision:{outcome:'requires-review',reasons:['Candidate verification failed; inspect the isolated attempt logs']},error:'verification-failed'};
    }
    const envelope={contract,attempt,hash:sha256(JSON.stringify(attempt))};
    const temporary=file+'.'+randomUUID()+'.tmp';
    await writeFile(temporary,JSON.stringify(envelope,null,2),{flag:'wx'});await rename(temporary,file);
    attempts.push(attempt);
    if(attempt.decision!.outcome!=='rejected')return {outcome:attempt.decision!.outcome,attempts,...(attempt.decision!.outcome==='accepted'?{acceptedAttempt:number}:{})};
  }
  return {outcome:'rejected',attempts};
}
