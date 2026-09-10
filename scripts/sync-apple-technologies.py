#!/usr/bin/env python3
"""Maintain the full Apple directory without copying existing implementation guides.

Default/--check: offline validation. --write: render the checked-in snapshot.
--refresh: retrieve Apple's current directory and landing-page metadata, then render.
"""
import argparse
import concurrent.futures
import datetime
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'docs/apple/technologies.json'
SOURCE = 'https://developer.apple.com/tutorials/data/documentation/technologies.json'
# Authored guides that predate, but were omitted from, the selected catalog.
LOCAL_GUIDES = {
    'Accelerate': 'docs/frameworks/accelerate.md',
    'Accessibility': 'docs/frameworks/accessibility.md',
    'Combine': 'docs/frameworks/combine.md',
    'XCUIAutomation': 'docs/testing/xcuiautomation.md',
}

def canonical(value):
    value = 'https://developer.apple.com' + value if value.startswith('/') else value
    p = urllib.parse.urlsplit(value)
    return urllib.parse.urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path, p.query, p.fragment))

def normalized(value):
    return re.sub('[^a-z0-9]', '', value.lower())

def fetch(url, as_json=True):
    last = None
    for _ in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'ios-agent-skill documentation catalog'})
            with urllib.request.urlopen(req, timeout=40) as response:
                body = response.read()
                return json.loads(body) if as_json else response.url
        except (OSError, ValueError) as error:
            last = error
    raise RuntimeError(f'{url}: {last}')

def inventory(document):
    entries = {}
    for section in document['sections']:
        for group in section.get('groups', []):
            for technology in group.get('technologies', []):
                ref = document['references'][technology['destination']['identifier']]
                url = canonical(ref['url'])
                row = entries.setdefault(url.rstrip('/').casefold(), dict(name=technology['title'], url=url,
                    categories=[], languages=technology.get('languages', []), abstract=ref.get('abstract', [])))
                if group['name'] not in row['categories']:
                    row['categories'].append(group['name'])
    if not entries:
        raise ValueError('Apple directory contained no technologies; refusing empty refresh')
    return list(entries.values())

def refresh():
    rows = inventory(fetch(SOURCE))
    old = json.loads((ROOT / 'frameworks.json').read_text())['technologies']
    def retrieve(row):
        parsed = urllib.parse.urlsplit(row['url'])
        docc = parsed.netloc == 'developer.apple.com' and parsed.path.startswith('/documentation/')
        slug = parsed.path.removeprefix('/documentation/').replace('/', '__') if docc else normalized(row['name'])
        page = fetch('https://developer.apple.com/tutorials/data' + parsed.path + '.json') if docc else {}
        verified = row['url'] if docc else fetch(row['url'], False)
        matches = [o for o in old if canonical(o.get('appleDocumentation', '')).rstrip('/').lower() == row['url'].rstrip('/').lower()
                   or normalized(o['name']) == normalized(row['name'])]
        if row['name'] == 'PhotoKit':
            matches = [o for o in old if o['name'] in ('Photos', 'PhotosUI')]
        guides = list(dict.fromkeys(o['guide'] for o in matches if o.get('guide')))
        if row['name'] in LOCAL_GUIDES:
            guides = list(dict.fromkeys([LOCAL_GUIDES[row['name']]] + guides))
        meta = page.get('metadata', {})
        words = ''.join(n.get('text', n.get('code', '')) for n in page.get('abstract', row['abstract'])).split()
        summary = ' '.join(words[:25]) + (' …' if len(words) > 25 else '')
        sections = []
        for section in page.get('topicSections', []):
            links, seen = [], set()
            for ident in section.get('identifiers', []):
                ref = page.get('references', {}).get(ident, {})
                if not ref.get('url'):
                    continue
                link = canonical(ref['url'])
                if link in seen:
                    continue
                seen.add(link)
                links.append(dict(title=ref.get('title', ident.split('/')[-1]), url=link,
                                  deprecated=bool(ref.get('deprecated', False)), beta=bool(ref.get('beta', False))))
            if links:
                sections.append(dict(title=section.get('title', 'Topics'), links=links))
        return dict(name=row['name'], slug=slug, url=row['url'], categories=row['categories'],
                    languages=row['languages'], summary=summary,
                    modules=[m['name'] for m in meta.get('modules', [])], platforms=meta.get('platforms', []),
                    deprecated=bool(meta.get('deprecated', False) or page.get('deprecationSummary')),
                    sourceKind='docc' if docc else 'external', verifiedURL=verified, guides=guides,
                    guide=guides[0] if guides else 'docs/apple/technologies/' + slug + '.md', topics=sections)
    # All reads succeed before the snapshot is replaced. An error is never recorded as coverage.
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        technologies = list(pool.map(retrieve, rows))
    return dict(schemaVersion=1, checkedAt=datetime.date.today().isoformat(), source=SOURCE,
                directoryURL='https://developer.apple.com/documentation/technologies', sourceCount=len(rows),
                technologies=sorted(technologies, key=lambda r: r['name'].casefold()))

def validate(data, root=ROOT):
    if data.get('schemaVersion') != 1 or not data.get('technologies'):
        raise ValueError('Invalid or empty technology catalog')
    entries = data['technologies']
    if len(entries) != data['sourceCount']:
        raise ValueError('Directory count does not match catalog')
    for field in ('url', 'slug', 'name'):
        values = [canonical(r[field]).rstrip('/').casefold() if field == 'url' else r[field].casefold() for r in entries]
        if len(set(values)) != len(values):
            raise ValueError('Duplicate technology ' + field)
    for row in entries:
        if not re.fullmatch(r'[a-z0-9_.-]+', row['slug']):
            raise ValueError('Unsafe slug: ' + row['slug'])
        if row['sourceKind'] not in ('docc', 'external') or not row['url'].startswith('https://'):
            raise ValueError('Invalid source: ' + row['name'])
        if not row['categories']:
            raise ValueError('Missing categories: ' + row['name'])
        for guide in row['guides']:
            if not (root / guide).is_file() or not (root / guide).resolve().is_relative_to(root.resolve()):
                raise ValueError('Missing or unsafe existing guide: ' + guide)
        expected = row['guides'][0] if row['guides'] else 'docs/apple/technologies/' + row['slug'] + '.md'
        if row['guide'] != expected:
            raise ValueError('Guide routing mismatch: ' + row['name'])
        for section in row['topics']:
            urls = [canonical(link['url']) for link in section['links']]
            if len(set(urls)) != len(urls) or any(not u.startswith('https://') for u in urls):
                raise ValueError('Invalid/duplicate topic links: ' + row['name'])

def escape(text):
    return str(text).replace('|', '\\|').replace('[', '\\[').replace(']', '\\]').replace('\n', ' ')

def relative(path, parent):
    import os
    return pathlib.Path(os.path.relpath(ROOT / path, ROOT / parent)).as_posix()

def render_guide(row, date):
    lines = ['# ' + row['name'], '', '## Context', '',
             f"Load this when a task names **{row['name']}** or one of the API topics below.", '',
             f"Apple categories: {', '.join(row['categories'])}.", '',
             f"[Apple documentation]({row['url']}) · Source checked: {date}.", '']
    if row['summary']:
        lines += ['Apple’s short description (excerpt):', '', '> ' + row['summary'], '']
    lines += ['## Pattern', '',
              'Use the topic map below to select the API for the requested feature. Follow the '
              '[technology implementation workflow](../technology-workflow.md) before writing integration code.', '']
    if row['modules']:
        lines += ['Documented modules: ' + ', '.join('`' + m + '`' for m in row['modules']) + '.', '']
    if row['languages']:
        lines += ['Documentation language identifiers: ' + ', '.join(row['languages']) + '.', '']
    if row['deprecated']:
        lines += ['**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.', '']
    if row['platforms']:
        lines += ['### Availability from the landing page', '', '| Platform | Introduced | Deprecated | Beta |', '|---|---|---|---|']
        for p in row['platforms']:
            lines += [f"| {escape(p['name'])} | {p.get('introducedAt', 'Not specified')} | {p.get('deprecatedAt', '—')} | {'Yes' if p.get('beta') else 'No'} |"]
        lines += ['', 'These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.', '']
    else:
        lines += ['Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.', '']
    if row['sourceKind'] == 'external':
        lines += ['### External resource', '', f"Apple routes this entry to an external resource: [verified destination]({row['verifiedURL']}). No DocC symbol inventory is claimed for this entry.", '']
    for section in row['topics']:
        lines += ['### ' + section['title'], '']
        for link in section['links']:
            flags = (' — deprecated' if link['deprecated'] else '') + (' — beta' if link['beta'] else '')
            lines += [f"- [{escape(link['title'])}]({link['url']}){flags}"]
        lines += ['']
    if not row['topics'] and row['sourceKind'] == 'docc':
        lines += ['The landing page exposes no topic groups in the retrieved DocC representation. Use its canonical source for the current navigation.', '']
    lines += ['## Anti-Patterns', '',
              '- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.',
              '- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.',
              '- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.', '',
              'Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.', '']
    return '\n'.join(lines)

def render_index(data):
    rows = data['technologies']; reused = sum(bool(r['guides']) for r in rows)
    lines = ['# All Apple Technologies: Accelerate to XPC', '',
             f"Snapshot checked **{data['checkedAt']}**: **{len(rows)} unique entries** from [Apple’s technology directory]({data['directoryURL']}).",
             '', f"**{reused}** entries reuse existing implementation guides; **{len(rows)-reused}** have dedicated source-backed reference pages. Each technology has one canonical catalog record.", '',
             'This full directory includes frameworks, services, tools, release notes, legacy technologies, and external resources. '
             'The selected app-development catalog in `frameworks.json` remains a separate curated subset; its coverage percentage is not the full Apple directory coverage.', '',
             '## How to use', '',
             '1. Find the technology below and load its local guide.',
             '2. For exact platform metadata and the full landing-page topic map, search its record in `docs/apple/technologies.json`.',
             '3. Follow [the implementation workflow](technology-workflow.md); source retrieval does not verify compilation or runtime behavior.', '',
             '## Directory', '', '| Technology | Categories | Local guide | Source |', '|---|---|---|---|']
    for r in rows:
        lines += [f"| {escape(r['name'])} | {', '.join(r['categories'])} | [Guide]({relative(r['guide'], 'docs/apple')}) | [Apple source]({r['url']}) |"]
    lines += ['', '## Maintenance', '',
              'The JSON snapshot stores source metadata and topic links, not copies of Apple’s full articles. Short descriptions are attributed excerpts capped at 25 words. Existing guides are linked and never overwritten by this generator.', '',
              '```bash', 'python3 scripts/sync-apple-technologies.py --check', 'python3 scripts/sync-apple-technologies.py --refresh', '```', '',
              'The offline check rejects duplicate names/URLs/slugs, missing guide routes, and stale generated pages. Refresh fetches the entire live directory and all landing pages before replacing the snapshot; network failures stop the refresh.', '']
    return '\n'.join(lines)

def outputs(data):
    result = {'docs/apple/all-technologies.md': render_index(data)}
    for row in data['technologies']:
        if not row['guides']:
            result[row['guide']] = render_guide(row, data['checkedAt'])
    return result

def reconcile(generated, write=False, root=ROOT):
    folder = root / 'docs/apple/technologies'
    actual = {p.relative_to(root).as_posix() for p in folder.glob('*.md')}
    obsolete = actual - set(generated)
    if obsolete and not write:
        raise ValueError('Obsolete generated guides: ' + ', '.join(sorted(obsolete)))
    # Only the generator's own marked outputs may be pruned. Authored files are never removed.
    for name in obsolete:
        if 'Generated from `docs/apple/technologies.json`' not in (root / name).read_text():
            raise ValueError('Unrecognized file in generated directory; preserve and review: ' + name)
    if write:
        for name in obsolete:
            (root / name).unlink()
        for name, content in generated.items():
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    else:
        stale = [name for name, content in generated.items() if not (root / name).is_file() or (root / name).read_text() != content]
        if stale:
            raise ValueError('Stale/missing generated files: ' + ', '.join(stale))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    data = refresh() if args.refresh else json.loads(CATALOG.read_text())
    validate(data)
    generated = outputs(data)
    reconcile(generated, write=args.refresh or args.write)
    if args.refresh:
        CATALOG.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f"OK - {len(data['technologies'])}/{data['sourceCount']} Apple technologies; unique names, URLs and slugs; {len(generated)-1} generated guides; existing guides preserved")

if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, KeyError) as error:
        sys.exit(str(error))
