# September 2026 distribution and runtime update notes

## Context

Apple sources checked 2026-09-21. Keep beta runtime behavior, TestFlight eligibility,
App Store distribution and API version numbers separate.

## Pattern

### TestFlight and asset packs

Apple’s September 18 update permits Xcode 27.1 beta iOS/iPadOS 27.1 beta builds for
internal and external TestFlight testing. The September 16 update permits the
listed Xcode 27.2 beta platform SDK builds in TestFlight and adds localized
Apple-hosted asset-pack distribution. Beta testing eligibility is not a general
App Store production-upload guarantee. Verify current upload requirements before
submission. [App Store Connect release notes](https://developer.apple.com/help/app-store-connect/release-notes/).

### ATT and StoreKit Testing on iOS/iPadOS 27.2 beta

Apple documents an expanded ATT prompt and annual EU re-prompting. Its notes name
France, Germany, Italy, Poland and Romania as requiring the alternative prompt.
Use Apple’s current platform guidance; do not implement a custom consent prompt,
a guessed country detector or a hand-rolled annual timer from this summary.

The beta notes resolve delayed eligibility reset after `SKTestSession.clearTransactions()`,
missing `Storefront.updates` after test storefront/locale changes, and error dialogs
appearing despite `dialogsDisabled`. A subscription-bundle purchase can still
incorrectly offer unbundling instead of failing. Pin the test runtime and preserve
a minimal reproduction before blaming app code or weakening an assertion.
[Apple iOS/iPadOS 27.2 beta notes](https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-27_2-release-notes).

### App Store Connect API 4.4

Version 4.4 adds subscription plan availability, storage/animation metrics and
additional performance goals. Background Assets supports locale filtering. Review
replacements for deprecated subscription availability, report permissions and
metric goal keys. Age-rating lookups move from app-store-version endpoints to
app-info endpoints. These are API migration notes, not calls performed by this repo.
[Apple API 4.4 notes](https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-4-4-release-notes).

### App Store Connect API 4.4.1

Version 4.4.1 adds separately versioned in-app purchase, subscription and subscription
group metadata. Their localizations/images attach to the corresponding versions;
review submission items can reference those versions. Older localization/image and
standalone submission resources are deprecated. It also adds adjusted subscription
price equalizations and social-media age-rating attributes. Download and pin the
current OpenAPI schema before generating a client; don’t reuse an old request body
just because a resource name looks similar.
[Apple API 4.4.1 notes](https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-4-4-1-release-notes).

## Anti-Patterns

Do not fabricate endpoint payloads, make account/API calls while updating knowledge,
or describe static guidance as an App Review/compliance guarantee. This update does
not add authenticated App Store Connect API execution.
