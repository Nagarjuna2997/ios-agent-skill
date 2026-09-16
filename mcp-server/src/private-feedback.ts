import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { issueReportSchema } from './issue-report.js';
import { VERSION } from './version.js';

const inputSchema = z.discriminatedUnion('action', [
  z.object({action:z.literal('preview'),report:issueReportSchema}).strict(),
  z.object({action:z.literal('submit'),previewId:z.string().uuid(),userApproved:z.literal(true)}).strict(),
]);
export const privateFeedbackTool = {
  name:'private_feedback',
  description:'Source-preview private feedback for a failure in iOS Agent tools, not the user app. First preview fixed categories. Show ALL fields, destination and privacy notice in chat. Submit only after the user explicitly approves that preview; never infer approval from a tool failure. No GitHub login needed for the user. Never send source, diagnostics, paths, credentials or free text. Not available until the operator configures an HTTPS receiver. Do not repeatedly offer after dismissal.',
  annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:true},
  inputSchema:{type:'object' as const,properties:{action:{type:'string',enum:['preview','submit']},report:{...issueReportSchemaToJSON()},previewId:{type:'string',format:'uuid'},userApproved:{type:'boolean',const:true}},required:['action'],additionalProperties:false},
};
function issueReportSchemaToJSON() {
  return {type:'object',properties:{feature:{type:'string',enum:['installation','swift-review','local-references','app-starter','asset-generation','simulator','app-loop','client-connection']},symptom:{type:'string',enum:['unexpected-error','timeout','incorrect-result','missing-result','invalid-output','documentation-mismatch']},client:{type:'string',enum:['claude','chatgpt-codex','gemini-cli','muse','unknown']},platform:{type:'string',enum:['macos','linux','windows','unknown']},reproducibility:{type:'string',enum:['once','repeated','unknown']}},required:['feature','symptom'],additionalProperties:false};
}
export function createPrivateFeedback({endpoint=process.env.IOS_AGENT_PRIVATE_FEEDBACK_URL,fetchImpl=fetch,now=Date.now}:{endpoint?:string,fetchImpl?:typeof fetch,now?:()=>number}={}) {
  const previews = new Map<string,{payload:unknown,expires:number}>();
  return async (raw:unknown) => {
    const input=inputSchema.parse(raw);
    if(!endpoint)return {status:'not-configured',submitted:false,notice:'Private feedback is not live. Nothing sent. No public issue will be created as a fallback.'};
    const url=new URL(endpoint);
    if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || url.pathname!=='/reports')throw Error('Configure an HTTPS /reports endpoint without credentials, query or fragment.');
    for(const [id,p] of previews)if(p.expires<=now())previews.delete(id);
    if(input.action==='preview') {
      if(previews.size>=50)throw Error('Too many pending previews. Wait for an earlier preview to expire.');
      const previewId=randomUUID(),payload={version:VERSION,...input.report};
      previews.set(previewId,{payload,expires:now()+15*60*1000});
      return {status:'awaiting-approval',submitted:false,previewId,payload,destination:url.origin,
        notice:'Nothing sent. Ask the user to approve these exact category fields and destination. The receiver and GitHub will process them; repository collaborators can read them. The host sees the network IP and may retain access logs. No app code, logs, paths or identity fields are included. A private repository is access-controlled, not end-to-end encrypted. Approval expires in 15 minutes. Declining has no effect on app development.'};
    }
    const preview=previews.get(input.previewId);
    if(!preview)throw Error('Preview expired, unknown or already used. Nothing sent.');
    // A failed/uncertain request cannot be silently retried with the same approval.
    previews.delete(input.previewId);
    try {
      const response=await fetchImpl(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(preview.payload),signal:AbortSignal.timeout(10000),redirect:'error'});
      if(!response.ok)return {status:'unconfirmed',submitted:false,notice:'The receiver did not confirm submission. Do not claim success or automatically retry.'};
      const result=z.object({status:z.enum(['submitted','duplicate']),receipt:z.string().uuid()}).strict().parse(await response.json());
      return {...result,submitted:true,notice:result.status==='duplicate'?'This category report is already recorded privately.':'Feedback recorded privately. No public issue was created.'};
    } catch {return {status:'unconfirmed',submitted:false,notice:'No confirmed receipt. Delivery may have failed or its response may have been lost. Do not automatically retry or claim success.'};}
  };
}
