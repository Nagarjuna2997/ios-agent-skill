// Recognize a closed set of AST shapes. Imported callbacks are never evaluated.
import ts from 'typescript';
import type { AppIR } from './schema.js';
type Collection = NonNullable<AppIR['collections']>[number];
type Fail = (node: ts.Node, reason: string) => never;
const isID = (n: ts.Node | undefined, name: string) => !!n && ts.isIdentifier(n) && n.text === name;
const prop = (n: ts.Expression, variable: string, field: string) =>
  ts.isPropertyAccessExpression(n) && !n.questionDotToken && isID(n.expression, variable) && n.name.text === field;
function argument(fn: ts.ArrowFunction, fail: Fail) {
  const p = fn.parameters[0];
  if (fn.modifiers?.length || fn.typeParameters || fn.parameters.length !== 1 || !p || !ts.isIdentifier(p.name) ||
      p.modifiers?.length || p.initializer || p.questionToken || p.dotDotDotToken) fail(fn, 'expected a single plain callback parameter');
  return p.name.text;
}
export function methodCall(expr: ts.Expression, method: string) {
  if (!ts.isCallExpression(expr) || expr.questionDotToken || expr.typeArguments || expr.arguments.length !== 1 ||
      !ts.isPropertyAccessExpression(expr.expression) || expr.expression.questionDotToken || expr.expression.name.text !== method) return;
  const callback = expr.arguments[0]!;
  return {receiver:expr.expression.expression,callback};
}
export function parseRecords(node: ts.ArrayLiteralExpression, fail: Fail): Pick<Collection,'fields'|'rows'> {
  if (!node.elements.length || node.elements.length > 100) fail(node,'record state needs 1–100 literal records');
  const ids = new Set<string>();
  let fields: string[] | undefined;
  const rows = node.elements.map(item=>{
    if(!ts.isObjectLiteralExpression(item))fail(item,'record values must be literal objects');
    const values: Record<string,string> = Object.create(null);
    for(const p of item.properties) {
      if(!ts.isPropertyAssignment(p)||!ts.isIdentifier(p.name)||!ts.isStringLiteral(p.initializer))fail(p,'record fields require identifier keys and string literals');
      const field=p.name.text, value=p.initializer.text;
      if(!/^[a-z][A-Za-z0-9]{0,39}$/.test(field)||field==='constructor'||Object.hasOwn(values,field))fail(p,'duplicate or unsupported record field');
      if(value.length > 4000 || /[\u0000-\u001f\u007f]/.test(value))fail(p,'record values must be bounded single-line text');
      values[field]=value;
    }
    const id=values.id;
    if(!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)||ids.has(id))fail(item,'each record needs a unique URL-safe string id');
    ids.add(id);delete values.id;
    const keys=Object.keys(values).sort();
    if(!keys.length||keys.length>16||fields&&JSON.stringify(fields)!==JSON.stringify(keys))fail(item,'records must have the same 1–16 string fields');
    fields=keys;
    return {id,values};
  });
  return {fields:fields!,rows};
}
export function listTemplate(callback: ts.Expression, fail: Fail) {
  if(!ts.isArrowFunction(callback))fail(callback,'list map needs an arrow returning a keyed Link');
  const item=argument(callback,fail);
  let body=callback.body;
  while(ts.isParenthesizedExpression(body))body=body.expression;
  if(!ts.isJsxElement(body)||body.openingElement.tagName.getText()!=='Link'||body.closingElement.tagName.getText()!=='Link')fail(body,'list map must return one keyed Link');
  const attrs=new Map<string,ts.Expression>();
  for(const a of body.openingElement.attributes.properties) {
    if(!ts.isJsxAttribute(a)||!ts.isIdentifier(a.name)||!a.initializer||!ts.isJsxExpression(a.initializer)||!a.initializer.expression||attrs.has(a.name.text))fail(a,'invalid keyed Link attribute');
    attrs.set(a.name.text,a.initializer.expression);
  }
  const key=attrs.get('key'),to=attrs.get('to');
  if(attrs.size!==2||!key||!prop(key,item,'id')||!to||!ts.isTemplateExpression(to)||to.templateSpans.length!==1||
     !prop(to.templateSpans[0]!.expression,item,'id')||to.templateSpans[0]!.literal.text||!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(to.head.text))fail(body,'key and path must use the same stable record id');
  const children=body.children.filter(c=>!ts.isJsxText(c)||c.text.trim());
  const child=children[0];
  if(children.length!==1||!child||!ts.isJsxExpression(child)||!child.expression||!ts.isPropertyAccessExpression(child.expression)||
     child.expression.questionDotToken||!isID(child.expression.expression,item))fail(body,'record link requires one field as its label');
  return {prefix:to.head.text, field:child.expression.name.text};
}
export function lookupParam(callback: ts.Expression, fail: Fail) {
  if(!ts.isArrowFunction(callback))fail(callback,'record lookup must compare a record id with the route parameter');
  const item=argument(callback,fail), b=callback.body;
  if(!ts.isBinaryExpression(b)||b.operatorToken.kind!==ts.SyntaxKind.EqualsEqualsEqualsToken||
     !prop(b.left,item,'id')||!ts.isIdentifier(b.right)||b.right.text===item)fail(callback,'record lookup requires row.id === routeParameter');
  return b.right.text;
}
export function recordUpdate(expr: ts.Expression, field: string, param: string, fail: Fail) {
  if(!ts.isArrowFunction(expr))fail(expr,'record input requires an onChange callback');
  const event=argument(expr,fail), call=expr.body;
  if(!ts.isCallExpression(call)||call.questionDotToken||call.typeArguments||call.arguments.length!==1||!ts.isIdentifier(call.expression))fail(expr,'record input requires one collection setter');
  const mapped=methodCall(call.arguments[0]!,'map');
  if(!mapped||!ts.isArrowFunction(mapped.callback)||!ts.isIdentifier(mapped.receiver))fail(call,'record input must update its collection by id');
  const item=argument(mapped.callback,fail), b=mapped.callback.body;
  if(new Set([item,event,param,mapped.receiver.text,call.expression.text]).size!==5)fail(call,'shadowed record update binding');
  if(!ts.isConditionalExpression(b)||!ts.isBinaryExpression(b.condition)||b.condition.operatorToken.kind!==ts.SyntaxKind.EqualsEqualsEqualsToken||
     !prop(b.condition.left,item,'id')||!isID(b.condition.right,param)||!isID(b.whenFalse,item)||!ts.isObjectLiteralExpression(b.whenTrue)||b.whenTrue.properties.length!==2)
    fail(call,'record update must leave all other ids unchanged');
  const [spread,change]=b.whenTrue.properties;
  if(!spread||!ts.isSpreadAssignment(spread)||!isID(spread.expression,item)||!change||!ts.isPropertyAssignment(change)||!isID(change.name,field))fail(call,'record update must preserve other fields and assign the bound field only');
  const val=change.initializer;
  if(!ts.isPropertyAccessExpression(val)||val.questionDotToken||val.name.text!=='value'||
     !['target','currentTarget'].some(k=>prop(val.expression,event,k)))fail(val,'record update must assign the event target value');
  return {collection:mapped.receiver.text,setter:call.expression.text};
}
