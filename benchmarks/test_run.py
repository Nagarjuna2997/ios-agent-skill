import importlib.util, pathlib, tempfile, unittest
spec=importlib.util.spec_from_file_location('harness',pathlib.Path(__file__).with_name('run.py'))
harness=importlib.util.module_from_spec(spec);spec.loader.exec_module(harness)

class HarnessTests(unittest.TestCase):
    def test_timeout_keeps_partial_diagnostics(self):
        result=harness.command(['python3','-u','-c','import time; print("before timeout"); time.sleep(5)'],pathlib.Path('/tmp'),0.1)
        self.assertEqual(result['exit_code'],124)
        self.assertIn('before timeout',result['stdout'])
    def test_provider_failure_is_not_an_acceptance_loss(self):
        original=harness.command
        harness.command=lambda *a,**k:dict(exit_code=1,stdout='',stderr='provider unavailable',seconds=0)
        try:
            with tempfile.TemporaryDirectory() as td:
                out=pathlib.Path(td)
                with self.assertRaises(SystemExit):
                    harness.run(harness.CASES[0],'codex','baseline',out,1,out,1,'test-model','[]')
                files=list(out.glob('*.json'))
                self.assertEqual(len(files),1)
                self.assertTrue(files[0].name.endswith('.provider-failure.json'))
                self.assertNotIn('compile_pass',files[0].read_text())
        finally:harness.command=original

    def test_resume_rejects_missing_evidence(self):
        import json
        with tempfile.TemporaryDirectory() as td:
            out=pathlib.Path(td)
            record=out/("codex-baseline-"+harness.CASES[0]['id']+"-trial-01.json")
            record.write_text(json.dumps({'artifacts':{'missing.build.json':'bad'}}))
            with self.assertRaisesRegex(SystemExit,'Invalid resume artifact'):
                harness.run(harness.CASES[0],'codex','baseline',out,1,out,1,'test-model','[]')

    def test_summary_only_compares_complete_pairs(self):
        import json
        summary_spec=importlib.util.spec_from_file_location('summary',pathlib.Path(__file__).with_name('summarize.py'))
        summary=importlib.util.module_from_spec(summary_spec);summary_spec.loader.exec_module(summary)
        with tempfile.TemporaryDirectory() as td:
            out=pathlib.Path(td)
            (out/'summary.json').write_text('')
            common=dict(client='codex',case='x',trial=1,compile_pass=True,blockers=0,provider_seconds=1)
            (out/'a.json').write_text(json.dumps(dict(common,condition='baseline',test_pass=True)))
            self.assertEqual(summary.summarize(out)['paired_trials'],0)
            (out/'b.json').write_text(json.dumps(dict(common,condition='skill',test_pass=False)))
            self.assertEqual(summary.summarize(out)['acceptance_outcomes'],{'skill_regression':1})

    def test_resume_skips_verified_completed_cell(self):
        import json,hashlib
        with tempfile.TemporaryDirectory() as td:
            out=pathlib.Path(td)
            key='codex-baseline-'+harness.CASES[0]['id']+'-trial-01'
            source=b'import Foundation\n'
            (out/(key+'.swift')).write_bytes(source)
            evidence=out/(key+'.build.json');evidence.write_text('{}')
            (out/(key+'.json')).write_text(json.dumps(dict(
                artifacts={evidence.name:hashlib.sha256(evidence.read_bytes()).hexdigest()},
                source_sha256=hashlib.sha256(source).hexdigest())))
            original=harness.command
            harness.command=lambda *a,**k:self.fail('completed cell reran')
            try:harness.run(harness.CASES[0],'codex','baseline',out,1,out,1,'test-model','[]')
            finally:harness.command=original

if __name__=='__main__':unittest.main()
