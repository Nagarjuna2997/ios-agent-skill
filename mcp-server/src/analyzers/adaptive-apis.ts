import { SourceFile } from './types.js';
import { appIntentsCode } from './app-intents.js';

/** Apple symbol metadata checked 2026-09-21. Recognition is not type resolution. */
const SYMBOLS = [
  ['SwiftUI', 'ArrangementView', 'arrangementview'],
  ['SwiftUI', 'ArrangementViewStyle', 'arrangementviewstyle'],
  ['SwiftUI', 'SplitArrangementViewStyle', 'splitarrangementviewstyle'],
  ['SwiftUI', 'OverlayArrangementViewStyle', 'overlayarrangementviewstyle'],
  ['SwiftUI', 'arrangementViewStyle', 'view/arrangementviewstyle(_:)'],
  ['SwiftUI', 'splitArrangementLayoutRatio', 'view/splitarrangementlayoutratio(_:)'],
  ['UIKit', 'UIArrangementViewController', 'uiarrangementviewcontroller'],
  ['UIKit', 'UISplitArrangement', 'uisplitarrangement-swift.struct'],
  ['UIKit', 'UIOverlayArrangement', 'uioverlayarrangement-swift.struct'],
] as const;
export function recognizeAdaptiveAPIs(files: SourceFile[]) {
  return files.flatMap(file => {
    const code = appIntentsCode(file.content);
    return SYMBOLS.flatMap(([framework, name, path]) => {
      if (!new RegExp(`\\bimport\\s+${framework}\\b`).test(code) || new RegExp(`\\b(?:class|struct|enum|protocol|typealias)\\s+${name}\\b`).test(code)) return [];
      const match = new RegExp(`\\b${name}\\b`).exec(code);
      return match ? [{ file: file.path, line: code.slice(0, match.index).split('\n').length,
        symbol: name, framework, introducedIOS: '27.1', beta: true, checkedAt: '2026-09-21',
        source: `https://developer.apple.com/documentation/${framework.toLowerCase()}/${path}`,
        verification: 'syntax-reference-only',
        guidance: 'Use an SDK declaring this symbol; verify iOS/iPadOS 27.1 availability and fallback with the compiler. No runtime support is inferred.' }] : [];
    });
  });
}
