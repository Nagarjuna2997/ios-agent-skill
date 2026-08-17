# Extended Apple Frameworks

## Context

Load this guide when a requested Apple technology is tracked in `frameworks.json` but does not have a dedicated deep-dive file. It covers the remaining framework routes needed for 100% coverage of this repository's Apple technology catalog.

This is not a replacement for Apple documentation. Treat the Apple Developer link in `frameworks.json` as canonical, then use this file for agent routing, first implementation choices, verification, and common failure modes.

## Core UI and document workflows

### QuickLook

Use Quick Look when the app needs system previews for documents, images, PDFs, audio, video, Live Photos, Office/iWork files, text files, or USDZ objects. Prefer `QLPreviewController` for user-facing previews. For custom file types, provide a Quick Look preview extension and declare supported UTTypes in `QLSupportedContentTypes`.

Avoid Quick Look when the app needs advanced playback controls, heavily customized document rendering, or overlays inside the preview. Use AVFoundation, PDFKit, or a custom renderer instead.

Verification: open representative file types on device and simulator, verify security-scoped resource access for document-picker URLs, and test missing/unsupported file behavior.

### LinkPresentation

Use LinkPresentation to render rich URL previews with title, icon, image, and metadata. Cache `LPLinkMetadata` results so lists do not repeatedly fetch metadata while scrolling.

Rules: never block initial UI on metadata fetching, handle URLs with no preview data, and avoid treating metadata as trusted content.

Verification: test slow networks, private URLs, malformed URLs, and reused cells in scrolling views.

### UniformTypeIdentifiers

Use Uniform Type Identifiers for file import/export, document pickers, share sheets, drag and drop, pasteboard, and Quick Look extension declarations. Prefer `UTType` over stringly typed MIME or extension checks.

Rules: check conformance with `conforms(to:)`, define exported/imported types in app metadata when the app owns a custom file format, and keep accepted types narrow.

Verification: test files with uppercase extensions, missing extensions, ambiguous MIME types, iCloud Drive, Files app, AirDrop, and share-sheet imports.

### PDFKit

Use PDFKit for native PDF display, navigation, search, annotations, selections, and document metadata. Use SwiftUI wrappers when a SwiftUI app needs `PDFView`.

Rules: do not load very large PDFs on the main actor if parsing or search can be deferred, avoid assuming every PDF has selectable text, and test password-protected or malformed PDFs.

Verification: test zoom, rotation, memory pressure, search, annotation persistence, dark-mode container contrast, and VoiceOver navigation.

### PencilKit

Use PencilKit when the feature needs Apple Pencil drawing, markup, sketches, handwriting surfaces, or low-latency ink. Store `PKDrawing` data, not screenshots, when strokes need to remain editable.

Rules: configure tool picker ownership per scene, preserve scale when compositing drawings over images or PDFs, and design finger-vs-pencil behavior intentionally.

Verification: test Apple Pencil, finger drawing, undo/redo, iPad multitasking, orientation changes, and drawing persistence.

## Design, motion, and feedback

### Core Animation

Use Core Animation for layer-backed animation, custom transitions, masks, shape layers, gradients, replicators, and performance-sensitive visual effects below SwiftUI or UIKit.

Rules: prefer transform and opacity animation over layout animation, keep layer tree changes on the main thread, avoid offscreen-rendering surprises, and set final model-layer values to match animations.

Verification: profile with Core Animation and Instruments, inspect dropped frames, and test Reduce Motion alternatives.

### Core Haptics

Use Core Haptics for custom tactile feedback patterns, synchronized audio-haptic experiences, and game-like interactions. Use UIKit feedback generators for simple selection, impact, and notification feedback.

Rules: check hardware capability, handle audio-session interruptions, start/stop engines around app lifecycle events, and provide a non-haptic fallback.

Verification: test on physical devices because simulators cannot prove haptic quality.

## AI and signal processing

### MLX

Use MLX for Apple-silicon-focused machine-learning experimentation and local model workflows when the project explicitly targets MLX. For app-integrated Apple-platform ML, prefer Foundation Models, Core ML, Vision, Natural Language, Speech, or Accelerate unless MLX is a stated requirement.

Rules: isolate MLX experiments from App Store app code until deployment constraints are clear, document hardware assumptions, and keep model artifacts out of source control unless intentionally small.

Verification: record device/Mac chip, memory footprint, model size, latency, and fallback path.

### Sound Analysis

Use Sound Analysis for classifying audio, detecting sound events, or running Core ML models over audio streams. Route speech transcription to Speech, music recognition to ShazamKit, and low-level capture/playback to AVFoundation.

Rules: request microphone permission only when live audio is required, process streaming audio off the main actor, and design privacy copy that explains what audio is analyzed.

Verification: test microphone permission states, background/foreground transitions, noisy rooms, silence, and model confidence thresholds.

## Data and file providers

### File Provider

Use File Provider when the app exposes remote or app-managed documents through the system Files experience. It is an extension architecture, not a generic file picker.

Rules: model stable item identifiers, sync metadata separately from file contents, handle eviction/materialization, and treat extension memory/time limits as hard constraints.

Verification: test Files app browsing, open-in-place, offline behavior, conflicts, deletion, rename, and large-file download cancellation.

### SQLite

Use SQLite when the app needs relational storage, portable database files, full control over queries, or compatibility with an existing SQLite schema. Prefer SwiftData/Core Data for object graph persistence when their model fits.

Rules: put database access behind an actor or serial queue, use prepared statements, run migrations transactionally, and avoid doing database I/O on the main actor.

Verification: test migrations from real older schemas, corruption recovery, concurrent access, large imports, and backup/restore behavior.

## Networking and connectivity

### Multipeer Connectivity

Use Multipeer Connectivity for nearby peer-to-peer discovery and data exchange over infrastructure Wi-Fi, peer-to-peer Wi-Fi, and Bluetooth-backed discovery. It fits local collaboration, nearby sharing, and offline peer sessions.

Rules: design explicit trust and invitation UX, handle peers appearing/disappearing, bound payload size, and keep session state observable from the main actor.

Verification: test multiple physical devices, locked screens, app backgrounding, network changes, and duplicate peer names.

### Nearby Interaction

Use Nearby Interaction for spatially aware nearby-device experiences with supported hardware and compatible peer discovery. Pair it with Multipeer Connectivity or another channel for token exchange.

Rules: guard hardware support, request permission with clear value, and provide a non-UWB fallback.

Verification: test supported and unsupported devices, permission denial, interrupted sessions, distance/orientation accuracy, and multi-user environments.

### Network Extension

Use Network Extension for VPN, content filtering, DNS proxying, packet tunnels, app proxying, and related managed-network capabilities. This area often requires entitlements and App Review justification.

Rules: verify entitlement availability before designing the feature, isolate extension code, keep privacy claims exact, and avoid using Network Extension for ordinary HTTP requests.

Verification: test entitlement provisioning, on-device behavior, managed configuration, reconnects, sleep/wake, and App Store policy fit.

## Games, spatial capture, and controllers

### SpriteKit

Use SpriteKit for 2D games, particle effects, tile maps, sprite animation, physics-driven 2D scenes, and lightweight interactive visual experiences.

Rules: keep game state deterministic, separate rendering from game rules, load atlases intentionally, and avoid mixing SwiftUI layout assumptions into the SpriteKit scene.

Verification: test frame pacing, texture memory, touch/controller input, pause/resume, scene transitions, and different refresh rates.

### GameplayKit

Use GameplayKit for game architecture helpers: state machines, entity-component design, pathfinding, randomization, agents, goals, and rule systems.

Rules: keep the simulation model independent from SpriteKit/SceneKit/RealityKit rendering, seed randomness for reproducible tests, and keep state transitions explicit.

Verification: unit-test state machines, pathfinding edge cases, deterministic random sequences, and save/restore behavior.

### Game Controller

Use Game Controller for physical controllers, keyboard/mouse game input, controller discovery, button/axis state, haptics, and player indexing.

Rules: support remapping where appropriate, provide touch fallback on iPhone/iPad, handle connect/disconnect live, and avoid assuming a specific controller layout.

Verification: test Xbox/PlayStation/MFi controllers, keyboard input, tvOS focus, disconnects, and multiple players.

### RoomPlan

Use RoomPlan for LiDAR-backed room scanning and structured room-capture output. Route general AR placement to ARKit/RealityKit.

Rules: guard device support, explain scanning privacy, handle incomplete scans, and give users editing/review affordances before export.

Verification: test small/large rooms, poor lighting, reflective surfaces, interrupted scans, export, and memory use.

### Object Capture

Use Object Capture for photogrammetry workflows that create 3D assets from image sets. Treat it as a capture pipeline with strict input quality needs, not a one-click magic feature.

Rules: guide users through coverage, lighting, focus, and overlap; validate image sets before processing; and plan for long-running work and large outputs.

Verification: test small and reflective objects, incomplete image sets, processing failure, output scale/orientation, and USDZ import into RealityKit.

## Camera, media, and audio

### AVKit

Use AVKit for system playback UI, Picture in Picture, player controls, and platform-native media presentation. Use AVFoundation when custom capture, editing, composition, or low-level playback control is required.

Rules: manage `AVPlayer` lifetime, observe playback state safely, support interruptions, and avoid rebuilding players on every SwiftUI body update.

Verification: test streaming, local files, AirPlay, PiP, background audio policy, captions, interruption, and poor networks.

### Core Media

Use Core Media for timestamps, sample buffers, format descriptions, time ranges, and low-level media pipelines. It usually appears with AVFoundation, VideoToolbox, Core Video, or Metal.

Rules: preserve timebase correctness, avoid copying sample buffers unnecessarily, and keep buffer lifetimes explicit.

Verification: test frame timing, audio/video sync, dropped frames, format changes, and memory pressure.

### ReplayKit

Use ReplayKit for screen recording, broadcast upload extensions, and user-controlled capture of app or game sessions.

Rules: make recording consent obvious, handle unavailable recording states, protect sensitive screens, and separate broadcast extension constraints from main-app assumptions.

Verification: test start/stop, microphone on/off, interruptions, broadcast extension memory, and App Review privacy expectations.

### MusicKit

Use MusicKit for Apple Music catalog access, playback integration, user library access, and music subscription-aware experiences.

Rules: request music authorization only when needed, handle subscription and region availability, and avoid assuming catalog identifiers are playable for every user.

Verification: test authorized/denied states, no subscription, different regions, offline playback expectations, and storefront changes.

### ShazamKit

Use ShazamKit for audio matching against Shazam's catalog or a custom signature catalog. Route generic audio classification to Sound Analysis.

Rules: explain microphone use, handle noisy environments, and keep matching UI resilient to no-match outcomes.

Verification: test live microphone matching, file matching, low volume, background noise, and custom catalog updates.

## Commerce and wallet server flows

### App Store Server API

Use App Store Server API for server-side transaction lookup, subscription status, transaction history, refund/consumption workflows, and App Store Server Notifications integration. Keep StoreKit 2 in the app for on-device purchase flow and transaction listening.

Rules: never put App Store Server API private keys in the app, validate signed data on the server, and model idempotency for notifications.

Verification: test sandbox, production environment separation, notification retries, revoked/refunded transactions, subscription grace periods, and key rotation.

### Wallet Orders

Use Wallet Orders for order tracking experiences in Apple Wallet when the product and merchant flow fit Apple's Wallet order model.

Rules: keep order state accurate, privacy-preserving, and synchronized with backend status; avoid using Wallet Orders as a generic notification system.

Verification: test order updates, cancellation/refund states, backend signing, user removal from Wallet, and localization.

## Security and hardware access

### Security Framework

Use the Security framework for Keychain, certificates, identities, trust evaluation, secure transport-adjacent trust objects, and lower-level security services. Prefer CryptoKit for modern cryptographic operations when it fits.

Rules: store secrets in Keychain, use access control intentionally, avoid custom crypto, and keep certificate-pinning rotation plans realistic.

Verification: test device lock state, biometric changes, keychain migration, iCloud Keychain expectations, certificate expiry, and failure paths.

### AccessorySetupKit

Use AccessorySetupKit for guided setup and authorization of compatible accessories. Route ongoing Bluetooth communication to Core Bluetooth or ExternalAccessory as appropriate.

Rules: design setup around user consent, accessory discovery limits, and clear recovery from failed pairing.

Verification: test first setup, re-setup, permission denial, nearby multiple accessories, and accessory firmware differences.

### ExternalAccessory

Use ExternalAccessory for Made for iPhone/iPad accessory communication using supported protocols. Do not use it for generic BLE; use Core Bluetooth for that.

Rules: verify protocol strings, entitlement needs, connection lifecycle, and background behavior before implementation.

Verification: test physical accessories, cable/Bluetooth transport, disconnects, background/foreground transitions, and unsupported firmware.

### SensorKit

Use SensorKit only when the app has the required entitlement and a legitimate sensor-research or approved data-use case. It is not a general sensor API.

Rules: verify entitlement availability first, keep consent and privacy language precise, minimize retention, and design data export/deletion.

Verification: test authorization states, entitlement provisioning, data availability, privacy disclosures, and fallback behavior when unavailable.

## Reporting standard

For any technology in this guide, report with:

```text
Status: VERIFIED / INSPECTED / UNVERIFIED
Apple source: framework URL from frameworks.json
Local guide: docs/frameworks/extended-apple-frameworks.md
Implementation route: framework choice and fallback
Evidence: build, device/simulator run, entitlement check, Instruments, logs, or static review
Remaining risk: unavailable hardware, entitlement, account, device, or OS coverage
```
