import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import type { Installation } from './discovery.js';

const exec = promisify(execFile);
const target = 'arm64-apple-ios17.0-simulator';
export const sdkDiffOptions = z.object({
  framework: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,79}$/),
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
  offset: z.number().int().nonnegative().default(0),
}).strict();

const graphSchema = z.object({
  module: z.object({ name: z.string() }),
  symbols: z.array(z.object({
    identifier: z.object({ precise: z.string() }),
    pathComponents: z.array(z.string()).min(1),
    declarationFragments: z.array(z.object({ spelling: z.string() })).optional(),
    availability: z.array(z.record(z.unknown())).optional(),
  })),
});

function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => JSON.stringify(key) + ':' + canonical(entry)).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function parseGraph(input: unknown, framework: string) {
  const graph = graphSchema.parse(input);
  if (graph.module.name !== framework) throw Error('Unexpected extracted module');
  return new Map(graph.symbols.map(s => [s.identifier.precise, {
    path: s.pathComponents.join('.'),
    token: s.pathComponents.at(-1)!.split('(')[0],
    signature: s.declarationFragments?.map(f => f.spelling).join('') ?? null,
    availability: (s.availability ?? []).map(canonical).sort(),
  }]));
}

export async function extractGraph(xcode: Installation, framework: string) {
  const env = { ...process.env, DEVELOPER_DIR: xcode.developer };
  // Use identical target, visibility and extraction flags for both captures.
  const sdkArgs = ['--sdk', 'iphonesimulator'];
  const sdk = (await exec('/usr/bin/xcrun', [...sdkArgs, '--show-sdk-path'], { env, timeout: 20_000 })).stdout.trim();
  const sdkVersion = (await exec('/usr/bin/xcrun', [...sdkArgs, '--show-sdk-version'], { env, timeout: 20_000 })).stdout.trim();
  const dir = await mkdtemp(join(tmpdir(), 'ios-agent-symbols-'));
  try {
    await exec('/usr/bin/xcrun', ['swift-symbolgraph-extract', '-module-name', framework, '-sdk', sdk,
      '-target', target, '-minimum-access-level', 'public', '-skip-synthesized-members',
      '-module-cache-path', join(dir, 'cache'), '-output-dir', dir], { env, timeout: 150_000, maxBuffer: 1_000_000 });
    const graphPath = join(dir, framework + '.symbols.json');
    if ((await stat(graphPath)).size > 64 * 1024 * 1024) throw Error('Graph exceeds 64 MiB');
    const raw = await readFile(graphPath);
    return { symbols: parseGraph(JSON.parse(raw.toString('utf8')), framework), provenance: {
      xcode: xcode.version, installation: xcode.name, sdk: sdkVersion, target,
      sha256: createHash('sha256').update(raw).digest('hex'),
    }};
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export function compareGraphs(before: ReturnType<typeof parseGraph>, after: ReturnType<typeof parseGraph>,
                              offset: number, examples: (token: string) => string[]) {
  const changes = [];
  const totals = { added: 0, removed: 0, changed: 0 };
  for (const id of [...new Set([...before.keys(), ...after.keys()])].sort()) {
    const old = before.get(id), current = after.get(id);
    const change = !old ? 'added' : !current ? 'removed' : 'changed';
    if (old && current && old.path === current.path && old.signature === current.signature &&
        canonical(old.availability) === canonical(current.availability)) continue;
    const pos = totals.added + totals.removed + totals.changed;
    totals[change]++;
    if (pos < offset || pos >= offset + 24) continue;
    const tokens = [...new Set([old?.token, current?.token].filter((v): v is string => !!v))];
    changes.push({ change, id, path: (current ?? old)!.path,
      before: old ? { declaration:old.signature, availability:old.availability.map(s=>JSON.parse(s)) } : null,
      after: current ? { declaration:current.signature, availability:current.availability.map(s=>JSON.parse(s)) } : null,
      exampleCandidates: [...new Set(tokens.flatMap(examples))].slice(0, 5),
    });
  }
  const total = totals.added + totals.removed + totals.changed;
  return { totals, changes, nextOffset: offset + changes.length < total ? offset + changes.length : null };
}

export async function diffSDKs(installations: Installation[], input: unknown) {
  const { framework, from, to, offset } = sdkDiffOptions.parse(input);
  const find = (name: string) => installations.filter(i => i.name === name);
  const left = find(from), right = find(to);
  if (from === to || left.length !== 1 || right.length !== 1)
    return { status: 'needs_distinct_installations', available: installations.map(i => i.name) };
  try {
    const a = await extractGraph(left[0], framework);
    const b = await extractGraph(right[0], framework);
    const { exampleMatcher } = await import('../knowledge.js');
    return { status:'compared', framework, from:a.provenance, to:b.provenance,
      ...compareGraphs(a.symbols,b.symbols,offset,exampleMatcher(framework)),
      scope:'Primary public symbol graph for this simulator target. Extension graphs in other modules are excluded. Example candidates are textual references, not compiler-verified breakage.' };
  } catch (e) {
    return { status:'unavailable', framework, reason:'SDK symbol extraction or comparison failed',
      diagnostic:(e instanceof Error ? e.message : String(e)).trim().split('\n').at(-1)?.slice(0, 500) };
  }
}
