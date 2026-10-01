#!/usr/bin/env python3
"""Run the frozen UI journeys; model responses cannot change this runner."""
import json
import os
from pathlib import Path
import shutil
import subprocess
root = Path(__file__).resolve().parent
os.chdir(root)
def run(*args):
    subprocess.run(args, check=True)
plan = json.loads((root / 'acceptance.json').read_text())
devices = json.loads(subprocess.check_output(['xcrun', 'simctl', 'list', 'devices', 'available', '--json']))
phones = [d for runtime, group in devices['devices'].items() if 'iOS' in runtime for d in group if d.get('isAvailable') and 'iPhone' in d.get('deviceTypeIdentifier', '')]
requested = os.environ.get('IOS_AGENT_SIMULATOR_UDID')
candidates = [d for d in phones if d['udid'] == requested] if requested else ([d for d in phones if d['state'] == 'Booted'] or phones)
if not candidates: raise SystemExit('No available iOS simulator. Install a runtime in Xcode.')
udid = candidates[0]['udid']
evidence_root = root / '.ios-agent'
evidence_root.mkdir(exist_ok=True)
results = evidence_root / 'acceptance.xcresult'
if results.exists(): shutil.rmtree(results)
run('xcodebuild', 'test', '-project', 'AppProject.xcodeproj', '-scheme', 'AppProject', '-destination', 'platform=iOS Simulator,id=' + udid, '-derivedDataPath', '.build', '-resultBundlePath', str(results), '-parallel-testing-enabled', 'NO', '-collect-test-diagnostics', 'never', 'CODE_SIGNING_ALLOWED=NO')
export = evidence_root / 'export'
if export.exists(): shutil.rmtree(export)
run('xcrun', 'xcresulttool', 'export', 'attachments', '--path', str(results), '--output-path', str(export))
evidence = evidence_root / 'evidence'
if evidence.exists(): shutil.rmtree(evidence)
evidence.mkdir()
names = {j['screen'] for j in plan['journeys']}
found = set()
for test in json.loads((export / 'manifest.json').read_text()):
    for item in test['attachments']:
        name = item['suggestedHumanReadableName'].split('_')[0]
        if name in names:
            source = export / item['exportedFileName']
            if source.read_bytes()[:8] != b'\x89PNG\r\n\x1a\n': raise SystemExit('Invalid screenshot')
            shutil.copyfile(source, evidence / (name + '.png'))
            found.add(name)
if found != names: raise SystemExit('Missing screenshots: ' + ', '.join(sorted(names - found)))
print(f'PASS: {len(names)} frozen UI journeys and simulator screenshots. Manual criteria remain unverified.')
