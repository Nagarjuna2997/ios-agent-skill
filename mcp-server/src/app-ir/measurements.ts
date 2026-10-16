import { z } from 'zod';
const Rect=z.object({x:z.number().finite(),y:z.number().finite(),width:z.number().positive(),height:z.number().positive()}).strict();
const Line=z.object({text:z.string().min(1),confidence:z.number().min(0).max(1),box:Rect}).strict();
export const TextCaptureSchema=z.object({version:z.literal(1),lines:z.array(Line).min(1).max(1000)}).strict();
const words=(s:string)=>s.normalize('NFKC').trim().split(/\s+/u).filter(Boolean);
/** OCR is evidence only when both complete transcripts match the expected visible source.
 * A missing/uncertain word is unknown, not a wrapping mismatch or proof of clipping.
 */
export function measureLineBreaks(reference:unknown,native:unknown,expected:string){
 const parsedA=TextCaptureSchema.safeParse(reference),parsedB=TextCaptureSchema.safeParse(native);
 if(!parsedA.success||!parsedB.success)return {status:'unavailable' as const,mismatches:null,reason:'Missing or malformed text recognition'};
 const a=parsedA.data,b=parsedB.data,tokens=words(expected);
 if(!tokens.length)throw Error('Expected visible text is empty');
 for(const capture of [a,b]){
  if(capture.lines.some(l=>l.confidence<0.8))return {status:'unavailable' as const,mismatches:null,reason:'Low-confidence text recognition'};
  if(JSON.stringify(capture.lines.flatMap(l=>words(l.text)))!==JSON.stringify(tokens))return {status:'unavailable' as const,mismatches:null,reason:'Recognized transcript differs from expected visible source'};
 }
 const ends=(capture:typeof a)=>{let n=0;return capture.lines.slice(0,-1).map(l=>n+=words(l.text).length);};
 const ar=ends(a),br=ends(b),mismatches=new Set([...ar.filter(n=>!br.includes(n)),...br.filter(n=>!ar.includes(n))]).size;
 return {status:mismatches?'failed' as const:'passed' as const,mismatches,referenceEnds:ar,nativeEnds:br};
}
export const GeometrySchema=z.object({version:z.literal(1),viewport:Rect,textClippingAudit:z.enum(['passed','failed','unavailable']),elements:z.array(z.object({id:z.string().min(1),frame:Rect}).strict()).min(1).max(1000)}).strict();
/** Screens may scroll vertically: fully offscreen elements are classified separately.
 * Partially intersecting bounds are reported for review; an Apple text-clipping audit
 * supplies independent clipping evidence, never inferred from a pixel similarity score.
 */
export function measureClipping(value:unknown){
 const g=GeometrySchema.parse(value),v=g.viewport;const regions: Array<{id:string;frame:z.infer<typeof Rect>;kind:string}>=[];
 for(const e of g.elements){const f=e.frame;
  if(f.y>=v.y+v.height||f.y+f.height<=v.y){regions.push({...e,kind:'offscreen'});continue;}
  if(f.x<v.x-1||f.x+f.width>v.x+v.width+1)regions.push({...e,kind:'horizontal-overflow'});
  else if(f.y<v.y-1||f.y+f.height>v.y+v.height+1)regions.push({...e,kind:'partial-viewport'});
 }
 const overflow=regions.filter(r=>r.kind==='horizontal-overflow').length;
 const uncertain=regions.some(r=>r.kind==='partial-viewport')||g.textClippingAudit==='unavailable';
 return {status:g.textClippingAudit==='failed'||overflow?'failed' as const:uncertain?'unavailable' as const:'passed' as const,
 clippedElements:g.textClippingAudit==='failed'?null:uncertain?null:overflow,regions,audit:g.textClippingAudit};
}
