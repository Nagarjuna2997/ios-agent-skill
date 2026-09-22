# Backend privacy and account lifecycle

Map data before selecting SDKs: what leaves the device, why, who receives it, how long it persists and how deletion propagates. A backend service name does not determine an app's App Privacy answers. Audit the actual product configuration, optional SDKs and server behavior.

## Service-specific inventory

| Integration | Data and operational questions |
|---|---|
| Supabase | Auth identifiers, Postgres rows, Storage files, function logs and realtime payloads; delete dependent objects and review log retention |
| Firebase | Separate Auth/data/storage from optional Analytics, Crashlytics, FCM and Remote Config; review breadcrumbs, device tokens and consent configuration |
| CloudKit | Private/public/shared scope, synchronized records/assets and participant visibility; inspect local copies and account changes |
| Amplify | Cognito attributes, AppSync data, S3 objects, Lambda logs and optional push/analytics; deletion spans services |
| Appwrite | Identity, database/files/functions and realtime; managed/self-hosted retention and backup policy differ |
| REST / GraphQL | Request payloads, error bodies, access logs, identifiers and resolver/service telemetry; the custom server remains responsible |
| WebSockets | Message contents, subscription metadata, connection logs and retention; avoid token-bearing URLs |

## Apple policy review

Use Apple's current App Privacy guidance to classify data collection, linkage and tracking. Advertising identifiers and tracking are separate decisions; do not request ATT merely because any backend exists. Review SDK privacy manifests and required-reason API use in the actual built dependencies. A manifest does not replace accurate App Privacy disclosures.

App Review 4.8 has conditions and exceptions for apps using third-party/social login. Assess the specific app against the policy rather than asserting every social login always mandates the same implementation. When the app supports account creation, review Apple's in-app account-deletion requirements and applicable exceptions. Signing out, disabling a local cache or opening a support email is not automatically a compliant deletion flow.

For user-generated content, evaluate moderation, reporting and blocking obligations under the applicable guideline. Public chat and a private personal notebook have different risks. Don't use one generic backend checklist as legal approval.

## Deletion workflow

Reauthenticate as needed → submit an authorized deletion operation → stop listeners and pending writes → remove or anonymize dependent records/files according to the disclosed policy → revoke credentials → clear local identity data → present the actual outcome. Explain legally required retention and backup handling. A server failure must not be reported as successful deletion.

## Verification record

Use synthetic identities to test export/deletion, telemetry redaction, account switching and sync cleanup. Inspect network destinations and crash SDK custom fields. Record which configurations were inspected versus exercised on a device; this library does not certify compliance.

Primary sources: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Privacy details](https://developer.apple.com/app-store/app-privacy-details/), [account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [privacy manifests](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files).
