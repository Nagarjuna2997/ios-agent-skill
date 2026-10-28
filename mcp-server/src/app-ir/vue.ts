// Vue SFC static-template adapter. Never evaluates scripts or loads components.
import type {DefaultTreeAdapterMap} from 'parse5';
import {parseStaticMarkup} from './static-markup.js';
import {basename} from 'node:path';
import {htmlToIR,readBoundedFile} from './html.js';
import {AppIRSchema,sha256,type AppIR} from './schema.js';
export async function importVue(file:string,name='ImportedApp'):Promise<AppIR>{
  return vueToIR(new TextDecoder('utf-8',{fatal:true}).decode(await readBoundedFile(file)),basename(file),name);
}
export function vueToIR(source:string,sourcePath='App.vue',name='ImportedApp'):AppIR{
  if(Buffer.byteLength(source)>262144)throw Error('Vue input exceeds 256 KiB');
  const fragment=parseStaticMarkup(source);
  const meaningful=fragment.childNodes.filter(n=>n.nodeName!=='#comment'&&!(n.nodeName==='#text'&&!(n as DefaultTreeAdapterMap['textNode']).value.trim()));
  if(meaningful.length!==1||!('tagName' in meaningful[0]!)||meaningful[0].tagName!=='template')throw Error('Vue input requires exactly one static <template>; scripts, styles and custom blocks are unsupported');
  const template=meaningful[0] as DefaultTreeAdapterMap['element'];
  if(template.attrs.length)throw Error('Vue template attributes, external sources and preprocessors are unsupported');
  const location=template.sourceCodeLocation;
  if(!location?.startTag||!location.endTag)throw Error('Vue template requires explicit opening and closing tags');
  const start=location.startTag.endOffset,end=location.endTag.startOffset;
  const markup=source.slice(start,end);
  // No interpolation is treated as static text, including inside nested elements.
  if(markup.includes('{{')||markup.includes('}}'))throw Error('Vue interpolation requires an explicit expression mapping');
  const ir=htmlToIR(markup,sourcePath,name);
  const offset=Buffer.byteLength(source.slice(0,start));
  for(const row of [...ir.nodes,...ir.requirements,...ir.limitations])for(const evidence of row.evidence){evidence.start+=offset;evidence.end+=offset;}
  ir.sources=[{id:'source',path:sourcePath,sha256:sha256(source),bytes:Buffer.byteLength(source),adapter:'vue-static@1'}];
  return AppIRSchema.parse(ir);
}
