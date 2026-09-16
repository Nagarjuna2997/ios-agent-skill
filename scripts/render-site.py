#!/usr/bin/env python3
"""Keep the existing landing page feature cards aligned with README's product table."""
import html
import json
import pathlib
import re
import sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
readme = (ROOT / 'README.md').read_text()
section = readme.split('<!-- product-features:start -->')[1].split('<!-- product-features:end -->')[0]
rows = [line.strip('|').split('|') for line in section.splitlines() if line.startswith('|')][2:]
if not rows or any(len(row) != 2 for row in rows):
    raise SystemExit('README feature table is missing or malformed')
cards = '\n'.join('<article class="card"><span class="num">%02d</span><h3>%s</h3><p>%s</p></article>' % (i, html.escape(title.strip()), html.escape(body.strip())) for i, (title, body) in enumerate(rows, 1))
p = ROOT / 'site/index.html'
s = p.read_text()
start = '<!-- generated-features:start -->'
end = '<!-- generated-features:end -->'
if s.count(start) != 1 or s.count(end) != 1:
    raise SystemExit('Site feature markers must occur exactly once')
s = s.split(start)[0] + start + '\n' + cards + '\n' + end + s.split(end)[1]
if '--check' in sys.argv:
    if s != p.read_text(): raise SystemExit('Site features stale: run python3 scripts/render-site.py')
else: p.write_text(s)
print('Site feature cards match README')
