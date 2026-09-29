/** Dated documentation snapshot. Account availability is never inferred from this list. */
export type Provider = 'apple'|'openai'|'anthropic'|'gemini';
export type Capability = 'text'|'vision'|'tools'|'reasoning'|'structuredOutput';
export interface Model { provider:Provider; modelId:string; status:'active'|'preview'|'retired'; replacement?:string; capabilities:Capability[]; contextWindow:number|null; source:string; verified:string }
const sources={openai:'https://developers.openai.com/api/docs/models',anthropic:'https://platform.claude.com/docs/en/models/overview',gemini:'https://ai.google.dev/gemini-api/docs/models',apple:'https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel'};
const model=(provider:Provider,modelId:string,capabilities:Capability[],status:Model['status']='active',replacement?:string):Model=>({provider,modelId,status,replacement,capabilities,contextWindow:null,source:sources[provider],verified:'2026-09-29'});
export const models:Model[]=[
 ...['gpt-6-astra','gpt-6-sol','gpt-6-luna'].map(id=>model('openai',id,['text','vision','tools','reasoning'])),
 ...['claude-opus-5-5','claude-sonnet-5-5','claude-fable-5-1','claude-haiku-4-5-20251001'].map(id=>model('anthropic',id,['text','vision','tools'])),
 model('gemini','gemini-3.8-flash',['text','vision','tools']),
 model('gemini','gemini-3.1-pro-preview',['text','vision','tools'],'preview'),
 model('apple','system-default',['text']),
 model('anthropic','claude-3-7-sonnet-20250219',[],'retired','claude-sonnet-5-5'),
 model('gemini','gemini-2.0-flash',[],'retired','gemini-3.8-flash'),
];
export function selectModel(provider:Provider,id:string,available:string[],required:Capability[]=[]):Model {
 const candidates=models.filter(m=>m.provider===provider && (id==='auto'?m.status==='active':m.modelId===id));
 const retired=candidates.find(m=>m.status==='retired');
 if(retired)throw Error(`Retired model. Select ${retired.replacement ?? 'a supported model'} explicitly.`);
 const selected=candidates.find(m=>available.includes(m.modelId)&&required.every(c=>m.capabilities.includes(c)));
 if(!selected)throw Error('No verified, account-accessible model meets the requested capabilities. Refresh discovery or explicitly register a verified adapter model.');
 return selected;
}
