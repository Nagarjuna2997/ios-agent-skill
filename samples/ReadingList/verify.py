#!/usr/bin/env python3
"""Run frozen unit/UI acceptance tests, then export their screenshots."""
import json
import os
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parent
os.chdir(root)
def run(*args):
    subprocess.run(args, check=True)

devices = json.loads(subprocess.check_output(['xcrun', 'simctl', 'list', 'devices', 'available', '--json']))
phones = [d for group in devices['devices'].values() for d in group if d.get('isAvailable') and 'iPhone' in d.get('deviceTypeIdentifier', '')]
booted = [d for d in phones if d['state'] == 'Booted']
udid = os.environ.get('IOS_AGENT_SIMULATOR_UDID')
if not udid:
    candidates = booted or phones
    if not candidates:
        raise SystemExit('No available iOS simulator. Install an iOS runtime in Xcode first.')
    udid = candidates[0]['udid']
results = root / '.ios-agent' / 'acceptance.xcresult'
if results.exists(): shutil.rmtree(results)
run('xcodebuild', 'test', '-project', 'ReadingList.xcodeproj', '-scheme', 'ReadingList', '-destination', 'platform=iOS Simulator,id=' + udid, '-derivedDataPath', '.build', '-resultBundlePath', str(results), '-parallel-testing-enabled', 'NO')
export = root / '.ios-agent' / 'export'
if export.exists(): shutil.rmtree(export)
run('xcrun', 'xcresulttool', 'export', 'attachments', '--path', str(results), '--output-path', str(export))
evidence = root / '.ios-agent' / 'evidence'
evidence.mkdir(parents=True, exist_ok=True)
names = {'empty', 'add', 'library', 'detail', 'search-empty', 'error'}
found = set()
for test in json.loads((export / 'manifest.json').read_text()):
    for item in test['attachments']:
        name = item['suggestedHumanReadableName'].split('_')[0]
        if name in names:
            source = export / item['exportedFileName']
            if source.read_bytes()[:8] != b'\x89PNG\r\n\x1a\n':
                raise SystemExit('Invalid PNG screenshot: ' + str(source))
            shutil.copyfile(source, evidence / (name + '.png'))
            found.add(name)
if found != names: raise SystemExit('Missing screenshots: ' + ', '.join(sorted(names - found)))
print('PASS: persistence, search, progress, failure handling and six simulator screenshots.')
