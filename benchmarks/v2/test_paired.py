import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import paired
from paired_worker import Docker, InfrastructureError, LocalOllama, ProviderError


class Spy:
    """A test double used ONLY for observer unit tests. No isolation claims."""
    def __init__(self):
        self.agent_inputs = []
        self.judge_inputs = []
        self.calls = 0

    def probe(self, workspace):
        self.agent_inputs.append(set(p.name for p in workspace.iterdir()))
        return 'Synthetic Swift toolchain test'

    def read_export(self, workspace):
        self.agent_inputs.append(set(p.name for p in workspace.iterdir()))
        return [(workspace/f).read_text() for f in ('TASK.md','Solution.swift')]

    def training_check(self, workspace):
        return {p.name for p in workspace.iterdir()} == {'Solution.swift','TASK.md'}

    def judge(self, workspace):
        self.calls += 1
        self.judge_inputs.append(set(p.name for p in workspace.iterdir()))
        src=(workspace/'Solution.swift').read_text()
        passed=any(src == (paired.HERE/'fixtures'/task/'reference/Solution.swift').read_text() for task in paired.GUIDES)
        return {'compiled': True, 'behavior': passed}


class WorkerTests(unittest.TestCase):
    def test_real_docker_arguments_isolate_only_one_readonly_directory(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            brief=root/'TASK.md'
            brief.write_text('Task')
            (root/'Solution.swift').write_text('fixture')
            result=subprocess.CompletedProcess([],0,b'',b'')
            uid=root.stat().st_uid
            if uid == 0:
                with self.assertRaisesRegex(ValueError,'non-root'):
                    Docker(td).run(root,['true'])
                return
            with patch('paired_worker.subprocess.run',return_value=result) as call:
                Docker(td).run(root,['cat','TASK.md'])
            args=call.call_args.args[0]
            for flag in ('--pull=never','--network=none','--cap-drop=ALL','--security-opt=no-new-privileges',
                         '--read-only',f'--user={uid}:{os.getgid()}'):
                self.assertIn(flag,args)
            self.assertEqual(args.count('--mount'),1)
            self.assertTrue(args[args.index('--mount')+1].endswith('dst=/workspace,readonly'))
            self.assertEqual(set(call.call_args.kwargs['env']),{'HOME','DOCKER_CONFIG','PATH'})
            self.assertNotIn(str(paired.REPO),str(args))
            (root/'Acceptance.swift').write_text('hidden')
            with self.assertRaisesRegex(InfrastructureError,'Unexpected'):
                Docker(td).run(root,['true'])

    def test_provider_is_pinned_and_never_accepts_remote_model(self):
        digest='a'*64
        model=LocalOllama('fixture:7b',digest)
        entry={'name':model.model,'digest':digest,'details':{'format':'gguf'}}
        def query(path,body=None,timeout=10):
            return {'tags':{'models':[entry]},'show':{},'version':{'version':'0.1.1'},
                    'generate':{'model':model.model,'done':True,'response':'{"source":"let a = 1"}',
                                'prompt_eval_count':5}}[path]
        with patch.object(model,'request',side_effect=query):
            self.assertEqual(model.identify()['observed_model'],model.model+'@sha256:'+digest)
            source,metrics=model.generate('prompt',paired.SETTINGS)
            self.assertEqual(source,'let a = 1')
            self.assertEqual(metrics,{'input_tokens':5,'output_tokens':None,'cached_tokens':None})
        with patch.object(model,'request',side_effect=[{'models':[entry]}, {'remote_host':'example'}]):
            with self.assertRaisesRegex(ProviderError,'Cloud-backed'):model.identify()
        with patch.object(model,'request',return_value={'models':[]}):
            with self.assertRaisesRegex(ProviderError,'missing or changed'):model.identify()

    def test_observer_roles_cold_warm_receipts_resume_and_tamper(self):
        fake=Spy()
        def guide(task,arm):
            return 'short' if arm=='optimized' else 'a longer reading'
        with tempfile.TemporaryDirectory() as tmp,patch.object(paired,'read_guide',side_effect=guide):
            out=Path(tmp)/'run'
            result=paired.compare_run(fake,out,conditions=('cold','warm'))
            self.assertEqual(result['counts']['tie_fail'],6)
            self.assertEqual(result['purpose'],'non-model-smoke')
            self.assertTrue(all(s=={'TASK.md','Solution.swift'} for s in fake.agent_inputs))
            self.assertTrue(all(s=={'Acceptance.swift','Solution.swift'} for s in fake.judge_inputs))
            receipts=[json.loads(f.read_text()) for f in (out/'cells').glob('*.json')]
            self.assertEqual(len({r['state_id'] for r in receipts}),12)
            for r in receipts:
                self.assertIsNone(r['metrics']['input_tokens'])
                self.assertEqual(r['training_tasks'],list(paired.TRAINING) if r['condition']=='warm' else [])
                self.assertFalse(set(r['training_tasks']) & set(paired.GUIDES))
            self.assertEqual(paired.compare_run(fake,out,conditions=('cold','warm'),resume=True),result)
            p=next((out/'cells').glob('*.json'));p.write_text(p.read_text()+' ')
            with self.assertRaisesRegex(ValueError,'Changed receipt'):
                paired.compare_run(fake,out,conditions=('cold','warm'),resume=True)

    def test_provider_failure_stays_out_of_quality_scores(self):
        class FailingProvider:
            def generate(self, prompt, settings):
                raise ProviderError('model unavailable')
        fake=Spy()
        pins=dict(paired.SMOKE, swift_version='test', sdk_version='test',
                  protocol_version=paired.protocol.VERSION, isolation='networkless-container',
                  worker_count=1, cache_policy='test', **paired.frozen('C02'))
        with tempfile.TemporaryDirectory() as tmp, patch.object(paired,'read_guide',return_value='guide'):
            receipt=paired.cell(fake,FailingProvider(),'C02','baseline',1,'cold',pins,Path(tmp),{})
            self.assertEqual(receipt['status'],'provider_failure')
            self.assertIsNone(receipt['passed'])
            self.assertEqual(fake.judge_inputs,[])
            self.assertIsNone(receipt['metrics']['input_tokens'])

    def test_live_reference_windows_match_actual_library(self):
        a=json.loads(paired.read_guide('D03','baseline'));b=json.loads(paired.read_guide('D03','optimized'))
        self.assertEqual(a['hash'],b['hash'])
        self.assertTrue(a['content'].startswith(b['content']))
        self.assertEqual(len(b['content']),1600)


if __name__=='__main__':
    unittest.main()
