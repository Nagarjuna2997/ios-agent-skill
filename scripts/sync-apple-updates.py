#!/usr/bin/env python3
"""Fetch the Updates hub and technology/platform release-note landing pages."""
import concurrent.futures
import datetime
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]

def read(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=35) as response:
                return json.load(response)
        except OSError:
            if attempt == 2:
                raise


def main():
    technologies = json.loads((ROOT / 'docs/apple/technologies.json').read_text())['technologies']
    urls = {
        'https://developer.apple.com/documentation/updates': 'Updates',
        'https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-release-notes': 'App Store Connect API Release Notes',
    }
    for row in technologies:
        if 'Release Notes' in row['categories']:
            urls[row['url']] = row['name']
        for section in row['topics']:
            for link in section['links']:
                if '/documentation/updates/' in link['url']:
                    urls[link['url']] = link['title']
    # Include every technology update linked from the Updates hub, even if not on a framework landing page.
    hub = read('https://developer.apple.com/tutorials/data/documentation/updates.json')
    for ref in hub.get('references', {}).values():
        url = ref.get('url', '')
        if url.startswith('/documentation/updates/'):
            urls['https://developer.apple.com' + url] = ref['title']
    def retrieve(pair):
        url, title = pair
        doc = read(url.replace('https://developer.apple.com/documentation/', 'https://developer.apple.com/tutorials/data/documentation/') + '.json')
        summary = ''.join(v.get('text', v.get('code', '')) for v in doc.get('abstract', [])).split()
        topics = []
        seen = set()
        for section in doc.get('topicSections', []):
            for ident in section.get('identifiers', []):
                ref = doc.get('references', {}).get(ident, {})
                target = ref.get('url', '')
                if target.startswith('/'):
                    target = 'https://developer.apple.com' + target
                if not target.startswith('https://') or target in seen:
                    continue
                seen.add(target)
                topics.append(dict(title=ref['title'], url=target, section=section.get('title', 'Topics')))
        return dict(title=title, url=url, summary=' '.join(summary[:25]) + (' …' if len(summary)>25 else ''), topics=topics)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        entries = sorted(pool.map(retrieve, urls.items()), key=lambda r:r['title'].casefold())
    snapshot = dict(checkedAt=datetime.date.today().isoformat(), source='https://developer.apple.com/documentation/updates', entries=entries)
    (ROOT / 'docs/apple/updates.json').write_text(json.dumps(snapshot, indent=2, ensure_ascii=False)+'\n')
    lines = ['# Apple Updates and Release Notes', '', f"Source snapshot: {snapshot['checkedAt']}. **{len(entries)} update/release-note landing pages** fetched from Apple, with **{sum(len(e['topics']) for e in entries)} unique-within-page topic links**.", '',
        '## Context', '', 'Load this before adopting new SDK behavior, diagnosing an OS upgrade regression, or selecting a feature that may be beta or deprecated. Full structured topic maps are in `docs/apple/updates.json`.', '',
        '## Pattern', '', 'Match the app’s installed SDK, deployment target, and affected framework to the source below. Read the relevant version’s changes, known issues, and resolved issues before modifying code. Record source date and toolchain, then reproduce and test the specific behavior. An SDK release date is not a symbol’s deployment minimum.', '',
        '| Update or release notes | Apple source | Topic links |', '|---|---|---:|']
    for entry in entries:
        lines.append(f"| {entry['title'].replace('|', '/')} | [Open]({entry['url']}) | {len(entry['topics'])} |")
    lines += ['', '## Anti-Patterns', '', '- Do not treat beta notes as shipped behavior or a listed known issue as a defect in app code.', '- Do not infer a release-specific fix from an overview. Open the version-specific source and reproduce it.', '- Do not claim this snapshot mirrors all historical release-note article bodies. It records the update directory and its topic maps; linked articles remain canonical at Apple.', '', 'Refresh with `python3 scripts/sync-apple-updates.py`. The MCP knowledge server can search the bundled snapshot without network access.', '']
    (ROOT / 'docs/apple/updates-and-release-notes.md').write_text('\n'.join(lines))
    print(f"OK - fetched {len(entries)} update/release-note landing pages")

if __name__ == '__main__':
    main()
