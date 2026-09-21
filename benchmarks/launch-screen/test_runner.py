import importlib.util,pathlib,unittest,json
spec=importlib.util.spec_from_file_location('launch_runner',pathlib.Path(__file__).with_name('run.py'));r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
class Metrics(unittest.TestCase):
 def test_counts_completed_events_once_and_marks_unknown_iterations(self):
  events=[{'type':'item.started','item':{'type':'command_execution','command':'xcodebuild build'}},{'type':'item.completed','item':{'type':'command_execution','command':'xcodebuild build'}},{'type':'item.completed','item':{'type':'command_execution','command':'swift test'}},{'type':'turn.completed','usage':{'input_tokens':10}}]
  m=r.metrics('\n'.join(map(json.dumps,events)));self.assertEqual(m['tool_calls'],2);self.assertEqual(m['observed_build_attempts'],1);self.assertEqual(m['observed_test_attempts'],1);self.assertIsNone(m['internal_model_turns'])
 def test_missing_usage_is_unknown(self):self.assertIsNone(r.metrics('not json')['usage'])
 def test_resume_checks_artifact_bytes(self):
  import tempfile
  with tempfile.TemporaryDirectory() as td:
   out=pathlib.Path(td);artifact=out/'evidence.json';artifact.write_text('{}');record=out/'record.json';record.write_text(json.dumps({'artifacts':{'evidence.json':r.digest(artifact)}}))
   r.verify_record(record,out)
   artifact.write_text('changed')
   with self.assertRaises(SystemExit):r.verify_record(record,out)
if __name__=='__main__':unittest.main()
