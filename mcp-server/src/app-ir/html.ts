// Read-only, deliberately narrow adapter. No script evaluation, URL fetches or package installation.
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { open, realpath } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename } from 'node:path';
import { AppIRSchema, sha256, type AppIR } from './schema.js';
type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const element = (n: Node): n is Element => 'tagName' in n;
const content = (n: Node): string => n.nodeName === '#text' ? (n as DefaultTreeAdapterMap['textNode']).value : 'childNodes' in n ? n.childNodes.map(content).join('') : '';
export async function readBoundedFile(file: string): Promise<Buffer> {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > 262144) throw Error('Expected a regular file of at most 256 KiB');
    const buffer = Buffer.alloc(262145);
    const {bytesRead} = await handle.read(buffer,0,buffer.length,0);
    if (bytesRead > 262144) throw Error('Input grew beyond 256 KiB');
    return buffer.subarray(0,bytesRead);
  } finally { await handle.close(); }
}
export async function importHTML(file: string, name = 'ImportedApp'): Promise<AppIR> {
  // Resolve parents; refuse a symlink at the selected file itself using O_NOFOLLOW.
  const bytes = await readBoundedFile(file);
  const sourcePath = basename(await realpath(file));
  const html = new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  return htmlToIR(html,sourcePath,name);
}
export function htmlToIR(html: string, sourcePath = 'index.html', name = 'ImportedApp'): AppIR {
  if (Buffer.byteLength(html) > 262144) throw Error('HTML exceeds 256 KiB');
  const ir: AppIR = { schemaVersion:'1.0.0',mode:'faithful',name,
    sources:[{id:'source',path:sourcePath,sha256:sha256(html),bytes:Buffer.byteLength(html),adapter:'html-inline@1'}], screens:[],nodes:[],requirements:[],limitations:[] };
  const doc = parse(html,{sourceCodeLocationInfo:true});
  const evidence = (n: Node) => {
    const loc = n.sourceCodeLocation;
    return [{source:'source',start:Buffer.byteLength(html.slice(0,loc?.startOffset ?? 0)),end:Buffer.byteLength(html.slice(0,loc?.endOffset ?? html.length)),certainty:'extracted' as const}];
  };
  const limitation = (code: string, message: string, n: Node) => { ir.limitations.push({code,message,evidence:evidence(n)}); };
  const style = (el: Element): AppIR['nodes'][number]['style'] => {
    const out: AppIR['nodes'][number]['style'] = {};
    const rawStyle = (el.attrs.find(a => a.name === 'style')?.value ?? '').toLowerCase();
    const isRow=/display\s*:\s*flex\s*(?:;|$)/.test(rawStyle)&&/flex-direction\s*:\s*row\s*(?:;|$)/.test(rawStyle);
    if(isRow&&['display','flex-direction'].some(key=>rawStyle.split(';').filter(part=>part.trim().startsWith(key+':')||new RegExp('^\\s*'+key+'\\s*:').test(part)).length>1))limitation('ambiguous-row-layout','Repeated row layout declarations require explicit resolution',el);
    if(isRow&&!/align-items\s*:\s*center\s*(?:;|$)/.test(rawStyle))limitation('unsupported-row-alignment','Rows require explicit align-items:center; stretch and baseline layout are not mapped',el);
    if (!isRow && /display\s*:\s*flex\s*(?:;|$)/.test(rawStyle) && !/flex-direction\s*:\s*column\s*(?:;|$)/.test(rawStyle)) limitation('unsupported-flex-direction','Flex rows are not supported; explicit column direction is required',el);
    for (const part of (el.attrs.find(a => a.name === 'style')?.value ?? '').split(';').filter(s => s.trim())) {
      const i = part.indexOf(':'); const key = part.slice(0,i).trim().toLowerCase(); const value = part.slice(i+1).trim();
      if (['color','background-color'].includes(key) && /^#[0-9a-fA-F]{6}$/.test(value)) out[key === 'color' ? 'foreground' : 'background'] = value;
      else if (['padding','gap','font-size','border-radius'].includes(key) && /^\d+(?:\.\d+)?px$/.test(value)) {
        const number = Number(value.slice(0,-2));
        if (number <= (key === 'font-size' ? 80 : 100) && (key !== 'font-size' || number >= 10)) {
          const field = {padding:'padding',gap:'gap','font-size':'fontSize','border-radius':'radius'}[key] as 'padding'|'gap'|'fontSize'|'radius'; out[field] = number;
        } else limitation('css-out-of-range',`Unsupported CSS value: ${key}`,el);
      } else if (key === 'font-weight' && ['400','600','700','normal','bold'].includes(value)) out.bold = ['600','700','bold'].includes(value);
      else if (key === 'text-align' && ['left','center'].includes(value)) out.centered = value === 'center';
      else if ((key === 'margin' && value === '0') || (key === 'font-family' && ['-apple-system','system-ui'].includes(value))) { /* native defaults */ }
      else if ((key === 'display' && value === 'flex') || (key === 'flex-direction' && ['column','row'].includes(value)) || (key === 'align-items' && value === 'center' && isRow)) { /* native column */ }
      else limitation('unsupported-css',`CSS declaration is not mapped: ${key || part}`,el);
    }
    for (const attr of el.attrs) if (!['style','id','lang'].includes(attr.name)) limitation('unsupported-attribute',`Attribute ${attr.name} is not mapped`,el);
    return out;
  };
  let count = 0;
  const visit = (n: Node, depth: number): string[] => {
    if (depth > 40 || count > 400) throw Error('HTML exceeds supported depth/node count');
    if (!element(n)) {
      const value = content(n).replace(/\s+/g,' ').trim();
      if (!value) return [];
      const id = `node-${++count}`;
      ir.nodes.push({id,kind:'text',text:value,children:[],style:{},evidence:evidence(n)}); return [id];
    }
    if (['script','style','link','iframe','img','svg','canvas','video','audio','input','button','form','a'].includes(n.tagName)) {
      limitation('unsupported-element',`<${n.tagName}> is not converted. Its behavior/assets require explicit mapping.`,n); return [];
    }
    if (!['body','main','section','article','div','header','footer','p','h1','h2','h3','span','strong','details','summary'].includes(n.tagName)) {
      limitation('unsupported-element',`<${n.tagName}> is not converted`,n); return [];
    }
    const id = `node-${++count}`; const appearance = style(n);
    const rawStyle=(n.attrs.find(a=>a.name==='style')?.value??'').toLowerCase();
    const row=/display\s*:\s*flex\s*(?:;|$)/.test(rawStyle)&&/flex-direction\s*:\s*row\s*(?:;|$)/.test(rawStyle);
    if(row&&['p','h1','h2','h3','span','strong','details','summary'].includes(n.tagName))limitation('unsupported-row-element','Rows require a plain container element',n);
    if(row){ir.schemaVersion='1.5.0';appearance.gap??=0;}
    if (['p','h1','h2','h3','span','strong'].includes(n.tagName)) {
      if (n.childNodes.some(element)) limitation('inline-markup',`Nested markup in <${n.tagName}> is flattened; inspect its semantics`,n);
      ir.nodes.push({id,kind:'text',text:content(n).replace(/\s+/g,' ').trim(),children:[],style:{...(n.tagName==='strong'?{bold:true}:{}),...(/^h[1-3]$/.test(n.tagName)?{bold:true,fontSize:n.tagName==='h1'?32:24}:{}),...appearance},evidence:evidence(n)}); return [id];
    }
    const summary = n.tagName === 'details' ? n.childNodes.find(c => element(c) && c.tagName === 'summary') : undefined;
    if (n.tagName === 'details' && !summary) { limitation('missing-summary','Details without an explicit summary is not mapped',n); return []; }
    if (summary && element(summary)) {
      if (summary.attrs.length || summary.childNodes.some(element)) limitation('unsupported-summary','Summary supports plain text only; attributes or nested markup require mapping',summary);
    }
    const visibleChildren = n.childNodes.filter(c => c !== summary && (element(c) || content(c).trim()));
    const explicitColumn = /display\s*:\s*flex/i.test(n.attrs.find(a => a.name === 'style')?.value ?? '');
    if (!explicitColumn && visibleChildren.length > 1 && visibleChildren.some(c => !element(c) || ['span','strong'].includes(c.tagName))) limitation('unsupported-inline-flow','Inline siblings require line-flow layout, which is not mapped',n);
    const children = n.childNodes.filter(c => c !== summary).flatMap(c => visit(c,depth+1));
    ir.nodes.push({id,kind:summary?'disclosure':row?'row':'column',...(summary?{text:content(summary).trim()}:{}),children,style:appearance,evidence:evidence(n)});
    return [id];
  };
  const htmlEl = doc.childNodes.find(n => element(n) && n.tagName === 'html') as Element;
  for (const attr of htmlEl.attrs) if (attr.name !== 'lang') limitation('unsupported-root-attribute',`Root attribute ${attr.name} is not mapped`,htmlEl);
  const head = htmlEl.childNodes.find(n => element(n) && n.tagName === 'head') as Element;
  const body = htmlEl.childNodes.find(n => element(n) && n.tagName === 'body') as Element;
  for (const n of head.childNodes) if (element(n) && ['style','script','link'].includes(n.tagName)) limitation('head-resource','Head CSS/scripts/resources are not evaluated',n);
  const root = visit(body,0)[0]!;
  const title = head.childNodes.find(n => element(n) && n.tagName === 'title');
  ir.screens.push({id:'home',title:(title?content(title):name).trim().slice(0,80) || name,root});
  for (const area of ['api','auth','data','assets','appearance','responsive'] as const) ir.requirements.push({id:`review-${area}`,area,status:'unknown',description:`No ${area} behavior inferred from static HTML. Developer review required.`,evidence:[]});
  return AppIRSchema.parse(ir);
}
