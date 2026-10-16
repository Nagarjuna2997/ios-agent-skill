// Static syntax adapter. Never imports, evaluates, bundles or installs the input project.
import ts from 'typescript';
import { basename } from 'node:path';
import { htmlToIR, readBoundedFile } from './html.js';
import { AppIRSchema, sha256, type AppIR } from './schema.js';

export async function importReact(file: string, name = 'ImportedApp'): Promise<AppIR> {
  const bytes = await readBoundedFile(file);
  return reactToIR(new TextDecoder('utf-8', {fatal:true}).decode(bytes), basename(file), name);
}
/** One parameterless entry and same-file components with bounded literal props.
 * Unsupported executable constructs fail closed rather than yielding misleading native output.
 */
export function reactToIR(source: string, sourcePath = 'App.tsx', name = 'ImportedApp'): AppIR {
  if (Buffer.byteLength(source) > 262144) throw Error('React input exceeds 256 KiB');
  const file = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const diagnostics = (file as ts.SourceFile & {parseDiagnostics: readonly ts.Diagnostic[]}).parseDiagnostics;
  if (diagnostics.length) throw Error('Invalid TSX syntax');
  const components = new Map<string, ts.FunctionDeclaration>();
  let entry: ts.FunctionDeclaration | undefined;
  const fail: (node: ts.Node, reason: string) => never = (node, reason) => {
    const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
    throw Error(`Unsupported React at ${pos.line+1}:${pos.character+1}: ${reason}`);
  };
  for (const node of file.statements) {
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client') continue;
    if (!ts.isFunctionDeclaration(node) || !node.body || !node.name) fail(node, 'only named, static function components are supported; no imports or module side effects');
    if (node.parameters.length > 1 || node.typeParameters?.length || node.asteriskToken || node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)) fail(node, 'multiple parameters, generics, generators and async components require explicit mapping');
    if (components.has(node.name!.text)) fail(node, 'duplicate component');
    components.set(node.name!.text, node);
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      if (entry) fail(node, 'multiple default components');
      entry = node;
    }
  }
  if (!entry) throw Error('React input needs a default-exported named function component');
  if(entry.parameters.length)fail(entry,'entry component cannot receive external props');
  const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const jsxText = (value: string, node: ts.Node) => {
    const decoded=value.replace(/&(?:#[^;\s]+|[A-Za-z][A-Za-z0-9]*);/g, entity => {
      const basic: Record<string,string>={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'\"','&apos;':"'"};
      return basic[entity] ?? fail(node,'unsupported JSX entity; use literal text');
    });
    if(/[\u00a0\u2000-\u200b\u202f\u3000]/.test(decoded))fail(node,'nonbreaking or special whitespace requires explicit layout support');
    return decoded;
  };
  type Literal = {value:string|number; origins:ts.Node[]};
  type Children = {kind:'children'; nodes:readonly ts.JsxChild[]; scope:Scope; stack:string[]; origins:ts.Node[]};
  type Binding = Literal|Children;
  type Props = Map<string,Binding>;
  type Scope = Map<string, Binding|Props>;
  const binding=(node:ts.Expression,scope:Scope):Binding|undefined=>{
    if(ts.isIdentifier(node)){const value=scope.get(node.text);return value instanceof Map?undefined:value;}
    if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)){
      const value=scope.get(node.expression.text);if(value instanceof Map)return value.get(node.name.text);
    }
    return undefined;
  };
  let expressionSteps=0;
  function literal(node:ts.Expression,scope:Scope,depth=0):Literal {
    if(++expressionSteps>4096)fail(node,'static expression work budget exceeded');
    if(depth>32)fail(node,'static expression exceeds depth limit');
    const checked=(value:string|number,origins:ts.Node[]):Literal=>{
      if(typeof value==='number'&&!Number.isFinite(value))fail(node,'non-finite numeric expression');
      if(typeof value==='string'&&(value.length>16384||/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(value)))fail(node,'oversized text, control characters and line separators are unsupported');
      // The expression span includes its operands; keep external prop provenance separately.
      const unique=[...new Set(origins)];
      return {value,origins:unique.filter(n=>!unique.some(parent=>parent!==n&&parent.pos<=n.pos&&parent.end>=n.end))};
    };
    if(ts.isParenthesizedExpression(node))return literal(node.expression,scope,depth+1);
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)||ts.isNumericLiteral(node))return checked(ts.isNumericLiteral(node)?Number(node.text):node.text,[node]);
    const resolved=binding(node,scope);if(resolved&&'value' in resolved)return resolved;
    if(ts.isPrefixUnaryExpression(node)&&[ts.SyntaxKind.PlusToken,ts.SyntaxKind.MinusToken].includes(node.operator)){
      const operand=literal(node.operand,scope,depth+1);if(typeof operand.value!=='number')fail(node,'unary arithmetic requires a number');
      return checked(node.operator===ts.SyntaxKind.MinusToken?-operand.value:+operand.value,[node,...operand.origins]);
    }
    if(ts.isBinaryExpression(node)&&[ts.SyntaxKind.PlusToken,ts.SyntaxKind.MinusToken,ts.SyntaxKind.AsteriskToken,ts.SyntaxKind.SlashToken,ts.SyntaxKind.PercentToken].includes(node.operatorToken.kind)){
      const left=literal(node.left,scope,depth+1),right=literal(node.right,scope,depth+1),op=node.operatorToken.kind;
      let value:string|number;
      if(op===ts.SyntaxKind.PlusToken&&(typeof left.value==='string'||typeof right.value==='string'))value=String(left.value)+String(right.value);
      else {
        if(typeof left.value!=='number'||typeof right.value!=='number')fail(node,'arithmetic requires numeric operands');
        const a=left.value as number,b=right.value as number;
        value=op===ts.SyntaxKind.PlusToken?a+b:op===ts.SyntaxKind.MinusToken?a-b:op===ts.SyntaxKind.AsteriskToken?a*b:op===ts.SyntaxKind.SlashToken?a/b:a%b;
      }
      return checked(value,[node,...left.origins,...right.origins]);
    }
    if(ts.isTemplateExpression(node)){
      if(node.templateSpans.length>256)fail(node,'template interpolation count exceeds limit');
      let value=node.head.text;const origins:ts.Node[]=[node];
      for(const span of node.templateSpans){const part=literal(span.expression,scope,depth+1);value+=String(part.value)+span.literal.text;origins.push(...part.origins);checked(value,origins);}
      return checked(value,origins);
    }
    return fail(node,'only bounded literal expressions and direct prop reads are supported');
  }
  const dependencies:Array<{start:number;end:number;nodes:ts.Node[]}>=[];
  let html = '', count = 0;
  const spans: Array<{start:number;end:number;node:ts.Node}> = [];
  const append = (text: string) => { html += text; if (Buffer.byteLength(html)>262144) throw Error('Expanded React exceeds 256 KiB'); };
  function unwrap(node: ts.Expression): ts.Expression { return ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node; }
  function component(node: ts.FunctionDeclaration, stack: string[], props:Props=new Map(), origins:ts.Node[] = []) {
    const scope:Scope=new Map();
    const param=node.parameters[0];
    if(param){
      if(param.dotDotDotToken||param.initializer||param.questionToken)fail(param,"defaults, rest and optional parameters are unsupported");
      if(ts.isIdentifier(param.name))scope.set(param.name.text,props);
      else if(ts.isObjectBindingPattern(param.name)){
        for(const binding of param.name.elements){
          if(binding.dotDotDotToken||binding.initializer||!ts.isIdentifier(binding.name)||binding.propertyName&&!ts.isIdentifier(binding.propertyName))fail(binding,"only shallow named prop bindings are supported");
          const key=binding.propertyName?.getText(file)??binding.name.getText(file);
          if(!props.has(key))fail(binding,"missing literal prop "+key);
          if(scope.has(binding.name.getText(file)))fail(binding,"duplicate prop binding");
          scope.set(binding.name.getText(file),props.get(key)!);
        }
      }else fail(param,"unsupported parameter binding");
    }
    const key = node.name!.text;
    if (stack.includes(key) || stack.length >= 30) fail(node, 'recursive or excessively deep component hierarchy');
    const statements = node.body!.statements;
    if (statements.length !== 1 || !ts.isReturnStatement(statements[0]!) || !statements[0]!.expression) fail(node, 'component must contain only a JSX return; hooks and executable state are unsupported');
    const start=html.length;
    render(unwrap((statements[0] as ts.ReturnStatement).expression!), [...stack,key],scope);
    if(origins.length)dependencies.push({start,end:html.length,nodes:origins});
  }
  // React constructs supplied children before calling a component, even if discarded.
  // Reuse the syntax-only lowering checks, then discard the temporary markup/evidence.
  // Work budgets are deliberately not restored. No application code is executed.
  function validateChildren(nodes:readonly ts.JsxChild[],stack:string[],scope:Scope){
    const savedHTML=html,savedSpans=spans.length,savedDependencies=dependencies.length;
    try{html='';for(const child of nodes)render(child,stack,scope);}
    finally{html=savedHTML;spans.length=savedSpans;dependencies.length=savedDependencies;}
  }
  function render(node: ts.Node, stack: string[], scope:Scope) {
    if (++count > 400) fail(node, 'expanded component count exceeds limit');
    if (ts.isJsxFragment(node)) { for (const child of node.children) render(child,stack,scope); return; }
    if (ts.isJsxText(node)) {
      // JSX removes indentation and joins nonempty source lines with spaces.
      const lines=node.text.replaceAll('\t',' ').split(/\r\n|\n|\r/);
      const text=lines.map((s,i)=>{ if(i>0)s=s.trimStart();if(i<lines.length-1)s=s.trimEnd();return s; }).filter(Boolean).join(' ');
      const start=html.length;append(escape(jsxText(text,node)));spans.push({start,end:html.length,node});return;
    }
    if (ts.isJsxExpression(node)) {
      if(!node.expression)fail(node,'empty JSX expressions are unsupported');
      const slot=binding(unwrap(node.expression),scope);
      if(slot&&'kind' in slot){for(const child of slot.nodes)render(child,slot.stack,slot.scope);return;}
      const value=literal(node.expression,scope);const start=html.length;
      const text=String(value.value);if(/[\u00a0\u2000-\u200b\u202f\u3000]/.test(text))fail(node,'special whitespace requires explicit layout support');
      append(escape(text));spans.push({start,end:html.length,node});dependencies.push({start,end:html.length,nodes:value.origins});return;
    }
    if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) fail(node, 'expected JSX element');
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const tag=opening.tagName.getText(file);
    if (/^[A-Z]/.test(tag)) {
      const props:Props=new Map();
      if(ts.isJsxElement(node)&&node.children.length)props.set('children',{kind:'children',nodes:node.children,scope,stack:[...stack],origins:[node]});
      for(const attr of opening.attributes.properties){
        if(!ts.isJsxAttribute(attr)||!ts.isIdentifier(attr.name))fail(attr,'spread/namespaced props are unsupported');
        const key=attr.name.getText(file);if(['key','ref','children'].includes(key)||props.has(key))fail(attr,'reserved or duplicate prop');
        const init=attr.initializer;if(!init)fail(attr,'boolean props are unsupported');
        const value=ts.isStringLiteral(init)?{value:jsxText(init.text,attr),origins:[attr]}:ts.isJsxExpression(init)&&init.expression?literal(init.expression,scope):fail(attr,'unsupported prop value');
        if(typeof value.value==='string'&&/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(value.value))fail(attr,'control characters and line separators are unsupported');
        props.set(key,value);
      }
      const target=components.get(tag);if(!target)fail(node,`unresolved component ${tag}`);
      if(ts.isJsxElement(node))validateChildren(node.children,stack,scope);
      const start=html.length;component(target!,stack,props,props.size?[node,...[...props.values()].flatMap(v=>v.origins)]:[]);spans.push({start,end:html.length,node});return;
    }
    if (!/^[a-z][a-z0-9]*$/.test(tag)) fail(node,'namespaced or member elements are unsupported');
    const start=html.length;append('<'+tag);
    const attributes=new Set<string>();
    for(const attr of opening.attributes.properties) {
      if (!ts.isJsxAttribute(attr)) fail(attr,'spread attributes are unsupported');
      const key=attr.name.getText(file),value=attr.initializer;
      if(attributes.has(key))fail(attr,'duplicate attribute');attributes.add(key);
      if(key==='style') {
        if(!value||!ts.isJsxExpression(value)||!value.expression||!ts.isObjectLiteralExpression(value.expression))fail(attr,'style must be a literal object');
        const declarations:string[]=[];const seen=new Set<string>();
        for(const prop of value.expression.properties) {
          if(!ts.isPropertyAssignment(prop)||(!ts.isIdentifier(prop.name)&&!ts.isStringLiteral(prop.name)))fail(prop,'style property must have a literal name and value');
          const raw=prop.name.text;if(!/^[a-zA-Z][a-zA-Z0-9]*$/.test(raw))fail(prop,'unsupported style property name');if(seen.has(raw))fail(prop,'duplicate style property');seen.add(raw);
          const css=raw.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),v=prop.initializer;
          const resolved=literal(v,scope);const text=String(resolved.value);
          if(/[;{}]/.test(text))fail(prop,'style values cannot contain declaration separators');
          const unit=typeof resolved.value==='number'&&['padding','gap','fontSize','borderRadius'].includes(raw)?'px':'';
          declarations.push(css+':'+text+unit);
        }
        append(' style="'+escape(declarations.join(';'))+'"');
      } else {
        if(!value||!ts.isStringLiteral(value))fail(attr,'attributes must be literal strings');
        append(' '+key+'="'+escape(jsxText(value.text,attr))+'"');
      }
    }
    append('>');if(ts.isJsxElement(node))for(const child of node.children)render(child,stack,scope);append('</'+tag+'>');
    spans.push({start,end:html.length,node});
  }
  component(entry,[]);
  const ir=htmlToIR(html,'intermediate.html',name);
  const origin=(start:number,end:number) => spans.filter(s=>Buffer.byteLength(html.slice(0,s.start))<=start&&Buffer.byteLength(html.slice(0,s.end))>=end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];
  for(const row of [...ir.nodes,...ir.requirements,...ir.limitations])row.evidence=row.evidence.flatMap(e=>{
    const span=origin(e.start,e.end);const node=span?.node??entry!;
    const deps=dependencies.filter(d=>Buffer.byteLength(html.slice(0,d.start))<=e.start&&Buffer.byteLength(html.slice(0,d.end))>=e.end).flatMap(d=>d.nodes);
    const nodes=[node,...deps];const seen=new Set<string>();
    return nodes.flatMap(n=>{const start=Buffer.byteLength(source.slice(0,n.getStart(file))),end=Buffer.byteLength(source.slice(0,n.end));const key=`${start}:${end}`;if(seen.has(key))return [];seen.add(key);return [{source:'source',start,end,certainty:'extracted' as const,...(!span?{note:'Synthetic root corresponds to the default component'}:{})}];});
  });
  ir.sources=[{id:'source',path:sourcePath,sha256:sha256(source),bytes:Buffer.byteLength(source),adapter:'react-static@1'}];
  return AppIRSchema.parse(ir);
}
