// The fixture supplies only UI tests. The built-in writer emits self-closing
// BuildableReference elements; XcodeGen expands them over several lines.
export function fixtureUIScheme(xml, appName) {
  let uiTargets = 0;
  const result = xml.replace(/<TestableReference\b[^>]*>[\s\S]*?<\/TestableReference>/g, block => {
    const name = /\bBuildableName\s*=\s*"([^"]+)"/.exec(block)?.[1];
    if (name === appName + 'Tests.xctest') return '';
    if (name !== appName + 'UITests.xctest') throw Error('Unexpected fixture test target: ' + name);
    uiTargets++;
    return block;
  });
  if (uiTargets !== 1) throw Error('Expected exactly one fixture UI test target');
  return result;
}
