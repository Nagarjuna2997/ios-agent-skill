# iOS 27 release verification

Checked **2026-09-16**. Release status is distinct from this repository’s compilation and runtime evidence.

| Item | Primary evidence | Repository verification |
|---|---|---|
| iOS 27.0 | [Apple release: September 14, build 24A437](https://developer.apple.com/news/releases/?id=09142026a) | Released; no local iOS 27 simulator test |
| Xcode 27 / Swift 6.4 | [Released September 14](https://support.apple.com/en-us/149040), [SDK notes](https://developer.apple.com/documentation/xcode-release-notes/xcode-27-release-notes) | Local host remains Xcode 26.6 / Swift 6.3.3 |
| Core AI and Evaluations | [Core AI](https://developer.apple.com/documentation/coreai), [Evaluations](https://developer.apple.com/documentation/evaluations) platform metadata identifies 27.0 without beta flags | Documentation reviewed; Xcode 27 compilation pending |
| App Intents | [Framework updates](https://developer.apple.com/documentation/updates/appintents), [OS release notes](https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-27-release-notes) | Static reviewer tests; no live Siri acceptance test |
| Foundation Models | [Framework updates](https://developer.apple.com/documentation/updates/foundationmodels) | AppleRecipes tool compiles with Xcode 26.6; deterministic tests, not live model generation |

## Latest public release-feed additions

Rechecked Apple's [release feed](https://developer.apple.com/news/releases/) on
2026-09-16. It now lists **27.2 beta** for iOS/iPadOS (24B5084k), macOS
(26B5086k), tvOS (24K5088l), visionOS (24N5088l), watchOS (24S5086l), and
Xcode 27.2 beta (27B5019j). These are prereleases, separate from the released
27.0 baseline. Their appearance in the feed does not establish local compile or
runtime compatibility; keep per-symbol availability guards and test with the
corresponding SDK before adopting APIs.

The 405-technology directory and 97 update/release-note landing pages were fetched
again for npm 2.7.0. Their public metadata was unchanged from the earlier snapshot.
No developer-account pages, certificates, signing profiles or credentials were
used to build these resources.

## Corrections that matter

[SiriKit updates](https://developer.apple.com/documentation/updates/sirikit) still describe existing standard/custom intents participating in enhanced Siri. We found no primary evidence for blanket SiriKit deprecation or an App-Intents-only requirement. `review_app_intents` therefore reports migration advice, not a deprecation error.

Schemas are a semantic integration choice, not a requirement for every intent. Apple also documents onscreen content through a `Transferable` entity associated with `NSUserActivity.appEntityIdentifier`, without requiring schema adoption. The reviewer’s `appleIntelligence` and `onscreenContent` checks are explicit opt-ins. They are reminders to inspect missing integration evidence, not compiler diagnostics.

The iOS 27 notes include schema migration details: `calendar.deleteEvents` becomes `calendar.deleteEvent`; the photo-asset schema gains properties that may require availability-gated adoption. Review the notes for the domain actually used by the app.

## Snapshot and validation boundaries

The technology directory and update-page topic maps were fetched again on 2026-09-16. The fetch completed before replacing snapshots. They are dated discovery references, not a copy of every symbol’s documentation or proof that every linked feature works.

Do not remove generic guidance about beta SDKs, TestFlight, or `.provisional` notification permissions: those are unrelated to the iOS 27 release-status correction. Historical changelog descriptions remain historical.

The Xcode 27 agent setup, Core AI execution, third-party Foundation Models adapters, and real Siri behavior still require their respective toolchain, provider and device tests. No new API keys are required for the shipped static checks or deterministic sample tests.
