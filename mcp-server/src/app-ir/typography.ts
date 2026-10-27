import {z} from 'zod';
import {parse,serialize,type DefaultTreeAdapterMap} from 'parse5';
import {AppIRSchema,sha256} from './schema.js';
const region=z.object({id:z.string().min(1),text:z.string().min(1),lines:z.array(z.array(z.number().int().nonnegative()).min(1)).min(1),truncated:z.boolean()}).strict();
export const TypographySnapshotSchema=z.object({version:z.literal(1),regions:z.array(region).min(1).max(500)}).strict();
/** Traceability comes from original source byte ranges, never label matching. */
export function annotateTextRegions(html:string,value:unknown):string {
 const ir=AppIRSchema.parse(value);
 if(ir.sources.length!==1||ir.sources[0].sha256!==sha256(html))throw Error('Source does not match App IR');
 const doc=parse(html,{sourceCodeLocationInfo:true});
 const elements=new Map<number,DefaultTreeAdapterMap['element']>();
 function walk(n:DefaultTreeAdapterMap['node']){if('tagName' in n&&n.sourceCodeLocation)elements.set(Buffer.byteLength(html.slice(0,n.sourceCodeLocation.startOffset)),n);if('childNodes' in n)for(const c of n.childNodes)walk(c);}
 walk(doc);
 for(const node of ir.nodes.filter(n=>n.kind==='text'||n.kind==='disclosure')){
  if(node.evidence.length!==1||node.evidence[0].certainty!=='extracted')throw Error('Ambiguous text source');
  let el=elements.get(node.evidence[0].start);
  if(node.kind==='disclosure'&&el)el=el.childNodes.find((n):n is DefaultTreeAdapterMap['element']=>'tagName' in n&&n.tagName==='summary');
  if(!el||el.childNodes.some(n=>'tagName' in n)||el.attrs.some(a=>a.name==='data-app-ir-node'))throw Error('Text region needs a directly traceable plain-text element');
  el.attrs.push({name:'data-app-ir-node',value:node.id});
 }
 return serialize(doc);
}
/** Source DOM and native TextRenderer supply word IDs; OCR cannot establish a pass.
 * Narrow LTR, normalized-space protocol. Split words, bidi and missing probes stay unknown.
 */
export function compareTextRegions(sourceValue:unknown,nativeValue:unknown,instrumentationUnchanged:boolean){
 const result=(status:'passed'|'failed'|'unavailable',reason:string,mismatches:number|null,regions:unknown[]=[])=> instrumentationUnchanged ? {status,reason,mismatches,regions} : {status:'unavailable' as const,reason:'Instrumentation changed the rendered image; provisional: '+reason,mismatches:null,regions};
 const a=TypographySnapshotSchema.safeParse(sourceValue),b=TypographySnapshotSchema.safeParse(nativeValue);
 if(!a.success||!b.success)return result('unavailable','Missing or malformed region evidence',null);
 const unique=(rows:z.infer<typeof region>[])=>new Set(rows.map(r=>r.id)).size===rows.length;
 if(!unique(a.data.regions)||!unique(b.data.regions))return result('unavailable','Duplicate region identifiers',null);
 if(a.data.regions.map(r=>r.id).sort().join('\n')!==b.data.regions.map(r=>r.id).sort().join('\n'))return result('unavailable','Visible region coverage differs',null);
 const details=[];let mismatches=0;
 for(const ref of a.data.regions){
  const native=b.data.regions.find(r=>r.id===ref.id)!;
  if(native.text!==ref.text)return result('failed','Native text differs from source',null);
  if(!/^[\x20-\x7e\u00b7]+$/.test(ref.text)||ref.text.trim()!==ref.text||ref.text.includes('  '))return result('unavailable','Unsupported text direction, script or whitespace',null);
  if(ref.truncated||native.truncated)return result('failed','Text layout is truncated',null);
  const expected=ref.text.split(' ').map((_,i)=>i);
  if([ref,native].some(r=>JSON.stringify(r.lines.flat())!==JSON.stringify(expected)))return result('unavailable','Missing, split or reordered word evidence',null);
  const ends=(r:typeof ref)=>r.lines.slice(0,-1).map(l=>l[l.length-1]);
  const re=ends(ref),ne=ends(native);const count=new Set([...re.filter(i=>!ne.includes(i)),...ne.filter(i=>!re.includes(i))]).size;
  details.push({id:ref.id,referenceLines:ref.lines.length,nativeLines:native.lines.length,referenceEnds:re,nativeEnds:ne,mismatches:count});mismatches+=count;
 }
 return result(mismatches?'failed':'passed',mismatches?'Text wrapping differs':'Every traced region has matching word boundaries',mismatches,details);
}
