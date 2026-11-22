import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixtureUIScheme} from './ui-test-scheme.mjs';

test('run only fixture UI targets from both scheme writers', () => {
  for (const expanded of [false, true]) {
    const reference = name => expanded
      ? `<TestableReference skipped = "NO">\n <BuildableReference\n BuildableName = "${name}.xctest">\n</BuildableReference>\n</TestableReference>`
      : `<TestableReference skipped="NO"><BuildableReference BuildableName="${name}.xctest"/></TestableReference>`;
    const ui = reference('TrailUITests');
    assert.equal(fixtureUIScheme('<Testables>'+reference('TrailTests')+ui+'</Testables>', 'Trail'), '<Testables>'+ui+'</Testables>');
    assert.throws(() => fixtureUIScheme(reference('TrailTests'), 'Trail'));
    assert.throws(() => fixtureUIScheme(ui+reference('OtherTests'), 'Trail'));
  }
});
