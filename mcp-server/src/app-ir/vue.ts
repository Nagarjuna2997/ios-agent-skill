// Vue SFC static-template adapter. Never evaluates scripts or loads components.
import {parseFragment,Tokenizer, type DefaultTreeAdapterMap} from 'parse5';
import {basename} from 'node:path';
import {htmlToIR,readBoundedFile} from './html.js';
import {AppIRSchema,sha256,type AppIR} from './schema.js';
export async function importVue(file:string,name='ImportedApp'):Promise<AppIR>{
  return vueToIR(new TextDecoder('utf-8',{fatal:true}).decode(await readBoundedFile(file)),basename(file),name);
}
export function vueToIR(source:string,sourcePath='App.vue',name='ImportedApp'):AppIR{
  if(Buffer.byteLength(source)>262144)throw Error('Vue input exceeds 256 KiB');
  // Tokenizer is pinned with parse5. Match source tags independently of its
  // HTML tree builder, which otherwise repairs invalid Vue nesting silently.
  const tags=new Map<number,{parent:number|null;end:number}>();
  const stack:Array<{name:string;start:number}>=[];
  const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  new Tokenizer({sourceCodeLocationInfo:true},{
    onStartTag(token){
      if(['script','style','textarea','title'].includes(token.tagName))throw Error('Vue script/style and raw-text elements are unsupported');
      const loc=token.location!;
      if(tags.size>=500||stack.length>=40)throw Error('Vue exceeds supported depth/node count');
      tags.set(loc.startOffset,{parent:stack.at(-1)?.start??null,end:loc.endOffset});
      if(!voidTags.has(token.tagName)){
        if(token.selfClosing)throw Error('Vue self-closing components/elements require explicit mapping');
        stack.push({name:token.tagName,start:loc.startOffset});
      }
    },
    onEndTag(token){const open=stack.pop();if(!open||open.name!==token.tagName)throw Error('Vue requires explicitly matching nested tags');tags.get(open.start)!.end=token.location!.endOffset;},
    onEof(){if(stack.length)throw Error('Vue requires explicit closing tags');},
    onComment(){},onDoctype(){throw Error('Vue doctype is unsupported');},onCharacter(){},onWhitespaceCharacter(){},
    onNullCharacter(){throw Error('Vue null text is unsupported');},onParseError(e){throw Error('Malformed Vue syntax: '+e.code);},
  }).write(source,true);
  const errors:string[]=[];
  const fragment=parseFragment(source,{sourceCodeLocationInfo:true,onParseError:e=>errors.push(e.code)});
  if(errors.length)throw Error('Unsupported malformed Vue template: '+errors[0]);
  const meaningful=fragment.childNodes.filter(n=>n.nodeName!=='#comment'&&!(n.nodeName==='#text'&&!(n as DefaultTreeAdapterMap['textNode']).value.trim()));
  if(meaningful.length!==1||!('tagName' in meaningful[0]!)||meaningful[0].tagName!=='template')throw Error('Vue input requires exactly one static <template>; scripts, styles and custom blocks are unsupported');
  // HTML parsing lowercases tag names, whereas Vue uses PascalCase for components.
  // Check original spelling before delegating to the HTML adapter.
  let visited=0;
  const inspect=(node:DefaultTreeAdapterMap['node'],parent:number|null=null):void=>{
    if('tagName' in node){
      const loc=node.sourceCodeLocation?.startTag;
      const expected=loc?tags.get(loc.startOffset):undefined;
      if(!loc||!expected||expected.parent!==parent||node.sourceCodeLocation?.endOffset!==expected.end)throw Error('Vue nesting requires HTML tree repair; conversion is unsupported');
      visited++;parent=loc.startOffset;
      const spelling=loc?source.slice(loc.startOffset,loc.endOffset).match(/^<([^\s/>]+)/)?.[1]:undefined;
      if(spelling&&spelling!==spelling.toLowerCase())throw Error('Vue component tags require explicit mapping: '+spelling);
      if('content' in node)inspect((node as DefaultTreeAdapterMap['template']).content,parent);
    }
    if('childNodes' in node)for(const child of node.childNodes)inspect(child,parent);
  };
  inspect(fragment);
  if(visited!==tags.size)throw Error('Vue source elements were discarded by HTML parsing');
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
