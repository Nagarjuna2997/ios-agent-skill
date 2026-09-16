# Messages

## Context

Load this when a task names **Messages** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/messages) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create app extensions that allow users to send text, stickers, media files, and interactive messages.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Messages`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 10.0 | — | No |
| iPadOS | 10.0 | — | No |
| Mac Catalyst | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Default messaging app

- [Preparing your app to be the default messaging app](https://developer.apple.com/documentation/messages/preparing-your-app-to-be-the-default-messaging-app)

### Custom sticker packs

- [Adding Sticker packs and iMessage apps to the system Stickers app, Messages camera, and FaceTime](https://developer.apple.com/documentation/messages/adding-sticker-packs-and-imessage-apps-to-the-system-stickers-app-messages-camera-and-facetime)
- [Adding your sticker packs to Messages](https://developer.apple.com/documentation/messages/adding-your-sticker-packs-to-messages)
- [MSStickerBrowserViewController](https://developer.apple.com/documentation/messages/msstickerbrowserviewcontroller)
- [MSStickerBrowserView](https://developer.apple.com/documentation/messages/msstickerbrowserview)
- [MSStickerView](https://developer.apple.com/documentation/messages/msstickerview)
- [MSStickerSize](https://developer.apple.com/documentation/messages/msstickersize)

### Custom iMessage app interface

- [IceCreamBuilder: Building an iMessage Extension](https://developer.apple.com/documentation/messages/icecreambuilder-building-an-imessage-extension)
- [Creating a Sticker App with a Custom Layout](https://developer.apple.com/documentation/messages/creating-a-sticker-app-with-a-custom-layout)
- [MSMessagesAppViewController](https://developer.apple.com/documentation/messages/msmessagesappviewcontroller)
- [MSMessagesAppTranscriptPresentation](https://developer.apple.com/documentation/messages/msmessagesapptranscriptpresentation)
- [MSMessagesAppPresentationStyle](https://developer.apple.com/documentation/messages/msmessagesapppresentationstyle)

### Message content

- [MSConversation](https://developer.apple.com/documentation/messages/msconversation)
- [MSSticker](https://developer.apple.com/documentation/messages/mssticker)

### Interactive messages

- [MSMessage](https://developer.apple.com/documentation/messages/msmessage)
- [MSSession](https://developer.apple.com/documentation/messages/mssession)
- [MSMessageLayout](https://developer.apple.com/documentation/messages/msmessagelayout)
- [MSMessageTemplateLayout](https://developer.apple.com/documentation/messages/msmessagetemplatelayout)
- [MSMessageLiveLayout](https://developer.apple.com/documentation/messages/msmessagelivelayout)

### Critical messages

- [Sending SMS messages from an app](https://developer.apple.com/documentation/messages/critical-messaging-api)
- [MSCriticalSMSMessenger](https://developer.apple.com/documentation/messages/mscriticalsmsmessenger)
- [MSRecipient](https://developer.apple.com/documentation/messages/msrecipient)
- [MSCriticalMessage](https://developer.apple.com/documentation/messages/mscriticalmessage)
- [MSCriticalMessagingAuthorizationStatus](https://developer.apple.com/documentation/messages/mscriticalmessagingauthorizationstatus)

### Errors

- [MSStickersErrorDomain](https://developer.apple.com/documentation/messages/msstickerserrordomain)
- [MSMessagesErrorDomain](https://developer.apple.com/documentation/messages/msmessageserrordomain)
- [MSMessageErrorCode](https://developer.apple.com/documentation/messages/msmessageerrorcode)
- [MSCriticalMessagingError](https://developer.apple.com/documentation/messages/mscriticalmessagingerror)

### Classes

- [MSUPIRequest](https://developer.apple.com/documentation/messages/msupirequest)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
