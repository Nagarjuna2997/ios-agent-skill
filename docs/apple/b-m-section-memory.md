# Apple Documentation B-M Section Memory

## Context

Load this when the Apple documentation navigator shows B-M technologies, or when the user mentions background tasks, browser engines, CallKit, CarPlay, CloudKit, Combine, Contacts, Core frameworks, DeviceCheck, EventKit, File Provider, FinanceKit, games, HealthKit, HomeKit, Journaling Suggestions, localization, MapKit, media, Metal, MetricKit, or nearby device features.

This is internal memory. It is not a link list.

## B-M routing table

| Family | Route first |
|---|---|
| Background execution | `docs/frameworks/background-tasks.md`, performance and App Review memory |
| Browser and web engines | `docs/web/README.md`, `docs/frameworks/extended-apple-frameworks.md` |
| Calling and communications | CallKit/PushKit memory here, UserNotifications |
| CarPlay | platform/extension memory here, HIG |
| Cloud and sync | `docs/frameworks/cloudkit.md`, `docs/data/README.md` |
| Combine | `docs/frameworks/combine.md` |
| Contacts and calendars | `docs/frameworks/services/contacts.md`, `docs/frameworks/services/eventkit.md` |
| Core data/storage | `docs/frameworks/core-data.md`, `docs/frameworks/swiftdata.md`, SQLite memory |
| Core graphics/media/math | Core Graphics/Core Image/Core Text/Core Audio/Core Media memory here |
| Core hardware | `docs/frameworks/hardware/core-bluetooth.md`, `core-motion.md`, `core-nfc.md` |
| Core location/maps | `docs/frameworks/core-location.md`, `docs/frameworks/mapkit.md` |
| Core ML/AI | `docs/ai/machine-learning-brain.md` |
| Security/device integrity | `docs/frameworks/device-integrity.md`, `docs/security/README.md` |
| File/document providers | File Provider memory here |
| Games | SpriteKit, GameplayKit, Game Controller, GameKit memory here |
| Health/home | `docs/frameworks/hardware/healthkit.md`, `homekit.md` |
| Localization | Translation, String Catalogs, locale formatting memory here |
| Metal/media playback | `docs/frameworks/metal.md`, AVFoundation/AVKit/Core Media memory |
| Metrics | OSLog, MetricKit, performance memory |
| Multipeer/nearby | `docs/networking/README.md`, extended frameworks |

## Background execution memory

Background work on Apple platforms is permissioned, time-limited, and user-protective. It is never a generic daemon.

Choose:

- BackgroundTasks for scheduled refresh or processing.
- URLSession background transfers for uploads/downloads.
- Push notifications for server-driven user-visible events.
- Live Activities for live task status, not hidden work.
- Location, audio, Bluetooth, HealthKit, or VoIP modes only when the product genuinely matches that background capability.

Rules:

- Declare the correct background mode.
- Keep work resumable and idempotent.
- Expect termination at any time.
- Never promise exact execution time.
- Measure battery and thermal impact.

Verification:

- Fresh install, denied permissions, low power mode, force quit, reboot, network loss, and long idle periods.

## Browser and web engine memory

Web work splits into WebKit embedding, Safari integration, passkeys/universal links, browser extensions, and highly restricted browser-engine entitlements.

Choose:

- WebKit for embedded web content.
- SafariServices for system Safari flows.
- AuthenticationServices for OAuth/passkeys.
- Universal links for app/web handoff.
- Browser-engine frameworks only when the app has the right entitlement and product category.

Rules:

- Do not build login with a raw embedded web view when ASWebAuthenticationSession is required.
- Treat JavaScript bridges as untrusted IPC.
- Keep cookie/session expectations explicit.
- Test content blockers, private browsing assumptions, and universal link fallback.

## CallKit and communications memory

CallKit is for system-integrated calling UX. PushKit is for time-sensitive VoIP push delivery under strict policy.

Choose CallKit when:

- The app offers real audio/video calls and needs system call UI, recent calls, interruption handling, and lock-screen integration.

Rules:

- Do not use VoIP pushes for non-call notifications.
- Keep caller identity privacy-safe.
- Handle interruptions, route changes, Bluetooth, CarPlay, and lock state.
- Use UserNotifications for normal messages.

Verification:

- Incoming, outgoing, missed, ended, held, muted, Bluetooth route, AirPods, CarPlay, app killed, and network loss.

## CarPlay memory

CarPlay is a driver-safety surface. It is not an app mirroring system.

Choose it only for supported categories such as audio, navigation, EV charging, parking, quick food ordering, messaging, calling, or automaker-supported experiences.

Rules:

- Follow CarPlay templates.
- Keep interaction minimal.
- Never require complex typing.
- Test on simulator and real head units when possible.
- Treat distraction rules as product requirements.

## CloudKit and sync memory

CloudKit is for iCloud-backed app data, private/shared/public databases, subscriptions, and sync. It is not a generic backend replacement for every product.

Rules:

- Model ownership: private, shared, public.
- Design conflict resolution.
- Keep local cache and server truth clear.
- Handle account unavailable, quota, network loss, and zone reset.
- Never block core UI waiting on CloudKit.

Verification:

- Multiple devices, fresh install, account change, offline edits, conflict, share revoke, quota, and server-side deletion.

## Combine memory

Combine is a reactive stream framework. In modern Swift code, prefer async/await and AsyncSequence unless the project already uses Combine or the API is publisher-native.

Rules:

- Store cancellables intentionally.
- Avoid retain cycles in sinks.
- Keep scheduler hops explicit.
- Bridge to async/await at module boundaries when simplifying architecture.

## Contacts and EventKit memory

Contacts and calendar/reminder access are privacy-sensitive.

Rules:

- Request the narrowest permission at the moment of need.
- Avoid importing entire address books or calendars by default.
- Use system pickers when possible.
- Never log contact names, phone numbers, emails, event notes, or attendee data.

Verification:

- Denied, limited/changed authorization, empty store, large store, duplicate contacts, calendar unavailable, and account sync delays.

## Core Data, SwiftData, SQLite, and file storage memory

Choose:

- SwiftData for modern Swift model persistence when the model fits.
- Core Data for mature object graph persistence, existing stores, advanced migration, or CloudKit sync patterns.
- SQLite for explicit relational schema, portability, or low-level control.
- FileManager/document APIs for user-owned documents and large binary files.

Rules:

- Keep persistence off the main actor except UI-facing model contexts.
- Version schemas.
- Test migrations with real old stores.
- Separate metadata from large blobs.
- Never store secrets in plain app files.

## Core Graphics, Core Image, Core Text memory

These are low-level rendering and image/text processing tools.

Choose:

- Core Graphics for 2D drawing, bitmap contexts, PDFs, paths, and image generation.
- Core Image for filter pipelines and GPU/CPU image processing.
- Core Text for advanced text layout below UIKit/SwiftUI.

Rules:

- Respect scale, color space, orientation, memory, and thread confinement.
- Do not redraw expensive content every SwiftUI body update.
- Snapshot output across light/dark, Dynamic Type, and localization.

## Core Audio and Core Media memory

Core Audio/Core Media sit under AVFoundation, Speech, Sound Analysis, and media pipelines.

Choose them when:

- The app needs sample buffers, timing, format descriptions, audio units, low-latency audio, or custom media processing.

Rules:

- Keep real-time audio callbacks allocation-free.
- Preserve timestamp/timebase correctness.
- Avoid blocking audio threads.
- Treat buffer lifetime explicitly.

## Core Bluetooth memory

Core Bluetooth is for BLE central/peripheral communication.

Rules:

- Model connection state as a state machine.
- Do not scan forever without reason.
- Handle permission, Bluetooth off, reconnects, duplicate peripherals, background limits, and firmware differences.
- Keep protocol parsing versioned and tested.

## Core Location and MapKit memory

Location is high-trust data.

Rules:

- Ask for When In Use before Always unless Always is truly needed.
- Explain background location clearly.
- Use approximate location gracefully.
- Avoid storing trails unless the product needs them.
- Use MapKit for maps/search/annotations/routes; use Core Location for device/user location.

Verification:

- Denied, approximate, restricted, background, poor GPS, region monitoring, and navigation interruption.

## Core Motion, Core NFC, and sensors memory

Sensor APIs are hardware-dependent and battery-sensitive.

Rules:

- Check availability before UI.
- Request permission when needed.
- Use sampling rates appropriate to product value.
- Stop updates when not visible or not needed.
- Test physical devices.

## CryptoKit, Security, DeviceCheck, App Attest memory

Security APIs protect identity, integrity, keys, and trust.

Rules:

- Use Keychain for secrets.
- Use CryptoKit for modern cryptographic primitives.
- Use Security framework for Keychain/cert/trust lower-level work.
- Use DeviceCheck/App Attest for server-side app/device integrity signals.
- Never invent crypto protocols.

Verification:

- Device lock, biometric changes, keychain migration, certificate expiry, replay attempts, jailbroken/simulator assumptions, and server validation.

## File Provider and document memory

File Provider exposes app or remote documents through Files. It is an extension architecture.

Rules:

- Stable item identifiers.
- Metadata sync separate from file materialization.
- Offline and eviction behavior.
- Extension memory/time limits.
- Conflict handling.

## FinanceKit and financial data memory

Finance data is high sensitivity.

Rules:

- Request only necessary accounts/transactions.
- Never log transaction descriptions, merchant data, account numbers, or balances.
- Provide revocation and deletion paths.
- Treat financial categorization as assistive, not authoritative.

## Games memory

Choose:

- SpriteKit for 2D games.
- SceneKit/RealityKit for 3D/spatial depending on modernity.
- GameplayKit for state machines, pathfinding, randomization, agents, and ECS-style game structure.
- Game Controller for controllers.
- GameKit for Game Center features.
- Metal for custom rendering/performance.

Rules:

- Separate simulation from rendering.
- Keep frame pacing stable.
- Test pause/resume, input disconnect, save/restore, and memory.

## HealthKit and HomeKit memory

Health and home data are among the most sensitive app domains.

Rules:

- Request narrow permissions.
- Explain value before system prompt.
- Keep writes auditable.
- Handle unavailable data.
- Never infer medical conclusions beyond product scope.
- Test revocation, paired devices, iCloud/account changes, and shared home permissions.

## Localization memory

Localization is not translation only.

Rules:

- Use String Catalogs.
- Test pluralization, gender/grammar where relevant, RTL, truncation, Dynamic Type, date/number/currency/list formatting.
- Use Translation framework for in-app user text translation, not app localization.
- Human review is required for product copy.

## Metal and MetricKit memory

Metal is explicit GPU programming. MetricKit reports production performance and diagnostics.

Rules:

- Label Metal resources.
- Avoid per-frame allocation.
- Capture GPU frames for visual/performance bugs.
- Use MetricKit for production regressions: launch, hangs, memory, battery, crashes, and diagnostics.

## Multipeer Connectivity and Nearby Interaction memory

Nearby work is unreliable by nature.

Rules:

- Model peer discovery, trust, invitation, session, transfer, disconnect.
- Use Nearby Interaction for spatial relationship with supported hardware.
- Use Multipeer Connectivity for local peer sessions.
- Provide non-nearby fallback.

## B-M anti-patterns

- Using background modes to keep an app alive.
- Treating CloudKit as a simple REST backend.
- Reading all contacts/calendars when a picker would do.
- Running image/audio processing on the main actor.
- Forgetting sensor and Bluetooth physical-device testing.
- Using low-level Core frameworks when SwiftUI/UIKit/AVFoundation/Vision already solves the task.
- Treating financial, health, home, or location data as ordinary analytics.
