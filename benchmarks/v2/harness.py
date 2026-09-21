#!/usr/bin/env python3
"""Fixture validation ONLY. Deliberately has no provider/arm execution command."""
import argparse,hashlib,json,os,pathlib,platform,plistlib,shutil,subprocess,tempfile,time,uuid,re
ROOT=pathlib.Path(__file__).resolve().parent
PROTOCOL_VERSION='diagnostic-v2-fixtures-1'
def sha(data):return hashlib.sha256(data).hexdigest()
def tree(root):
 return {str(p.relative_to(root)):sha(p.read_bytes()) for p in sorted(root.rglob('*')) if p.is_file() and not any(x in p.parts for x in ['__pycache__','.build','.git'])}
def atomic(path,value):
 path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_name('.'+path.name+'.'+uuid.uuid4().hex);tmp.write_text(json.dumps(value,indent=2)+'\n');tmp.replace(path)
def command(args,cwd,timeout=60):
 start=time.monotonic()
 try:
  p=subprocess.run(args,cwd=cwd,capture_output=True,text=True,timeout=timeout,env={**os.environ,'SWIFTPM_DISABLE_PACKAGE_MANIFEST_CACHING':'1'})
  return dict(command=args,exit=p.returncode,stdout=p.stdout,stderr=p.stderr,seconds=time.monotonic()-start,status='completed')
 except subprocess.TimeoutExpired as e:return dict(command=args,exit=None,stdout=(e.stdout or b'').decode() if isinstance(e.stdout,bytes) else e.stdout or '',stderr=(e.stderr or b'').decode() if isinstance(e.stderr,bytes) else e.stderr or '',seconds=time.monotonic()-start,status='timeout')
 except FileNotFoundError:return dict(command=args,exit=None,stdout='',stderr='required executable unavailable',seconds=0,status='unsupported')
def toolchain():
 out={'platform':platform.system(),'swift':command(['swift','--version'],ROOT)['stdout'].strip()}
 if platform.system()=='Darwin':
  out.update(xcode=command(['xcodebuild','-version'],ROOT)['stdout'].strip(),sdk=command(['xcrun','--sdk','iphonesimulator','--show-sdk-version'],ROOT)['stdout'].strip(),macos_sdk=command(['xcrun','--sdk','macosx','--show-sdk-version'],ROOT)['stdout'].strip())
 else:out['sdk']='Swift toolchain Foundation, no Apple SDK'
 return out
def freeze(out,lane,simulator):
 protocol={'version':PROTOCOL_VERSION,'purpose':'fixture-validation-NOT-scored','client':'none: fixture validator','model':'none: no inference','toolchain':toolchain(),'lane':lane,'simulator':simulator,'hashes':tree(ROOT)}
 if simulator and platform.system()=='Darwin':
  inventory=json.loads(command(['xcrun','simctl','list','devices','available','--json'],ROOT)['stdout'])
  selected=[{'runtime':runtime,'deviceType':d.get('deviceTypeIdentifier'),'udid':d['udid']} for runtime,devices in inventory['devices'].items() for d in devices if d['udid']==simulator]
  protocol['simulatorIdentity']=selected
 file=out/'protocol.json'
 if file.exists():
  if json.loads(file.read_text())!=protocol:raise ValueError('Protocol/toolchain/fixtures changed; use a new evidence directory')
 else:atomic(file,protocol)
 return protocol
def verify_cell(path,protocol_hash=None,task=None,variant=None):
 complete=json.loads((path/'complete.json').read_text())
 if sha((path/'result.json').read_bytes())!=complete['resultHash']:raise ValueError('Modified cell result')
 r=json.loads((path/'result.json').read_text())
 if protocol_hash is not None and (r['protocolHash']!=protocol_hash or r['id']!=task or r['variant']!=variant):raise ValueError('Foreign cell/protocol')
 for name,digest in r['artifacts'].items():
  if pathlib.Path(name).name!=name or sha((path/name).read_bytes())!=digest:raise ValueError('Modified cell evidence: '+str(path))
 return r

def mask_swift(text):
 # Scanner handles nested block comments, line comments and normal/raw strings.
 out=[];i=0
 while i<len(text):
  if text.startswith('//',i):
   end=text.find('\n',i);end=len(text) if end<0 else end;out.append(' '*(end-i));i=end
  elif text.startswith('/*',i):
   start=i;i+=2;depth=1
   while i<len(text) and depth:
    if text.startswith('/*',i):depth+=1;i+=2
    elif text.startswith('*/',i):depth-=1;i+=2
    else:i+=1
   out.append(' '*(i-start))
  elif text[i]=='"' or (text[i]=='#' and re.match(r'#+"',text[i:])):
   start=i;hashes=0
   while text[i]=='#':hashes+=1;i+=1
   quote='"""' if text.startswith('"""',i) else '"';i+=len(quote);end=quote+'#'*hashes
   while i<len(text):
    if text.startswith(end,i):i+=len(end);break
    if text[i]=='\\':i+=2
    else:i+=1
   out.append(' '*(i-start))
  else:out.append(text[i]);i+=1
 return ''.join(out)

def source_guard(work):
 import re
 for p in work.rglob('*.swift'):
  text=mask_swift(p.read_text())
  if re.search(r'@unchecked\s+Sendable|nonisolated\s*\(\s*unsafe\s*\)|@preconcurrency',text):return 'unsafe concurrency escape'
 return None

def check(fixture,work,variant,simulator):
 meta=json.loads((fixture/'fixture.json').read_text());kind=meta['kind'];logs=[]
 if meta['lane']!='portable' and platform.system()!='Darwin':return 'unsupported',logs,'requires macOS/Xcode'
 if kind=='simulator' and not simulator:return 'unsupported',logs,'explicit Simulator UDID required'
 guard=source_guard(work)
 if guard:return 'fail',logs,guard
 if kind=='plist':
  try:
   p=plistlib.loads((work/'PrivacyInfo.xcprivacy').read_bytes());c=json.loads((fixture/'oracle/contract.json').read_text());items=p['NSPrivacyAccessedAPITypes']
   okay=p['NSPrivacyTracking'] is c['tracking'] and p['NSPrivacyCollectedDataTypes']==[] and isinstance(items,list) and len(items)==1 and items[0]['NSPrivacyAccessedAPIType']==c['category'] and items[0]['NSPrivacyAccessedAPITypeReasons']==[c['reason']]
   return ('pass' if okay else 'fail'),logs,'pinned manifest structure (not legal approval)'
  except (ValueError,KeyError,TypeError,IndexError):return 'fail',logs,'malformed manifest'
 if kind in ['swift','swiftdata']:
  oracle=work/'Evaluator.swift';shutil.copy2(fixture/'oracle/Check.swift',oracle)
  args=['swiftc','-swift-version','6','-strict-concurrency=complete','-warnings-as-errors','-parse-as-library',str(work/'Solution.swift'),str(oracle),'-o',str(work/'check')]
  if kind=='swiftdata':args[1:1]=['-target',platform.machine()+'-apple-macos14.0']
  logs.append(command(args,work,90))
  if logs[-1]['status']=='unsupported':return 'unsupported',logs,'Swift toolchain unavailable'
  if logs[-1]['exit']!=0:return 'fail',logs,'strict Swift compilation'
  if kind=='swiftdata' and meta['id']=='D01':
   # Seed from a separate frozen executable; candidate V1 cannot redefine history.
   seed=work/'Seed.swift';shutil.copy2(fixture/'oracle/Seed.swift',seed)
   logs.append(command(['swiftc','-swift-version','6','-parse-as-library','-target',platform.machine()+'-apple-macos14.0',str(seed),'-o',str(work/'seed')],work,90))
   if logs[-1]['exit']!=0:return 'infrastructure_error',logs,'trusted old-store seeder failed to compile'
   logs.append(command([str(work/'seed'),str(work/'old.store')],work,30))
   if logs[-1]['exit']!=0:return 'infrastructure_error',logs,'old-store seed failed'
   seed.unlink() # never part of a returned candidate archive
   logs.append(command([str(work/'check'),str(work/'old.store')],work,30))
  else:logs.append(command([str(work/'check')],work,meta['timeout']))
  return ('pass' if logs[-1]['exit']==0 else 'fail'),logs,'independent behavioral oracle'
 if kind in ['spm','test-quality']:
  return check_package(fixture,work,logs,meta)
 if kind in ['simulator','xcode-build']:
  from xcode import evaluate
  return evaluate(fixture,work,logs,meta,simulator,command)
 raise ValueError('Unknown fixture kind')

def check_package(fixture,work,logs,meta):
 # Supply trusted tests only after the candidate export has left the agent environment.
 if meta['kind']=='spm':
  target=work/'Tests/FixtureTests';target.mkdir(parents=True,exist_ok=True);shutil.copy2(fixture/'oracle/Check.swift',target/'Check.swift')
  logs.append(command(['swift','test','--disable-automatic-resolution'],work,120))
  return ('pass' if logs[-1]['exit']==0 else 'fail'),logs,'offline package runtime tests'
 # Candidate edits tests, evaluator substitutes both correct and defective production implementations.
 import re
 tests=work/'Tests/FixtureTests/RepairTests.swift'
 if not tests.exists():return 'fail',logs,'missing candidate tests'
 # XCTest count and semantic mutation detection, not style, wording or assertion spelling.
 original=(work/'Sources/Fixture/Solution.swift').read_bytes();outcomes=[];ran_tests=[]
 for name in ['correct','mutant']:
  (work/'Sources/Fixture/Solution.swift').write_bytes((fixture/f'oracle/{name}.swift').read_bytes())
  c=command(['swift','test','--disable-automatic-resolution','--parallel'],work,60);logs.append(c)
  test_output=c['stdout']+c['stderr']
  ran=bool(re.search(r'Executed [1-9][0-9]* test|Test run with [1-9][0-9]* test|\[[1-9][0-9]*/[1-9][0-9]*\] Testing',test_output))
  outcomes.append(c['exit']==0 and ran);ran_tests.append(ran)
  if c['status']!='completed':return 'infrastructure_error',logs,'mutation check did not complete'
  if 'Build complete!' not in test_output:return 'fail',logs,'mutation check must compile before tests'
  if name=='mutant' and (not ran or not re.search(r'(?:failed|failure|issue was recorded)',test_output,re.I)):return 'fail',logs,'mutant requires an observed test failure'
 (work/'Sources/Fixture/Solution.swift').write_bytes(original)
 if outcomes != [True,False]:return 'fail',logs,'tests must pass correct behavior and detect seeded defect'
 # Repeat the correct arm to catch global/order dependent state. No provider arms involved.
 (work/'Sources/Fixture/Solution.swift').write_bytes((fixture/'oracle/correct.swift').read_bytes())
 for _ in range(2):
  logs.append(command(['swift','test','--disable-automatic-resolution','--parallel'],work,60))
  if logs[-1]['exit']!=0:return 'fail',logs,'repeat/parallel inconsistency'
 return 'pass',logs,'test mutation sensitivity and repeated parallel stability'

def export(task,out):
 fixture=ROOT/'fixtures'/task
 if not (fixture/'fixture.json').exists():raise ValueError('Unknown fixture')
 if task not in [p.name for p in (ROOT/'fixtures').iterdir()]:raise ValueError('Unknown fixture ID')
 if out.resolve().is_relative_to(ROOT.parents[1]):raise ValueError('Export must be outside repository checkout')
 if out.exists():raise ValueError('Export destination must be new')
 if (fixture/'starter').is_symlink() or any(p.is_symlink() for p in (fixture/'starter').rglob('*')):raise ValueError('Symlink in starter')
 shutil.copytree(fixture/'starter',out);shutil.copy2(fixture/'brief.md',out/'TASK.md')
 # No .git, reference, oracle, evaluator, symlink or parent checkout enters the export.
 for p in out.rglob('*'):
  if p.is_symlink() or p.name in ['oracle','reference','.git']:raise ValueError('Unsafe export')
 return tree(out)

def validate(out,lane,ids,simulator):
 if ids and set(ids)-{p.name for p in (ROOT/'fixtures').iterdir()}:raise ValueError('Unknown selected fixture')
 if out.resolve().is_relative_to(ROOT):raise ValueError('Evidence must be outside fixture source tree')
 out.mkdir(parents=True,exist_ok=True);protocol=freeze(out,lane,simulator);results=[]
 for fixture in sorted((ROOT/'fixtures').iterdir()):
  meta=json.loads((fixture/'fixture.json').read_text())
  if ids and meta['id'] not in ids:continue
  if lane!='all' and meta['lane']!=lane:
   results.append({'id':meta['id'],'status':'skipped','reason':'outside selected lane'});continue
  pair=[]
  for variant in ['starter','reference']:
   dest=out/(meta['id']+'-'+variant)
   if tree(ROOT)!=protocol['hashes']:raise ValueError('Fixture changed during validation')
   protocol_hash=sha(json.dumps(protocol,sort_keys=True).encode())
   if dest.exists():r=verify_cell(dest,protocol_hash,meta['id'],variant)
   else:
    # Interrupted cells have no completion marker; finished cells remain immutable.
    with tempfile.TemporaryDirectory(prefix='v2-validator-') as td:
     work=pathlib.Path(td)/'workspace';shutil.copytree(fixture/'starter',work)
     if variant=='reference':shutil.copytree(fixture/'reference',work,dirs_exist_ok=True)
     status,logs,reason=check(fixture,work,variant,simulator)
     pending=out/('.pending-'+meta['id']+'-'+variant+'-'+uuid.uuid4().hex);pending.mkdir()
     atomic(pending/'commands.json',logs)
     r={'id':meta['id'],'variant':variant,'status':status,'reason':reason,'purpose':'fixture-validation','protocolHash':sha(json.dumps(protocol,sort_keys=True).encode()),'artifacts':{'commands.json':sha((pending/'commands.json').read_bytes())}}
     if tree(ROOT)!=protocol['hashes']:raise ValueError('Fixture changed during validation')
     atomic(pending/'result.json',r);atomic(pending/'complete.json',{'resultHash':sha((pending/'result.json').read_bytes())});pending.rename(dest)
   pair.append(r)
  status='validated' if [r['status'] for r in pair]==['fail','pass'] else 'unsupported' if any(r['status']=='unsupported' for r in pair) else 'infrastructure_error' if any(r['status']=='infrastructure_error' for r in pair) else 'fixture_error'
  results.append({'id':meta['id'],'status':status,'cells':[r['status'] for r in pair]});print(meta['id'],status,results[-1]['cells'],flush=True)
 atomic(out/'summary.json',{'purpose':'fixture-validation-NOT-comparison','results':results,'provider_failures':[],'ties':[],'regressions':[],'comparison_run':False})
 return all(r['status'] in ['validated','unsupported','skipped'] for r in results)

def main():
 p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='action',required=True)
 v=sub.add_parser('validate');v.add_argument('--output',type=pathlib.Path,required=True);v.add_argument('--lane',choices=['portable','macos','simulator','all'],default='portable');v.add_argument('--ids',nargs='*');v.add_argument('--simulator')
 e=sub.add_parser('export');e.add_argument('--task',required=True);e.add_argument('--output',type=pathlib.Path,required=True)
 a=p.parse_args()
 if a.action=='export':print(json.dumps(export(a.task,a.output),indent=2));return
 import fcntl
 a.output.mkdir(parents=True,exist_ok=True)
 with (a.output/'.lock').open('w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  if not validate(a.output,a.lane,a.ids,a.simulator):raise SystemExit(1)
if __name__=='__main__':main()
