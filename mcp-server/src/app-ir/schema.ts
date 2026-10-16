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
  schemaVersion: z.literal('1.0.0'),
  mode: z.enum(['faithful', 'creative']),
  name: z.string().regex(/^[A-Z][A-Za-z0-9]{0,39}$/),
  sources: z.array(z.object({ id, path, sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().min(0).max(262144), adapter: z.string().min(1).max(80) }).strict()).min(1).max(100),
  screens: z.array(z.object({ id, title: z.string().min(1).max(80), root: id }).strict()).min(1).max(30),
  nodes: z.array(z.object({ id, kind: z.enum(['column', 'text', 'disclosure']), text: text.optional(), children: z.array(id).max(200), style: StyleSchema, evidence: z.array(evidence).min(1).max(20) }).strict()).min(1).max(500),
  requirements: z.array(z.object({ id, area: z.enum(['navigation','assets','motion','state','data','api','auth','native','accessibility','responsive','appearance']), status: z.enum(['extracted','inferred','unknown']), description: text, evidence: z.array(evidence).max(20) }).strict()).max(200),
  limitations: z.array(z.object({ code: id, message: text, evidence: z.array(evidence).max(20) }).strict()).max(500),
}).strict().superRefine((ir, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  for (const [label, rows] of [['source',ir.sources],['screen',ir.screens],['node',ir.nodes],['requirement',ir.requirements]] as const) {
    if (new Set(rows.map(r => r.id)).size !== rows.length) fail(`Duplicate ${label} ID`);
  }
  const sources = new Map(ir.sources.map(s => [s.id,s]));
  for (const row of [...ir.nodes, ...ir.requirements, ...ir.limitations]) for (const e of row.evidence) {
    const source = sources.get(e.source);
    if (!source || e.end > source.bytes) fail(`Evidence outside source: ${e.source}`);
    if (e.certainty === 'inferred' && !e.note) fail('Inferences require an explanation');
  }
  const nodes = new Map(ir.nodes.map(n => [n.id,n]));
  const reached = new Set<string>();
  const visit = (key: string, ancestors: Set<string>, depth: number) => {
    if (depth > 50) { fail('Hierarchy exceeds 50 levels'); return; }
    if (ancestors.has(key)) { fail(`Cycle at ${key}`); return; }
    if (reached.has(key)) { fail(`Node has multiple parents: ${key}`); return; }
    const node = nodes.get(key);
    if (!node) { fail(`Missing node ${key}`); return; }
    reached.add(key);
    if (node.kind === 'text' && (node.children.length || node.text === undefined)) fail(`Invalid text node ${key}`);
    if (node.kind === 'disclosure' && !node.text) fail(`Missing disclosure label ${key}`);
    const next = new Set([...ancestors,key]);
    for (const child of node.children) visit(child,next,depth+1);
  };
  for (const screen of ir.screens) visit(screen.root,new Set(),0);
  if (reached.size !== nodes.size) fail('Unreachable nodes');
});
export type AppIR = z.infer<typeof AppIRSchema>;
export function parseIR(value: unknown): AppIR { return AppIRSchema.parse(value); }
