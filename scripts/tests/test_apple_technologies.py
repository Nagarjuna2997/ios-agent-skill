import copy
import importlib.util
import pathlib
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('catalog', pathlib.Path(__file__).parents[1] / 'sync-apple-technologies.py')
catalog = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(catalog)


def record():
    return dict(name='Example', slug='example', url='https://developer.apple.com/documentation/example',
                categories=['System'], languages=['swift'], summary='', modules=[], platforms=[],
                deprecated=False, sourceKind='docc', verifiedURL='https://developer.apple.com/documentation/example',
                guides=[], guide='docs/apple/technologies/example.md', topics=[])


class CatalogTests(unittest.TestCase):
    def snapshot(self):
        return dict(schemaVersion=1, checkedAt='2026-09-10', sourceCount=1, directoryURL='https://developer.apple.com/documentation/technologies', technologies=[record()])

    def test_duplicate_categories_merge_by_canonical_url(self):
        technology = dict(title='Example', destination={'identifier': 'one'}, languages=['swift'])
        doc = dict(sections=[dict(groups=[dict(name='System', technologies=[technology]),
                  dict(name='Developer Tools', technologies=[technology])])],
                  references={'one': {'url': '/documentation/example', 'abstract': []}})
        rows = catalog.inventory(doc)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['categories'], ['System', 'Developer Tools'])

    def test_source_paths_and_topic_anchors_are_preserved(self):
        self.assertEqual(catalog.canonical("https://developer.apple.com/musickit/web/"), "https://developer.apple.com/musickit/web/")
        self.assertEqual(catalog.canonical("/documentation/example#topic"), "https://developer.apple.com/documentation/example#topic")

    def test_empty_directory_fails(self):
        with self.assertRaises(ValueError):
            catalog.inventory({'sections': [], 'references': {}})

    def test_duplicate_url_rejected_even_with_different_name_and_slug(self):
        data = self.snapshot()
        other = copy.deepcopy(data['technologies'][0])
        other.update(name='Alias', slug='alias', url=other['url'] + '/')
        data['technologies'].append(other)
        data['sourceCount'] = 2
        with self.assertRaisesRegex(ValueError, 'Duplicate technology url'):
            catalog.validate(data)

    def test_missing_entry_fails_count_check(self):
        data = self.snapshot()
        data['sourceCount'] = 2
        with self.assertRaisesRegex(ValueError, 'count'):
            catalog.validate(data)

    def test_reused_guide_is_never_generated(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / 'existing.md').write_text('authored implementation')
            data = self.snapshot()
            data['technologies'][0].update(guides=['existing.md'], guide='existing.md')
            catalog.validate(data, root)
            result = catalog.outputs(data)
            self.assertNotIn('existing.md', result)
            self.assertEqual(len(result), 1)
            self.assertEqual((root / 'existing.md').read_text(), 'authored implementation')

    def test_missing_existing_guide_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            data = self.snapshot()
            data['technologies'][0].update(guides=['missing.md'], guide='missing.md')
            with self.assertRaisesRegex(ValueError, 'Missing or unsafe'):
                catalog.validate(data, pathlib.Path(directory))

    def test_path_traversal_rejected(self):
        data = self.snapshot()
        data['technologies'][0]['slug'] = '../../outside'
        with self.assertRaisesRegex(ValueError, 'Unsafe slug'):
            catalog.validate(data)

    def test_external_entry_uses_actual_destination(self):
        row = record()
        row.update(sourceKind='external', verifiedURL='https://www.swift.org/documentation/docc/')
        rendered = catalog.render_guide(row, '2026-09-10')
        self.assertIn('[verified destination](https://www.swift.org/documentation/docc/)', rendered)
        self.assertNotIn('tutorials/datahttps:', rendered)

    def test_obsolete_generated_file_is_detected_and_pruned(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            old = root / 'docs/apple/technologies/obsolete.md'
            old.parent.mkdir(parents=True)
            old.write_text('Generated from `docs/apple/technologies.json`')
            with self.assertRaisesRegex(ValueError, 'Obsolete'):
                catalog.reconcile({}, root=root)
            catalog.reconcile({}, write=True, root=root)
            self.assertFalse(old.exists())

    def test_unrecognized_authored_file_is_not_pruned(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            authored = root / 'docs/apple/technologies/custom.md'
            authored.parent.mkdir(parents=True)
            authored.write_text('Custom authored guide')
            with self.assertRaisesRegex(ValueError, 'Unrecognized'):
                catalog.reconcile({}, write=True, root=root)
            self.assertEqual(authored.read_text(), 'Custom authored guide')

    def test_fetch_retries_then_surfaces_failure(self):
        with patch.object(catalog.urllib.request, 'urlopen', side_effect=OSError('unavailable')) as request:
            with self.assertRaisesRegex(RuntimeError, 'unavailable'):
                catalog.fetch('https://developer.apple.com/documentation/example')
            self.assertEqual(request.call_count, 3)


if __name__ == '__main__':
    unittest.main()
