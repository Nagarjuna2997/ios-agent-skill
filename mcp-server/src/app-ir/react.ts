// Static syntax adapter. Never imports, evaluates, bundles or installs the input project.
import ts from 'typescript';
import { basename } from 'node:path';
import { htmlToIR, readBoundedFile } from './html.js';
import { AppIRSchema, sha256, type AppIR } from './schema.js';

export async function importReact(file: string, name = 'ImportedApp'): Promise<AppIR> {
  const bytes = await readBoundedFile(file);
  return reactToIR(new TextDecoder('utf-8', {fatal:true}).decode(bytes), basename(file), name);
}
/** One default-exported, parameterless function and optional same-file static components.
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
    if (node.parameters.length || node.typeParameters?.length || node.asteriskToken || node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)) fail(node, 'props, generics, generators and async components require explicit mapping');
    if (components.has(node.name!.text)) fail(node, 'duplicate component');
    components.set(node.name!.text, node);
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      if (entry) fail(node, 'multiple default components');
      entry = node;
    }
  }
  if (!entry) throw Error('React input needs a default-exported named function component');
  const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const jsxText = (value: string, node: ts.Node) => {
    const decoded=value.replace(/&(?:#[^;\s]+|[A-Za-z][A-Za-z0-9]*);/g, entity => {
      const basic: Record<string,string>={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'\"','&apos;':"'"};
      return basic[entity] ?? fail(node,'unsupported JSX entity; use literal text');
    });
    if(/[\u00a0\u2000-\u200b\u202f\u3000]/.test(decoded))fail(node,'nonbreaking or special whitespace requires explicit layout support');
    return decoded;
  };
  let html = '', count = 0;
  const spans: Array<{start:number;end:number;node:ts.Node}> = [];
  const append = (text: string) => { html += text; if (Buffer.byteLength(html)>262144) throw Error('Expanded React exceeds 256 KiB'); };
  function unwrap(node: ts.Expression): ts.Expression { return ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node; }
  function component(node: ts.FunctionDeclaration, stack: string[]) {
    const key = node.name!.text;
    if (stack.includes(key) || stack.length >= 30) fail(node, 'recursive or excessively deep component hierarchy');
    const statements = node.body!.statements;
    if (statements.length !== 1 || !ts.isReturnStatement(statements[0]!) || !statements[0]!.expression) fail(node, 'component must contain only a JSX return; hooks and executable state are unsupported');
    render(unwrap((statements[0] as ts.ReturnStatement).expression!), [...stack,key]);
  }
  function render(node: ts.Node, stack: string[]) {
    if (++count > 400) fail(node, 'expanded component count exceeds limit');
    if (ts.isJsxFragment(node)) { for (const child of node.children) render(child,stack); return; }
    if (ts.isJsxText(node)) {
      // JSX removes indentation and joins nonempty source lines with spaces.
      const lines=node.text.replaceAll('\t',' ').split(/\r\n|\n|\r/);
      const text=lines.map((s,i)=>{ if(i>0)s=s.trimStart();if(i<lines.length-1)s=s.trimEnd();return s; }).filter(Boolean).join(' ');
      const start=html.length;append(escape(jsxText(text,node)));spans.push({start,end:html.length,node});return;
    }
    if (ts.isJsxExpression(node)) fail(node, 'JSX expressions, including event handlers and dynamic data, require explicit mapping');
    if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) fail(node, 'expected JSX element');
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const tag=opening.tagName.getText(file);
    if (/^[A-Z]/.test(tag)) {
      if (opening.attributes.properties.length || (ts.isJsxElement(node) && node.children.some(c=>!ts.isJsxText(c)||c.text.trim()))) fail(node,'component props/children are unsupported');
      const target=components.get(tag);if(!target)fail(node,`unresolved component ${tag}`);
      const start=html.length;component(target!,stack);spans.push({start,end:html.length,node});return;
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
          if(!ts.isStringLiteral(v)&&!ts.isNumericLiteral(v))fail(prop,'computed style values are unsupported');
          if(/[;{}]/.test(v.text))fail(prop,'style values cannot contain declaration separators');
          const unit=ts.isNumericLiteral(v)&&['padding','gap','fontSize','borderRadius'].includes(raw)?'px':'';
          declarations.push(css+':'+v.text+unit);
        }
        append(' style="'+escape(declarations.join(';'))+'"');
      } else {
        if(!value||!ts.isStringLiteral(value))fail(attr,'attributes must be literal strings');
        append(' '+key+'="'+escape(jsxText(value.text,attr))+'"');
      }
    }
    append('>');if(ts.isJsxElement(node))for(const child of node.children)render(child,stack);append('</'+tag+'>');
    spans.push({start,end:html.length,node});
  }
  component(entry,[]);
  const ir=htmlToIR(html,'intermediate.html',name);
  const origin=(start:number,end:number) => spans.filter(s=>Buffer.byteLength(html.slice(0,s.start))<=start&&Buffer.byteLength(html.slice(0,s.end))>=end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];
  for(const row of [...ir.nodes,...ir.requirements,...ir.limitations])row.evidence=row.evidence.map(e=>{
    const span=origin(e.start,e.end);const node=span?.node??entry!;
    return {source:'source',start:Buffer.byteLength(source.slice(0,node.getStart(file))),end:Buffer.byteLength(source.slice(0,node.end)),certainty:'extracted' as const,...(!span?{note:'Synthetic root corresponds to the default component'}:{})};
  });
  ir.sources=[{id:'source',path:sourcePath,sha256:sha256(source),bytes:Buffer.byteLength(source),adapter:'react-static@1'}];
  return AppIRSchema.parse(ir);
}
