#!/usr/bin/env python3
"""Re-run the isolated HabitTracker simulator interaction on a selected device."""
import argparse
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--device', required=True, help='UDID of an available iOS simulator')
parser.add_argument('--result', required=True, type=Path, help='new .xcresult path to preserve test evidence')
args = parser.parse_args()
if not re.fullmatch(r'[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}', args.device):
    parser.error('device must be a simulator UDID')
result = args.result.resolve()
if result.exists() or result.suffix != '.xcresult' or not result.parent.is_dir():
    parser.error('result must be a new .xcresult path in an existing directory')
example = Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix='ios-agent-habit-interaction-') as temporary:
    project = Path(temporary) / 'HabitTracker'
    shutil.copytree(example, project)
    tests = project / 'HabitTrackerUITests'
    tests.mkdir()
    shutil.copy2(example / 'verification/HabitInteractionTests.swift', tests / 'HabitInteractionTests.swift')
    engine = example.parents[2] / 'mcp-server/dist/agent/journeys.js'
    if not engine.is_file():
        raise SystemExit('Build mcp-server first (npm ci && npm run build)')
    generator = """import { readFileSync } from 'node:fs'; import { pathToFileURL } from 'node:url';
const { journeyTests } = await import(pathToFileURL(process.argv[1]));
process.stdout.write(journeyTests(JSON.parse(readFileSync(process.argv[2], 'utf8')).journeys));"""
    with (tests / 'PlannedJourneyTests.swift').open('w') as source:
        subprocess.run(['node', '--input-type=module', '-e', generator, str(engine),
                        str(example / '.ios-agent/plan.json')], stdout=source, check=True)
    spec = project / 'project.yml'
    text = spec.read_text(encoding='utf-8')
    if text.count('schemes:\n') != 1 or 'HabitTrackerUITests:' in text:
        raise SystemExit('Unsupported example project layout; review the current project spec')
    text = text.replace('schemes:\n', '''  HabitTrackerUITests:
    type: bundle.ui-testing
    platform: iOS
    deploymentTarget: "17.0"
    sources: [HabitTrackerUITests]
    dependencies:
      - target: HabitTracker
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.example.habittracker.uitests
        GENERATE_INFOPLIST_FILE: YES
schemes:
''')
    text += '''    test:
      targets:
        - HabitTrackerUITests
'''
    spec.write_text(text, encoding='utf-8')
    subprocess.run(['xcodegen', 'generate', '--spec', str(spec)], cwd=project, check=True)
    execution = subprocess.run(['xcodebuild', '-project', 'HabitTracker.xcodeproj', '-scheme', 'HabitTracker',
                    '-destination', f'platform=iOS Simulator,id={args.device}',
                    '-derivedDataPath', str(project / 'derived'), '-resultBundlePath', str(result),
                    '-parallel-testing-enabled', 'NO', 'CODE_SIGNING_ALLOWED=NO', 'test'], cwd=project, check=False)
    if (result / 'Info.plist').exists():
        report = subprocess.run(['node', str(example / 'verification/report.mjs'), str(result)], check=False)
        if report.returncode:
            raise SystemExit(report.returncode)
    elif execution.returncode == 0:
        raise SystemExit('Missing XCTest result bundle')
    raise SystemExit(execution.returncode)
