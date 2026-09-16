#!/usr/bin/env python3
"""Paired Swift microbenchmark. Never fabricates provider output or acceptance results."""
import argparse, hashlib, json, os, pathlib, shutil, subprocess, tempfile, time, datetime, signal
ROOT=pathlib.Path(__file__).resolve().parents[1]
CASES=json.loads((ROOT/'benchmarks/cases.json').read_text())
def command(argv,cwd,timeout=120):
    start=time.monotonic()
    p=subprocess.Popen(argv,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
    try:
        stdout,stderr=p.communicate(timeout=timeout)
        return dict(exit_code=p.returncode,stdout=stdout,stderr=stderr,seconds=round(time.monotonic()-start,3))
    except subprocess.TimeoutExpired:
        os.killpg(p.pid,signal.SIGKILL);p.communicate()
        return dict(exit_code=124,stdout='',stderr='timeout',seconds=round(time.monotonic()-start,3))
    finally:
        try: os.killpg(p.pid,signal.SIGKILL)
        except ProcessLookupError: pass

def usage(stdout,client):
    tokens={}
    for line in stdout.splitlines():
        try: d=json.loads(line)
        except ValueError: continue
        if client=='codex' and d.get('type')=='turn.completed': tokens=d.get('usage',{})
        if client=='claude' and d.get('type')=='result': tokens=d.get('usage',{})
    return tokens or None

def run(case,client,condition,out,timeout,reference):
    key=f"{client}-{condition}-{case['id']}";record=out/(key+'.json')
    if record.exists():return
    with tempfile.TemporaryDirectory(prefix='ios-agent-bench-') as td:
        work=pathlib.Path(td);(work/'Sources').mkdir();(work/'Sources/Solution.swift').write_text('import Foundation\n')
        command(['git','init','-q'],work)
        prompt=case['prompt']+'\nImplement only Sources/Solution.swift. Use Swift 6 and Foundation. Do not add an entry point, app branding, external dependencies or modify other files. You may typecheck with swiftc -typecheck -swift-version 6 -module-cache-path .build/cache Sources/Solution.swift. Hidden acceptance checks run independently after you finish.'
        if condition=='skill':
            dest=work/'.benchmark-skill';dest.mkdir()
            shutil.copy2(reference/'SKILL.md',dest/'SKILL.md')
            for folder in ['docs','patterns','templates','checklists','samples','scripts']:
                shutil.copytree(reference/folder,dest/folder,ignore=shutil.ignore_patterns('node_modules','.build','.ios-agent','xcuserdata','__pycache__','*.pyc'))
            prompt+='\nFirst read .benchmark-skill/SKILL.md and use its relevant engineering guidance. Reference content is under .benchmark-skill; retrieve only what helps.'
        if client=='codex':args=['codex','exec','--ignore-user-config','--ephemeral','--json','--sandbox','workspace-write','-c','project_doc_max_bytes=0','-C',str(work),prompt]
        else:args=['claude','-p','--safe-mode','--no-session-persistence','--output-format','json','--max-turns','8','--permission-mode','acceptEdits','--tools','Read,Write,Edit,Glob,Grep','--allowedTools','Read,Write,Edit,Glob,Grep','--',prompt]
        response=command(args,work,timeout)
        # Tests are introduced only after the model exits; the agent cannot edit the oracle.
        test='import Foundation\n@main struct Acceptance { static func main() throws {\n'+case['assertions']+'\n} }\n'
        (work/'Acceptance.swift').write_text(test)
        build=command(['swiftc','-swift-version','6','-module-cache-path',str(out/'module-cache'),str(work/'Sources/Solution.swift'),str(work/'Acceptance.swift'),'-o',str(work/'acceptance')],work)
        tests=command([str(work/'acceptance')],work,30) if build['exit_code']==0 else None
        review=command(['node',str(ROOT/'benchmarks/review.mjs'),str(work/'Sources')],work)
        try:findings=json.loads(review['stdout'])['findings']
        except (ValueError,KeyError):findings=None
        source=(work/'Sources/Solution.swift').read_text()
        # Save only synthetic source and bounded diagnostics, never client config/auth files.
        (out/(key+'.swift')).write_text(source)
        result=dict(case=case['id'],client=client,condition=condition,provider_exit=response['exit_code'],provider_seconds=response['seconds'],usage=usage(response['stdout'],client),compile_pass=build['exit_code']==0,test_pass=tests is not None and tests['exit_code']==0,blockers=None if findings is None else sum(f['severity']=='blocker' for f in findings),source_sha256=hashlib.sha256(source.encode()).hexdigest(),compile_diagnostics=build['stderr'].replace(str(work),'<fixture>').replace(str(out),'<results>')[-4000:],provider_error=response['stderr'][-500:] if response['exit_code'] else None)
        record.write_text(json.dumps(result,indent=2)+'\n');print(key,result['provider_exit'],result['compile_pass'],result['test_pass'],flush=True)
def main():
    p=argparse.ArgumentParser();p.add_argument('--client',choices=['codex','claude'],required=True);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--timeout',type=int,default=180);p.add_argument('--case');p.add_argument('--condition',choices=['baseline','skill']);a=p.parse_args()
    out=a.output.resolve();out.mkdir(parents=True,exist_ok=True)
    metadata=out/('environment-'+a.client+'.json')
    reference_files={}
    for folder in ['docs','patterns','templates','checklists','samples','scripts']:
        for f in sorted((ROOT/folder).rglob('*')):
            if f.is_file() and not any(x in f.parts for x in ['node_modules','.build','.ios-agent','xcuserdata','__pycache__']) and f.suffix!='.pyc':
                reference_files[str(f.relative_to(ROOT))]=hashlib.sha256(f.read_bytes()).hexdigest()
    reference_files['SKILL.md']=hashlib.sha256((ROOT/'SKILL.md').read_bytes()).hexdigest()
    reviewer_files={str(f.relative_to(ROOT)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted((ROOT/'mcp-server/dist').rglob('*.js'))}
    protocol=dict(cases_sha256=hashlib.sha256((ROOT/'benchmarks/cases.json').read_bytes()).hexdigest(),harness_sha256=hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),review_script_sha256=hashlib.sha256((ROOT/'benchmarks/review.mjs').read_bytes()).hexdigest(),reference_files=reference_files,reviewer_files=reviewer_files,timeout_seconds=a.timeout,client_version=command([a.client,'--version'],ROOT)['stdout'].strip())
    if metadata.exists():
        prior=json.loads(metadata.read_text())
        if prior.get('protocol')!=protocol:raise SystemExit('Protocol/content/client differs from existing results. Use a fresh output directory.')
    else:
        metadata.write_text(json.dumps(dict(date=datetime.datetime.now(datetime.timezone.utc).isoformat(),revision=command(['git','rev-parse','HEAD'],ROOT)['stdout'].strip(),protocol=protocol,swift=command(['swift','--version'],ROOT)['stdout'].strip(),limitations=['One trial per condition; Swift microtasks, not full apps','Client default models; do not compare clients as controlled model experiments','Only supplied assertions are checked; no complete-correctness claim','Claude file tools and Codex shell tools differ; compare conditions within each client','No MCP or subagent bundle is supplied to the model']),indent=2)+'\n')

    # Freeze the treatment once; later repository edits cannot change later cells.
    with tempfile.TemporaryDirectory(prefix='ios-agent-reference-') as td:
        reference=pathlib.Path(td)
        for relative,digest in reference_files.items():
            target=reference/relative;target.parent.mkdir(parents=True,exist_ok=True)
            data=(ROOT/relative).read_bytes()
            if hashlib.sha256(data).hexdigest()!=digest:
                raise SystemExit('Reference changed during snapshot; restart with fresh output.')
            target.write_bytes(data)
        for i,case in enumerate(CASES):
            if a.case and case['id']!=a.case:continue
            order=['baseline','skill'] if i%2==0 else ['skill','baseline']
            for condition in order:
                if not a.condition or condition==a.condition:run(case,a.client,condition,out,a.timeout,reference)
if __name__=='__main__':main()
