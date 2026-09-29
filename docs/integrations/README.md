# Apple System Integrations

Connect app features to Apple's user-controlled services with focused Swift previews and evidence-based configuration checks. Included in **npm 2.8.0**. Source package 2.7.3 is reserved for a later npm release.

## Agent workflow

1. Call `list_system_integrations`, then `get_system_integration` with an integration ID.
2. Inspect the user's app with `recommend_system_integrations`. Recommendations require concrete API evidence; an empty project does not receive a wish list.
3. Call `scaffold_system_integration` with `path`, `integration`, and optional `operations`. This returns source previews, not filesystem writes. Review the preview and add the needed components to the app target. It never rewrites the app or changes permissions automatically.
4. Call `check_apple_permissions`, `check_apple_capabilities`, or `review_system_integrations`. Supply the effective selected-target `infoPlist` and `entitlements` paths relative to the app root when known.
5. Build and test cancellation, denied/restricted/limited access, success and unavailable-device behavior. Simulator tests are not device verification.

The source server adds seven tools (40 → 47). Existing clients continue using the same stdio connection. Build the checkout with `npm ci && npm run build` inside mcp-server and configure the client to execute `node /absolute/checkout/mcp-server/dist/unified.js`. Do not expect the new tools from npm until the next package release.

## Supported workflows

| ID | Implementation preview | Existing knowledge |
|---|---|---|
| calendar | Full-access calendars, fetch/create/update/delete and alarms | [EventKit](../frameworks/services/eventkit.md) |
| reminders | Lists, creation, due dates, priority, notes, completion and recurrence | [EventKit](../frameworks/services/eventkit.md) |
| contacts | Permission-free picker plus separately usable store search/create/update | [Contacts](../frameworks/services/contacts.md) |
| photos | Multiple PhotosPicker selection, filtered Transferable loading, add-only image/video saves | [PhotosUI](../frameworks/photosui.md) |
| camera | Permission preflight and presented photo capture; front/rear selection | [AVFoundation](../frameworks/avfoundation.md), [VisionKit](../frameworks/visionkit.md) |
| maps | SwiftUI marker, search, directions and opening Apple Maps | [MapKit](../frameworks/mapkit.md) |
| files | Scoped import, FileDocument export and PDF selection | [Foundation](../frameworks/foundation.md) |
| sharing | ShareLink and UIActivityViewController for text, URLs, images and files | [Framework reference](../frameworks/extended-apple-frameworks.md) |
| shortcuts | Working parameterized duration intent and AppShortcutsProvider | [App Intents](../frameworks/app-intents.md) |
| notifications | Authorization/status, local scheduling, categories, actions and response routing | [UserNotifications](../frameworks/usernotifications.md) |

The registry in `mcp-server/src/integrations/registry.ts` supplies MCP and website metadata. The Swift templates are canonical files in `samples/SystemIntegrationDemo/Sources`; package builds copy only the ten reusable components, not the demo app. Each preview contains a complete starter file, even when operations are supplied; remove unused components before integration. Picker-only Contacts/Photos apps must not retain or invoke the optional direct-access service merely because it appears in the preview.

## Permissions are not capabilities

Privacy usage descriptions explain data access. Authorization is a runtime user decision. Entitlements enable provisioned features. None substitutes for the others.

- Calendar and Reminders use separate iOS 17 access APIs and keys. Full and write-only calendar access are different scopes. Legacy keys apply to legacy OS paths, not every EventKit import.
- PhotosPicker and the contact picker do not themselves require broad library access. Saving photos uses add-only access; direct library reads use read/write access and must accept limited authorization.
- A map displaying supplied coordinates, searching or opening Maps does not require device location. Request location only for actual device-location features.
- Camera video recording requires microphone permission only if audio is captured. AVFoundation playback alone is not camera access.
- Local notifications need runtime authorization but no APNs entitlement. Remote push requires a provider, provisioning and `aps-environment`.
- HealthKit, Apple Pay, CloudKit and remote push entitlements are checked separately when concrete API use is detected. Associated domains and iCloud document-container routing still require manual app/provisioning inspection.
- System sharing exposes AirDrop when available. Apps cannot select AirDrop destinations, silently send mail/SMS or bypass user permission.

## Conservative static coverage

The analyzer identifies concrete permission-request calls for Calendar, Reminders, Contacts, Photos, Camera, microphone, location, Bluetooth and Speech. Health read/share checks require literal nonempty sets; dynamically composed scopes remain unknown. The existing App Store reviewer reuses these operation rules instead of import-based warnings. The existing App Intents analyzer supplies SiriKit migration and optional schema guidance; it is not duplicated.

Missing/empty permission keys and missing/invalid supported entitlements require a resolved configuration. A single standalone plist can be selected automatically; Xcode, xcconfig and multiple-target projects need an explicit effective plist to avoid combining targets. Generated build settings are not evaluated. Unresolved configuration is reported as unknown, never a clean bill of health.

This is lexical review, not a Swift AST or interprocedural analysis. It cannot prove a denied-state UI is absent, that a requested permission is unnecessary, or that every availability branch is correct. Conditional-compilation branches, custom API names and wrappers can affect evidence. Source scans use the existing bounded reader; large/unreadable files may be omitted. Always compile the selected target. No signing profiles, accounts, network services or private source are uploaded.

## Verification and extension

The templates target iOS 17+, with Swift 6 isolation checked by the sample verification script. Contacts limited access requires an iOS 18+ device check; custom camera video/barcode pipelines, device location delegates and app-specific AppEntity/EntityQuery/navigation are guidance routes rather than invented application data models. The sample demonstrates photo selection, reminder/event creation, Maps, sharing and a local notification. Those user actions modify the tester's calendar/reminders; use a test device/account and explicitly choose each action.

To add another integration: add a registry record, a focused compile-tested template, supported evidence patterns, metadata/false-positive tests and guide links. Rebuild the website from the registry. Next candidates are Mail/Messages system composers, Spotlight, Wallet, Apple Pay, MusicKit, WeatherKit, HealthKit, Widgets, Live Activities, Safari, LocalAuthentication and Clipboard. Do not invent direct AirDrop or silent-send APIs.

## Apple sources

- [Calendar authorization](https://developer.apple.com/documentation/eventkit/accessing-calendar-using-eventkit-and-eventkitui)
- [Contact picker](https://developer.apple.com/documentation/contactsui/cncontactpickerviewcontroller)
- [Photos selection](https://developer.apple.com/documentation/photokit/selecting-photos-and-videos-in-ios)
- [Notification authorization](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications)
