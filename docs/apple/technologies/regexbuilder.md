# RegexBuilder

## Context

Load this when a task names **RegexBuilder** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/regexbuilder) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Use an expressive domain-specific language to build regular expressions, for operations like searching and replacing in text.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `RegexBuilder`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Components

- [CharacterClass](https://developer.apple.com/documentation/regexbuilder/characterclass)
- [Anchor](https://developer.apple.com/documentation/regexbuilder/anchor)
- [Lookahead](https://developer.apple.com/documentation/regexbuilder/lookahead)
- [NegativeLookahead](https://developer.apple.com/documentation/regexbuilder/negativelookahead)
- [ChoiceOf](https://developer.apple.com/documentation/regexbuilder/choiceof)

### Quantifiers

- [One](https://developer.apple.com/documentation/regexbuilder/one)
- [Optionally](https://developer.apple.com/documentation/regexbuilder/optionally)
- [ZeroOrMore](https://developer.apple.com/documentation/regexbuilder/zeroormore)
- [OneOrMore](https://developer.apple.com/documentation/regexbuilder/oneormore)
- [Repeat](https://developer.apple.com/documentation/regexbuilder/repeat)
- [Local](https://developer.apple.com/documentation/regexbuilder/local)

### Captures

- [Capture](https://developer.apple.com/documentation/regexbuilder/capture)
- [TryCapture](https://developer.apple.com/documentation/regexbuilder/trycapture)
- [Reference](https://developer.apple.com/documentation/regexbuilder/reference)

### Builders

- [RegexComponentBuilder](https://developer.apple.com/documentation/regexbuilder/regexcomponentbuilder)
- [AlternationBuilder](https://developer.apple.com/documentation/regexbuilder/alternationbuilder)

### Operators

- [...(_:_:)](https://developer.apple.com/documentation/regexbuilder/'...(_:_:)-16g2a)
- [...(_:_:)](https://developer.apple.com/documentation/regexbuilder/'...(_:_:)-629xh)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
