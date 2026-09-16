# Symbols

## Context

Load this when a task names **Symbols** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/symbols) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Apply universal animations to symbol-based images.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Symbols`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | Not specified | — | No |
| Mac Catalyst | 17.0 | — | No |
| macOS | 14.0 | — | No |
| tvOS | 17.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Symbol effects

- [appear](https://developer.apple.com/documentation/symbols/symboleffect/appear)
- [bounce](https://developer.apple.com/documentation/symbols/symboleffect/bounce)
- [disappear](https://developer.apple.com/documentation/symbols/symboleffect/disappear)
- [pulse](https://developer.apple.com/documentation/symbols/symboleffect/pulse)
- [scale](https://developer.apple.com/documentation/symbols/symboleffect/scale)
- [variableColor](https://developer.apple.com/documentation/symbols/symboleffect/variablecolor)

### Symbol content transitions

- [replace](https://developer.apple.com/documentation/symbols/symboleffect/replace)
- [automatic](https://developer.apple.com/documentation/symbols/symboleffect/automatic)

### Symbol effect types

- [AppearSymbolEffect](https://developer.apple.com/documentation/symbols/appearsymboleffect)
- [AutomaticSymbolEffect](https://developer.apple.com/documentation/symbols/automaticsymboleffect)
- [BounceSymbolEffect](https://developer.apple.com/documentation/symbols/bouncesymboleffect)
- [DisappearSymbolEffect](https://developer.apple.com/documentation/symbols/disappearsymboleffect)
- [PulseSymbolEffect](https://developer.apple.com/documentation/symbols/pulsesymboleffect)
- [ReplaceSymbolEffect](https://developer.apple.com/documentation/symbols/replacesymboleffect)
- [ScaleSymbolEffect](https://developer.apple.com/documentation/symbols/scalesymboleffect)
- [VariableColorSymbolEffect](https://developer.apple.com/documentation/symbols/variablecolorsymboleffect)
- [BreatheSymbolEffect](https://developer.apple.com/documentation/symbols/breathesymboleffect)
- [RotateSymbolEffect](https://developer.apple.com/documentation/symbols/rotatesymboleffect)
- [WiggleSymbolEffect](https://developer.apple.com/documentation/symbols/wigglesymboleffect)

### Symbol effect options

- [SymbolEffectOptions](https://developer.apple.com/documentation/symbols/symboleffectoptions)

### Symbol effect protocols

- [SymbolEffect](https://developer.apple.com/documentation/symbols/symboleffect)
- [DiscreteSymbolEffect](https://developer.apple.com/documentation/symbols/discretesymboleffect)
- [IndefiniteSymbolEffect](https://developer.apple.com/documentation/symbols/indefinitesymboleffect)
- [ContentTransitionSymbolEffect](https://developer.apple.com/documentation/symbols/contenttransitionsymboleffect)
- [TransitionSymbolEffect](https://developer.apple.com/documentation/symbols/transitionsymboleffect)

### Structures

- [DrawOffSymbolEffect](https://developer.apple.com/documentation/symbols/drawoffsymboleffect)
- [DrawOnSymbolEffect](https://developer.apple.com/documentation/symbols/drawonsymboleffect)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
