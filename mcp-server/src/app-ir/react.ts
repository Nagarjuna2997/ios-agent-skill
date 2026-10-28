import {isErasedTypeStatement} from './react-types.js';
// Static syntax adapter. Never imports, evaluates, bundles or installs the input project.
import ts from 'typescript';
import { htmlToIR } from './html.js';
import { AppIRSchema, sha256, type AppIR } from './schema.js';
import { absoluteRoute, readRoutes, routerNames } from './react-routes.js';

export async function importReact(file: string, name = 'ImportedApp'): Promise<AppIR> {
  return (await import('./react-project.js')).importReactProject(file,name);
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
  let hasStateImport = false;
  let hasRouterImport = false;
  let entry: ts.FunctionDeclaration | undefined;
  const fail: (node: ts.Node, reason: string) => never = (node, reason) => {
    const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
    throw Error(`Unsupported React at ${pos.line+1}:${pos.character+1}: ${reason}`);
  };
  for (const node of file.statements) {
    if(isErasedTypeStatement(node))continue;
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client') continue;
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause, imports = clause?.namedBindings;
      if (ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'react-router-dom') {
        if (hasRouterImport || !clause || clause.isTypeOnly || clause.name || !imports || !ts.isNamedImports(imports) || node.attributes ||
            imports.elements.length !== routerNames.length || new Set(imports.elements.map(e => e.name.text)).size !== routerNames.length ||
            imports.elements.some(e => e.propertyName || e.isTypeOnly || !routerNames.includes(e.name.text as typeof routerNames[number]))) fail(node, 'router import must explicitly name MemoryRouter, Routes, Route and Link without aliases');
        hasRouterImport = true; continue;
      }
      if (hasStateImport || !ts.isStringLiteral(node.moduleSpecifier) || node.moduleSpecifier.text !== 'react' ||
          !clause || clause.isTypeOnly || clause.name || !imports || !ts.isNamedImports(imports) ||
          imports.elements.length !== 1 || imports.elements[0]!.name.text !== 'useState' ||
          imports.elements[0]!.propertyName || imports.elements[0]!.isTypeOnly || node.attributes) {
        fail(node, 'only the named useState import from react is supported; input modules are never loaded');
      }
      hasStateImport = true; continue;
    }
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
  if (hasStateImport && components.has('useState')) fail(components.get('useState')!, 'useState import is shadowed');
  if (hasRouterImport) for (const name of routerNames) if (components.has(name)) fail(components.get(name)!, 'router import is shadowed');
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
  type StateBinding = {kind:'state'|'setter'; id:string; origins:ts.Node[]};
  type Binding = Literal|Children|StateBinding;
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
  const states:Array<{id:string; initial:boolean|string; origin:ts.Node}>=[];
  type Mapping = {start:number; end:number; textBinding?:AppIR['nodes'][number]['textBinding']; action?:AppIR['nodes'][number]['action']; stringBinding?:string; input?:boolean; placeholder?:string; origins:ts.Node[]};
  const stateMappings:Mapping[]=[];
  const conditionMappings:Array<{start:number;end:number;state:string;branches:Array<{start:number;end:number}|null>}> = [];
  let conditionalDepth=0;
  const routeSpans:Array<{id:string;path:string;start:number;end:number;origin:ts.Node}>=[];
  let initialPath:string|undefined, currentPath:string|undefined, inRoute=false;
  let declaredPaths = new Set<string>();
  let html = '', count = 0, textElementDepth = 0;
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
          if(binding.dotDotDotToken||!ts.isIdentifier(binding.name)||binding.propertyName&&!ts.isIdentifier(binding.propertyName))fail(binding,"only shallow named prop bindings are supported");
          const key=binding.propertyName?.getText(file)??binding.name.getText(file);
          // Validate defaults even when overridden: unsupported executable syntax must
          // never disappear silently. Empty scope deliberately excludes dependent defaults.
          const fallback=binding.initializer?literal(binding.initializer,new Map()):undefined;
          if(!props.has(key)&&!fallback)fail(binding,"missing literal prop "+key);
          if(scope.has(binding.name.getText(file)))fail(binding,"duplicate prop binding");
          scope.set(binding.name.getText(file),props.get(key)??fallback!);
          if(!props.has(key)&&fallback)origins=[...origins,...fallback.origins];
        }
      }else fail(param,"unsupported parameter binding");
    }
    const key = node.name!.text;
    if (stack.includes(key) || stack.length >= 30) fail(node, 'recursive or excessively deep component hierarchy');
    const statements = node.body!.statements;
    const returned = statements[statements.length - 1];
    if (!returned || !ts.isReturnStatement(returned) || !returned.expression) fail(node, 'component must end with a JSX return');
    for (const statement of statements.slice(0,-1)) {
      // Read constant primitive declarations in source order, without executing
      // application code. Mutable bindings and destructuring are not inferred.
      if(ts.isVariableStatement(statement)&&!statement.modifiers?.length&&
          statement.declarationList.flags===ts.NodeFlags.Const&&statement.declarationList.declarations.length===1){
        const local=statement.declarationList.declarations[0]!;
        if(ts.isIdentifier(local.name)&&local.initializer){
          const name=local.name.text;
          if(scope.has(name)||components.has(name)||name==='useState'||hasRouterImport&&routerNames.includes(name as typeof routerNames[number]))fail(local,'constant shadows another binding');
          const value=literal(local.initializer,scope);
          scope.set(name,{value:value.value,origins:[statement,...value.origins]});
          origins=[...origins,statement,...value.origins];
          continue;
        }
      }
      if (node !== entry || !hasStateImport || !ts.isVariableStatement(statement) || statement.modifiers?.length ||
          statement.declarationList.flags !== ts.NodeFlags.Const || statement.declarationList.declarations.length !== 1) {
        fail(statement, 'only top-level const boolean/string useState bindings in the entry component are supported');
      }
      const declaration = statement.declarationList.declarations[0]!, call = declaration.initializer;
      if (!ts.isArrayBindingPattern(declaration.name) || declaration.name.elements.length !== 2 || declaration.type ||
          !call || !ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || call.expression.text !== 'useState' ||
          (call.typeArguments?.length!==undefined&&(call.typeArguments.length!==1||![ts.SyntaxKind.BooleanKeyword,ts.SyntaxKind.StringKeyword].includes(call.typeArguments[0]!.kind))) || call.arguments.length !== 1 ||
          !ts.isStringLiteral(call.arguments[0]!)&&![ts.SyntaxKind.TrueKeyword,ts.SyntaxKind.FalseKeyword].includes(call.arguments[0]!.kind)) {
        fail(declaration, 'useState requires a literal boolean or string and a [value, setter] binding');
      }
      if (states.length >= 16) fail(declaration, 'state count exceeds 16');
      const id = `state-${states.length + 1}`;
      for (const [index, element] of [...declaration.name.elements].entries()) {
        if (!ts.isBindingElement(element) || !ts.isIdentifier(element.name) || element.initializer || element.dotDotDotToken || element.propertyName) fail(element, 'state bindings require two distinct identifiers');
        if (scope.has(element.name.text) || components.has(element.name.text) || element.name.text === 'useState' || hasRouterImport && routerNames.includes(element.name.text as typeof routerNames[number])) fail(element, 'state binding shadows another name');
        scope.set(element.name.text, {kind:index === 0 ? 'state' : 'setter', id, origins:[statement]});
      }
      const initial=ts.isStringLiteral(call.arguments[0]!)?call.arguments[0]!.text:call.arguments[0]!.kind===ts.SyntaxKind.TrueKeyword;
      if(call.typeArguments?.length&&call.typeArguments[0]!.kind!==(typeof initial==='string'?ts.SyntaxKind.StringKeyword:ts.SyntaxKind.BooleanKeyword))fail(call,'useState type must match its literal initializer');
      if(typeof initial==='string'&&(initial.length>4000||/[\r\n\u0000-\u001f]/.test(initial)))fail(call,'string state must be bounded single-line text');
      states.push({id,initial,origin:statement});
    }
    const start=html.length;
    if (node === entry && hasRouterImport) {
      const router=readRoutes(unwrap(returned.expression),file,fail);initialPath=router.initialPath;
      declaredPaths = new Set(router.routes.map(r=>r.path));
      for (const route of router.routes) {
        const start=html.length;inRoute=true;currentPath=route.path;
        try { render(unwrap(route.element), [...stack,key],scope); } finally { inRoute=false;currentPath=undefined; }
        routeSpans.push({...route,start,end:html.length});
        dependencies.push({start,end:html.length,nodes:[route.origin]});
      }
    } else render(unwrap(returned.expression), [...stack,key],scope);
    if(origins.length)dependencies.push({start,end:html.length,nodes:origins});
  }
  // React constructs supplied children before calling a component, even if discarded.
  // Reuse the syntax-only lowering checks, then discard the temporary markup/evidence.
  // Work budgets are deliberately not restored. No application code is executed.
  function validateChildren(nodes:readonly ts.JsxChild[],stack:string[],scope:Scope){
    const savedHTML=html,savedSpans=spans.length,savedDependencies=dependencies.length,savedMappings=stateMappings.length,savedConditions=conditionMappings.length;
    try{html='';for(const child of nodes)render(child,stack,scope);}
    finally{html=savedHTML;spans.length=savedSpans;dependencies.length=savedDependencies;stateMappings.length=savedMappings;conditionMappings.length=savedConditions;}
  }
  function conditionalTree(expression:ts.Expression, stack:string[], scope:Scope):boolean {
    const node=unwrap(expression);
    let test:ts.Expression,yes:ts.Expression,no:ts.Expression|undefined;
    if(ts.isConditionalExpression(node)){test=node.condition;yes=node.whenTrue;no=node.whenFalse;}
    else if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken){test=node.left;yes=node.right;}
    else return false;
    if(textElementDepth)fail(node,'conditional view trees cannot appear inside text');
    test=unwrap(test);let negate=false;
    if(ts.isPrefixUnaryExpression(test)&&test.operator===ts.SyntaxKind.ExclamationToken){negate=true;test=unwrap(test.operand);}
    const value=binding(test,scope);
    if(!value||!('kind' in value)||value.kind!=='state'||typeof states.find(s=>s.id===value.id)?.initial!=='boolean')fail(test,'conditional views require a declared boolean state');
    const start=html.length;append('<div>');
    const branches=[yes,no].map(branch=>{
      if(!branch||unwrap(branch).kind===ts.SyntaxKind.NullKeyword)return null;
      const root=unwrap(branch);
      if(!ts.isJsxElement(root)&&!ts.isJsxSelfClosingElement(root))fail(root,'conditional branch requires one JSX element or null');
      const start=html.length;append('<div>');const contentStart=html.length;
      conditionalDepth++;try{render(root,stack,scope);}finally{conditionalDepth--;}
      // Intermediate wrappers must never hide unsupported inline sibling flow.
      const tag=/^<([a-z0-9]+)/.exec(html.slice(contentStart))?.[1];
      if(!tag||['span','strong'].includes(tag))fail(root,'conditional branch must have a block root, not inline text');
      append('</div>');return {start,end:html.length};
    });
    append('</div>');const end=html.length;
    if(negate)branches.reverse();
    conditionMappings.push({start,end,state:value.id,branches});
    spans.push({start,end,node});dependencies.push({start,end,nodes:[node,...value.origins]});return true;
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
      if(conditionalTree(node.expression,stack,scope))return;
      const slot=binding(unwrap(node.expression),scope);
      if(slot&&'kind' in slot&&slot.kind==='children'){for(const child of slot.nodes)render(child,slot.stack,slot.scope);return;}
      const value=literal(node.expression,scope);const start=html.length;
      const text=String(value.value);if(/[\u00a0\u2000-\u200b\u202f\u3000]/.test(text))fail(node,'special whitespace requires explicit layout support');
      append(escape(text));spans.push({start,end:html.length,node});dependencies.push({start,end:html.length,nodes:value.origins});return;
    }
    if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) fail(node, 'expected JSX element');
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const tag=opening.tagName.getText(file), isLink=hasRouterImport&&tag==='Link';
    if (/^[A-Z]/.test(tag) && scope.has(tag)) fail(node,'local binding shadows a router/component element');
    if (hasRouterImport && routerNames.includes(tag as typeof routerNames[number]) && !isLink) fail(node,'router containers are allowed only at the entry root');
    if (isLink && !inRoute) fail(node,'Link requires a mapped route');
    if((tag==='button'||isLink)&&textElementDepth>0)fail(node,'inline buttons or links inside text elements require explicit mixed-content layout');
    if (/^[A-Z]/.test(tag) && !isLink) {
      const props:Props=new Map();
      if(ts.isJsxElement(node)&&node.children.length)props.set('children',{kind:'children',nodes:node.children,scope,stack:[...stack],origins:[node]});
      for(const attr of opening.attributes.properties){
        if(!ts.isJsxAttribute(attr)||!ts.isIdentifier(attr.name))fail(attr,'spread/namespaced props are unsupported');
        const key=attr.name.getText(file);if(['key','ref','children'].includes(key)||props.has(key))fail(attr,'reserved or duplicate prop');
        const init=attr.initializer;if(!init)fail(attr,'boolean props are unsupported');
        const direct=ts.isJsxExpression(init)&&init.expression?binding(unwrap(init.expression),scope):undefined;
        if(direct&&'kind' in direct&&(direct.kind==='state'||direct.kind==='setter')){
          props.set(key,{...direct,origins:[attr,...direct.origins]});
        }else{
          const value=ts.isStringLiteral(init)?{value:jsxText(init.text,attr),origins:[attr]}:ts.isJsxExpression(init)&&init.expression?literal(init.expression,scope):fail(attr,'unsupported prop value');
          if(typeof value.value==='string'&&/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(value.value))fail(attr,'control characters and line separators are unsupported');
          props.set(key,value);
        }
      }
      const target=components.get(tag);if(!target)fail(node,`unresolved component ${tag}`);
      if(ts.isJsxElement(node))validateChildren(node.children,stack,scope);
      const start=html.length;component(target!,stack,props,props.size?[node,...[...props.values()].flatMap(v=>v.origins)]:[]);spans.push({start,end:html.length,node});return;
    }
    if (!isLink && !/^[a-z][a-z0-9]*$/.test(tag)) fail(node,'namespaced or member elements are unsupported');
    if (conditionalDepth && tag === 'details') fail(node,'disclosure lifecycle inside conditional views is not mapped');
    if (inRoute && tag === 'details') fail(node,'disclosure lifecycle inside routed screens is not mapped');
    if(tag==='input'){
      if(textElementDepth||!ts.isJsxSelfClosingElement(node))fail(node,'text input must be self-closing outside text content');
      const attrs=new Map<string,ts.JsxAttribute>();
      for(const attr of opening.attributes.properties){if(!ts.isJsxAttribute(attr))fail(attr,'input spreads are unsupported');const key=attr.name.getText(file);if(attrs.has(key)||!['type','aria-label','placeholder','value','onChange'].includes(key))fail(attr,'unsupported or duplicate input attribute');attrs.set(key,attr);}
      const stringAttr=(key:string)=>{const init=attrs.get(key)?.initializer;if(!init||!ts.isStringLiteral(init))fail(node,'input requires literal '+key);const value=jsxText(init.text,node);if(/[\u0000-\u001f]/.test(value))fail(node,'input labels and placeholders must be single-line');return value;};
      if(stringAttr('type')!=='text')fail(node,'only text input is supported');const label=stringAttr('aria-label');if(!label.trim())fail(node,'input requires an accessible label');
      const valueAttr=attrs.get('value')?.initializer,handler=attrs.get('onChange')?.initializer;
      if(!valueAttr||!ts.isJsxExpression(valueAttr)||!valueAttr.expression||!handler||!ts.isJsxExpression(handler)||!handler.expression)fail(node,'input needs controlled value and onChange');
      const state=binding(unwrap(valueAttr.expression),scope);if(!state||!('kind' in state)||state.kind!=='state'||typeof states.find(s=>s.id===state.id)?.initial!=='string')fail(node,'input value must reference string state');
      const fn=unwrap(handler.expression);if(!ts.isArrowFunction(fn)||fn.modifiers?.length||fn.typeParameters?.length||fn.parameters.length!==1||ts.isBlock(fn.body))fail(node,'input event requires a single expression callback');
      const param=fn.parameters[0]!;if(!ts.isIdentifier(param.name)||param.initializer||param.dotDotDotToken||param.questionToken||param.modifiers?.length)fail(node,'input event requires one plain identifier');
      const call=unwrap(fn.body);if(!ts.isCallExpression(call)||call.questionDotToken||call.typeArguments?.length||call.arguments.length!==1)fail(node,'input event requires one setter call');
      const setterExpression=unwrap(call.expression);
      if((ts.isIdentifier(setterExpression)&&setterExpression.text===param.name.text)||(ts.isPropertyAccessExpression(setterExpression)&&ts.isIdentifier(setterExpression.expression)&&setterExpression.expression.text===param.name.text))fail(node,'input event parameter shadows its setter');
      const setter=binding(call.expression,scope);if(!setter||!('kind' in setter)||setter.kind!=='setter'||setter.id!==state.id)fail(node,'input setter must update its bound state');
      const arg=unwrap(call.arguments[0]!);if(!ts.isPropertyAccessExpression(arg)||arg.questionDotToken||arg.name.text!=='value'||!ts.isPropertyAccessExpression(arg.expression)||arg.expression.questionDotToken||!['target','currentTarget'].includes(arg.expression.name.text)||!ts.isIdentifier(arg.expression.expression)||arg.expression.expression.text!==param.name.text)fail(node,'input setter must receive its event target value');
      const start=html.length;append('<p>'+escape(label)+'</p>');spans.push({start,end:html.length,node});stateMappings.push({start,end:html.length,stringBinding:state.id,input:true,placeholder:attrs.has('placeholder')?stringAttr('placeholder'):undefined,origins:[node,...state.origins,...setter.origins]});return;
    }
    let action:Mapping['action'], textBinding:Mapping['textBinding'], stringBinding:Mapping['stringBinding'];
    const stateOrigins:ts.Node[]=[];
    const visibleChildren=ts.isJsxElement(node)?node.children.filter(c=>!ts.isJsxText(c)||c.text.trim()):[];
    const conditional=visibleChildren.length===1&&ts.isJsxExpression(visibleChildren[0]!)?visibleChildren[0].expression:undefined;
    if(conditional&&['p','h1','h2','h3','span','strong'].includes(tag)){
      const value=binding(unwrap(conditional),scope);
      if(value&&'kind' in value&&value.kind==='state'&&typeof states.find(s=>s.id===value.id)?.initial==='string'){stringBinding=value.id;stateOrigins.push(...value.origins);}
    }
    if (conditional && ts.isConditionalExpression(unwrap(conditional)) && ['p','h1','h2','h3','span','strong'].includes(tag)) {
      if (!['p','h1','h2','h3','span','strong'].includes(tag)) fail(node, 'state text requires a dedicated text element');
      const expression=unwrap(conditional) as ts.ConditionalExpression;
      const state=binding(unwrap(expression.condition),scope);
      if (!state || !('kind' in state) || state.kind !== 'state' || typeof states.find(s=>s.id===state.id)?.initial!=='boolean') fail(expression, 'conditional text requires a supported boolean state');
      const yes=literal(expression.whenTrue,scope),no=literal(expression.whenFalse,scope);
      const values=[yes,no].map(v=>String(v.value));
      if(values.some(v=>v.trim()!==v||/\s{2}|[\u00a0\u2000-\u200b\u202f\u3000]/.test(v))) fail(expression,'state text must use normalized ordinary spaces');
      textBinding={state:state.id,whenTrue:values[0]!,whenFalse:values[1]!};
      stateOrigins.push(...state.origins,...yes.origins,...no.origins);
    }
    // Lower to a plain text element only as an intermediate representation. The exact
    // source span below must resolve back to one IR node before an action is attached.
    const loweredTag=tag==='button'||isLink?'p':tag;
    const start=html.length;append('<'+loweredTag);
    const attributes=new Set<string>();
    for(const attr of opening.attributes.properties) {
      if (!ts.isJsxAttribute(attr)) fail(attr,'spread attributes are unsupported');
      const key=attr.name.getText(file),value=attr.initializer;
      if(attributes.has(key))fail(attr,'duplicate attribute');attributes.add(key);
      if(isLink && key==='to') {
        if(!value || !ts.isStringLiteral(value) || !absoluteRoute(value.text)) fail(attr,'Link requires a canonical absolute literal destination');
        if(!declaredPaths.has(value.text)) fail(attr,'Link destination must match a declared route exactly');
        if(value.text===currentPath) fail(attr,'same-route Link replacement is not mapped');
        action={operation:'navigate',screen:value.text};stateOrigins.push(attr);
      } else if (isLink && key !== 'style') fail(attr,'Link supports only to and literal style; replace, state, reload and events are unsupported');
      else if(key==='onClick') {
        if(tag!=='button'||!value||!ts.isJsxExpression(value)||!value.expression)fail(attr,'events require a supported button action');
        const callback=unwrap(value.expression);
        if(!ts.isArrowFunction(callback)||callback.parameters.length||callback.modifiers?.length||callback.typeParameters?.length||callback.type||ts.isBlock(callback.body))fail(attr,'onClick must be a parameterless arrow containing one state setter');
        const call=unwrap(callback.body);
        if(!ts.isCallExpression(call)||call.questionDotToken||call.typeArguments?.length||call.arguments.length!==1)fail(attr,'event must contain exactly one state assignment');
        const setter=binding(call.expression,scope);
        if(!setter||!('kind' in setter)||setter.kind!=='setter')fail(attr,'unresolved state setter');
        const argument=unwrap(call.arguments[0]!);
        if(typeof states.find(s=>s.id===setter.id)?.initial==='string'){
          if(!ts.isStringLiteral(argument)||argument.text.length>4000||/[\u0000-\u001f]/.test(argument.text))fail(argument,'string assignment requires a bounded single-line literal');
          action={operation:'set',state:setter.id,value:argument.text};
        }else if([ts.SyntaxKind.TrueKeyword,ts.SyntaxKind.FalseKeyword].includes(argument.kind))action={operation:'set',state:setter.id,value:argument.kind===ts.SyntaxKind.TrueKeyword};
        else if(ts.isPrefixUnaryExpression(argument)&&argument.operator===ts.SyntaxKind.ExclamationToken){
          const value=binding(unwrap(argument.operand),scope);
          if(!value||!('kind' in value)||value.kind!=='state'||value.id!==setter.id)fail(argument,'toggle must reference its own boolean state');
          action={operation:'toggle',state:setter.id};
        }else if(ts.isArrowFunction(argument)){
          if(argument.modifiers?.length||argument.typeParameters?.length||argument.type||argument.parameters.length!==1||ts.isBlock(argument.body))fail(argument,'boolean updater requires one plain parameter and a negation expression');
          const parameter=argument.parameters[0]!;
          if(!ts.isIdentifier(parameter.name)||parameter.initializer||parameter.dotDotDotToken||parameter.questionToken||parameter.type||parameter.modifiers?.length)fail(parameter,'boolean updater parameter must be a plain identifier');
          const body=unwrap(argument.body);
          if(!ts.isPrefixUnaryExpression(body)||body.operator!==ts.SyntaxKind.ExclamationToken)fail(body,'boolean updater supports only negating its previous value');
          const operand=unwrap(body.operand);
          if(!ts.isIdentifier(operand)||operand.text!==parameter.name.text)fail(body,'boolean updater must reference its own parameter, not captured state');
          action={operation:'toggle',state:setter.id};
        }else fail(argument,'state action supports literal true/false, own-value negation or previous-value boolean negation');
        stateOrigins.push(attr,...setter.origins);
      } else if(key==='style') {
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
    if(tag==='button'&&(!action||visibleChildren.some(c=>!ts.isJsxText(c))))fail(node,'button requires one state action and a plain text label');
    if(isLink&&(!action||visibleChildren.some(c=>!ts.isJsxText(c))))fail(node,'Link requires one destination and a plain text label');
    append('>');
    if(stringBinding){append(escape(states.find(s=>s.id===stringBinding)!.initial as string));}
    else if(textBinding){const state=states.find(s=>s.id===textBinding.state)!;append(escape(state.initial?textBinding.whenTrue:textBinding.whenFalse));}
    else if(ts.isJsxElement(node)){
      const textElement=['p','h1','h2','h3','span','strong'].includes(tag);
      if(textElement)textElementDepth++;
      try{for(const child of node.children)render(child,stack,scope);}finally{if(textElement)textElementDepth--;}
    }
    append('</'+loweredTag+'>');
    spans.push({start,end:html.length,node});
    if(action||textBinding||stringBinding)stateMappings.push({start,end:html.length,action,textBinding,stringBinding,origins:stateOrigins});
  }
  component(entry,[]);
  const segments=routeSpans.length?routeSpans:[{id:'home',path:'/',start:0,end:html.length,origin:entry}];
  const converted=segments.map(segment=>{
    const ir=htmlToIR(html.slice(segment.start,segment.end),'intermediate.html',name);
    const prefix=routeSpans.length?segment.id+'-':'';
    const offset=Buffer.byteLength(html.slice(0,segment.start));
    for(const n of ir.nodes){n.id=prefix+n.id;n.children=n.children.map(c=>prefix+c);}
    for(const row of [...ir.nodes,...ir.requirements,...ir.limitations])for(const e of row.evidence){e.start+=offset;e.end+=offset;}
    for(const r of ir.requirements)r.id=prefix+r.id;
    ir.screens=[{id:segment.id,title:ir.screens[0]!.title,root:prefix+ir.screens[0]!.root}];
    return ir;
  });
  const ir=converted[0]!;
  for(const part of converted.slice(1)){ir.nodes.push(...part.nodes);ir.screens.push(...part.screens);ir.requirements.push(...part.requirements);ir.limitations.push(...part.limitations);}
  for(const mapping of stateMappings){
    const start=Buffer.byteLength(html.slice(0,mapping.start)),end=Buffer.byteLength(html.slice(0,mapping.end));
    const matches=ir.nodes.filter(n=>n.kind==='text'&&n.evidence.length===1&&n.evidence[0]!.start===start&&n.evidence[0]!.end===end);
    if(matches.length!==1)throw Error('State mapping has no unambiguous source element');
    const node=matches[0]!;
    if(mapping.action?.operation==='navigate') {
      const path=mapping.action.screen, destination=routeSpans.find(r=>r.path===path);
      if(!destination)throw Error('Unsupported React: Link destination must match a declared route exactly');
      node.kind='link';node.action={operation:'navigate',screen:destination.id};
    } else if(mapping.action){node.kind='button';node.action=mapping.action;}
    if(mapping.textBinding)node.textBinding=mapping.textBinding;
    if(mapping.stringBinding){node.stringBinding=mapping.stringBinding;if(mapping.input){node.kind='textfield';if(mapping.placeholder!==undefined)node.placeholder=mapping.placeholder;}else node.text=states.find(s=>s.id===mapping.stringBinding)!.initial as string;}
    dependencies.push({start:mapping.start,end:mapping.end,nodes:mapping.origins});
  }
  const intermediateNode=(range:{start:number;end:number})=>{
    const start=Buffer.byteLength(html.slice(0,range.start)),end=Buffer.byteLength(html.slice(0,range.end));
    const matches=ir.nodes.filter(n=>n.evidence.length===1&&n.evidence[0]!.start===start&&n.evidence[0]!.end===end);
    if(matches.length!==1)throw Error('Conditional mapping has no unambiguous source element');return matches[0]!;
  };
  for(const mapping of conditionMappings){
    const outer=intermediateNode(mapping);
    const children=mapping.branches.map(branch=>{
      if(!branch)return null;
      const wrapper=intermediateNode(branch);
      if(wrapper.kind!=='column'||wrapper.children.length!==1)throw Error('Conditional branch must expand to exactly one root');
      const root=wrapper.children[0]!;ir.nodes=ir.nodes.filter(n=>n.id!==wrapper.id);return root;
    });
    if(!children.some(Boolean))throw Error('Conditional branches cannot both be empty');
    outer.kind='conditional';outer.style={};outer.children=children.filter((id):id is string=>id!==null);
    outer.condition={state:mapping.state,whenTrue:children[0]!,whenFalse:children[1]!};
  }
  const origin=(start:number,end:number) => spans.filter(s=>Buffer.byteLength(html.slice(0,s.start))<=start&&Buffer.byteLength(html.slice(0,s.end))>=end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];
  for(const row of [...ir.nodes,...ir.requirements,...ir.limitations])row.evidence=row.evidence.flatMap(e=>{
    const span=origin(e.start,e.end);const node=span?.node??entry!;
    const deps=dependencies.filter(d=>Buffer.byteLength(html.slice(0,d.start))<=e.start&&Buffer.byteLength(html.slice(0,d.end))>=e.end).flatMap(d=>d.nodes);
    const nodes=[node,...deps];const seen=new Set<string>();
    return nodes.flatMap(n=>{const start=Buffer.byteLength(source.slice(0,n.getStart(file))),end=Buffer.byteLength(source.slice(0,n.end));const key=`${start}:${end}`;if(seen.has(key))return [];seen.add(key);return [{source:'source',start,end,certainty:'extracted' as const,...(!span?{note:'Synthetic root corresponds to the default component'}:{})}];});
  });
  if(states.length){
    ir.schemaVersion='1.1.0';
    ir.states=states.map(s=>({id:s.id,initial:s.initial,evidence:[{source:'source',start:Buffer.byteLength(source.slice(0,s.origin.getStart(file))),end:Buffer.byteLength(source.slice(0,s.origin.end)),certainty:'extracted'}]}));
    ir.requirements.push({id:'local-boolean-state',area:'state',status:'extracted',description:states.some(s=>typeof s.initial==='string')?'Entry-owned boolean/string state, controlled text fields and direct text bindings. No form submission, effects, persistence or async events.':'Entry-component boolean state, literal text branches and single-step button transitions. No effects, persistence or async events.',evidence:ir.states.flatMap(s=>s.evidence)});
  }
  if(routeSpans.length){
    ir.schemaVersion='1.2.0';ir.navigation={initialScreen:routeSpans.find(r=>r.path===initialPath)!.id,routes:routeSpans.map(r=>({screen:r.id,path:r.path}))};
    ir.requirements.push({id:'native-route-stack',area:'navigation',status:'inferred',description:'Explicit MemoryRouter routes and Link pushes become a native stack with a platform Back control. No browser URL, forward history, scroll restoration or deep-link synchronization.',evidence:[{source:'source',start:Buffer.byteLength(source.slice(0,entry.getStart(file))),end:Buffer.byteLength(source.slice(0,entry.end)),certainty:'inferred',note:'Native Back navigation substitutes for router-history back; exact web navigation chrome and scroll restoration are not inferred.'}]});
  }
  if(conditionMappings.length)ir.schemaVersion='1.3.0';
  if(states.some(s=>typeof s.initial==='string'))ir.schemaVersion='1.4.0';
  ir.sources=[{id:'source',path:sourcePath,sha256:sha256(source),bytes:Buffer.byteLength(source),adapter:states.some(s=>typeof s.initial==='string')?'react-controlled-text@1':conditionMappings.length?'react-conditional-views@1':routeSpans.length?'react-memory-router@1':states.length?'react-boolean-state@1':'react-static@1'}];
  return AppIRSchema.parse(ir);
}
