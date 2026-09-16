import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAppIntents } from '../dist/analyzers/app-intents.js';
import { analyzeSwiftUI } from '../dist/analyzers/swiftui.js';
const file = (content, path = 'Feature.swift') => ({ path, content });
const entity = 'struct Book: AppEntity { let id: String }';
test('SiriKit is a migration advisory, never a blanket deprecation', () => {
  const findings = analyzeAppIntents([file('import Intents\nclass Intent: INIntent {}')]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.match(findings[0].consequence, /not a deprecation/);
  assert.equal(findings[0].line, 1);
});
test('ordinary entities and background intents do not require schemas or view annotations', () => {
  assert.deepEqual(analyzeAppIntents([file(entity + '\nstruct Save: AppIntent {}')]), []);
  assert.deepEqual(analyzeAppIntents([file('struct Save: AppIntent {}')], { onscreenContent: true }), []);
});
test('schema review is opt-in and attributed to the unannotated entity', () => {
  const code = '@AppEntity(schema: .books.book)\n' + entity + '\nstruct Note: AppEntity {}';
  const findings = analyzeAppIntents([file(code)], { appleIntelligence: true });
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /Note/);
  assert.equal(findings[0].line, 3);
});
test('onscreen association can live in another file', () => {
  const flags = { onscreenContent: true };
  assert.equal(analyzeAppIntents([file(entity)], flags)[0].rule, 'onscreen-entity-association-review');
  assert.deepEqual(analyzeAppIntents([file(entity), file('activity.appEntityIdentifier = book.appEntityIdentifier', 'Screen.swift')], flags), []);
});
test('nested comments, strings, raw strings and multiline strings are not source findings', () => {
  const source = ['/* import Intents /* nested */ INIntent */', '// import SiriKit',
    'let x = "INIntent"', 'let y = #"import Intents"#', 'let z = """',
    'struct Fake: AppEntity {}', 'INIntent', '"""', 'struct Real: AppEntity {}'].join('\n');
  const findings = analyzeAppIntents([file(source)], { appleIntelligence: true });
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /Real/);
  assert.equal(findings[0].line, 9);
});
test('test support files do not drive integration findings', () => {
  assert.deepEqual(analyzeAppIntents([file('import Intents', 'IntentTests.swift')]), []);
});
test('current SwiftUI container/document patterns are not treated as deprecated', () => {
  const code = 'import SwiftUI\nForEach(items) { row in Row(row) }.reorderable()\n.reorderContainer(for: Item.self, move: move)\nlet document: any WritableDocument';
  assert.deepEqual(analyzeSwiftUI(file(code)), []);
});

test('generic constraints are not entity conformances', () => {
  for (const code of ['struct Wrapper<T: AppEntity> { let value: T }', 'struct Wrapper<T>: View where T: AppEntity {}']) {
    assert.deepEqual(analyzeAppIntents([file(code)], { appleIntelligence: true, onscreenContent: true }), []);
  }
  assert.equal(analyzeAppIntents([file('struct Entity<T>: Identifiable, AppIntents.AppEntity where T: Sendable {}')], { appleIntelligence: true }).length, 1);
});
