import unittest,tempfile,json
from copy import deepcopy
from evaluate import *
def cell(arm):
 pins={k:'exact' for k in protocol.REQUIRED}
 for k in ('fixture_hash','oracle_hash','repair_hash','skill_hash','harness_hash','analyzer_hash'):pins[k]='a'*64
 pins.update(protocol_version=protocol.VERSION,isolation='networkless-container',worker_count=1)
 return dict(version=VERSION,model_settings={'temperature':0,'seed':None,'max_output_tokens':4096},task='evaluation-1',trial=1,condition='cold',component='profiles',arm=arm,state_id=arm,pins=pins,memory_hash='b'*64,evidence_hash='c'*64,status='completed',passed=True,quality={'compiler':True,'acceptance':True},metrics={k:None for k in METRICS})
class Tests(unittest.TestCase):
 def test_nulls_ties_failures(self):
  a,b=cell('baseline'),cell('optimized');r=compare([a,b]);self.assertEqual(r['counts']['tie_pass'],1);self.assertIsNone(r['pairs'][0]['optimized_minus_baseline']['input_tokens'])
  b['passed']=False;self.assertEqual(compare([a,b])['counts']['regression'],1)
  for s in ('unsupported','skipped','provider_failure','infrastructure_error'):
   b['status']=s;self.assertEqual(compare([a,b])['counts'][s],1)
 def test_pins_leakage_isolation(self):
  a,b=cell('baseline'),cell('optimized');b['pins']['requested_model']='other'
  with self.assertRaises(ValueError):compare([a,b])
  b=cell('optimized');b['state_id']=a['state_id']
  with self.assertRaises(ValueError):compare([a,b])
  b=cell('optimized');b['training_tasks']=['evaluation-1']
  with self.assertRaises(ValueError):validate(b)
 def test_resume_immutable(self):
  with tempfile.TemporaryDirectory() as d:
   c=cell('baseline');p=save_cell(d,c);self.assertEqual(save_cell(d,c),p);c['passed']=False
   with self.assertRaises(ValueError):save_cell(d,c)
 def test_cold_warm_separate(self):
  cells=[cell('baseline'),cell('optimized')];warm=deepcopy(cells)
  for c in warm:c.update(condition='warm',training_tasks=['training-only'],state_id=c['state_id']+'-warm')
  self.assertEqual(compare(cells+warm)['counts']['tie_pass'],2)

class NativeEvidence(unittest.TestCase):
 def test_committed_native_log_integrity(self):
  import gzip
  base=pathlib.Path(__file__).parent/'evidence'
  data=json.loads((base/'native-compiler.json').read_text())
  for row in data['brokenBuilds']+data['referenceBuilds']:
   self.assertEqual(hashlib.sha256(gzip.decompress((base/row['log']).read_bytes())).hexdigest(),row['sha256'])
  self.assertEqual([r['action'] for r in data['brokenBuilds']],['continue','strategy','stop'])
  self.assertTrue(all(r['success'] for r in data['referenceBuilds']))

if __name__=='__main__':unittest.main()
