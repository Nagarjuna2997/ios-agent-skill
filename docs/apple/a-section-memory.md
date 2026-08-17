# Apple Documentation A-Section Memory

## Context

Load this when the Apple documentation navigator shows A-section technologies, or when the user mentions Accelerate, Accessibility, accessories, account/data transfer, advertising attribution, AlarmKit, analytics, App Clips, App Intents, App Store Connect API, or other A-section framework names.

This is memory, not a list of links. It covers the A-section items visible in the Apple documentation navigator snapshot.

## A-section routing table

| Name | Route first |
|---|---|
| Accelerate | `docs/frameworks/accelerate.md` |
| Accessibility | `docs/frameworks/accessibility.md` |
| Accessory Access | Accessory privacy and permission memory in this file |
| Accessory Live Activities | Accessory forwarding memory in this file plus ActivityKit |
| Accessory Notifications | Accessory forwarding memory in this file |
| Accessory Transport Extension | Accessory extension memory in this file |
| AccessorySetupKit | `docs/frameworks/extended-apple-frameworks.md` plus this file |
| Account & Organizational Data Sharing | Account data governance memory in this file |
| Account Data Transfer | Account migration memory in this file |
| Accounts | Legacy account integration memory in this file |
| ActivityKit | `docs/frameworks/activitykit.md` |
| AdAttributionKit | Advertising attribution memory in this file |
| Address Book | Legacy contacts memory in this file |
| Address Book UI | Legacy contacts UI memory in this file |
| AdServices | Advertising attribution memory in this file |
| AdSupport | Advertising identifier privacy memory in this file |
| Advanced Commerce API | Commerce server memory in this file |
| AlarmKit | Alarm memory in this file |
| Analytics Reports | App Store analytics memory in this file |
| App Clips | `docs/frameworks/app-clips.md` |
| App Data Transfer | App migration memory in this file |
| App Intents | `docs/frameworks/app-intents.md` |
| App Intents Testing | `docs/frameworks/app-intents-intelligence.md`, `docs/testing/evaluations.md` |
| App License Delivery SDK | Commerce/license delivery memory in this file |
| App Store Connect API | Distribution automation memory in this file |

## Accelerate memory

Accelerate is for high-performance CPU math, signal processing, image processing, linear algebra, sparse solvers, vector operations, and vImage.

Choose it when:

- The task is numeric, image, audio, signal, matrix, FFT, convolution, or vector-heavy.
- The result must be deterministic and local.
- Core ML is too high-level, and Metal is too low-level.

Do not choose it when:

- The task is simple UI math.
- The operation belongs to Core ML, Vision, Metal, or AVFoundation.
- The code would run synchronously on the main actor.

Implementation memory:

- Accelerate APIs are synchronous.
- Treat heavy Accelerate work as background work even though the calls look like normal Swift.
- Own non-Sendable setup objects, such as FFT setup, inside an actor or a confined service.
- Use known-answer tests for transforms.
- Validate buffer sizes and strides before calling C-backed APIs.

## Accessibility memory

Accessibility is not a final pass; it is product correctness.

Choose it when:

- Any UI, custom control, chart, canvas, map, game scene, widget, Live Activity, or AR/spatial view is built.

Implementation memory:

- Every meaningful control needs label, trait, value, and hint when needed.
- Decorative views should be hidden from assistive technologies.
- Dynamic Type, contrast, Reduce Motion, VoiceOver order, Switch Control, keyboard access, and captions matter.
- Custom drawn UI needs explicit accessibility representation.
- Live Activities, widgets, and accessory displays also need accessible descriptions.

Verification:

- Inspect VoiceOver order.
- Test text scaling.
- Check contrast.
- Check motion alternatives.
- Run UI tests for critical identifiers where possible.

## Accessory family memory

The accessory family is about consented communication between an iPhone app and external hardware. It is not generic networking.

Includes:

- Accessory Access
- Accessory Live Activities
- Accessory Notifications
- Accessory Transport Extension
- AccessorySetupKit
- ExternalAccessory
- Core Bluetooth
- MFi-related flows

Default route:

1. Use AccessorySetupKit for guided accessory setup and authorization.
2. Use Accessory Notifications for forwarding iOS notifications to an accessory.
3. Use Accessory Live Activities only after notification forwarding exists.
4. Use Accessory Transport Extension when the accessory requires extension-based transport.
5. Use Core Bluetooth for BLE communication.
6. Use ExternalAccessory for supported MFi protocol accessories.

Privacy memory:

- Accessory setup is user-consented.
- Notification forwarding and Live Activity forwarding expose sensitive user content.
- Present clear settings and revocation paths.
- Do not forward more than the accessory needs to display or act on.

Verification:

- Physical accessory or test accessory path.
- Permission denied, allowed, changed in settings.
- Disconnect/reconnect.
- Multiple nearby accessories.
- Background/foreground transitions.
- Region/account constraints when the framework has them.

## Accessory Live Activities memory

Accessory Live Activities forwards Live Activity status updates and alerts from iPhone to an accessory.

Choose it when:

- The accessory has its own display or alert surface.
- The product needs live task status outside the phone.
- Notification forwarding is already part of the accessory experience.

Do not choose it when:

- The app only needs iPhone Lock Screen or Dynamic Island Live Activities.
- The accessory does not need Live Activity data.

Implementation memory:

- Start with Accessory Notifications.
- Add Live Activity forwarding after notification forwarding works.
- Use the accessory data provider extension to receive lifecycle updates.
- Treat forwarded content as sensitive.

## Accessory Notifications memory

Accessory Notifications forwards iOS notification content to an accessory after user permission.

Choose it when:

- A hardware accessory needs to display or react to iPhone notifications.

Implementation memory:

- Request forwarding for a specific accessory.
- Check forwarding status before presenting accessory notification UI.
- Provide settings access.
- Handle notification identifiers, source app name, dates, actions, attachments, icons, priority, and Apple Intelligence summaries if present.

Risk:

- Notifications can contain private messages, attachments, and summaries.
- Never treat forwarded notification text as public accessory telemetry.

## Accessory Transport Extension memory

Accessory Transport Extension belongs to accessory communication that needs extension-hosted transport.

Choose it when:

- The accessory integration requires system-managed extension transport rather than only in-app Core Bluetooth or ExternalAccessory.

Implementation memory:

- Keep the extension small.
- Expect memory and time limits.
- Keep communication protocol versioned.
- Persist minimal state in shared containers only when needed.
- Test extension launch, suspend, reconnect, and failure recovery.

## Account and data transfer memory

This family is about moving user or organization data between apps, accounts, teams, or services.

Includes:

- Account & Organizational Data Sharing
- Account Data Transfer
- App Data Transfer

Choose it when:

- The product must transfer user data, app data, or organization-managed data in a controlled Apple-supported workflow.

Implementation memory:

- Treat identity, consent, auditability, deletion, and rollback as first-class.
- Separate account identity from app-local user records.
- Map old identifiers to new identifiers explicitly.
- Preserve user privacy and organization policy boundaries.
- Never build a one-off migration script without a dry-run report and failure plan.

Verification:

- Empty account.
- Large account.
- Partially migrated account.
- Revoked permission.
- Duplicate identifiers.
- User cancels mid-flow.
- Organization policy blocks sharing.

## Accounts memory

Accounts is legacy-era account integration. Modern apps usually use AuthenticationServices, OAuth, passkeys, Sign in with Apple, or server-side account flows instead.

Choose it only when:

- Maintaining older code that already depends on it.
- A platform-specific legacy integration requires it.

Default modernization:

- Move user sign-in to AuthenticationServices or a secure OAuth flow.
- Move secrets to Keychain.
- Review privacy and deprecation status before adding new code.

## ActivityKit memory

ActivityKit owns Live Activity lifecycle: request, schedule, update, alert, and end. WidgetKit and SwiftUI own the presentation.

Choose it when:

- A live task needs glanceable status on Lock Screen, Dynamic Island, StandBy, CarPlay, Apple Watch, or paired surfaces.

Implementation memory:

- Check whether Live Activities are enabled before showing start UI.
- Support all required presentations.
- Use App Intents for buttons and toggles.
- Use deep links to launch the app into the matching state.
- Keep content state small.
- End every Live Activity when the real-world task ends.
- Always include a final content state.

Verification:

- Enabled/disabled settings.
- Device presentation differences.
- Push updates.
- Alert configuration.
- Stale date and dismissal policy.
- Accessibility labels.

## Advertising and attribution memory

Includes:

- AdAttributionKit
- AdServices
- AdSupport

Choose these only for advertising attribution, campaign measurement, or ad-network integration.

Privacy memory:

- Advertising identifiers and attribution signals are privacy-sensitive.
- Respect App Tracking Transparency and platform privacy rules.
- Avoid collecting identifiers unless the product actually needs ad measurement.
- Keep attribution separate from product analytics and user profiles unless consent and policy allow it.

Implementation memory:

- Prefer privacy-preserving attribution APIs over raw identifiers.
- Avoid fingerprinting.
- Document exactly what campaign data is collected and why.
- Test limited ad tracking, denied tracking, child/managed accounts, and no-network states.

## Address Book memory

Address Book and Address Book UI are legacy contacts APIs.

Default route:

- Use Contacts and ContactsUI for new code.
- Touch Address Book only for maintenance of older Objective-C code.

Migration memory:

- Map `ABRecord` style code to Contacts objects.
- Re-check authorization behavior.
- Avoid importing all contacts unless the feature needs it.
- Keep contact data out of logs.

## Advanced Commerce API memory

Advanced Commerce API belongs to server-side or advanced App Store commerce workflows, not ordinary in-app purchase UI.

Choose it when:

- The app has complex commerce needs beyond normal StoreKit client flows.
- Server systems need to coordinate App Store commerce data.

Default route:

- Use StoreKit 2 in the app.
- Use App Store Server API for transaction status, history, notifications, refunds, and subscriptions.
- Add Advanced Commerce only when normal StoreKit/App Store Server API is not enough.

Verification:

- Sandbox and production separation.
- Idempotent server handling.
- Signed data validation.
- Refund, revocation, grace period, renewal, and cancellation.

## AlarmKit memory

AlarmKit schedules prominent alarms and countdowns with system-managed UI.

Choose it when:

- The app needs a true alarm or timer that the system presents prominently.
- The user explicitly schedules time-based alerting.

Do not choose it when:

- A normal local notification is enough.
- The app wants hidden background execution.

Implementation memory:

- Add the required usage description.
- Request authorization before scheduling.
- Use `AlarmManager` for scheduling, snoozing, cancelling, pausing, and resuming.
- Model traditional alarms and countdown timers separately.
- Use localized strings for presentation.
- Provide stop and secondary intents where the UI needs actions.
- Treat alarm IDs as stable product identifiers.

Verification:

- Permission missing, denied, granted.
- One-time and repeating schedule.
- Countdown duration.
- Pause/resume.
- Snooze.
- Stop intent.
- App relaunch.
- Time zone and daylight-saving changes.

## Analytics Reports memory

Analytics Reports is about App Store/App Store Connect reporting, not in-app event logging.

Choose it when:

- The task is fetching, analyzing, or automating App Store analytics/reporting data.

Implementation memory:

- Keep credentials server-side.
- Treat reports as business data.
- Version report schemas.
- Build import jobs idempotently.
- Separate user privacy analytics from sales, installs, crashes, and business metrics.

## App Clips memory

App Clips are lightweight app experiences launched from codes, NFC, links, Maps, Safari, Messages, or place cards.

Implementation memory:

- Keep scope tiny.
- Use the full app for account-heavy or long-running flows.
- Handle invocation URL.
- Preserve continuity into full app install.
- Keep privacy prompts minimal and justified.

## App Intents and App Intents Testing memory

App Intents expose deterministic actions and entities to Siri, Shortcuts, Spotlight, widgets, controls, and Apple Intelligence.

Implementation memory:

- Model actions as typed intents.
- Model nouns as entities.
- Keep parameters clear and localized.
- Return predictable results.
- Use intents for actions; use Foundation Models for language around actions.

Testing memory:

- Test entity resolution.
- Test phrase coverage.
- Test unavailable states.
- Test permission denial.
- Test widget/control/Live Activity invocation if the intent is used there.

## App License Delivery SDK memory

App License Delivery SDK belongs to license entitlement delivery for apps that need server-side or external license integration.

Choose it when:

- The product has an Apple-supported app license delivery workflow.

Implementation memory:

- Keep license validation server-side where possible.
- Cache only what is safe.
- Support revocation, renewal, offline grace, and clock skew.
- Keep user messaging clear when license state blocks access.

## App Store Connect API memory

App Store Connect API automates App Store Connect operations.

Choose it when:

- Automating builds, TestFlight, metadata, users, provisioning, analytics, app info, submissions, or reporting.

Implementation memory:

- Store API keys securely.
- Scope keys narrowly.
- Build idempotent scripts.
- Do not commit private keys.
- Separate CI automation from local developer credentials.
- Log request IDs and high-level outcomes, not secrets.

Verification:

- Dry-run mode.
- Sandbox/test app where possible.
- Rate-limit and retry handling.
- Permission failure.
- Expired/revoked key.
- App Store Connect role mismatch.

## A-section anti-patterns

- Using legacy Address Book in new code instead of Contacts.
- Treating accessory notification content as low-sensitivity telemetry.
- Starting Live Activity forwarding before notification forwarding.
- Using AlarmKit as a background task scheduler.
- Running Accelerate on the main actor because the API call is synchronous and short-looking.
- Using advertising identifiers without privacy review.
- Automating App Store Connect with personal credentials committed to the repo.
- Calling a framework beta production-ready without noting risk.
