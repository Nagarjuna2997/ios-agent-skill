#!/usr/bin/env python3
"""Render only verified community cards; never fetch, infer or invent mentions."""
import html,json,pathlib,sys
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
ROOT=pathlib.Path(__file__).resolve().parents[1]
START='<!-- community:start -->';END='<!-- community:end -->'
ORDER={'community':0,'article':1,'resource':2,'discussion':3,'directory':4,'own':5,'mirror':6,'official':7}
INTRO='A record of verified directory listings, articles and developer discussions about ios-agent-skill. Thank you to everyone who has shared useful feedback or helped others find the project.'
def canonical(url):
    u=urlsplit(url)
    if u.scheme!='https' or not u.hostname or u.username or u.password:raise ValueError('Only public HTTPS links without credentials are allowed')
    return urlunsplit(('https',u.netloc.lower(),u.path.rstrip('/'),urlencode(sorted((k,v) for k,v in parse_qsl(u.query) if not k.startswith('utm_'))),''))
def render(data):
    if data.get('schemaVersion')!=1:raise ValueError('Unknown schema')
    seen=set();ids=set();groups={}
    for m in sorted(data['mentions'],key=lambda m:ORDER[m['kind']]):
        key=canonical(m['url'])
        if key in seen or m['id'] in ids:raise ValueError('Duplicate mention')
        seen.add(key);ids.add(m['id'])
        for field in ['platform','category','description','verifiedOn','evidence']:
            if not isinstance(m.get(field),str) or not m[field].strip():raise ValueError('Missing verification or card text')
        if m['kind'] in ('own','mirror','official') and not any(word in m['category'].lower() for word in ('maintainer','mirror','official')):raise ValueError('Disclose ownership/mirror status')
        e=lambda field:html.escape(m[field],quote=True)
        group={'community':'Community & integrations','article':'Articles & integrations','resource':'Articles & integrations','discussion':'Community & integrations','directory':'Directories & indexes','own':'From the project','mirror':'From the project','official':'From the project'}[m['kind']]
        groups.setdefault(group,[])
        groups[group].append(f'<article class="card"><span class="num">{e("category")}</span><h3>{e("platform")}</h3><p>{e("description")}</p><a href="{e("url")}" target="_blank" rel="noopener noreferrer">Visit {e("platform")} <span class="small">(opens in a new tab)</span></a></article>')
    sections=''.join('<section class="mention-group" aria-label="'+html.escape(name)+'"><h2>'+html.escape(name)+'</h2><div class="grid">'+''.join(items)+'</div></section>' for name,items in groups.items())
    filters=''.join('<button type="button" data-filter="'+html.escape(name)+'" aria-pressed="false">'+html.escape(name)+'</button>' for name in groups)
    return '<section id="community" aria-labelledby="community-title"><div class="eyebrow">Community &amp; Mentions</div><h1 id="community-title">Shared. Discussed.<br>Discovered.</h1><p class="lead">'+html.escape(INTRO)+'</p><p class="note">Directories are not endorsements. Maintainer posts are labelled separately.</p><div class="community-tools" hidden><label for="mention-search">Find a mention</label><input id="mention-search" type="search" placeholder="Search a publication, project or topic"><div class="community-filters" aria-label="Mention categories"><button type="button" data-filter="All" aria-pressed="true">All</button>'+filters+'</div><p id="mention-count" role="status" aria-live="polite"></p></div>'+sections+'<p id="mention-empty" hidden>No matching mentions. Try another search or category.</p><div class="community-thanks"><h2>Building with it?</h2><p>Using ios-agent-skill in a real project? I’d love to hear about it.</p><div class="actions"><a class="btn primary" href="https://github.com/Nagarjuna2997/ios-agent-skill/issues/new/choose">Share feedback</a><a class="btn" href="./releases.html">What’s new →</a></div></div></section>'

def update(page,block):
    if page.count(START)!=1 or page.count(END)!=1:raise ValueError('Community markers must occur exactly once')
    before,tail=page.split(START);_,after=tail.split(END)
    return before+START+'\n'+block+'\n'+END+after
if __name__=='__main__':
    p=ROOT/'site/community.html';old=p.read_text();new=update(old,render(json.loads((ROOT/'site/community-mentions.json').read_text())))
    if '--check' in sys.argv:
        if new!=old:raise SystemExit('Community section stale: run scripts/render-community.py')
    elif new!=old:p.write_text(new)
    print('Community section verified')
