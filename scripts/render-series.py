"""Render authored series lessons; never turn roadmap titles into filler pages."""
from pathlib import Path
import html,json,re
import markdown

def render(root,page,base):
 site=root/'site';(site/'series').mkdir(exist_ok=True)
 levels=json.loads((root/'content/blog/series.json').read_text())
 lessons=[lesson for level in levels for lesson in level['lessons']]
 diagrams={
 '0.1':('The evidence loop',['Describe behavior','Inspect proposed change','Build and exercise','Accept or return failure']),
 '0.2':('Local development prerequisites',['Mac + selected Xcode','Available iOS runtime','Known project + scheme','Baseline before agent']),
 '0.3':('Choose by execution needs',['Need local build?','Check client access','Try identical small task','Compare actual evidence']),
 '0.4':('A baseline you can diagnose',['Create or open project','Select simulator','Build → install → launch','Change text and repeat']),
 '0.5':('Where project knowledge belongs',['Stable rules → instructions','Current goal → brief','Executable checks → scripts','Results → evidence record']),
 '0.6':('How extension layers cooperate',['Plugin packages capabilities','Skill supplies procedure','MCP exposes operations','Hook invokes event checks'])}
 urls=[]
 for i,lesson in enumerate(lessons):
  number=lesson['number'];source=root/'content/series'/f'{number}.md'
  if not source.exists():continue
  title=lesson['title'];text=source.read_text();label,nodes=diagrams[number]
  # A vertical diagram stays readable on narrow screens; arrows convey order.
  diagram='<figure class="lesson-diagram" aria-label="'+label+'"><figcaption>'+label+'</figcaption><ol>'+''.join('<li><span class="diagram-step">'+str(j+1)+'</span><span>'+html.escape(node)+'</span>'+('<span class="diagram-arrow" aria-hidden="true">↓</span>' if j<3 else '')+'</li>' for j,node in enumerate(nodes))+'</ol></figure>'
  md=markdown.Markdown(extensions=['fenced_code','tables','toc'])
  # Authored paths are relative to the site root; these pages are one folder down.
  body=md.convert(text.replace('{{diagram}}',diagram))
  next_lesson=lessons[i+1] if i+1<len(lessons) else None
  next_path=(next_lesson['number']+'.html' if (root/'content/series'/f"{next_lesson['number']}.md").exists() else '../series.html#level-'+next_lesson['number'].split('.')[0]) if next_lesson else '../series.html'
  next_title=next_lesson['title'] if next_lesson else 'All levels'
  content='<article class="blog-article"><p><a href="../series.html#level-'+number.split('.')[0]+'">← Guided series</a> · <a href="../blog.html">All articles</a></p><header class="page-intro"><p class="eyebrow">Lesson '+number+' · Orientation</p><h1>'+html.escape(title)+'</h1></header><div class="article-body"><aside class="article-toc"><strong>On this page</strong>'+md.toc+'</aside>'+body+'<h2>What to do next</h2><p><a href="'+next_path+'">Next: '+html.escape(next_title)+'</a></p></div></article>'
  path='series/'+number+'.html';urls.append(path)
  (site/path).write_text(page(title,'An illustrated orientation lesson for AI-assisted Swift development: '+title,content,path,1))
 return urls
