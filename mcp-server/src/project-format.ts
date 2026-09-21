/** Configuration recognition only: .xcproj is inside .xcodeproj, not its replacement. */
export function isXcodeConfiguration(path: string): boolean {
  return /(?:^|\/)[^/]+\.xcodeproj\/[^/]+\.(?:pbxproj|xcproj)$/.test(path.replaceAll('\\', '/'));
}
export function jsonProjectStatus(text: string): 'json-object-unresolved' | 'invalid-json' | 'unsupported-json-root' {
  try {
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? 'json-object-unresolved' : 'unsupported-json-root';
  } catch { return 'invalid-json'; }
}
export const JSON_PROJECT_LIMITATION = 'JSON .xcproj configuration detected. JSON syntax can be checked, but target/build-setting schema resolution is not implemented. Resolve with a compatible Xcode; do not infer missing targets, launch settings, or convert the file automatically.';
