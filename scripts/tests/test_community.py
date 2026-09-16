import unittest,importlib.util,pathlib,json,copy
root=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('community',root/'scripts/render-community.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Community(unittest.TestCase):
 def setUp(self):self.data=json.loads((root/'site/community-mentions.json').read_text())
 def test_duplicate_tracking_and_fragment(self):
  duplicate=copy.deepcopy(self.data['mentions'][0]);duplicate['id']='duplicate';duplicate['url']+='?utm_source=spam#x';self.data['mentions'].append(duplicate)
  with self.assertRaises(ValueError):m.render(self.data)
 def test_escape_and_safe_links(self):
  self.data['mentions'][0]['platform']='<script>alert(1)</script>'
  s=m.render(self.data);self.assertNotIn('<script>',s);self.assertIn('noopener noreferrer',s)
  self.data['mentions'][0]['url']='javascript:alert(1)'
  with self.assertRaises(ValueError):m.render(self.data)
 def test_idempotent_scoped_update(self):
  page='before'+m.START+'old'+m.END+'after';new=m.update(page,m.render(self.data));self.assertTrue(new.startswith('before'));self.assertTrue(new.endswith('after'));self.assertEqual(new,m.update(new,m.render(self.data)))
 def test_requires_ownership_label(self):
  self.data['mentions'][0].update(kind='own',category='Independent Article')
  with self.assertRaises(ValueError):m.render(self.data)
