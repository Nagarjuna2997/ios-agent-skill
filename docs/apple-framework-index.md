# Apple Framework Index

This file is generated from `frameworks.json`. Run `node scripts/check-framework-catalog.mjs --write` after editing the catalog.

The goal is not to mirror every Apple documentation navigator entry. The goal is to track the Apple app-development technologies an AI iOS engineer should route, use, or deliberately skip.

## Coverage

| Metric | Count |
|---|---:|
| Tracked technologies | 98 |
| Covered by a guide | 68 |
| Planned | 30 |
| Skipped | 0 |
| Deprecated | 0 |
| Coverage | 69.4% |

## AI and Machine Learning

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| Apple Intelligence | iOS, iPadOS, macOS, visionOS | active / covered | [docs/frameworks/apple-intelligence.md](frameworks/apple-intelligence.md) |
| Core AI | iOS, iPadOS, macOS | active / covered | [docs/frameworks/core-ai.md](frameworks/core-ai.md) |
| Core ML | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/ml/coreml.md](frameworks/ml/coreml.md) |
| Core Spotlight RAG | iOS, iPadOS, macOS | active / covered | [docs/frameworks/core-spotlight-rag.md](frameworks/core-spotlight-rag.md) |
| Evaluations | iOS, iPadOS, macOS | active / covered | [docs/testing/evaluations.md](testing/evaluations.md) |
| Foundation Models | iOS, iPadOS, macOS, visionOS | active / covered | [docs/frameworks/foundation-models.md](frameworks/foundation-models.md) |
| MLX | iOS, iPadOS, macOS | planned |  |
| Natural Language | iOS, iPadOS, macOS, tvOS, visionOS | active / covered | [docs/frameworks/ml/natural-language.md](frameworks/ml/natural-language.md) |
| Sound Analysis | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| Speech | iOS, iPadOS, macOS, visionOS | active / covered | [docs/frameworks/ml/speech.md](frameworks/ml/speech.md) |
| Vision | iOS, iPadOS, macOS, tvOS, visionOS | active / covered | [docs/frameworks/ml/vision.md](frameworks/ml/vision.md) |

## Authentication, Security, and Privacy

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| AuthenticationServices | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/authentication-services.md](frameworks/authentication-services.md) |
| CryptoKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/cryptokit.md](frameworks/cryptokit.md) |
| Device Integrity | iOS, iPadOS | active / covered | [docs/frameworks/device-integrity.md](frameworks/device-integrity.md) |
| LocalAuthentication | iOS, iPadOS, macOS, watchOS, visionOS | active / covered | [docs/frameworks/local-authentication.md](frameworks/local-authentication.md) |
| Privacy Manifest | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [checklists/app-store-submission.md](../checklists/app-store-submission.md) |
| Security Framework | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | planned |  |

## Camera, Media, and Audio

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| AVFoundation | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/avfoundation.md](frameworks/avfoundation.md) |
| AVKit | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| Core Media | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| MusicKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | planned |  |
| Photos | iOS, iPadOS, macOS, tvOS, visionOS | active / covered | [docs/frameworks/photosui.md](frameworks/photosui.md) |
| ReplayKit | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| ShazamKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | planned |  |

## Commerce and Wallet

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| App Store Server API | Server | planned |  |
| PassKit | iOS, iPadOS, macOS, watchOS, visionOS | active / covered | [docs/frameworks/services/passkit.md](frameworks/services/passkit.md) |
| StoreKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/storekit.md](frameworks/storekit.md) |
| Wallet Orders | iOS, iPadOS | planned |  |

## Core UI and Apps

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| ActivityKit | iOS, iPadOS | active / covered | [docs/frameworks/activitykit.md](frameworks/activitykit.md) |
| App Clips | iOS, iPadOS | active / covered | [docs/frameworks/app-clips.md](frameworks/app-clips.md) |
| App Intents | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/app-intents.md](frameworks/app-intents.md) |
| LinkPresentation | iOS, iPadOS, macOS | planned |  |
| PDFKit | iOS, iPadOS, macOS | planned |  |
| PencilKit | iOS, iPadOS, visionOS | planned |  |
| PhotosUI | iOS, iPadOS, macOS | active / covered | [docs/frameworks/photosui.md](frameworks/photosui.md) |
| QuickLook | iOS, iPadOS, macOS, visionOS | planned |  |
| Swift Charts | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/swift-charts.md](frameworks/swift-charts.md) |
| SwiftUI | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/swiftui/views-and-controls.md](swiftui/views-and-controls.md) |
| TipKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/tipkit.md](frameworks/tipkit.md) |
| UIKit | iOS, iPadOS, tvOS | active / covered | [docs/uikit/uikit-essentials.md](uikit/uikit-essentials.md) |
| UniformTypeIdentifiers | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | planned |  |
| VisionKit | iOS, iPadOS, visionOS | active / covered | [docs/frameworks/visionkit.md](frameworks/visionkit.md) |
| WidgetKit | iOS, iPadOS, macOS, watchOS | active / covered | [docs/frameworks/widgetkit.md](frameworks/widgetkit.md) |

## Data Management

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| CloudKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/cloudkit.md](frameworks/cloudkit.md) |
| Core Data | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/core-data.md](frameworks/core-data.md) |
| Core Spotlight | iOS, iPadOS, macOS | active / covered | [docs/frameworks/core-spotlight-rag.md](frameworks/core-spotlight-rag.md) |
| Data Concurrency | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/data-concurrency.md](frameworks/data-concurrency.md) |
| File Provider | iOS, iPadOS, macOS | planned |  |
| Foundation | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/foundation.md](frameworks/foundation.md) |
| SQLite | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | planned |  |
| SwiftData | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/swiftdata.md](frameworks/swiftdata.md) |

## Design and Motion

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| Core Animation | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| Core Haptics | iOS, iPadOS | planned |  |
| Human Interface Guidelines | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/design/stunning-ui-patterns.md](design/stunning-ui-patterns.md) |
| Liquid Glass | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/design/liquid-glass-adoption.md](design/liquid-glass-adoption.md) |
| Native vs Web Animation | iOS, iPadOS, macOS, visionOS | active / covered | [docs/web/native-vs-web-animation.md](web/native-vs-web-animation.md) |
| SwiftUI Animation | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/swiftui/animations.md](swiftui/animations.md) |

## Developer Tools

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| Device Hub | macOS | active / covered | [docs/tooling/device-hub.md](tooling/device-hub.md) |
| fm CLI | macOS | active / covered | [docs/tooling/fm-cli.md](tooling/fm-cli.md) |
| Foundation Models Instruments | macOS | active / covered | [docs/tooling/foundation-models-instruments.md](tooling/foundation-models-instruments.md) |
| iOS Simulator MCP | macOS | active / covered | [docs/tooling/ios-simulator-mcp.md](tooling/ios-simulator-mcp.md) |
| Xcode Agents | macOS | active / covered | [docs/tooling/xcode-27-agents.md](tooling/xcode-27-agents.md) |

## Graphics, 3D, and Games

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| ARKit | iOS, iPadOS, visionOS | active / covered | [docs/frameworks/arkit.md](frameworks/arkit.md) |
| Game Controller | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| GameplayKit | iOS, iPadOS, macOS, tvOS | planned |  |
| Metal | iOS, iPadOS, macOS, tvOS, visionOS | active / covered | [docs/frameworks/metal.md](frameworks/metal.md) |
| Object Capture | macOS | planned |  |
| RealityKit | iOS, iPadOS, macOS, visionOS | active / covered | [docs/frameworks/realitykit.md](frameworks/realitykit.md) |
| RoomPlan | iOS, iPadOS | planned |  |
| SceneKit | iOS, iPadOS, macOS, tvOS, visionOS | active / covered | [docs/frameworks/scenekit.md](frameworks/scenekit.md) |
| SpriteKit | iOS, iPadOS, macOS, tvOS, watchOS | planned |  |

## Health, Hardware, and Sensors

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| AccessorySetupKit | iOS, iPadOS | planned |  |
| Core Motion | iOS, iPadOS, watchOS, visionOS | active / covered | [docs/frameworks/hardware/core-motion.md](frameworks/hardware/core-motion.md) |
| Core NFC | iOS | active / covered | [docs/frameworks/hardware/core-nfc.md](frameworks/hardware/core-nfc.md) |
| ExternalAccessory | iOS, iPadOS, macOS | planned |  |
| HealthKit | iOS, iPadOS, watchOS, visionOS | active / covered | [docs/frameworks/hardware/healthkit.md](frameworks/hardware/healthkit.md) |
| SensorKit | iOS, watchOS | planned |  |

## Networking and Connectivity

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| Core Bluetooth | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/hardware/core-bluetooth.md](frameworks/hardware/core-bluetooth.md) |
| Multipeer Connectivity | iOS, iPadOS, macOS, tvOS, visionOS | planned |  |
| Nearby Interaction | iOS, iPadOS, watchOS | planned |  |
| Network Extension | iOS, iPadOS, macOS | planned |  |
| Network Framework | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/network-framework.md](frameworks/network-framework.md) |
| Networking | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/networking.md](frameworks/networking.md) |
| WebKit | iOS, iPadOS, macOS, visionOS | active / covered | [docs/web/native-vs-web-animation.md](web/native-vs-web-animation.md) |

## Platforms

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| iOS | iOS | active / covered | [docs/platforms/ios.md](platforms/ios.md) |
| macOS | macOS | active / covered | [docs/platforms/macos.md](platforms/macos.md) |
| tvOS | tvOS | active / covered | [docs/platforms/tvos.md](platforms/tvos.md) |
| visionOS | visionOS | active / covered | [docs/platforms/visionos.md](platforms/visionos.md) |
| watchOS | watchOS | active / covered | [docs/platforms/watchos.md](platforms/watchos.md) |

## System Integration

| Technology | Platforms | Status | Guide |
|---|---|---|---|
| BackgroundTasks | iOS, iPadOS | active / covered | [docs/frameworks/background-tasks.md](frameworks/background-tasks.md) |
| Contacts | iOS, iPadOS, macOS, watchOS, visionOS | active / covered | [docs/frameworks/services/contacts.md](frameworks/services/contacts.md) |
| Core Location | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/core-location.md](frameworks/core-location.md) |
| EventKit | iOS, iPadOS, macOS, watchOS, visionOS | active / covered | [docs/frameworks/services/eventkit.md](frameworks/services/eventkit.md) |
| HomeKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/hardware/homekit.md](frameworks/hardware/homekit.md) |
| MapKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/mapkit.md](frameworks/mapkit.md) |
| OSLog | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/oslog.md](frameworks/oslog.md) |
| UserNotifications | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/usernotifications.md](frameworks/usernotifications.md) |
| WeatherKit | iOS, iPadOS, macOS, watchOS, tvOS, visionOS | active / covered | [docs/frameworks/services/weatherkit.md](frameworks/services/weatherkit.md) |
