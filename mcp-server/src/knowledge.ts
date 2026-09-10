import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { VERSION } from './version.js';

type Topic = { title: string; links: { title: string; url: string }[] };
type Technology = { name: string; slug: string; url: string; summary: string; categories: string[];
  guide: string; topics: Topic[]; platforms: unknown[]; deprecated: boolean };
type Update = { title: string; url: string; summary: string; topics: { title: string; url: string; section: string }[] };
type Bundle = { catalog: { checkedAt: string; technologies: Technology[] }; updates: { checkedAt: string; entries: Update[] };
  guides: Record<string, string>; iconGuide: string; appWorkflow: string };
const bundle = JSON.parse(readFileSync(new URL('../data/knowledge.json', import.meta.url), 'utf8')) as Bundle;
const hints = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const result = (value: object) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value) }] });
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function searchTechnologies(query: string, limit: number) {
  const q = query.toLowerCase();
  return bundle.catalog.technologies.map(t => ({ t, score: normalize(t.name) === normalize(query) ? 100 :
    t.name.toLowerCase().includes(q) ? 50 : (t.summary + ' ' + t.categories.join(' ')).toLowerCase().includes(q) ? 10 : 0 }))
    .filter(r => r.score > 0).sort((a,b) => b.score-a.score || a.t.name.localeCompare(b.t.name))
    .slice(0,limit).map(({t}) => ({ name:t.name, id:t.slug, url:t.url, summary:t.summary, categories:t.categories }));
}
export function lookupTechnology(id: string) {
  const t = bundle.catalog.technologies.find(t => t.slug === id || normalize(t.name) === normalize(id));
  if (!t) return { error: 'Technology not found. Use search_apple_technologies first.' };
  return { ...t, checkedAt: bundle.catalog.checkedAt, guideText: bundle.guides[t.guide],
    evidence: 'Source snapshot and authored/reference guidance; not proof of runtime or compilation.' };
}
export function lookupUpdates(query: string, limit: number) {
  const q = query.toLowerCase();
  return { checkedAt:bundle.updates.checkedAt, results:bundle.updates.entries.filter(r =>
    !q || r.title.toLowerCase().includes(q) || r.topics.some(t => t.title.toLowerCase().includes(q))).slice(0,limit),
    evidence:'Dated landing-page topic maps. Open version-specific Apple links for exact changes and current known issues.' };
}
export function validAppName(name: string) {
  return /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(name) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name);
}
export function appPlan(name: string, brief: string) {
  if (!validAppName(name)) throw new Error('Use a Swift-safe app name.');
  return { name, brief, status:'Implementation brief, not an app already built',
    scaffold: { executable:'npx', args:['-y','@nagarjuna2002/ios-agent@0.2.0','new',name,'--brief',brief,'--xcodegen'] },
    phases: ['Turn the brief into screens, user flows, data models, and acceptance criteria.',
      'Use scaffold executable/args as an argument array; never interpolate the brief into a shell command.',
      'Implement the app with injected services, preview data, persistent state and explicit errors.',
      'Create separate Icon Composer SVG layers and import them as groups.',
      'Generate the Xcode project from App/project.yml, then build and test with the installed SDK.',
      'Inspect simulator screens and accessibility; iterate until the requested flows pass.'],
    workflow:bundle.appWorkflow };
}
export function iconPlan(appName: string, concept: string) {
  return { appName, concept, status:'Layer specification; import and verify in Icon Composer',
    background: { kind:'native fill', note:'Choose a solid color or gradient in Icon Composer; keep imported backgrounds full-bleed and opaque.' },
    groups:[{order:1,name:'01-base',purpose:'Large supporting silhouette',file:'01-base.svg'},
      {order:2,name:'02-symbol',purpose:'Recognizable primary app symbol',file:'02-symbol.svg'},
      {order:3,name:'03-accent',purpose:'Small distinguishing detail',file:'03-accent.svg'}],
    checks:['Separate editable SVG/PNG layers on a shared canvas','Maximum four foreground groups',
      'No baked-in system highlights, shadows, or icon corner mask','Preview Default, Dark, and Mono appearances',
      'Save and reopen the .icon document in Icon Composer; verify Xcode target assignment'],
    guidance:bundle.iconGuide };
}
export function createKnowledgeServer() {
  const server = new McpServer({ name:'ios-agent-knowledge', version:VERSION }, { instructions:
    'Look up Apple technologies and updates before implementation. This server reads only bundled public reference data; it cannot access local projects, write files, build, or publish apps. Use a local coding agent and CLI for implementation.' });
  server.registerTool('search_apple_technologies', { title:'Search Apple technologies', description:'Find Apple frameworks, tools, services and legacy technologies in the bundled 405-entry source snapshot.',
    inputSchema:{query:z.string().min(1).max(200),limit:z.number().int().min(1).max(30).default(10)}, annotations:hints },
    async ({query,limit}) => result({checkedAt:bundle.catalog.checkedAt,results:searchTechnologies(query,limit)}));
  server.registerTool('get_apple_technology', {title:'Read Apple technology guide',description:'Read a catalog technology, its local engineering guide, availability metadata and API topic links by exact name or returned id.',
    inputSchema:{id:z.string().min(1).max(200)},annotations:hints}, async ({id}) => result(lookupTechnology(id)));
  server.registerTool('get_apple_updates', {title:'Find Apple updates and release notes',description:'Search dated Apple update and release-note landing pages with version-specific source links. Does not claim live results.',
    inputSchema:{query:z.string().max(200).default(''),limit:z.number().int().min(1).max(30).default(10)},annotations:hints}, async ({query,limit}) => result(lookupUpdates(query,limit)));
  server.registerTool('plan_ios_app', {title:'Plan an iOS app from a brief',description:'Return an implementation workflow and safe CLI argument array for a named app. No files are created and no build is claimed.',
    inputSchema:{name:z.string().max(64).refine(validAppName, 'Use a non-reserved Swift-safe app name'),brief:z.string().min(5).max(8000)},annotations:hints}, async ({name,brief}) => result(appPlan(name,brief)));
  server.registerTool('plan_app_icon', {title:'Plan layered Icon Composer artwork',description:'Return a separate-layer icon specification, Apple workflow and appearance checks. Does not fabricate a native .icon document.',
    inputSchema:{appName:z.string().min(1).max(100),concept:z.string().min(3).max(2000)},annotations:hints}, async ({appName,concept}) => result(iconPlan(appName,concept)));
  return server;
}
