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

# Series is a reading roadmap; planned lessons never link to nonexistent articles.
import importlib.util
spec=importlib.util.spec_from_file_location('series_renderer',root/'scripts/render-series.py')
series_renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(series_renderer)
lesson_urls=series_renderer.render(root,page,base)
levels=json.loads((root/'content/blog/series.json').read_text())
related={0:[('choose-ai-client','Choose an AI client')],1:[('chatgpt-codex-ios','Plan an app and verify locally'),('verify-swiftui-simulator','Five simulator checks')],2:[('claude-hooks','Generated-file guards and Stop checks'),('swift-concurrency','Review concurrency findings')],3:[('swiftui-state-review','Review state transitions')],4:[('asset-catalogs','Generate and compile color assets')],5:[('review-swift-with-ai','Review before accepting changes')],7:[('muse-connection','Inspect a client verification record')]}
body='<p><a href="blog.html">← Back to all articles</a></p><header class="page-intro"><p class="eyebrow">Guided learning · Series roadmap</p><h1>From first prompt<br>to shipped app.</h1><p class="lead">A step-by-step Swift learning path, from opening Xcode to reviewing, testing and shipping an app.</p><p>All 84 lessons are available to read, with a diagram in each. These educational guides distinguish recorded results from practice exercises and blocked hands-on labs. Read each lesson’s evidence section before treating an example as verified.</p></header><div class="series-map" role="navigation" aria-label="Series levels">'+''.join('<a href="#level-'+str(l['number'])+'">'+str(l['number'])+' · '+html.escape(l['title'].split(' (')[0])+'</a>' for l in levels)+'</div>'
for level in levels:
 n=level['number'];body+='<section class="series-level" id="level-'+str(n)+'"><p class="eyebrow">Level '+str(n)+'</p><h2>'+html.escape(level['title'])+'</h2><ol class="series-lessons">'+''.join('<li><strong>'+x['number']+'</strong><span>'+('<a href="series/'+x['number']+'.html">'+html.escape(x['title'])+'</a>' if (root/'content/series'/str(x['number']+'.md')).exists() else html.escape(x['title']))+'</span><span class="lesson-status">'+('Read lesson' if (root/'content/series'/str(x['number']+'.md')).exists() else 'Coming next')+'</span></li>' for x in level['lessons'])+'</ol>'
 if n in related:body+='<div class="related-reading"><strong>Related reading available now</strong><ul>'+''.join('<li><a href="blog/'+slug+'.html">'+title+'</a></li>' for slug,title in related[n])+'</ul></div>'
 body+=('<p><a href="#level-'+str(n+1)+'">What to do next: Level '+str(n+1)+' →</a></p>' if n<8 else '<p><a href="blog.html">Explore all available articles →</a></p>')+'</section>'
(site/'series.html').write_text(page('From first prompt to shipped app: guided Swift series','A nine-level reading roadmap for learning AI-assisted Swift app development, with related tutorials available now.',body,'series.html'))
p=site/'sitemap.xml';p.write_text(p.read_text().replace('</urlset>','<url><loc>'+base+'series.html</loc></url>\n</urlset>'))

p=site/'sitemap.xml';p.write_text(p.read_text().replace('</urlset>',''.join('<url><loc>'+base+u+'</loc></url>\n' for u in lesson_urls)+'</urlset>'))
