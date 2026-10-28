import {parseFragment,Tokenizer,type DefaultTreeAdapterMap} from 'parse5';
/** Reject HTML parser repair before lowering framework template syntax. */
export function parseStaticMarkup(source:string):DefaultTreeAdapterMap['documentFragment']{
  if(Buffer.byteLength(source)>262144)throw Error('Static template exceeds 256 KiB');
  // Tokenizer is pinned with parse5. Match source tags independently of its
  // HTML tree builder, which otherwise repairs invalid Static template nesting silently.
  const tags=new Map<number,{parent:number|null;end:number}>();
  const stack:Array<{name:string;start:number}>=[];
  const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  new Tokenizer({sourceCodeLocationInfo:true},{
    onStartTag(token){
      if(['script','style','textarea','title'].includes(token.tagName))throw Error('Static template script/style and raw-text elements are unsupported');
      const loc=token.location!;
      if(tags.size>=500||stack.length>=40)throw Error('Static template exceeds supported depth/node count');
      tags.set(loc.startOffset,{parent:stack.at(-1)?.start??null,end:loc.endOffset});
      if(!voidTags.has(token.tagName)){
        if(token.selfClosing)throw Error('Static template self-closing components/elements require explicit mapping');
        stack.push({name:token.tagName,start:loc.startOffset});
      }
    },
    onEndTag(token){const open=stack.pop();if(!open||open.name!==token.tagName)throw Error('Static template requires explicitly matching nested tags');tags.get(open.start)!.end=token.location!.endOffset;},
    onEof(){if(stack.length)throw Error('Static template requires explicit closing tags');},
    onComment(){},onDoctype(){throw Error('Static template doctype is unsupported');},onCharacter(){},onWhitespaceCharacter(){},
    onNullCharacter(){throw Error('Static template null text is unsupported');},onParseError(e){throw Error('Malformed Static template syntax: '+e.code);},
  }).write(source,true);
  const errors:string[]=[];
  const fragment=parseFragment(source,{sourceCodeLocationInfo:true,onParseError:e=>errors.push(e.code)});
  if(errors.length)throw Error('Unsupported malformed Static template template: '+errors[0]);
  // HTML parsing lowercases tag names, whereas Static template uses PascalCase for components.
  // Check original spelling before delegating to the HTML adapter.
  let visited=0;
  const inspect=(node:DefaultTreeAdapterMap['node'],parent:number|null=null):void=>{
    if('tagName' in node){
      const loc=node.sourceCodeLocation?.startTag;
      const expected=loc?tags.get(loc.startOffset):undefined;
      if(!loc||!expected||expected.parent!==parent||node.sourceCodeLocation?.endOffset!==expected.end)throw Error('Static template nesting requires HTML tree repair; conversion is unsupported');
      visited++;parent=loc.startOffset;
      const spelling=loc?source.slice(loc.startOffset,loc.endOffset).match(/^<([^\s/>]+)/)?.[1]:undefined;
      if(spelling&&spelling!==spelling.toLowerCase())throw Error('Static template component tags require explicit mapping: '+spelling);
      if('content' in node)inspect((node as DefaultTreeAdapterMap['template']).content,parent);
    }
    if('childNodes' in node)for(const child of node.childNodes)inspect(child,parent);
  };
  inspect(fragment);
  if(visited!==tags.size)throw Error('Static template source elements were discarded by HTML parsing');
  return fragment;
}
