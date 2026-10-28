import {createHash} from 'node:crypto';
import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
// Budget is serialized JSON UTF-16 characters, not model tokens or transport bytes.
function fit<T>(max:number,length:number,render:(n:number)=>T):T{
 let lo=0,hi=length;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(JSON.stringify(render(mid)).length<=max)lo=mid;else hi=mid-1;}
 return render(lo);
}
export class OutputStore {
 private rows=new Map<string,{text:string,at:number}>();
 constructor(readonly limit:number,private now=()=>Date.now()){}
 bound(result:CallToolResult,eligible:boolean):CallToolResult {
  const text=JSON.stringify(result);
  if(!this.limit||!eligible||result.isError||result.structuredContent||result.content.some(c=>c.type!=='text')||text.length<=this.limit)return result;
  if(Buffer.byteLength(text)>2_000_000)return result; // Do not truncate what cannot be retained.
  const id=createHash('sha256').update(text).digest('hex');this.rows.delete(id);this.rows.set(id,{text,at:this.now()});
  while(this.rows.size>8)this.rows.delete(this.rows.keys().next().value!);
  return fit(this.limit,text.length,n=>({content:[{type:'text' as const,text:JSON.stringify({format:'ios-agent-bounded-output-v1',truncated:true,notice:'Excerpt only; resources/read retrieves the original response. Expires in 600 seconds; last 8 responses retained.',excerpt:text.slice(0,n),details:{uri:`ios-agent-output://${id}?offset=0`,sha256:id,totalCharacters:text.length}})}]}));
 }
 read(uri:string){const u=new URL(uri);if(u.protocol!=='ios-agent-output:'||u.pathname||u.username||u.password||! /^[a-f0-9]{64}$/.test(u.hostname))throw Error('Invalid output reference');const id=u.hostname,row=this.rows.get(id);if(!row||this.now()-row.at>600000){this.rows.delete(id);throw Error('Output expired or evicted. Repeat the original read-only request.');}
  const raw=u.searchParams.get('offset')??'0';if(!/^\d+$/.test(raw))throw Error('Invalid output offset');const offset=Number(raw);if(!Number.isSafeInteger(offset)||offset>row.text.length)throw Error('Invalid output offset');
  return fit(this.limit||8000,row.text.length-offset,n=>({contents:[{uri,mimeType:'application/json',text:JSON.stringify({sha256:id,offset,text:row.text.slice(offset,offset+n),next:offset+n<row.text.length?`ios-agent-output://${id}?offset=${offset+n}`:null})}]}));
 }
}
