import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('daily', ROOT/'scripts/apple-daily-refresh.py')
daily=importlib.util.module_from_spec(spec);spec.loader.exec_module(daily)

class DailyRefresh(unittest.TestCase):
    def test_beta_build_is_not_selected_as_release(self):
        releases=daily.released_xcode_builds('<h2>Xcode 27.2 (27B52)</h2><h2>Xcode 27.1 beta (27A9269)</h2>')
        self.assertIn(('27.2','27B52'),releases);self.assertNotIn(('27.1','27A9269'),releases)
        self.assertIsNone(daily.stable_version('Xcode_27.3_beta.app','Xcode 27.3\nBuild version 27C5020n'))
        self.assertIsNone(daily.stable_version('Xcode_27.3.app','Xcode 27.3\nBuild version 27C5020n'))
        self.assertEqual(daily.stable_version('Xcode_27.2.app','Xcode 27.2\nBuild version 27B52'),(27,2,0))
    def test_dates_alone_are_not_changes(self):
        self.assertEqual(daily.without_date({'checkedAt':'yesterday','entries':[1]}),daily.without_date({'checkedAt':'today','entries':[1]}))
    def test_removals_require_review(self):
        old={'entries':[{'url':'https://apple/a','topics':[{'url':'https://apple/topic'}]}]}
        with self.assertRaises(RuntimeError):daily.check_no_removed(old,{'entries':[{'url':'https://apple/a','topics':[]}]},'entries')
        daily.check_no_removed(old,{'entries':[{'url':'https://apple/a','topics':[{'url':'https://apple/topic'},{'url':'https://apple/new'}]}]},'entries')
    def test_drift_report_preserves_missing_links_and_their_parent(self):
        from unittest.mock import patch
        old={'technologies':[{'url':'https://apple/parent','topics':[{'links':[{'url':'https://apple/still-reachable'}]}]}]}
        new={'technologies':[{'url':'https://apple/parent','topics':[]}]}
        with tempfile.TemporaryDirectory() as tmp:
            report=Path(tmp)/'drift.json'
            with patch.dict('os.environ', {'APPLE_REFRESH_REPORT':str(report)}):
                with self.assertRaisesRegex(RuntimeError,'human review required'):
                    daily.check_no_removed(old,new,'technologies')
                data=json.loads(report.read_text())
                self.assertEqual(data['missingTopicLinks'],['https://apple/still-reachable'])
                self.assertEqual(data['affectedPages'],[{'landingPage':'https://apple/parent','landingPageMissing':False,'missingTopics':['https://apple/still-reachable']}])
                report.unlink()
                daily.check_no_removed(old,old,'technologies')
                self.assertFalse(report.exists())
    def test_plugin_hashes_do_not_copy_content_and_reject_symlink(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/'.claude-plugin').mkdir(); (root/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'xcode-integration'}))
            skill=root/'skills/example';skill.mkdir(parents=True);(skill/'SKILL.md').write_text('private source text')
            data=daily.plugin_inventory(root,'Xcode 27.2');self.assertEqual(len(data['files']),1);self.assertNotIn('private source text',json.dumps(data))
            (skill/'other.md').symlink_to('/etc/passwd')
            with self.assertRaises(RuntimeError):daily.plugin_inventory(root,'Xcode 27.2')

class RefreshOrchestration(unittest.TestCase):
    def test_plugin_only_restores_date_only_files_and_reindexes(self):
        import subprocess
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); apple=root/'docs/apple'; (apple/'technologies').mkdir(parents=True)
            tech={'checkedAt':'old','technologies':[{'url':'https://apple/a','topics':[]}]}
            updates={'checkedAt':'old','entries':[{'url':'https://apple/b','topics':[]}]}
            oldplugin={'xcode':'Xcode 27.2','files':{'one/SKILL.md':'old'}}
            for name,value in [('technologies.json',tech),('updates.json',updates),('xcode-plugin-inventory.json',oldplugin)]: (apple/name).write_text(json.dumps(value))
            for name in ['all-technologies.md','updates-and-release-notes.md','technologies/generated.md']:(apple/name).write_text('old date')
            subprocess.run(['git','init','-q',str(root)],check=True)
            subprocess.run(['git','-C',str(root),'config','user.name','Test'],check=True)
            subprocess.run(['git','-C',str(root),'config','user.email','test@example.org'],check=True)
            subprocess.run(['git','-C',str(root),'add','.'],check=True)
            subprocess.run(['git','-C',str(root),'commit','-qm','fixture'],check=True)
            real_run=subprocess.run; real_check=subprocess.check_output;calls=[]
            def check(args,**kwargs):
                if args[0]=='xcodebuild':return 'Xcode 27.2'
                if args[0]=='xcrun':return str(root)
                return real_check(args,**kwargs)
            def run(args,**kwargs):
                if args[:2]==['python3','scripts/sync-apple-technologies.py']:
                    (apple/'technologies.json').write_text(json.dumps({**tech,'checkedAt':'new'}));(apple/'technologies/generated.md').write_text('new date');return None
                if args[:2]==['python3','scripts/sync-apple-updates.py']:
                    (apple/'updates.json').write_text(json.dumps({**updates,'checkedAt':'new'}));return None
                if args[:2]==['node','scripts/index-local-library.mjs']:calls.append('indexed');return None
                return real_run(args,**kwargs)
            import os
            cwd=Path.cwd()
            try:
                with patch.object(daily,'ROOT',root),patch.object(daily.subprocess,'check_output',side_effect=check),patch.object(daily.subprocess,'run',side_effect=run),patch.object(daily,'plugin_inventory',return_value={'files':{'one/SKILL.md':'new'}}),patch.object(daily,'choose_xcode',return_value=('/Applications/Xcode.app/Contents/Developer','Xcode 27.2')),patch.dict(os.environ,{},clear=True):daily.main()
            finally:os.chdir(cwd)
            self.assertEqual((apple/'technologies/generated.md').read_text(),'old date')
            self.assertEqual(json.loads((apple/'technologies.json').read_text())['checkedAt'],'old')
            self.assertEqual(json.loads((apple/'xcode-plugin-inventory.json').read_text())['files']['one/SKILL.md'],'new')
            self.assertEqual(calls,['indexed'])

if __name__ == '__main__': unittest.main()
