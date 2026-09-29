import type { Provider } from './registry.js';
export type FailureKind='retryable'|'provider-switchable'|'user-action-required'|'fatal';
export class ProviderFailure extends Error { constructor(public kind:FailureKind,public code:string){super(code);this.name='ProviderFailure';} }
export function classify(status:number,code=''):ProviderFailure {
 if(/quota|credit|billing|resource_exhausted/i.test(code))return new ProviderFailure('provider-switchable','quota');
 if(status===429)return new ProviderFailure('retryable','rate-limit');
 if(status===408||status>=500)return new ProviderFailure('retryable','temporarily-unavailable');
 if(status===401||status===403)return new ProviderFailure('user-action-required','credentials-or-access');
 if(status===404)return new ProviderFailure('provider-switchable','model-unavailable');
 if(status===413||/context|token.*limit|too.*large/i.test(code))return new ProviderFailure('user-action-required','context-limit');
 return new ProviderFailure('fatal','request-rejected');
}
export interface Response { text:string; usage:unknown; provider:Provider; model:string }
export interface Adapter { provider:Provider; list(signal?:AbortSignal):Promise<string[]>; generate(model:string,prompt:string,signal?:AbortSignal):Promise<Response> }
const endpoints={openai:'https://api.openai.com/v1',anthropic:'https://api.anthropic.com/v1',gemini:'https://generativelanguage.googleapis.com/v1beta'};
export const keyNames={openai:'OPENAI_API_KEY',anthropic:'ANTHROPIC_API_KEY',gemini:'GEMINI_API_KEY'};
/** Fixed origins, no redirects, bounded timeout; raw provider errors/headers are never surfaced. */
export function cloudAdapter(provider:Exclude<Provider,'apple'>,key:string|undefined,fetcher:typeof fetch=fetch):Adapter {
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(provider==='openai')headers.Authorization=`Bearer ${key ?? ''}`;
 if(provider==='anthropic'){headers['x-api-key']=key??'';headers['anthropic-version']='2023-06-01';}
 if(provider==='gemini')headers['x-goog-api-key']=key??'';
 async function request(path:string,body?:unknown,signal?:AbortSignal):Promise<any>{
  if(!key)throw new ProviderFailure('user-action-required','missing-key');
  let response:globalThis.Response;
  try{response=await fetcher(endpoints[provider]+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(60000)]):AbortSignal.timeout(60000)});}
  catch{if(signal?.aborted)throw new ProviderFailure('fatal','cancelled');throw new ProviderFailure('retryable','network-or-timeout');}
  // Cap response bytes before JSON parsing, including error bodies.
  const reader=response.body?.getReader();let text='';let size=0;const decoder=new TextDecoder();
  if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000){await reader.cancel();throw new ProviderFailure('fatal','response-too-large');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}catch(error){if(error instanceof ProviderFailure)throw error;if(signal?.aborted)throw new ProviderFailure('fatal','cancelled');throw new ProviderFailure('retryable','network-or-timeout');}finally{reader.releaseLock();}
  let data:any;try{data=JSON.parse(text);}catch{if(!response.ok)throw classify(response.status);throw new ProviderFailure('fatal','invalid-provider-response');}
  if(!response.ok)throw classify(response.status,String(data?.error?.code??data?.error?.type??data?.error?.status??''));
  return data;
 }
 return {provider,async list(signal){
  const ids:string[]=[];let cursor='';
  for(let page=0;page<20;page++){
   const path=provider==='gemini'?`/models?pageSize=100${cursor?'&pageToken='+encodeURIComponent(cursor):''}`:provider==='anthropic'?`/models?limit=100${cursor?'&after_id='+encodeURIComponent(cursor):''}`:'/models';
   const data=await request(path,undefined,signal);
   const entries=provider==='gemini'?data.models:data.data;
   if(!Array.isArray(entries))throw new ProviderFailure('fatal','invalid-model-list');
   for(const entry of entries){const id=provider==='gemini'?entry.name?.replace(/^models\//,''):entry.id;if(typeof id==='string')ids.push(id);}
   const next=provider==='gemini'?data.nextPageToken:provider==='anthropic'&&data.has_more?data.last_id:null;
   if(!next)return [...new Set(ids)];if(next===cursor)throw new ProviderFailure('fatal','pagination-loop');cursor=next;
  }throw new ProviderFailure('fatal','model-list-limit');
 },async generate(model,prompt,signal){
  if(!/^[a-zA-Z0-9._-]+$/.test(model))throw new ProviderFailure('fatal','invalid-model-id');
  const body=provider==='openai'?{model,input:prompt,store:false,max_output_tokens:4096}:provider==='anthropic'?{model,max_tokens:4096,messages:[{role:'user',content:prompt}]}:{contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:4096}};
  const data=await request(provider==='openai'?'/responses':provider==='anthropic'?'/messages':`/models/${encodeURIComponent(model)}:generateContent`,body,signal);
  const text=provider==='openai'?(data.output??[]).flatMap((o:any)=>o.content??[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('\n'):provider==='anthropic'?(data.content??[]).filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('\n'):(data.candidates?.[0]?.content?.parts??[]).filter((c:any)=>!c.thought&&typeof c.text==='string').map((c:any)=>c.text).join('\n');
  if(!text)throw new ProviderFailure('fatal','no-text-response');
  return {provider,model,text,usage:data.usage??data.usageMetadata??null};
 }};
}
