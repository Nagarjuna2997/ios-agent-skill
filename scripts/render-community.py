#!/usr/bin/env python3
"""Render only verified community cards; never fetch, infer or invent mentions."""
import html,json,pathlib,sys
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
ROOT=pathlib.Path(__file__).resolve().parents[1]
START='<!-- community:start -->';END='<!-- community:end -->'
ORDER={'community':0,'article':1,'resource':2,'discussion':3,'directory':4,'own':5,'mirror':6,'official':7}
INTRO='Seeing ios-agent-skill shared, indexed, discussed, and discovered across the developer community means a lot to me. Thank you to everyone who has checked out the project, shared feedback, starred the repository, or helped others discover it. I’m still improving it, and every bit of support genuinely motivates me to keep building.'
def canonical(url):
    u=urlsplit(url)
    if u.scheme!='https' or not u.hostname or u.username or u.password:raise ValueError('Only public HTTPS links without credentials are allowed')
    return urlunsplit(('https',u.netloc.lower(),u.path.rstrip('/'),urlencode(sorted((k,v) for k,v in parse_qsl(u.query) if not k.startswith('utm_'))),''))
def render(data):
    if data.get('schemaVersion')!=1:raise ValueError('Unknown schema')
    seen=set();ids=set();cards=[]
    for m in sorted(data['mentions'],key=lambda m:ORDER[m['kind']]):
        key=canonical(m['url'])
        if key in seen or m['id'] in ids:raise ValueError('Duplicate mention')
        seen.add(key);ids.add(m['id'])
        for field in ['platform','category','description','verifiedOn','evidence']:
            if not isinstance(m.get(field),str) or not m[field].strip():raise ValueError('Missing verification or card text')
        if m['kind'] in ('own','mirror','official') and not any(word in m['category'].lower() for word in ('maintainer','mirror','official')):raise ValueError('Disclose ownership/mirror status')
        e=lambda field:html.escape(m[field],quote=True)
        cards.append(f'<article class="card"><span class="num">{e("category")}</span><h3>{e("platform")}</h3><p>{e("description")}</p><a href="{e("url")}" target="_blank" rel="noopener noreferrer">Visit {e("platform")} <span class="small">(opens in a new tab)</span></a></article>')
    return '<section id="community" aria-labelledby="community-title"><div class="eyebrow">Public footprint</div><h2 id="community-title">Community &amp; Mentions</h2><p class="lead">'+html.escape(INTRO)+'</p><p class="note">Verified links, clearly labelled. Directory listings are not endorsements; maintainer posts and republications are identified separately.</p><div class="grid">\n'+'\n'.join(cards)+'\n</div><div class="community-thanks"><h3>Thank you for supporting ios-agent-skill.</h3><p>This started as a side project because I wanted AI coding agents to work better with real iOS development workflows. Seeing developers discover it, read the documentation, give feedback, and share it keeps me motivated to make it better.</p><p>Using ios-agent-skill in a real project? I’d love to hear about it.</p><div class="actions"><a class="btn" href="https://github.com/Nagarjuna2997/ios-agent-skill">View on GitHub</a><a class="btn" href="https://github.com/Nagarjuna2997/ios-agent-skill/issues/new/choose">Share Feedback</a><a class="btn" href="https://github.com/Nagarjuna2997/ios-agent-skill">Star the Project</a></div></div></section>'
def update(page,block):
    if page.count(START)!=1 or page.count(END)!=1:raise ValueError('Community markers must occur exactly once')
    before,tail=page.split(START);_,after=tail.split(END)
    return before+START+'\n'+block+'\n'+END+after
if __name__=='__main__':
    p=ROOT/'site/index.html';old=p.read_text();new=update(old,render(json.loads((ROOT/'site/community-mentions.json').read_text())))
    if '--check' in sys.argv:
        if new!=old:raise SystemExit('Community section stale: run scripts/render-community.py')
    elif new!=old:p.write_text(new)
    print('Community section verified')
