import unittest,tempfile,pathlib,json,sys,shutil
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import harness,protocol,isolation
class Contracts(unittest.TestCase):
 def test_thirty_and_six_categories(self):
  fixtures=[json.loads(p.read_text()) for p in (harness.ROOT/'fixtures').glob('*/fixture.json')]
  self.assertEqual(len(fixtures),30)
  self.assertEqual({c:sum(f['category']==c for f in fixtures) for c in {f['category'] for f in fixtures}},dict(concurrency=5,**{'swiftui-state-lifecycle':5,'persistence-codable':5,'testing':5,'build-configuration':5,'quality':5}))
 def test_exports_all_hide_oracles(self):
  with tempfile.TemporaryDirectory() as td:
   for p in sorted((harness.ROOT/'fixtures').iterdir()):
    out=pathlib.Path(td)/p.name;files=harness.export(p.name,out)
    self.assertIn('TASK.md',files)
    self.assertFalse(any('oracle' in n or 'reference' in n or '.git' in n or 'Check.swift' in n for n in files))
 def test_symlink_export_refused_before_copy(self):
  with tempfile.TemporaryDirectory() as td:
   root=pathlib.Path(td)/'repo/benchmarks/v2';fixture=root/'fixtures/C01';(fixture/'starter').mkdir(parents=True);(fixture/'fixture.json').write_text('{}');(fixture/'starter/leak').symlink_to(__file__)
   with patch.object(harness,'ROOT',root):
    with self.assertRaisesRegex(ValueError,'Symlink'):harness.export('C01',pathlib.Path(td)/'out')
 def test_cell_tamper_identity_and_crash(self):
  with tempfile.TemporaryDirectory() as td:
   out=pathlib.Path(td);cell=out/'C01-reference';cell.mkdir();harness.atomic(cell/'commands.json',[])
   r={'id':'C01','variant':'reference','protocolHash':'p','status':'pass','artifacts':{'commands.json':harness.sha((cell/'commands.json').read_bytes())}}
   harness.atomic(cell/'result.json',r);harness.atomic(cell/'complete.json',{'resultHash':harness.sha((cell/'result.json').read_bytes())})
   self.assertEqual(harness.verify_cell(cell,'p','C01','reference')['status'],'pass')
   (out/'.pending-crashed').mkdir();self.assertEqual(harness.verify_cell(cell,'p','C01','reference')['status'],'pass')
   with self.assertRaises(ValueError):harness.verify_cell(cell,'other','C01','reference')
   with self.assertRaises(ValueError):harness.verify_cell(cell,'p','C02','reference')
   r['status']='fail';harness.atomic(cell/'result.json',r)
   with self.assertRaises(ValueError):harness.verify_cell(cell)
 def test_guard_is_not_comment_style(self):
  with tempfile.TemporaryDirectory() as td:
   root=pathlib.Path(td);source=root/'A.swift';source.write_text('// avoid @unchecked Sendable\nlet s=#"nonisolated(unsafe)"#\n/* nested /* @preconcurrency */ okay */')
   self.assertIsNone(harness.source_guard(root));source.write_text('final class X: @unchecked Sendable {}');self.assertIsNotNone(harness.source_guard(root))
 def test_outcome_categories(self):
  completed=lambda b:dict(status='completed',passed=b)
  self.assertEqual(protocol.pair_outcome(completed(True),completed(False)),'regression')
  self.assertEqual(protocol.pair_outcome(completed(True),completed(True)),'tie_pass')
  self.assertEqual(protocol.pair_outcome(completed(False),completed(False)),'tie_fail')
  for kind in ['provider_failure','unsupported','skipped','infrastructure_error','incomplete']:
   self.assertEqual(protocol.pair_outcome(completed(True),dict(status=kind)),kind)
 def test_scoring_requires_pins(self):
  with self.assertRaises(ValueError):protocol.validate_pins({})
  pins={k:'exact-version' for k in protocol.REQUIRED};pins.update(protocol_version=protocol.VERSION,isolation='networkless-container',worker_count=1)
  for k in list(pins):
   if k.endswith('_hash'):pins[k]='a'*64
  self.assertEqual(len(protocol.validate_pins(pins)),64)
  for key in protocol.REQUIRED:
   broken=dict(pins);broken[key]=None
   with self.assertRaises(ValueError):protocol.validate_pins(broken)
 def test_agent_boundary_network_and_mount(self):
  with tempfile.TemporaryDirectory() as td:
   if isolation.os.getuid()==0:
    with self.assertRaisesRegex(ValueError,'non-root'):isolation.tool_command(td,'swift@sha256:'+'a'*64,['swift','--version'])
    return
   cmd=isolation.tool_command(td,'swift@sha256:'+'a'*64,['swift','--version'])
   self.assertIn(f'--user={isolation.os.getuid()}:{isolation.os.getgid()}',cmd)
   self.assertIn('--network=none',cmd);self.assertIn('--pull=never',cmd);self.assertEqual(cmd.count('--mount'),1)
   self.assertNotIn(str(harness.ROOT),str(cmd))
   with self.assertRaises(ValueError):isolation.tool_command(td,'swift:latest',['swift'])
   with self.assertRaises(ValueError):isolation.tool_command(td,'swift@sha256:'+'a'*64,['swift'],'simulator')
if __name__=='__main__':unittest.main()
