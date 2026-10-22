// A syntax contract for a deliberately bounded react-router-dom MemoryRouter.
// No router package or imported application code is loaded.
import ts from 'typescript';

export const routerNames = ['MemoryRouter', 'Routes', 'Route', 'Link'] as const;
type Fail = (node: ts.Node, reason: string) => never;
export const absoluteRoute = (s: string) => s.length <= 200 && /^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/.test(s);
export function readRoutes(node: ts.Expression, file: ts.SourceFile, fail: Fail) {
  const attributes = (node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, allowed: string[]) => {
    const result = new Map<string, ts.JsxAttribute>();
    for (const attr of node.attributes.properties) {
      if (!ts.isJsxAttribute(attr) || !ts.isIdentifier(attr.name) || !allowed.includes(attr.name.text) || result.has(attr.name.text)) fail(attr, 'unsupported or duplicate router attribute');
      result.set(attr.name.getText(file), attr);
    }
    return result;
  };
  const children = (node: ts.JsxElement) => node.children.filter(n => !ts.isJsxText(n) || n.text.trim());
  if (!ts.isJsxElement(node) || node.openingElement.tagName.getText(file) !== 'MemoryRouter') fail(node, 'routed entry must return MemoryRouter directly');
  const initial = attributes(node.openingElement, ['initialEntries']).get('initialEntries')?.initializer;
  if (!initial || !ts.isJsxExpression(initial) || !initial.expression || !ts.isArrayLiteralExpression(initial.expression) || initial.expression.elements.length !== 1 || !ts.isStringLiteral(initial.expression.elements[0]!)) fail(node, 'MemoryRouter requires one literal initialEntries path');
  const initialPath = initial.expression.elements[0]!.text;
  if (!absoluteRoute(initialPath)) fail(initial, 'initial route must be a canonical absolute path');
  const roots = children(node), routesNode = roots[0];
  if (roots.length !== 1 || !routesNode || !ts.isJsxElement(routesNode) || routesNode.openingElement.tagName.getText(file) !== 'Routes') fail(node, 'MemoryRouter requires a single Routes child');
  attributes(routesNode.openingElement, []);
  const routes = children(routesNode).map((route, index) => {
    if (!ts.isJsxSelfClosingElement(route) || route.tagName.getText(file) !== 'Route') fail(route, 'only flat self-closing Route declarations are supported');
    const attrs = attributes(route, ['path','element']);
    const path = attrs.get('path')?.initializer, element = attrs.get('element')?.initializer;
    if (!path || !ts.isStringLiteral(path) || !absoluteRoute(path.text)) fail(route, 'route path must be a canonical absolute literal without parameters, query or fragment');
    if (!element || !ts.isJsxExpression(element) || !element.expression) fail(route, 'route element requires explicit JSX');
    return {id:`screen-${index + 1}`, path:path.text, element:element.expression, origin:route};
  });
  if (!routes.length || routes.length > 30) fail(node, 'route count must be between 1 and 30');
  // React Router is case-insensitive by default. Reject aliases rather than diverge.
  if (new Set(routes.map(r => r.path.toLowerCase())).size !== routes.length) fail(node, 'duplicate or case-ambiguous routes');
  if (!routes.some(r => r.path === initialPath)) fail(node, 'initial path must match a declared route exactly');
  return {initialPath,routes};
}
