/** Generate only the integrations content region from the compiled registry. */
import {readFileSync,writeFileSync} from 'node:fs';
import {integrations} from '../mcp-server/dist/integrations/registry.js';
const root=new URL('../',import.meta.url), file=new URL('site/integrations.html',root);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const region='<section><h1>Apple system integrations</h1><p class="lead">Focused Swift previews and permission checks for the services your app uses.</p><p>Included in npm 2.8.0.</p><p><a href="./">← Home</a> · <a href="install.html">Client setup</a> · <a href="https://github.com/Nagarjuna2997/ios-agent-skill/tree/main/docs/integrations">Agent workflow and limitations</a></p><div class="grid">'+integrations.map(i=>`<article class="card"><span class="num">${esc(i.frameworks.join(' · '))}</span><h2>${esc(i.name)}</h2><p>${esc(i.approach)}</p><p><strong>Operations:</strong> ${esc(i.operations.join(', '))}</p><p><strong>Permissions:</strong> ${esc(i.permissions.join('; ')||'No broad-data permission for the supplied system UI workflow.')}</p><p><strong>Verification:</strong> ${esc(i.limitations.join(' '))} Device verification required before shipping.</p><a href="${esc(i.appleURL)}">Apple framework documentation</a></article>`).join('\n')+'</div></section>';
const before=readFileSync(file,'utf8');
const after=before.replace(/<!-- integrations:start -->[\s\S]*?<!-- integrations:end -->/,'<!-- integrations:start -->'+region+'<!-- integrations:end -->');
if(process.argv.includes('--check')){if(before!==after)throw Error('Integrations page stale: run node scripts/render-integrations.mjs');}
else writeFileSync(file,after);
console.log(`Integrations website: ${integrations.length} registry entries`);
