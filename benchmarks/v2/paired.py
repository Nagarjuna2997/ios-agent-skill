#!/usr/bin/env python3
"""Three paired Swift repair tasks with networkless Docker tools and separate grading."""
import argparse
import fcntl
import hashlib
import json
from pathlib import Path
import os
import subprocess
import sys
import tempfile
import time
import uuid

import harness
import protocol
from paired_worker import Docker, IMAGE, InfrastructureError, LocalOllama, ProviderError

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / 'efficiency'))
import evaluate

GUIDES = {'C02': 'docs/swift/swift-concurrency.md', 'D03': 'docs/frameworks/foundation.md',
          'Q02': 'docs/swift/memory-lifetime.md'}
TRAINING = ('D04', 'Q01')
SETTINGS = {'temperature': 0, 'seed': 23, 'max_output_tokens': 2048}
VERSION = 'portable-guidance-pairs-1'
FACT = 'Two separate held-out Swift fixtures typechecked with swiftc -swift-version 6 -strict-concurrency=complete -warnings-as-errors -typecheck Solution.swift.'
SMOKE = {'client': 'unchanged-starter-smoke', 'client_version': VERSION,
         'requested_model': 'none-smoke', 'observed_model': 'none-smoke'}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def frozen(task):
    fixture = HERE / 'fixtures' / task
    files = {name: harness.tree(fixture / name) for name in ('starter', 'oracle', 'reference')}
    return {'fixture_hash': digest([files['starter'], harness.sha((fixture / 'brief.md').read_bytes()),
                                    harness.sha((fixture / 'fixture.json').read_bytes())]),
            'oracle_hash': digest(files['oracle']), 'repair_hash': digest(files['reference']),
            'skill_hash': harness.sha((REPO / GUIDES[task]).read_bytes()),
            'analyzer_hash': harness.sha((REPO / 'mcp-server/src/analyzers/performance.ts').read_bytes()),
            'harness_hash': digest({str(p.relative_to(REPO)): harness.sha(p.read_bytes()) for p in
                (HERE/'paired.py', HERE/'paired_worker.py', HERE/'harness.py', HERE/'isolation.py',
                 HERE/'protocol.py', HERE.parent/'efficiency/evaluate.py', REPO/'scripts/query-library.mjs',
                 REPO/'scripts/lib/local-library.mjs')})}


def grade(docker, fixture, source):
    # No candidate-controlled names, directories, build scripts or package manifests.
    # Sole candidate artifact: bytes of Solution.swift. The original repo isn't mounted.
    with tempfile.TemporaryDirectory(prefix='ios-judge-') as tmp:
        work = Path(tmp)
        (work/'Solution.swift').write_text(source, encoding='utf-8')
        if harness.source_guard(work):
            return {'compiled': None, 'behavior': False, 'source_guard': False}
        (work/'Acceptance.swift').write_bytes((fixture/'oracle/Check.swift').read_bytes())
        return dict(docker.judge(work), source_guard=True)


def train(docker):
    results = {}
    for task in TRAINING:
        with tempfile.TemporaryDirectory() as tmp:
            export = Path(tmp)/'starter'
            contents = harness.export(task, export)
            if not docker.training_check(export):
                raise InfrastructureError('Held-out toolchain confirmation failed for ' + task)
            results[task] = {'starter_hash': digest(contents), 'typecheck': 'passed'}
    return results


def read_guide(task, arm):
    # Only evaluator-owned allowlisted documentation paths enter this trusted tool.
    response = subprocess.run(['node', str(REPO/'scripts/query-library.mjs'), 'read',
        GUIDES[task], '0', '16000' if arm == 'baseline' else '1600'],
        env={'PATH': os.environ['PATH']}, capture_output=True, timeout=30)
    if response.returncode:
        raise InfrastructureError('Offline reference lookup failed')
    result = json.loads(response.stdout)
    if result['path'] != GUIDES[task] or result['hash'] != harness.sha((REPO/GUIDES[task]).read_bytes()):
        raise InfrastructureError('Local reference identity changed')
    return response.stdout.decode('utf-8').strip()


def cell(docker, provider, task, arm, trial, condition, pins, root, training):
    started = time.monotonic()
    fixture = HERE/'fixtures'/task
    evidence = {'purpose': 'model-comparison' if provider else 'non-model-smoke',
                'task': task, 'condition': condition, 'arm': arm, 'trial': trial,
                'training': training if condition == 'warm' else {}}
    measured = {key: None for key in evaluate.METRICS}
    metrics = {'tool_calls': 0, 'retries': 0}
    status, passed = 'incomplete', None
    memory = FACT if condition == 'warm' else ''
    try:
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)/'starter'
            harness.export(task, workspace)
            brief, starter = docker.read_export(workspace)
            metrics['tool_calls'] = 2  # Task and source reads, excluding independent grading.
            measure_start = time.monotonic()
            # Same allowlisted guide in both arms; test the effect of bounded retrieval.
            # These are Unicode-character limits, never token estimates.
            excerpt = read_guide(task, arm)
            metrics['tool_calls'] += 1
            prompt = ('Repair only Solution.swift. Return JSON with the complete Swift source under "source".\n'
                      + brief + '\nStarter:\n' + starter + '\nRepository guide:\n' + excerpt
                      + ('\nObserved setup fact:\n' + memory if memory else ''))
            metrics.update(response_bytes=len(excerpt.encode()), memory_characters=len(memory),
                           overhead_ms=round((time.monotonic()-measure_start)*1000))
            evidence.update(prompt_sha256=harness.sha(prompt.encode()), source_before=harness.sha(starter.encode()))
            if provider:
                source, usage = provider.generate(prompt, SETTINGS)
                metrics.update(usage)
            else:
                source = starter  # Explicitly a non-model control, never counted as provider performance.
            evidence['source_after'] = harness.sha(source.encode())
        # Agent workspace is gone before the trusted oracle is even staged.
        quality = grade(docker, fixture, source)
        passed = quality['behavior'] is True
        evidence['quality'] = quality
        status = 'completed'
    except ProviderError as exc:
        status, evidence['error'] = 'provider_failure', str(exc)
    except (InfrastructureError, OSError, subprocess.SubprocessError) as exc:
        status, evidence['error'] = 'infrastructure_error', str(exc)
    metrics['elapsed_ms'] = round((time.monotonic()-started)*1000)
    measured.update(metrics)
    evidence_hash = digest(evidence)
    harness.atomic(root/'evidence'/(evidence_hash+'.json'), evidence)
    receipt = dict(version=evaluate.VERSION, task=task, arm=arm, trial=trial, condition=condition,
                   component='responses', pins=pins, model_settings=SETTINGS,
                   state_id=uuid.uuid4().hex, memory_hash=harness.sha(memory.encode()),
                   training_tasks=list(TRAINING) if memory else [], status=status, passed=passed,
                   quality=evidence.get('quality', {}), evidence_hash=evidence_hash, metrics=measured)
    path = evaluate.save_cell(root/'cells', receipt)
    harness.atomic(root/'marks'/path.name, {'sha256': harness.sha(path.read_bytes())})
    return receipt


def compare_run(docker, root, provider=None, trials=1, conditions=('cold',), resume=False):
    root = Path(root).resolve()
    if root == REPO or REPO in root.parents:
        raise ValueError('Use an evidence directory outside the checkout')
    if not 1 <= trials <= 10 or not conditions or set(conditions) - {'cold','warm'}:
        raise ValueError('Invalid trial count or condition')
    if not resume:
        root.mkdir(parents=True, exist_ok=False)
    elif not (root/'protocol.json').is_file():
        raise ValueError('Cannot resume without a frozen protocol')
    with (root/'.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        identity = provider.identify() if provider else SMOKE
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)/'starter'
            harness.export('C02', workspace)
            swift = docker.probe(workspace)
        training = train(docker) if 'warm' in conditions else {}
        inputs = {key: frozen(key) for key in GUIDES}
        common = dict(identity, swift_version=swift, sdk_version='Linux Swift Foundation in '+IMAGE,
                      image=IMAGE, protocol_version=protocol.VERSION, isolation='networkless-container',
                      worker_count=1, cache_policy='fresh workspaces; provider unload requested per cell')
        run = {'version': VERSION, 'purpose': 'model-comparison' if provider else 'non-model-smoke',
               'common': common, 'inputs': inputs, 'training': training, 'settings': SETTINGS,
               'conditions': list(conditions), 'trials': trials,
               'agent_interface': 'one structured replacement, no model-selected shell or tool servers'}
        if resume:
            if json.loads((root/'protocol.json').read_text()) != run:
                raise ValueError('Frozen protocol changed; use a new output directory')
        else:
            harness.atomic(root/'protocol.json', run)
        receipts = []
        for pos, (task, hashes) in enumerate(inputs.items()):
            pins = dict(common, **hashes)
            protocol.validate_pins(pins)
            fixture = HERE/'fixtures'/task
            starter = grade(docker, fixture, (fixture/'starter/Solution.swift').read_text())
            reference = grade(docker, fixture, (fixture/'reference/Solution.swift').read_text())
            harness.atomic(root/'controls'/(task+'.json'), {'starter': starter, 'reference': reference})
            if starter['behavior'] is True or reference['behavior'] is not True:
                raise InfrastructureError('Independent starter/reference control did not validate: '+task)
            for condition in conditions:
                for trial in range(1, trials+1):
                    # Counterbalance task and trial order before observing either result.
                    arms = ('baseline','optimized') if (pos+trial)%2 else ('optimized','baseline')
                    for arm in arms:
                        key = hashlib.sha256(json.dumps([task,trial,condition,'responses',arm],sort_keys=True).encode()).hexdigest()
                        path = root/'cells'/(key+'.json')
                        if resume and path.exists():
                            marker = json.loads((root/'marks'/path.name).read_text())
                            if marker != {'sha256': harness.sha(path.read_bytes())}:
                                raise ValueError('Changed receipt')
                            rec = json.loads(path.read_text())
                            evaluate.validate(rec)
                            content=json.loads((root/'evidence'/(rec['evidence_hash']+'.json')).read_text())
                            if rec['pins'] != pins or rec['model_settings'] != SETTINGS or digest(content) != rec['evidence_hash'] or [rec[k] for k in ('task','trial','condition','arm')] != [task,trial,condition,arm]:
                                raise ValueError('Changed evidence or foreign receipt')
                        else:
                            rec = cell(docker, provider, task, arm, trial, condition, pins, root, training)
                        receipts.append(rec)
            if frozen(task) != hashes:
                raise InfrastructureError('Frozen evaluation input changed')
        summary = dict(evaluate.compare(receipts), purpose=run['purpose'], image=IMAGE)
        harness.atomic(root/'summary.json', summary)
        return summary


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', required=True, choices=('smoke','ollama'))
    parser.add_argument('--model')
    parser.add_argument('--model-digest')
    parser.add_argument('--condition', choices=('cold','warm','both'), default='cold')
    parser.add_argument('--trials', type=int, default=1)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--resume', action='store_true')
    args=parser.parse_args()
    if args.mode=='smoke' and (args.model or args.model_digest):
        parser.error('The smoke worker does not accept model settings')
    try:
        provider=LocalOllama(args.model,args.model_digest) if args.mode=='ollama' else None
        with tempfile.TemporaryDirectory(prefix='ios-bench-docker-') as cfg:
            summary=compare_run(Docker(cfg), args.output, provider, args.trials,
                                ('cold','warm') if args.condition=='both' else (args.condition,),args.resume)
        print(json.dumps({'purpose':summary['purpose'],'counts':summary['counts']},indent=2))
        if any(summary['counts'][s] for s in ('infrastructure_error','incomplete','provider_failure','unsupported','skipped')):
            return 2
        return 0
    except (InfrastructureError,ProviderError,ValueError,OSError) as e:
        print(str(e), file=sys.stderr)
        return 2


if __name__=='__main__':
    raise SystemExit(main())
