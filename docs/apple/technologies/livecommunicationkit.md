# LiveCommunicationKit

## Context

Load this when a task names **LiveCommunicationKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/livecommunicationkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Initiate and handle VoIP and cellular conversations, coordinate them with other communication apps and the system, and get ready to be a default calling or …

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `LiveCommunicationKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 17.4 | — | No |
| Mac Catalyst | 17.4 | — | No |
| visionOS | 1.1 | — | No |
| watchOS | 10.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Initiating VoIP conversations with LiveCommunicationKit](https://developer.apple.com/documentation/livecommunicationkit/initiating-voip-conversations-with-livecommunicationkit)
- [Preparing your app to be the default dialer app](https://developer.apple.com/documentation/livecommunicationkit/preparing-your-app-to-be-the-default-dialer-app)
- [LiveCommunicationKit updates](https://developer.apple.com/documentation/updates/livecommunicationkit)

### Cellular network conversations

- [TelephonyConversationManager](https://developer.apple.com/documentation/livecommunicationkit/telephonyconversationmanager)
- [StartCellularConversationAction](https://developer.apple.com/documentation/livecommunicationkit/startcellularconversationaction)
- [CellularService](https://developer.apple.com/documentation/livecommunicationkit/cellularservice)
- [Handle](https://developer.apple.com/documentation/livecommunicationkit/handle)

### VoIP conversations

- [ConversationManager](https://developer.apple.com/documentation/livecommunicationkit/conversationmanager)
- [ConversationManagerDelegate](https://developer.apple.com/documentation/livecommunicationkit/conversationmanagerdelegate)
- [ConversationHistoryManager](https://developer.apple.com/documentation/livecommunicationkit/conversationhistorymanager)
- [Conversation](https://developer.apple.com/documentation/livecommunicationkit/conversation)

### Conversation actions

- [ConversationAction](https://developer.apple.com/documentation/livecommunicationkit/conversationaction)
- [EndConversationAction](https://developer.apple.com/documentation/livecommunicationkit/endconversationaction)
- [JoinConversationAction](https://developer.apple.com/documentation/livecommunicationkit/joinconversationaction)
- [MergeConversationAction](https://developer.apple.com/documentation/livecommunicationkit/mergeconversationaction)
- [MuteConversationAction](https://developer.apple.com/documentation/livecommunicationkit/muteconversationaction)
- [PauseConversationAction](https://developer.apple.com/documentation/livecommunicationkit/pauseconversationaction)
- [PlayToneAction](https://developer.apple.com/documentation/livecommunicationkit/playtoneaction)
- [SetTranslatingAction](https://developer.apple.com/documentation/livecommunicationkit/settranslatingaction)
- [StartConversationAction](https://developer.apple.com/documentation/livecommunicationkit/startconversationaction)
- [UnmergeConversationAction](https://developer.apple.com/documentation/livecommunicationkit/unmergeconversationaction)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
