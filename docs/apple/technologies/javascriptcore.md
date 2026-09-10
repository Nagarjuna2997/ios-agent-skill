# JavaScriptCore

## Context

Load this when a task names **JavaScriptCore** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/javascriptcore) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Evaluate JavaScript programs from within an app, and support JavaScript scripting of your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `JavaScriptCore`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.5 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Execution Environment

- [JSVirtualMachine](https://developer.apple.com/documentation/javascriptcore/jsvirtualmachine)
- [JSContext](https://developer.apple.com/documentation/javascriptcore/jscontext)

### JavaScript Code

- [JSValue](https://developer.apple.com/documentation/javascriptcore/jsvalue)
- [JSManagedValue](https://developer.apple.com/documentation/javascriptcore/jsmanagedvalue)

### Native Code

- [JSExport](https://developer.apple.com/documentation/javascriptcore/jsexport)

### C API

- [C JavaScriptCore API](https://developer.apple.com/documentation/javascriptcore/c-javascriptcore-api)

### Reference

- [JavaScriptCore Constants](https://developer.apple.com/documentation/javascriptcore/javascriptcore-constants)

### Variables

- [kJSTypeBigInt](https://developer.apple.com/documentation/javascriptcore/kjstypebigint)

### Functions

- [JSBigIntCreateWithDouble(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsbigintcreatewithdouble(_:_:_:))
- [JSBigIntCreateWithInt64(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsbigintcreatewithint64(_:_:_:))
- [JSBigIntCreateWithString(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsbigintcreatewithstring(_:_:_:))
- [JSBigIntCreateWithUInt64(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsbigintcreatewithuint64(_:_:_:))
- [JSValueCompare(_:_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluecompare(_:_:_:_:))
- [JSValueCompareDouble(_:_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluecomparedouble(_:_:_:_:))
- [JSValueCompareInt64(_:_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluecompareint64(_:_:_:_:))
- [JSValueCompareUInt64(_:_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluecompareuint64(_:_:_:_:))
- [JSValueIsBigInt(_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvalueisbigint(_:_:))
- [JSValueToInt32(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluetoint32(_:_:_:))
- [JSValueToInt64(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluetoint64(_:_:_:))
- [JSValueToUInt32(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluetouint32(_:_:_:))
- [JSValueToUInt64(_:_:_:)](https://developer.apple.com/documentation/javascriptcore/jsvaluetouint64(_:_:_:))

### Enumerations

- [JSRelationCondition](https://developer.apple.com/documentation/javascriptcore/jsrelationcondition)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
