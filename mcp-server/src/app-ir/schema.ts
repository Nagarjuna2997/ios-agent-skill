import { z } from 'zod';
import { createHash } from 'node:crypto';

const id = z.string().regex(/^[a-z][a-z0-9-]{0,79}$/);
const text = z.string().max(4000);
const path = z.string().min(1).max(300).refine(s => !s.startsWith('/') && !s.includes('\\') && !s.split('/').some(p => !p || p === '.' || p === '..'), 'Use a relative source path');
export const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const evidence = z.object({ source: id, start: z.number().int().nonnegative(), end: z.number().int().nonnegative(), certainty: z.enum(['extracted', 'inferred']), note: text.optional() }).strict().refine(e => e.end >= e.start, 'Invalid source range');
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const StyleSchema = z.object({
  foreground: color.optional(), background: color.optional(),
  padding: z.number().min(0).max(100).optional(), gap: z.number().min(0).max(100).optional(),
  fontSize: z.number().min(10).max(80).optional(), bold: z.boolean().optional(),
  radius: z.number().min(0).max(100).optional(), centered: z.boolean().optional(),
}).strict();
export const AppIRSchema = z.object({
  schemaVersion: z.enum(['1.0.0', '1.1.0', '1.2.0', '1.3.0', '1.4.0']),
  mode: z.enum(['faithful', 'creative']),
  name: z.string().regex(/^[A-Z][A-Za-z0-9]{0,39}$/),
  sources: z.array(z.object({ id, path, sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().min(0).max(262144), adapter: z.string().min(1).max(80) }).strict()).min(1).max(100),
  screens: z.array(z.object({ id, title: z.string().min(1).max(80), root: id }).strict()).min(1).max(30),
  navigation: z.object({ initialScreen: id, routes: z.array(z.object({ screen: id, path: z.string().max(200).regex(/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/) }).strict()).min(1).max(30) }).strict().optional(),
  states: z.array(z.object({ id, initial: z.union([z.boolean(),text]), evidence: z.array(evidence).min(1).max(20) }).strict()).max(16).optional(),
  nodes: z.array(z.object({ id, kind: z.enum(['column', 'text', 'disclosure', 'button', 'link', 'conditional', 'textfield']), text: text.optional(),
    stringBinding: id.optional(), placeholder: text.optional(),
    condition: z.object({state:id, whenTrue:id.nullable(), whenFalse:id.nullable()}).strict().optional(),
    textBinding: z.object({ state: id, whenTrue: text, whenFalse: text }).strict().optional(),
    action: z.discriminatedUnion('operation', [
      z.object({ operation: z.literal('toggle'), state: id }).strict(),
      z.object({ operation: z.literal('set'), state: id, value: z.boolean() }).strict(),
      z.object({ operation: z.literal('navigate'), screen: id }).strict(),
    ]).optional(),
    children: z.array(id).max(200), style: StyleSchema, evidence: z.array(evidence).min(1).max(20) }).strict()).min(1).max(500),
  requirements: z.array(z.object({ id, area: z.enum(['navigation','assets','motion','state','data','api','auth','native','accessibility','responsive','appearance']), status: z.enum(['extracted','inferred','unknown']), description: text, evidence: z.array(evidence).max(20) }).strict()).max(200),
  limitations: z.array(z.object({ code: id, message: text, evidence: z.array(evidence).max(20) }).strict()).max(500),
}).strict().superRefine((ir, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  for (const [label, rows] of [['source',ir.sources],['screen',ir.screens],['node',ir.nodes],['requirement',ir.requirements]] as const) {
    if (new Set(rows.map(r => r.id)).size !== rows.length) fail(`Duplicate ${label} ID`);
  }
  const sources = new Map(ir.sources.map(s => [s.id,s]));
  const states = new Map((ir.states ?? []).map(s => [s.id,s]));
  if (states.size !== (ir.states ?? []).length) fail('Duplicate state ID');
  if (!['1.2.0','1.3.0','1.4.0'].includes(ir.schemaVersion) && (ir.navigation || ir.nodes.some(n => n.kind === 'link' || n.action?.operation === 'navigate'))) fail('Navigation requires schema 1.2.0');
  const screens = new Set(ir.screens.map(s => s.id));
  if (ir.navigation) {
    if (!screens.has(ir.navigation.initialScreen)) fail('Missing initial screen');
    if (new Set(ir.navigation.routes.map(r => r.path)).size !== ir.navigation.routes.length) fail('Duplicate route path');
    if (new Set(ir.navigation.routes.map(r => r.screen)).size !== screens.size || ir.navigation.routes.length !== screens.size || ir.navigation.routes.some(r => !screens.has(r.screen))) fail('Every screen needs exactly one route');
  }
  if (ir.schemaVersion === '1.0.0' && (ir.states !== undefined || ir.nodes.some(n => n.action || n.textBinding || n.kind === 'button'))) fail('State and event mappings require schema 1.1.0');
  if(ir.schemaVersion!=='1.4.0' && ((ir.states??[]).some(s=>typeof s.initial==='string')||ir.nodes.some(n=>n.stringBinding||n.placeholder!==undefined||n.kind==='textfield')))fail('String state requires schema 1.4.0');
  for (const row of [...ir.nodes, ...ir.requirements, ...ir.limitations, ...(ir.states ?? [])]) for (const e of row.evidence) {
    const source = sources.get(e.source);
    if (!source || e.end > source.bytes) fail(`Evidence outside source: ${e.source}`);
    if (e.certainty === 'inferred' && !e.note) fail('Inferences require an explanation');
  }
  for(const state of ir.states??[])if(typeof state.initial==='string'&&/[\r\n\u0000-\u001f]/.test(state.initial))fail('String state must be single-line text');
  const nodes = new Map(ir.nodes.map(n => [n.id,n]));
  const reached = new Set<string>();
  const visit = (key: string, ancestors: Set<string>, depth: number) => {
    if (depth > 50) { fail('Hierarchy exceeds 50 levels'); return; }
    if (ancestors.has(key)) { fail(`Cycle at ${key}`); return; }
    if (reached.has(key)) { fail(`Node has multiple parents: ${key}`); return; }
    const node = nodes.get(key);
    if (!node) { fail(`Missing node ${key}`); return; }
    reached.add(key);
    if(node.kind === 'conditional') {
      const c=node.condition;
      if(!['1.3.0','1.4.0'].includes(ir.schemaVersion) || !c || typeof states.get(c.state)?.initial!=='boolean' || (!c.whenTrue && !c.whenFalse) || node.text !== undefined || node.textBinding || node.action || Object.keys(node.style).length) fail(`Invalid conditional ${key}`);
      if(c && JSON.stringify(node.children)!==JSON.stringify([c.whenTrue,c.whenFalse].filter(Boolean))) fail(`Conditional branch mismatch ${key}`);
    } else if(node.condition) fail(`Condition on nonconditional node ${key}`);
    if(node.kind === 'disclosure' && [...ancestors].some(id=>nodes.get(id)?.kind==='conditional')) fail('Disclosure lifecycle inside conditional views is not mapped');
    if (node.kind === 'text' && (node.children.length || node.text === undefined)) fail(`Invalid text node ${key}`);
    if (['button','link'].includes(node.kind) && (!node.text?.trim() || node.children.length || !node.action || node.textBinding)) fail(`Invalid control node ${key}`);
    if (node.action?.operation === 'navigate') {
      if (node.kind !== 'link' || !ir.navigation || !screens.has(node.action.screen)) fail(`Invalid navigation ${key}`);
    } else if (node.action && (node.kind !== 'button' || typeof states.get(node.action.state)?.initial!=='boolean')) fail(`Invalid action ${key}`);
    if (node.kind === 'link' && node.action?.operation !== 'navigate') fail(`Invalid link ${key}`);
    if (node.textBinding) {
      const state = states.get(node.textBinding.state);
      if (node.kind !== 'text' || !state || typeof state.initial!=='boolean' || node.text !== (state.initial ? node.textBinding.whenTrue : node.textBinding.whenFalse)) fail(`Invalid text binding ${key}`);
    }
    if(node.stringBinding){
      const state=states.get(node.stringBinding);
      if(typeof state?.initial!=='string'||!['text','textfield'].includes(node.kind)||node.children.length||node.action||node.textBinding)fail(`Invalid string binding ${key}`);
      if(node.kind==='text'&&node.text!==state?.initial)fail(`String default mismatch ${key}`);
    }
    if(node.kind==='textfield'&&(!node.stringBinding||!node.text?.trim()||node.children.length||node.action||node.textBinding))fail(`Invalid text field ${key}`);
    if(node.placeholder!==undefined&&node.kind!=='textfield')fail(`Placeholder on non-input ${key}`);
    if (node.kind === 'disclosure' && !node.text) fail(`Missing disclosure label ${key}`);
    const next = new Set([...ancestors,key]);
    for (const child of node.children) visit(child,next,depth+1);
  };
  for (const screen of ir.screens) visit(screen.root,new Set(),0);
  if (reached.size !== nodes.size) fail('Unreachable nodes');
});
export type AppIR = z.infer<typeof AppIRSchema>;
export function parseIR(value: unknown): AppIR { return AppIRSchema.parse(value); }
