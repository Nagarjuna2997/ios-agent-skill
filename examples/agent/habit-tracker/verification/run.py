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
    subprocess.run(['xcodebuild', '-project', 'HabitTracker.xcodeproj', '-scheme', 'HabitTracker',
                    '-destination', f'platform=iOS Simulator,id={args.device}',
                    '-derivedDataPath', str(project / 'derived'), '-resultBundlePath', str(result),
                    'CODE_SIGNING_ALLOWED=NO', 'test'], cwd=project, check=True)
