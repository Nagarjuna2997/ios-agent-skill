#!/usr/bin/env python3
"""Offline paired evaluation of trusted observer receipts; never executes agent code.
Uses v2 pin/outcome contracts. Provider execution and hidden-oracle isolation remain
owned by the existing harness; this module must not grant agents oracle access.
"""
import re, argparse, hashlib, importlib.util, json, pathlib, tempfile, os
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('v2protocol',ROOT/'v2/protocol.py')
protocol=importlib.util.module_from_spec(spec);spec.loader.exec_module(protocol)
VERSION='efficiency-pairs-1'
METRICS=('tool_calls','response_bytes','schema_bytes','retries','elapsed_ms','input_tokens','output_tokens','cached_tokens','overhead_ms','memory_characters','interventions')
def validate(cell):
 if cell.get('version')!=VERSION:raise ValueError('Unsupported cell version')
 protocol.validate_pins(cell['pins'])
 if cell.get('component') not in ('profiles','responses','memory','intervention','combined'):raise ValueError('Invalid optimization component')
 if not isinstance(cell.get('model_settings'),dict) or not {'temperature','seed','max_output_tokens'}<=cell['model_settings'].keys():raise ValueError('Explicit model settings required; unavailable seed may be null')
 if cell['arm'] not in ('baseline','optimized') or cell['condition'] not in ('cold','warm'):raise ValueError('Invalid arm/condition')
 if cell['task'] in cell.get('training_tasks',[]):raise ValueError('Evaluation task leaked into training memory')
 if cell['condition']=='cold' and cell.get('training_tasks'):raise ValueError('Cold run contains learned memory')
 if cell['condition']=='warm' and not cell.get('training_tasks'):raise ValueError('Warm run requires declared disjoint training tasks')
 if not isinstance(cell.get('state_id'),str) or not cell['state_id']:raise ValueError('Missing isolated state identity')
 if not re.fullmatch('[a-f0-9]{64}',cell.get('memory_hash','')):raise ValueError('Missing initial memory hash')
 for k in METRICS:
  v=cell['metrics'].get(k)
  if v is not None and (type(v) not in (int,float) or v<0 or not __import__('math').isfinite(v)):raise ValueError('Invalid measured metric '+k)
 if cell['metrics'].get('overhead_ms') is not None and cell['metrics'].get('elapsed_ms') is not None and cell['metrics']['overhead_ms']>cell['metrics']['elapsed_ms']:raise ValueError('Overhead exceeds inclusive elapsed')
 if cell['status']=='completed' and (type(cell.get('passed'))is not bool or not isinstance(cell.get('quality'),dict)):raise ValueError('Missing acceptance/quality evidence')
 if not re.fullmatch('[a-f0-9]{64}',cell.get('evidence_hash','')):raise ValueError('Missing evidence hash')
 return cell

def compare(cells):
 pairs={};states=set();evaluation_tasks={c['task'] for c in cells}
 if any(evaluation_tasks.intersection(c.get('training_tasks',[])) for c in cells):raise ValueError('Training overlaps the evaluation set')
 for c in cells:
  validate(c)
  if c['state_id'] in states:raise ValueError('State reused between experimental cells')
  states.add(c['state_id'])
  key=(c['task'],c['trial'],c['condition'],c['component'])
  pair=pairs.setdefault(key,{})
  if c['arm'] in pair:raise ValueError('Duplicate cell')
  pair[c['arm']]=c
 results=[]
 for key,p in sorted(pairs.items()):
  if set(p)!= {'baseline','optimized'}:results.append({'key':key,'outcome':'incomplete'});continue
  a,b=p['baseline'],p['optimized']
  if a['pins']!=b['pins'] or a['model_settings']!=b['model_settings']:raise ValueError('Mismatched model/task/environment/acceptance pins')
  if a.get('training_tasks',[])!=b.get('training_tasks',[]):raise ValueError('Mismatched training task set')
  outcome=protocol.pair_outcome(a,b)
  delta={k:None if a['metrics'].get(k) is None or b['metrics'].get(k) is None else b['metrics'][k]-a['metrics'][k] for k in METRICS}
  results.append({'key':key,'outcome':outcome,'baseline_quality':a.get('quality'),'optimized_quality':b.get('quality'),'optimized_minus_baseline':delta,'baseline_metrics':a['metrics'],'optimized_metrics':b['metrics']})
 return {'version':VERSION,'pairs':results,'counts':{s:sum(r['outcome']==s for r in results) for s in ('tie_pass','tie_fail','improvement','regression','unsupported','skipped','provider_failure','infrastructure_error','incomplete')},'cost':None,'notice':'Metrics are observer-reported. Null is unavailable. Latency includes optimization overhead. No automatic cost or savings claim.'}

def save_cell(directory,cell):
 """Immutable, atomic per-cell receipts: resumed runs cannot rewrite completed evidence."""
 validate(cell);directory=pathlib.Path(directory);directory.mkdir(parents=True,exist_ok=True)
 key=hashlib.sha256(json.dumps([cell[k] for k in ('task','trial','condition','component','arm')],sort_keys=True).encode()).hexdigest()
 path=directory/(key+'.json');encoded=json.dumps(cell,sort_keys=True,indent=2).encode()
 if path.exists():
  if path.read_bytes()!=encoded:raise ValueError('Conflicting completed cell; preserve original evidence')
  return path
 fd,name=tempfile.mkstemp(dir=directory,prefix='.cell-')
 try:
  with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
  try:os.link(name,path)
  except FileExistsError:
   if path.read_bytes()!=encoded:raise ValueError('Conflicting concurrent receipt')
 finally:os.unlink(name)
 return path
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('cells',type=pathlib.Path);a=parser.parse_args()
 print(json.dumps(compare([json.loads(p.read_text()) for p in sorted(a.cells.glob('*.json'))]),indent=2))
