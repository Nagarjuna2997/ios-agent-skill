#!/usr/bin/env python3
"""Refresh Apple metadata on an ephemeral CI checkout; never copy plugin text."""
import hashlib
from html.parser import HTMLParser
import json
import os
import re
from pathlib import Path
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads(path.read_text())

def without_date(obj):
    return {k: v for k, v in obj.items() if k != 'checkedAt'}

def urls(doc, key):
    return {item['url'] for item in doc[key]}

def topic_urls(doc, key):
    if key == 'entries':
        return {t['url'] for item in doc[key] for t in item.get('topics', [])}
    return {link['url'] for item in doc[key] for section in item.get('topics', []) for link in section.get('links', [])}

def check_no_removed(old, new, key):
    missing = urls(old, key) - urls(new, key)
    topics = topic_urls(old, key) - topic_urls(new, key)
    if missing or topics:
        # Omission from an Apple index does not prove an API was removed. Keep
        # enough provenance to review the change without promoting a partial
        # snapshot or requiring another hundreds-page fetch.
        affected = []
        for item in old[key]:
            sections = item.get('topics', [])
            links = sections if key == 'entries' else [link for section in sections for link in section.get('links', [])]
            lost = sorted({link['url'] for link in links} & topics)
            if item['url'] in missing or lost:
                affected.append({'landingPage': item['url'], 'landingPageMissing': item['url'] in missing, 'missingTopics': lost})
        report = {'source': key, 'missingLandingPages': sorted(missing), 'missingTopicLinks': sorted(topics), 'affectedPages': affected}
        report_path = os.environ.get('APPLE_REFRESH_REPORT')
        if report_path:
            Path(report_path).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        sample = sorted(missing)[:3] + sorted(topics)[:3]
        raise RuntimeError(f'{key}: {len(missing)} landing pages and {len(topics)} topic links disappeared; human review required. Examples: {json.dumps(sample)}')

def plugin_inventory(export, version):
    root = export.resolve(strict=True)
    manifest = root / '.claude-plugin' / 'plugin.json'
    if manifest.is_symlink() or manifest.parent.is_symlink() or load(manifest).get('name') != 'xcode-integration':
        raise RuntimeError('unexpected Xcode plugin manifest')
    skills = root / 'skills'
    if skills.is_symlink() or not skills.is_dir():
        raise RuntimeError('plugin skills unavailable')
    files = {}
    for base, dirs, names in os.walk(skills, followlinks=False):
        parent = Path(base)
        if any((parent / name).is_symlink() for name in dirs + names):
            raise RuntimeError('symlink in plugin export')
        for name in names:
            path = parent / name
            if path.suffix != '.md':
                continue
            if not path.is_file() or path.stat().st_size > 256000:
                raise RuntimeError('unexpected plugin file')
            key = path.relative_to(skills).as_posix()
            files[key] = hashlib.sha256(path.read_bytes()).hexdigest()
            if len(files) > 1000:
                raise RuntimeError('plugin export too large')
    if not files or not any(x.endswith('/SKILL.md') for x in files):
        raise RuntimeError('empty plugin export')
    return {'schemaVersion': 1, 'source': 'selected Xcode Claude plugin; file hashes only', 'xcode': version.strip(), 'files': dict(sorted(files.items()))}

def restore_unchanged_generated():
    # Only called after the clean-checkout preflight, inside the ephemeral runner.
    subprocess.run(['git', 'restore', '--', 'docs/apple/technologies.json', 'docs/apple/technologies', 'docs/apple/all-technologies.md', 'docs/apple/updates.json', 'docs/apple/updates-and-release-notes.md'], check=True)

def stable_version(app_name, output):
    """Only accept releases without beta/RC path or prerelease build suffix."""
    if re.search(r'(?:beta|preview|release[ _-]*candidate|(?:^|[ _.-])rc(?:[ _.-]|$))', app_name, re.I):
        return None
    lines = output.splitlines()
    if len(lines) < 2:
        return None
    match = re.fullmatch(r'Xcode (\d+)(?:\.(\d+))?(?:\.(\d+))?', lines[0].strip())
    if not match or not re.fullmatch(r'Build version \d+[A-Z]\d+', lines[1].strip()):
        return None
    return tuple(int(x or 0) for x in match.groups())

class ReleaseTitles(HTMLParser):
    def __init__(self):
        super().__init__(); self.in_h2 = False; self.parts = []; self.titles = []
    def handle_starttag(self, tag, attrs):
        if tag == 'h2': self.in_h2 = True; self.parts = []
    def handle_data(self, data):
        if self.in_h2: self.parts.append(data)
    def handle_endtag(self, tag):
        if tag == 'h2' and self.in_h2: self.titles.append(''.join(self.parts).strip()); self.in_h2 = False

def released_xcode_builds(html):
    parser=ReleaseTitles(); parser.feed(html); found=set()
    for title in parser.titles:
        match=re.fullmatch(r'Xcode (\d+(?:\.\d+){0,2}) \((\d+[A-Z]\d+)\)', title)
        if match: found.add((match.group(1),match.group(2)))
    if not found: raise RuntimeError('Apple release list has no verifiable Xcode releases')
    return found

def choose_xcode():
    """Choose the newest installed release-shaped Xcode without changing system selection."""
    with urllib.request.urlopen('https://developer.apple.com/news/releases/', timeout=35) as response:
        body=response.read(4_000_001)
    if len(body)>4_000_000: raise RuntimeError('Apple release list is unexpectedly large')
    releases=released_xcode_builds(body.decode('utf-8'))
    candidates = []
    for app in Path('/Applications').glob('Xcode*.app'):
        developer = app / 'Contents/Developer'
        if not developer.is_dir():
            continue
        env = {**os.environ, 'DEVELOPER_DIR': str(developer)}
        try:
            version = subprocess.check_output(['xcodebuild', '-version'], text=True, timeout=30, env=env)
        except (OSError, subprocess.SubprocessError):
            continue
        parsed = stable_version(app.name, version)
        lines = version.splitlines()
        identity = (lines[0].strip().removeprefix('Xcode '), lines[1].strip().removeprefix('Build version ')) if len(lines)>1 else ('','')
        if parsed and identity in releases:
            candidates.append((parsed, str(developer), version.strip()))
    if not candidates:
        raise RuntimeError('no Apple-confirmed stable hosted Xcode installation available')
    _, developer, version = max(candidates)
    return developer, version

def main():
    os.chdir(ROOT)
    if subprocess.check_output(['git', 'status', '--porcelain'], text=True).strip():
        raise RuntimeError('refresh requires a clean checkout; preserving existing changes')
    techpath = ROOT / 'docs/apple/technologies.json'
    updatespath = ROOT / 'docs/apple/updates.json'
    inventorypath = ROOT / 'docs/apple/xcode-plugin-inventory.json'
    oldtech, oldupdates = load(techpath), load(updatespath)
    oldplugin = load(inventorypath) if inventorypath.exists() else None
    developer, version = choose_xcode()
    # GitHub's disposable image does not start XcodeService by default. Enable
    # its headless mode without granting automatic agent approvals. Never alter
    # the developer's own Mac when running the script locally.
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        subprocess.run(['sudo', 'env', f'DEVELOPER_DIR={developer}', 'xcrun', 'mcp-server', 'enable'], check=True, timeout=60)
    if oldplugin:
        previous = re.search(r'Xcode (\d+)(?:\.(\d+))?(?:\.(\d+))?', oldplugin.get('xcode',''))
        current = re.search(r'Xcode (\d+)(?:\.(\d+))?(?:\.(\d+))?', version)
        if not previous or not current or tuple(int(x or 0) for x in current.groups()) < tuple(int(x or 0) for x in previous.groups()):
            raise RuntimeError('hosted Xcode is older than recorded plugin; refusing downgrade')
    export = subprocess.check_output(['xcrun', 'agent', 'plugin', 'path', '--plugin-format', 'claude'], text=True, timeout=60, env={**os.environ, 'DEVELOPER_DIR': developer}).strip()
    if not Path(export).is_absolute() or not version.startswith('Xcode '):
        raise RuntimeError('invalid Xcode export')
    plugin = plugin_inventory(Path(export), version)
    if oldplugin and set(oldplugin['files']) - set(plugin['files']):
        raise RuntimeError('plugin files disappeared; human review required')
    subprocess.run(['python3', 'scripts/sync-apple-technologies.py', '--refresh'], check=True, timeout=900)
    subprocess.run(['python3', 'scripts/sync-apple-updates.py'], check=True, timeout=600)
    newtech, newupdates = load(techpath), load(updatespath)
    check_no_removed(oldtech, newtech, 'technologies')
    check_no_removed(oldupdates, newupdates, 'entries')
    apple_changed = without_date(oldtech) != without_date(newtech) or without_date(oldupdates) != without_date(newupdates)
    plugin_changed = plugin != oldplugin
    if not apple_changed:
        restore_unchanged_generated()
    if plugin_changed:
        inventorypath.write_text(json.dumps(plugin, indent=2) + '\n')
    if apple_changed or plugin_changed:
        subprocess.run(['node', 'scripts/index-local-library.mjs', '--write'], check=True, timeout=120)
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
            output.write(f'apple_changed={str(apple_changed).lower()}\nplugin_changed={str(plugin_changed).lower()}\n')
    print(f'Apple source changes: {apple_changed}; Xcode plugin inventory changes: {plugin_changed}')
    print('Plugin inventory contains file names and hashes, not Apple guidance text; hashes do not establish correctness.')

if __name__ == '__main__':
    main()
