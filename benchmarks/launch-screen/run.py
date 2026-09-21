#!/usr/bin/env python3
"""Separate diagnostic experiment. Does not read or overwrite historical results."""
import argparse, base64, datetime, hashlib, importlib.util, json, pathlib, shutil, tempfile
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('baseline_harness',ROOT/'benchmarks/run.py')
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
CASES=json.loads((pathlib.Path(__file__).parent/'cases.json').read_text())
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def metrics(stdout):
    counts=dict(agent_turns=0,tool_calls=0,observed_build_attempts=0,observed_test_attempts=0)
    usage=None
    for line in stdout.splitlines():
        try:e=json.loads(line)
        except ValueError:continue
        if e.get('type')=='turn.completed':counts['agent_turns']+=1;usage=e.get('usage')
        if e.get('type')!='item.completed':continue
        item=e.get('item',{});kind=item.get('type')
        if kind in ('command_execution','mcp_tool_call','web_search','file_change'):
            counts['tool_calls']+=1
        if kind=='command_execution':
            import re
            cmd=item.get('command','')
            counts['observed_build_attempts']+=int(bool(re.search(r'\bxcodebuild\b|\bswift\s+build\b',cmd)))
            counts['observed_test_attempts']+=int(bool(re.search(r'\bxcodebuild\b[^\n]*\btest\b|\bswift\s+test\b|\bnode\s+--test\b',cmd)))
    # Codex turn.completed is a top-level turn, not its internal model iteration count.
    return {**counts,'usage':usage,'internal_model_turns':None,'attempt_scope':'observed direct commands; wrappers may hide attempts'}
def verify_record(record,out):
    saved=json.loads(record.read_text())
    if not saved.get('artifacts'):raise SystemExit('Missing evidence manifest')
    for name,sha in saved['artifacts'].items():
        if pathlib.Path(name).name!=name or not (out/name).is_file() or digest(out/name)!=sha:raise SystemExit('Missing/modified evidence: '+name)

def main():
    p=argparse.ArgumentParser();p.add_argument('--model',required=True);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--trials',type=int,default=1);p.add_argument('--timeout',type=int,default=300);p.add_argument('--case');a=p.parse_args()
    if a.trials<1 or a.timeout<1:raise SystemExit('Positive trials and timeout required')
    if a.case and a.case not in {c['id'] for c in CASES}:raise SystemExit('Unknown case')
    out=a.output.resolve();out.mkdir(parents=True,exist_ok=True)
    protocol_files=[ROOT/'benchmarks/run.py',ROOT/'mcp-server/test/helpers/launch-project.js',ROOT/'mcp-server/package-lock.json']+list((ROOT/'benchmarks/launch-screen').glob('*'))
    references=[]
    for folder in ['docs','patterns','templates','checklists','samples','scripts']:
        references += [f for f in (ROOT/folder).rglob('*') if f.is_file() and not any(x in f.parts for x in ['node_modules','.build','.git','__pycache__']) and f.suffix!='.pyc']
    references.append(ROOT/'SKILL.md')
    excludes=sorted(str(f.resolve()) for base in [pathlib.Path.home()/'.codex/skills',pathlib.Path.home()/'.agents/skills'] if base.exists() for f in base.rglob('SKILL.md'))
    exclusion_config='['+','.join('{path='+json.dumps(f)+',enabled=false}' for f in excludes)+']'
    protocol=dict(suite='launch-screen-v1',model=a.model,trials=a.trials,timeout=a.timeout,exclusions=excludes,
        hashes={str(f.relative_to(ROOT)):digest(f) for f in protocol_files+references if f.is_file()},
        toolchain={cmd[0]:h.command(cmd,ROOT)['stdout'] for cmd in [['codex','--version'],['xcodebuild','-version'],['swift','--version']]})
    meta=out/'protocol.json'
    if meta.exists():
        if json.loads(meta.read_text())['protocol']!=protocol:raise SystemExit('Protocol changed: use a fresh output directory; archived results are immutable.')
    else:meta.write_text(json.dumps(dict(started=datetime.datetime.now(datetime.timezone.utc).isoformat(),protocol=protocol),indent=2))
    with tempfile.TemporaryDirectory(prefix='launch-reference-') as rd:
        reference=pathlib.Path(rd)
        for f in references:
            rel=f.relative_to(ROOT);target=reference/rel;target.parent.mkdir(parents=True,exist_ok=True)
            if digest(f)!=protocol['hashes'][str(rel)]:raise SystemExit('Reference changed during snapshot')
            shutil.copy2(f,target)
        for i,case in enumerate(CASES):
            if a.case and a.case!=case['id']:continue
            for trial in range(1,a.trials+1):
                for arm in (['baseline','skill'] if (i+trial)%2 else ['skill','baseline']):
                    key=f"{case['id']}-{arm}-{trial:02d}";record=out/(key+'.json')
                    if record.exists():
                        verify_record(record,out)
                        continue
                    with tempfile.TemporaryDirectory(prefix='launch-task-') as td:
                        work=pathlib.Path(td)
                        made=h.command(['node',str(ROOT/'benchmarks/launch-screen/create.mjs'),td,case['id']],ROOT)
                        if made['exit_code']:raise SystemExit(made['stderr'])
                        h.command(['git','init','-q'],work);h.command(['git','add','.'],work)
                        committed=h.command(['git','-c','core.hooksPath=/dev/null','-c','user.name=Benchmark','-c','user.email=benchmark@example.invalid','commit','-qm','Fixture'],work)
                        if committed['exit_code']:raise SystemExit('Fixture snapshot failed')
                        before={str(f.relative_to(work)):digest(f) for f in work.rglob('*') if f.is_file() and '.git' not in f.parts}
                        prompt=case['brief']+'\nPreserve the intended launch mechanism unless asked to remove an obsolete mechanism. Do not modify the app UI or delete its assets. Inspect all build configurations. Write diagnosis.json as {"issues":[{"category":"configuration-reference|asset-reference|storyboard-behavior|configuration-overlap","evidence":"project-relative path and concrete reason"}]}; use an empty issues array if valid. Fix proven defects only. You may build with xcodebuild -project App.xcodeproj -scheme LaunchFixture -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build. Do not access paths outside this fixture except toolchain files. Do not search for benchmark oracles.'
                        if arm=='skill':
                            shutil.copytree(reference,work/'.benchmark-skill');prompt+='\nRead .benchmark-skill/SKILL.md first and retrieve relevant local guidance only.'
                        response=h.command(['codex','exec','--ignore-user-config','--ephemeral','--json','--sandbox','workspace-write','--model',a.model,'-c','features.plugins=false','-c','project_doc_max_bytes=0','-c','skills.config='+exclusion_config,'-C',td,prompt],work,a.timeout)
                        if response['exit_code']:
                            (out/(key+'.provider-failure.json')).write_text(json.dumps({'exit':response['exit_code'],'quality_scored':False}))
                            raise SystemExit('Provider failed; incomplete cell can be resumed: '+key)
                        diagnosis=None
                        try:
                            d=json.loads((work/'diagnosis.json').read_text());issues=d['issues']
                            diagnosis=sorted({x['category'] for x in issues})==sorted(case['expected']) and all(isinstance(x.get('evidence'),str) and x['evidence'].strip() for x in issues)
                        except (OSError,ValueError,KeyError,TypeError):pass
                        oracle=h.command(['node',str(ROOT/'benchmarks/launch-screen/oracle.mjs'),td,case['id']],ROOT)
                        builds={}
                        for configuration in (['Debug','Release'] if case['id']=='release-reference' else ['Debug']):
                            builds[configuration]=h.command(['xcodebuild','-project',str(work/'App.xcodeproj'),'-scheme','LaunchFixture','-sdk','iphonesimulator','-configuration',configuration,'-derivedDataPath',str(work/'.derived'), 'CODE_SIGNING_ALLOWED=NO','build'],work,180)
                        changed=[];artifacts={}
                        for rel,sha in before.items():
                            f=work/rel
                            if not f.exists() or digest(f)!=sha:changed.append(rel)
                        extra=[str(f.relative_to(work)) for f in work.rglob('*') if f.is_file() and not any(x in f.parts for x in ['.git','.derived','.benchmark-skill','build']) and str(f.relative_to(work)) not in before and f.name!='diagnosis.json']
                        # Retain synthetic changed source, diagnosis and full scorer logs, never client auth/config.
                        source={rel:{'encoding':'base64','data':base64.b64encode((work/rel).read_bytes()).decode()} if (work/rel).exists() else None for rel in changed+extra}
                        def save(label,value):
                            f=out/(key+'.'+label+'.json');s=json.dumps(value,indent=2).replace(td,'<fixture>').replace(str(pathlib.Path.home()),'<home>');f.write_text(s+'\n');artifacts[f.name]=digest(f)
                        save('oracle',oracle);save('builds',builds);save('changes',source)
                        # Private local synthetic-run events; do not publish without reviewing for sensitive content.
                        save('provider-events',response)
                        save('diagnosis', (work/'diagnosis.json').read_text() if (work/'diagnosis.json').exists() else None)
                        diff=h.command(['git','diff','--numstat'],work);save('diff',diff)
                        import re
                        warning_lines=sum(len(re.findall(r'^.*\bwarning:', v['stdout']+'\n'+v['stderr'],re.M)) for v in builds.values())
                        error_lines=sum(len(re.findall(r'^.*\berror:', v['stdout']+'\n'+v['stderr'],re.M)) for v in builds.values())
                        result=dict(task=case['id'],arm=arm,trial=trial,diagnosis_category_match=diagnosis,diagnosis_reasoning_review=None,contract_pass=oracle['exit_code']==0,build_pass=all(v['exit_code']==0 for v in builds.values()),app_xctest=None,
                            changed_files=changed,added_files=extra,protected_app_changed='App.swift' in changed or 'Intro.swift' in changed,valid_case_unchanged=not changed and not extra if not case['expected'] else None,
                            final_warning_lines=warning_lines,final_error_lines=error_lines,warning_delta=None,provider_seconds=response['seconds'],metrics=metrics(response['stdout']),artifacts=artifacts)
                        temp=record.with_suffix('.pending');temp.write_text(json.dumps(result,indent=2)+'\n');temp.replace(record)
                        print(key,result['diagnosis_category_match'],result['contract_pass'],result['build_pass'],flush=True)
if __name__=='__main__':main()
