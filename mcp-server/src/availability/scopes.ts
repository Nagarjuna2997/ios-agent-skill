import { appIntentsCode } from '../analyzers/app-intents.js';
export const version = (v: unknown): v is string => typeof v === 'string' && /^\d+(?:\.\d+){0,2}$/.test(v);
export function compare(a: string, b: string): number {
  const x=a.split('.').map(Number), y=b.split('.').map(Number);
  for(let i=0;i<3;i++) if((x[i]??0)!==(y[i]??0))return (x[i]??0)>(y[i]??0)?1:-1;
  return 0;
}
export interface Range {start:number;end:number;version:string;kind:'declaration'|'branch'|'guard'}
export function iosVersion(s:string):string|undefined {
  return /\biOS\s+(\d+(?:\.\d+){0,2})\b/.exec(s)?.[1] ?? /\biOS\s*,\s*introduced:\s*(\d+(?:\.\d+){0,2})/.exec(s)?.[1];
}
/** Lexical, offset-preserving scopes. Compiler diagnostics remain authoritative. */
export function availabilityScopes(source:string) {
  const code=appIntentsCode(source), pairs=new Map<number,number>(), stack:number[]=[];
  for(let i=0;i<code.length;i++){if(code[i]==='{')stack.push(i);else if(code[i]==='}'){const s=stack.pop();if(s!==undefined)pairs.set(s,i);}}
  const ranges:Range[]=[];
  for(const m of code.matchAll(/@available\s*\(([^)]*)\)/g)){
    const v=iosVersion(m[1]);if(!v)continue;
    const tail=code.slice(m.index!+m[0].length);
    // Attributes/modifiers may precede the declaration; never consume another body.
    const head=/^\s*(?:(?:@[\w.]+(?:\([^)]*\))?|public|private|internal|fileprivate|open|final|nonisolated|static|class|override|mutating|@MainActor)\s+)*(?:struct|enum|class|actor|extension|func|var|let|init|subscript|protocol)\b[^{};]*/.exec(tail);
    if(!head)continue;
    const start=m.index!, body=m.index!+m[0].length+head[0].length;
    const sibling=/\n\s*(?:(?:@[\w.]+(?:\([^)]*\))?|public|private|fileprivate|internal|open|final|static|nonisolated(?:\([^)]*\))?|isolated|override|mutating|distributed|required|convenience)\s+)*(?:func|struct|class|enum|extension|actor|let|var)\b/.exec(head[0].trimStart());
    const end=sibling ? m.index!+m[0].length+head[0].indexOf(head[0].trimStart())+sibling.index : code[body]==='{'?pairs.get(body):code.indexOf('\n',m.index!+m[0].length+tail.search(/\S/));
    if(end!==undefined&&end>=start)ranges.push({start,end,version:v,kind:'declaration'});
  }
  for(const m of code.matchAll(/\b(if|guard|while)\s+#available\s*\(([^)]*)\)([^{}]*)\{/g)){
    const v=iosVersion(m[2]);if(!v||/\|\|/.test(m[3]))continue;
    const open=m.index!+m[0].length-1, close=pairs.get(open);if(close===undefined)continue;
    if(m[1]==='guard'){
      if(!/\belse\s*$/.test(m[3])||! /\b(return|throw|continue|break|fatalError|preconditionFailure)\b/.test(code.slice(open,close)))continue;
      const enclosing=[...pairs].filter(([a,b])=>a<m.index!&&b>close).sort((a,b)=>b[0]-a[0])[0];
      ranges.push({start:close+1,end:enclosing?.[1]??code.length,version:v,kind:'guard'});
    }else ranges.push({start:open+1,end:close,version:v,kind:'branch'});
  }
  return {code,ranges};
}
