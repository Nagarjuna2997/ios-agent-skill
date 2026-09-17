"""Publish existing repository guides as a searchable, source-linked learning library."""
from pathlib import Path
import html,json,re,runpy,xml.etree.ElementTree as ET
import markdown
root=Path(__file__).resolve().parents[1]
blog=runpy.run_path(str(root/'scripts/render-blog.py'))
site=root/'site';base=blog['base'];page=blog['page']
technologies=json.loads((root/'frameworks.json').read_text())['technologies']
paths={t['guide'] for t in technologies if t.get('guide')}
for folder in ['docs/design','docs/tooling','docs/swiftui','docs/orchestration','docs/mcp']:
 paths.update(str(p.relative_to(root)) for p in (root/folder).glob('*.md'))
(site/'guides').mkdir(exist_ok=True)
cards=[];urls=[]
for source in sorted(paths):
 p=root/source
 if not p.exists():continue
 text=p.read_text(); title=next((x[2:] for x in text.splitlines() if x.startswith('# ')),p.stem.replace('-',' ').title())
 slug=source.removeprefix('docs/').removesuffix('.md').replace('/','-')
 names=[t['name'] for t in technologies if t.get('guide')==source]
 category=next((t['category'] for t in technologies if t.get('guide')==source),source.split('/')[1].title())
 # Resolve repository-relative links against the Markdown source, retaining external sources.
 def link(m):
  label,url=m.groups()
  if url.startswith(('https:','http:','mailto:','#')):return m[0]
  from urllib.parse import urljoin
  return '['+label+']('+urljoin('https://github.com/Nagarjuna2997/ios-agent-skill/blob/main/'+source,url)+')'
 text=re.sub(r'\[([^\]]+)\]\(([^\s)]+)\)',link,text)
 text=re.sub(r'^# .+\n','',text,count=1)
 md=markdown.Markdown(extensions=['fenced_code','tables','toc']);body=md.convert(text)
 body=body.replace('#3-google-fonts--top-100-for-ios','#3-google-fonts-top-100-for-ios')
 desc='Repository guidance for '+(', '.join(names) if names else title)+'. Examples, decisions, and verification limits from the maintained source guide.'
 content='<article class="blog-article"><header class="page-intro"><p class="eyebrow">'+html.escape(category)+' · Reference guide</p><h1>'+html.escape(title)+'</h1><p class="lead">'+html.escape(desc)+'</p><p><a href="https://github.com/Nagarjuna2997/ios-agent-skill/blob/main/'+source+'">Read or improve the source</a> · <a href="../library.html">All guides</a></p></header><div class="article-body"><aside class="article-toc"><strong>On this page</strong>'+md.toc+'</aside>'+body+'</div></article>'
 url='guides/'+slug+'.html';urls.append(url)
 (site/url).write_text(page(title,desc,content,url,1))
 cards.append('<article class="card" data-guide><p class="eyebrow">'+html.escape(category)+'</p><h2><a href="'+url+'">'+html.escape(title)+'</a></h2><p>'+html.escape(', '.join(names) or category)+' </p></article>')
intro='<header class="page-intro"><p class="eyebrow">Learn from the source</p><h1>Frameworks. Features.<br>Practical decisions.</h1><p class="lead">Explore '+str(len(technologies))+' tracked technologies and '+str(len(cards))+' source guides. These are maintained references, not a claim that every example has been compiled. Each guide retains its own availability and verification notes.</p><p><a href="blog.html">Start with a tested walkthrough →</a></p></header><label for="guide-search">Find a framework, feature or workflow</label><input class="library-search" id="guide-search" type="search" placeholder="Try SwiftUI, accessibility, assets or concurrency"><p id="guide-count" role="status" aria-live="polite"></p>'
(site/'library.html').write_text(page('Apple development guide library','Search repository guidance for Apple frameworks, SwiftUI, design assets, MCP tools and agent workflows.',intro+'<div class="grid blog-grid">'+''.join(cards)+'</div><script src="library.js" defer></script>','library.html'))
p=site/'sitemap.xml';s=p.read_text().replace('</urlset>',''.join('<url><loc>'+base+u+'</loc></url>\n' for u in ['library.html']+urls)+'</urlset>');p.write_text(s)
print(f'Rendered {len(cards)} source guides covering {len(technologies)} tracked technologies')
