# Apple Documentation N-Z Section Memory

## Context

Load this when the Apple documentation navigator shows N-Z technologies, or when the user mentions networking, notifications, Objective-C/runtime, OSLog, PassKit, PDFKit, PencilKit, Photos, PushKit, QuickLook, RealityKit, ReplayKit, RoomPlan, Safari, SceneKit, Security, SensorKit, ShazamKit, SiriKit, SpriteKit, StoreKit, Swift, TipKit, TV, UserNotifications, VideoToolbox, Vision, Wallet, WatchConnectivity, WeatherKit, WebKit, WidgetKit, Xcode, or Store/distribution topics.

This is internal memory for the rest of the navigator.

## N-Z routing table

| Family | Route first |
|---|---|
| Networking | `docs/networking/README.md`, `docs/frameworks/network-framework.md` |
| Notifications | `docs/frameworks/usernotifications.md`, ActivityKit, accessory memory |
| Objective-C/runtime | Interop and legacy memory here |
| Observability | `docs/frameworks/oslog.md`, MetricKit/performance |
| Payments/wallet | `docs/frameworks/storekit.md`, `docs/frameworks/services/passkit.md` |
| Documents/previews | QuickLook, PDFKit, PencilKit memory here |
| Photos/camera | `docs/frameworks/photosui.md`, AVFoundation, Vision |
| Push/VoIP | UserNotifications, PushKit/CallKit memory |
| Spatial/AR/3D | `docs/frameworks/realitykit.md`, `arkit.md`, `scenekit.md` |
| Safari/Web | `docs/web/README.md`, WebKit |
| Security | `docs/security/README.md` |
| Sensors | SensorKit/Core Motion/HealthKit |
| Store/distribution | StoreKit, App Store Connect API, Xcode Cloud |
| Swift tools | `docs/swift/swift-brain.md`, SwiftUI docs, Xcode docs |
| Video/image codecs | AVFoundation, Core Media, VideoToolbox |
| Vision and ML | `docs/ai/machine-learning-brain.md` |
| Watch/weather/widgets | WatchConnectivity, WeatherKit, WidgetKit |

## Networking memory

Choose:

- URLSession for HTTP APIs, downloads, uploads, background transfers.
- Network framework for TCP/UDP, custom protocols, listeners, path monitoring, TLS customization.
- Network Extension for VPN/content filter/DNS/proxy-style capabilities with entitlements.
- Multipeer Connectivity for local peer-to-peer sessions.

Rules:

- Keep retries bounded.
- Make cancellation work.
- Separate transport errors from API errors.
- Do not block main actor.
- Redact tokens and PII in logs.
- Test airplane mode, captive portal, slow networks, TLS failure, backgrounding.

## Notifications memory

Choose:

- UserNotifications for local/remote notifications.
- ActivityKit for ongoing live status.
- PushKit only for allowed VoIP-style use.
- Accessory Notifications for forwarding to hardware accessories.

Rules:

- Ask permission at the moment of value.
- Keep notification content private by default when needed.
- Handle provisional/denied settings.
- Use categories/actions sparingly.
- Deep link to relevant app state.

## Objective-C and runtime memory

Use Objective-C/runtime features only for legacy interoperability, delegates, selectors, dynamic dispatch, associated objects, method swizzling, or framework requirements.

Rules:

- Prefer Swift-native APIs.
- Keep `@objc` exposure minimal.
- Avoid swizzling unless there is no alternative.
- Document thread and lifetime behavior.
- Test mixed Swift/ObjC nullability and bridging.

## OSLog, MetricKit, and diagnostics memory

Observability must be privacy-safe.

Rules:

- Use structured logging with privacy annotations.
- Never log secrets, prompts, transcripts, health, finance, contacts, precise location, or raw notification content.
- Use MetricKit for production performance/crash diagnostics.
- Use signposts around expensive flows.
- Tie logs to feature state, not personal data.

## PassKit, Wallet, StoreKit, and commerce memory

Choose:

- StoreKit 2 for in-app purchases and subscriptions.
- App Store Server API for server-side transaction history/status/notifications.
- PassKit for Apple Pay, Wallet passes, passes, and payment authorization.
- Wallet Orders for Wallet order tracking.

Rules:

- Never ship private server keys in the app.
- Verify signed transaction/server data.
- Keep purchase UI honest and restorable.
- Handle refund, revoke, billing retry, grace period, family sharing, subscription group changes.
- Test sandbox and production separation.

## PDFKit, PencilKit, QuickLook, and documents memory

Choose:

- QuickLook for system previews.
- PDFKit for PDF viewing, search, annotations, selection, and document metadata.
- PencilKit for drawing/markup.
- UniformTypeIdentifiers for file type routing.
- File Provider/document picker for file-system integration.

Rules:

- Keep security-scoped resources alive only as needed.
- Handle large documents without loading everything on the main actor.
- Preserve editable drawing data, not only screenshots.
- Test iCloud Drive, Files app, AirDrop, unsupported file types, corrupted PDFs, and orientation.

## Photos, camera, and media library memory

Choose:

- PhotosUI for user-selected photo/video import.
- Photos for library access and asset management.
- AVFoundation for custom capture.
- Vision for analysis.

Rules:

- Prefer limited library picker over broad permission.
- Downsample images.
- Avoid keeping full-resolution assets in memory.
- Respect metadata privacy.
- Test denied/limited permissions, iCloud-only assets, Live Photos, RAW, HDR, and large videos.

## PushKit memory

PushKit is not a general push mechanism.

Rules:

- Use only for allowed high-priority push types such as VoIP under current policy.
- Pair VoIP pushes with CallKit.
- Report incoming calls promptly.
- Do not use PushKit for marketing, chat messages, or background refresh.

## RealityKit, ARKit, SceneKit, RoomPlan, Object Capture memory

Choose:

- RealityKit for modern 3D/spatial entities, physics, materials, animation, RealityView.
- ARKit for tracking, anchors, world understanding, camera/depth.
- SceneKit for legacy scene graphs and existing `.scnassets`.
- RoomPlan for LiDAR room capture.
- Object Capture for photogrammetry.

Rules:

- Separate session/tracking lifecycle from rendering.
- Handle permission, unsupported device, poor lighting, relocalization, interruption.
- Test memory and thermal behavior.
- Avoid per-frame asset creation.
- Use real devices for AR/spatial verification.

## ReplayKit, ScreenCapture, and recording memory

Choose ReplayKit for user-controlled screen recording and broadcast upload extensions.

Rules:

- Make recording consent obvious.
- Hide or block sensitive screens.
- Treat broadcast extensions as memory-limited.
- Test microphone, interruption, orientation, background, and stop/failure paths.

## SafariServices and WebKit memory

Choose:

- SafariServices for system browser experiences.
- ASWebAuthenticationSession for OAuth/passkeys.
- WebKit for embedded web content.
- Safari extensions only for Safari-specific extension products.

Rules:

- Do not put untrusted JS bridge messages directly into app actions.
- Keep navigation policy explicit.
- Handle universal link fallback.
- Test cookies, login, private mode assumptions, and content blockers.

## Security and privacy memory

Security is cross-cutting.

Rules:

- Keychain for secrets.
- CryptoKit for cryptography.
- LocalAuthentication for biometric gating, not permanent authorization.
- Security framework for certificates/trust/keychain lower-level work.
- App Attest/DeviceCheck for server-side integrity.
- Privacy manifests and permission text must match real data use.

## SensorKit memory

SensorKit requires special entitlement and careful privacy handling. It is not a normal sensor API.

Rules:

- Verify entitlement first.
- Minimize retention.
- Explain research/data use clearly.
- Provide deletion/export where product requires it.
- Test unavailable and denied states.

## ShazamKit and audio recognition memory

Choose ShazamKit for music/audio matching against Shazam or custom catalogs. Choose Sound Analysis for generic sound classification.

Rules:

- Explain microphone use.
- Handle no match.
- Test noise, low volume, file/live input, and custom catalog updates.

## SiriKit legacy and App Intents memory

Default to App Intents for new Siri/Shortcuts/Spotlight/widget/control actions. Use SiriKit only for legacy domains or existing integrations.

Rules:

- Typed intents perform actions.
- Foundation Models can help interpret or generate around the action.
- Test entity resolution, permissions, unavailable states, and localized phrases.

## SpriteKit, GameplayKit, GameKit memory

Choose:

- SpriteKit for 2D rendering and physics.
- GameplayKit for game state, agents, pathfinding, randomization.
- GameKit for Game Center, leaderboards, achievements, matchmaking.

Rules:

- Keep simulation deterministic.
- Seed random behavior for tests.
- Handle pause/resume, controller disconnect, network match loss, and save/restore.

## Swift, SwiftUI, SwiftData memory

Route:

- Swift language -> `docs/swift/swift-brain.md`.
- SwiftUI UI/state/navigation -> SwiftUI docs.
- SwiftData persistence -> `docs/frameworks/swiftdata.md`.

Rules:

- MainActor UI state.
- Strict concurrency.
- Availability guards.
- Real previews/tests.
- Avoid generating Xcode project files unless explicitly requested.

## TipKit memory

TipKit is for feature discovery, not tutorials or ads.

Rules:

- Tips should be timely, dismissible, and tied to user context.
- Do not show tips for obvious controls.
- Persist eligibility and dismissal correctly.
- Test repeated sessions and localization.

## UserNotifications memory

Notifications are interruptions.

Rules:

- Ask after showing value.
- Keep content relevant.
- Use categories/actions for common immediate responses.
- Handle notification settings changes.
- Provide in-app notification preferences.

## VideoToolbox and low-level video memory

Use VideoToolbox for low-level encoding/decoding/compression when AVFoundation is not enough.

Rules:

- Preserve timestamps and color metadata.
- Manage pixel buffers explicitly.
- Avoid copying frames unnecessarily.
- Test codec availability, hardware acceleration, memory, and thermal behavior.

## Vision and VisionKit memory

Vision analyzes images/video. VisionKit provides system camera/document/Live Text-style UI.

Rules:

- Use VisionKit when system UI is desired.
- Use Vision for custom pipelines.
- Handle orientation, crop, camera permission, latency, and privacy.
- Combine with Foundation Models only after extraction when language reasoning is needed.

## WatchConnectivity and watchOS memory

WatchConnectivity is for phone-watch data transfer.

Rules:

- Model reachable vs background transfer.
- Keep payloads small.
- Handle independent watch apps.
- Test paired/unpaired, locked, offline, and delayed delivery.

## WeatherKit memory

WeatherKit provides weather data with attribution and service constraints.

Rules:

- Cache responsibly.
- Respect attribution.
- Handle unavailable regions/network.
- Avoid using weather data as safety-critical forecast without disclaimers.

## WebKit and WidgetKit memory

WebKit:

- Embedded web content, JS bridge, content policy, navigation, privacy.

WidgetKit:

- Glanceable UI, timelines, controls, Live Activity presentation via widget extension, App Intents for interactivity.

Rules:

- Widgets are not mini apps.
- Keep timelines efficient.
- Use placeholders/redacted states.
- Test all families and platforms.

## Xcode, Xcode Cloud, distribution memory

Xcode owns project/build/debug/signing. Xcode Cloud owns hosted CI/distribution workflows.

Rules:

- Keep signing identities out of source.
- Use schemes and test plans intentionally.
- Verify simulator and real device when hardware matters.
- Use TestFlight for beta evidence.
- Automate App Store Connect carefully with scoped API keys.

## N-Z anti-patterns

- Using PushKit as a general notification channel.
- Treating widgets as full apps.
- Using WebKit for OAuth when AuthenticationServices is required.
- Running AR/spatial features without real-device testing.
- Storing secrets outside Keychain.
- Logging private notification, health, finance, location, prompt, or transcript data.
- Treating StoreKit sandbox success as production proof.
- Using low-level media/video APIs when AVFoundation solves the job.
