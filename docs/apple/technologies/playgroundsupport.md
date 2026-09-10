# Playground Support

## Context

Load this when a task names **Playground Support** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/playgroundsupport) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Share playground data, manage live views, and control the execution of a playground.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 12.0 | — | No |
| Swift Playgrounds | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Playground Pages

- [PlaygroundPage](https://developer.apple.com/documentation/playgroundsupport/playgroundpage)

### Live Views

- [PlaygroundLiveViewable](https://developer.apple.com/documentation/playgroundsupport/playgroundliveviewable)
- [PlaygroundLiveViewRepresentation](https://developer.apple.com/documentation/playgroundsupport/playgroundliveviewrepresentation)
- [PlaygroundLiveViewSafeAreaContainer](https://developer.apple.com/documentation/playgroundsupport/playgroundliveviewsafeareacontainer)

### Page-View Communication

- [Messaging Between a Playground Page and the Always-On Live View](https://developer.apple.com/documentation/playgroundsupport/messaging_between_a_playground_page_and_the_always-on_live_view)
- [PlaygroundRemoteLiveViewProxy](https://developer.apple.com/documentation/playgroundsupport/playgroundremoteliveviewproxy)
- [PlaygroundRemoteLiveViewProxyDelegate](https://developer.apple.com/documentation/playgroundsupport/playgroundremoteliveviewproxydelegate)
- [PlaygroundLiveViewMessageHandler](https://developer.apple.com/documentation/playgroundsupport/playgroundliveviewmessagehandler)

### Data Persistence

- [PlaygroundKeyValueStore](https://developer.apple.com/documentation/playgroundsupport/playgroundkeyvaluestore)
- [PlaygroundValue](https://developer.apple.com/documentation/playgroundsupport/playgroundvalue)
- [playgroundSharedDataDirectory](https://developer.apple.com/documentation/playgroundsupport/playgroundshareddatadirectory)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
