import copy
import json
import unittest
import metrics as m


def stream(*events):
    return '\n'.join(json.dumps(e) for e in events)


class MetricsTests(unittest.TestCase):
    def test_codex_success_dedup_tokens_and_missing(self):
        text = stream({'type':'thread.started'},
          {'type':'item.started','item':{'id':'a','type':'command_execution','command':'swift build'}},
          {'type':'item.completed','item':{'id':'a','type':'command_execution','command':'swift build','exit_code':0}},
          {'type':'item.completed','item':{'id':'b','type':'command_execution','command':'swift test','exit_code':1}},
          {'type':'turn.completed','usage':{'input_tokens':0,'output_tokens':12}})
        result=m.parse_events(text,'codex-jsonl-1')
        self.assertEqual(result['tool_calls'],2)
        self.assertEqual(result['observed_test_attempts'],1)
        self.assertEqual(result['tokens']['input_tokens'],0)
        self.assertIsNone(result['tokens']['cached_input_tokens'])
        self.assertIsNone(result['retries'])

    def test_claude_terminal_usage_not_double_counted(self):
        event={'type':'assistant','message':{'id':'m','usage':{'input_tokens':99},'content':[{'type':'tool_use','id':'t','name':'Bash','input':{'command':'swift test'}}]}}
        r=m.parse_events(stream(event,event,{'type':'result','subtype':'success','usage':{'input_tokens':12}}),'claude-stream-json-1')
        self.assertEqual(r['agent_turns'],1)
        self.assertEqual(r['tool_calls'],1)
        self.assertEqual(r['tokens']['input_tokens'],12)

    def test_failure_and_missing_transcripts(self):
        for fmt,e in [('codex-jsonl-1',{'type':'turn.failed'}),('claude-stream-json-1',{'type':'result','is_error':True})]:
            self.assertTrue(m.parse_events(stream(e),fmt)['provider_failure'])
            self.assertIsNone(m.parse_events('',fmt)['tool_calls'])
        r=m.parse_events('not json','codex-jsonl-1')
        self.assertFalse(r['stream_complete'])
        self.assertIsNone(r['agent_turns'])
        self.assertFalse(m.parse_events(stream({'type':'turn.completed'},{'type':'turn.started'}),'codex-jsonl-1')['stream_complete'])

    def test_indirect_commands_not_inferred(self):
        for cmd in [None, 1, 'bash -c "swift test"','./build.sh','echo swift build','swift build && swift test','python3 wrapper.py']:
            self.assertIsNone(m.command_kind(cmd))
        self.assertEqual(m.command_kind('/usr/bin/xcodebuild -scheme Demo test'),'test')
        r=m.parse_events(stream({'type':'item.completed','item':{'type':'command_execution','id':'a','command':'./build.sh'}},{'type':'turn.completed'}),'codex-jsonl-1')
        self.assertEqual(r['indirect_commands'],1)
        self.assertEqual(r['observed_build_attempts'],0)

    def test_explicit_retry_observer(self):
        r=m.parse_events(stream({'type':'thread.started'},{'type':'benchmark.retry-observer.v1'},{'type':'benchmark.retry.v1','id':'r'},{'type':'benchmark.retry.v1','id':'r'},{'type':'turn.completed'}),'codex-jsonl-1')
        self.assertEqual(r['retries'],1)

    def record(self):
        return m.measurement(stream({'type':'turn.completed','usage':{'input_tokens':3}}),'codex-jsonl-1',provider_seconds=2,scorer_seconds=4,worker_count=1,cache_condition='cold',before={'private.swift':b'a\nb\n'},after={'private.swift':b'a\nc\nd\n'},initial_diagnostics={'warnings':2,'errors':1},final_diagnostics={'warnings':0,'errors':0})

    def test_diff_diagnostics_and_no_text_retained(self):
        r=self.record()
        self.assertEqual(r['diff']['added_lines'],2)
        self.assertEqual(r['diff']['deleted_lines'],1)
        self.assertEqual(r['diagnostics']['warnings']['delta'],-2)
        self.assertNotIn('private.swift',json.dumps(r))
        r=m.parse_events(stream({'type':'turn.completed','usage':{'secret':'CANARY','input_tokens':1},'message':'CANARY'}),'codex-jsonl-1')
        self.assertNotIn('CANARY',json.dumps(r))
        self.assertEqual(m.diff_size({'a':b'\0'},{'b':b'new'})['binary_files'],1)

    def test_pairs_reject_pooling_and_incomplete(self):
        a=dict(client='codex',protocol_hash='fixed',task='C01',trial=1,arm='baseline',status='completed',metrics=self.record())
        b=copy.deepcopy(a);b['arm']='skill'
        self.assertEqual(m.compare([a,b])['pairs'][0]['status'],'paired')
        self.assertIsNone(m.compare([a,b])['pairs'][0]['token_deltas']['output_tokens'])
        self.assertEqual(m.compare([a])['pairs'][0]['status'],'incomplete')
        b['metrics']['event_format']='claude-stream-json-1'
        self.assertEqual(m.compare([a,b])['pairs'][0]['status'],'incompatible_conditions')
        b['status']='provider_failure'
        self.assertEqual(m.compare([a,b])['pairs'][0]['arm_statuses']['skill'],'provider_failure')
        b['client']='claude'
        with self.assertRaises(ValueError):m.compare([a,b])
        with self.assertRaises(ValueError):m.compare([a,a])

    def test_partial_usage_duplicate_terminal_and_truncation(self):
        e={'type':'turn.completed','id':'a','usage':{'input_tokens':5}}
        self.assertEqual(m.parse_events(stream(e,e),'codex-jsonl-1')['tokens']['input_tokens'],5)
        self.assertIsNone(m.parse_events(stream(e,{'type':'turn.completed','id':'b','usage':None}),'codex-jsonl-1')['tokens']['input_tokens'])
        r=m.parse_events(stream({'type':'result','usage':{}},{'type':'assistant','message':{'id':'next','content':[]}}),'claude-stream-json-1')
        self.assertFalse(r['stream_complete'])
        for e in [{'type':'turn.completed','id':[]}, {'type':'item.completed','item':'bad'}, {'type':'assistant','message':{'content':[1]}}, {'type':'assistant','message':{'content':[{'input':'bad'}]}}]:
            r=m.parse_events(stream(e),'codex-jsonl-1')
            self.assertIsNone(r['tool_calls'])
            self.assertEqual(r['malformed_events'],1)

    def test_bad_numeric_data(self):
        self.assertIsNone(m.parse_events(stream({'type':'item.completed','item':{'type':'command_execution','id':['a']}}),'codex-jsonl-1')['tool_calls'])
        self.assertIsNone(m.number(True))
        self.assertIsNone(m.number(float('nan')))
        with self.assertRaises(ValueError):m.parse_events('', 'future-schema')

if __name__=='__main__':unittest.main()
