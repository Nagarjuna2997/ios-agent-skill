# SiriKit

## Context

Load this when a task names **SiriKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/sirikit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Empower users to interact with their devices through voice, intelligent suggestions, and personalized workflows.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 10.0 | — | No |
| iPadOS | 10.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 12.0 | — | No |
| tvOS | 14.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 3.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Frameworks

- [Intents](https://developer.apple.com/documentation/intents)
- [IntentsUI](https://developer.apple.com/documentation/intentsui)

### Sample code

- [Adding Shortcuts for Wind Down](https://developer.apple.com/documentation/sirikit/adding-shortcuts-for-wind-down)
- [Booking Rides with SiriKit](https://developer.apple.com/documentation/sirikit/booking-rides-with-sirikit)
- [Handling Payment Requests with SiriKit](https://developer.apple.com/documentation/sirikit/handling-payment-requests-with-sirikit)
- [Handling Workout Requests with SiriKit](https://developer.apple.com/documentation/sirikit/handling-workout-requests-with-sirikit)
- [Integrating Your App with Siri Event Suggestions](https://developer.apple.com/documentation/sirikit/integrating-your-app-with-siri-event-suggestions)
- [Managing Audio with SiriKit](https://developer.apple.com/documentation/sirikit/managing-audio-with-sirikit)
- [Providing Hands-Free App Control with Intents](https://developer.apple.com/documentation/sirikit/providing-hands-free-app-control-with-intents)
- [Soup Chef: Accelerating App Interactions with Shortcuts](https://developer.apple.com/documentation/sirikit/soup-chef-accelerating-app-interactions-with-shortcuts)
- [Soup Chef with App Intents: Migrating custom intents](https://developer.apple.com/documentation/sirikit/soup-chef-with-app-intents-migrating-custom-intents)

### Articles

- [Adding User Interactivity with Siri Shortcuts and the Shortcuts App](https://developer.apple.com/documentation/sirikit/adding-user-interactivity-with-siri-shortcuts-and-the-shortcuts-app)
- [Defining Relevant Shortcuts for the Siri Watch Face](https://developer.apple.com/documentation/sirikit/defining-relevant-shortcuts-for-the-siri-watch-face)
- [Deleting Donated Shortcuts](https://developer.apple.com/documentation/sirikit/deleting-donated-shortcuts)
- [Dispatching intents to handlers](https://developer.apple.com/documentation/sirikit/dispatching-intents-to-handlers)
- [Improving Siri Media Interactions and App Selection](https://developer.apple.com/documentation/sirikit/improving-siri-media-interactions-and-app-selection)
- [Improving interactions between Siri and your messaging app](https://developer.apple.com/documentation/sirikit/improving-interactions-between-siri-and-your-messaging-app)
- [Registering Custom Vocabulary with SiriKit](https://developer.apple.com/documentation/sirikit/registering-custom-vocabulary-with-sirikit)
- [Confirming the Details of an Intent](https://developer.apple.com/documentation/sirikit/confirming-the-details-of-an-intent)
- [Handling an Intent](https://developer.apple.com/documentation/sirikit/handling-an-intent)
- [Resolving the Parameters of an Intent](https://developer.apple.com/documentation/sirikit/resolving-the-parameters-of-an-intent)
- [Generating a List of Ride Options](https://developer.apple.com/documentation/sirikit/generating-a-list-of-ride-options)
- [Handling the Ride-Booking Intents](https://developer.apple.com/documentation/sirikit/handling-the-ride-booking-intents)
- [Donating Reservations](https://developer.apple.com/documentation/sirikit/donating-reservations)
- [Specifying Synonyms for Your App Name](https://developer.apple.com/documentation/sirikit/specifying-synonyms-for-your-app-name)
- [Intent Phrases](https://developer.apple.com/documentation/sirikit/intent-phrases)
- [Localizing Your Vocabulary for Chinese Dialects](https://developer.apple.com/documentation/sirikit/localizing-your-vocabulary-for-chinese-dialects)
- [Parameter Vocabularies](https://developer.apple.com/documentation/sirikit/parameter-vocabularies)
- [Offering Actions in the Shortcuts App](https://developer.apple.com/documentation/sirikit/offering-actions-in-the-shortcuts-app)
- [Creating an Intents App Extension](https://developer.apple.com/documentation/sirikit/creating-an-intents-app-extension)
- [Requesting Authorization to Use Siri](https://developer.apple.com/documentation/sirikit/requesting-authorization-to-use-siri)
- [Structuring Your Code to Support App Extensions](https://developer.apple.com/documentation/sirikit/structuring-your-code-to-support-app-extensions)
- [Providing Live Status Updates](https://developer.apple.com/documentation/sirikit/providing-live-status-updates)
- [Donating Shortcuts](https://developer.apple.com/documentation/sirikit/donating-shortcuts)
- [Configuring the View Controller for Your Custom Interface](https://developer.apple.com/documentation/sirikit/configuring-the-view-controller-for-your-custom-interface)
- [Configuring Your Intents UI App Extension Target](https://developer.apple.com/documentation/sirikit/configuring-your-intents-ui-app-extension-target)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
