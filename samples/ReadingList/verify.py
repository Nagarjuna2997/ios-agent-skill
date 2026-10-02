#!/usr/bin/env python3
"""Run frozen unit/UI acceptance tests, then export their screenshots."""
import json
import os
import re
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parent
os.chdir(root)
def run(*args):
    subprocess.run(args, check=True)

def runtime_version(key):
    """com.apple.CoreSimulator.SimRuntime.iOS-26-1 -> (26, 1); other platforms sort last."""
    match = re.search(r'\.iOS-(\d+)-(\d+)', key)
    return (int(match.group(1)), int(match.group(2))) if match else (-1, -1)

devices = json.loads(subprocess.check_output(['xcrun', 'simctl', 'list', 'devices', 'available', '--json']))
# Pick the same simulator on every run: a booted iPhone first, then the newest iOS runtime,
# then the device name. Dictionary order from simctl is not stable across machines.
phones = sorted(
    ((runtime, d) for runtime, group in devices['devices'].items() for d in group
     if d.get('isAvailable') and 'iPhone' in d.get('deviceTypeIdentifier', '') and runtime_version(runtime) >= (0, 0)),
    key=lambda item: (item[1]['state'] != 'Booted', tuple(-n for n in runtime_version(item[0])), item[1]['name']),
)
udid = os.environ.get('IOS_AGENT_SIMULATOR_UDID')
if not udid:
    if not phones:
        raise SystemExit('No available iOS simulator. Install an iOS runtime in Xcode first.')
    runtime, device = phones[0]
    udid = device['udid']
    print('Simulator: ' + device['name'] + ' (' + runtime.rsplit('.', 1)[-1] + ')', flush=True)
results = root / '.ios-agent' / 'acceptance.xcresult'
if results.exists(): shutil.rmtree(results)
export = root / '.ios-agent' / 'export'
if export.exists(): shutil.rmtree(export)
try:
    run('xcodebuild', 'test', '-project', 'ReadingList.xcodeproj', '-scheme', 'ReadingList', '-destination', 'platform=iOS Simulator,id=' + udid, '-derivedDataPath', '.build', '-resultBundlePath', str(results), '-parallel-testing-enabled', 'NO')
finally:
    # Export screenshots even when a test fails, so the failing screen can be inspected.
    if results.exists():
        subprocess.run(['xcrun', 'xcresulttool', 'export', 'attachments', '--path', str(results), '--output-path', str(export)], check=False)
if not (export / 'manifest.json').exists():
    raise SystemExit('Could not export test attachments from ' + str(results))
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
