# visionOS Platform Guide

## WindowGroup, ImmersiveSpace, and Volume

### Scene Types

```swift
@main
struct SpatialApp: App {
    @State private var appModel = AppModel()

    var body: some Scene {
        // Standard 2D window
        WindowGroup {
            ContentView()
                .environment(appModel)
        }

        // 3D volumetric window
        WindowGroup(id: "globe") {
            GlobeView()
                .environment(appModel)
        }
        .windowStyle(.volumetric)
        .defaultSize(width: 0.5, height: 0.5, depth: 0.5, in: .meters)

        // Full immersive space
        ImmersiveSpace(id: "solarSystem") {
            SolarSystemView()
                .environment(appModel)
        }
        .immersionStyle(selection: $appModel.immersionStyle, in: .mixed, .progressive, .full)
    }
}

@Observable
class AppModel {
    var immersionStyle: ImmersionStyle = .mixed
    var isImmersiveSpaceOpen = false
}
```

### Opening and Dismissing Spaces

```swift
struct ContentView: View {
    @Environment(\.openWindow) private var openWindow
    @Environment(\.dismissWindow) private var dismissWindow
    @Environment(\.openImmersiveSpace) private var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) private var dismissImmersiveSpace
    @Environment(AppModel.self) private var appModel

    var body: some View {
        VStack(spacing: 20) {
            Button("Open Globe") {
                openWindow(id: "globe")
            }

            Button("Enter Solar System") {
                Task {
                    let result = await openImmersiveSpace(id: "solarSystem")
                    switch result {
                    case .opened:   appModel.isImmersiveSpaceOpen = true
                    case .error:    print("Failed to open immersive space")
                    case .userCancelled: break
                    @unknown default: break
                    }
                }
            }

            if appModel.isImmersiveSpaceOpen {
                Button("Exit Immersive") {
                    Task {
                        await dismissImmersiveSpace()
                        appModel.isImmersiveSpaceOpen = false
                    }
                }
            }
        }
    }
}
```

---

## RealityView and RealityKit Entities

```swift
import RealityKit

struct ImmersiveSceneView: View {
    @State private var earthEntity: Entity?

    var body: some View {
        RealityView { content, attachments in
            // Load USDZ model
            if let earth = try? await Entity(named: "Earth", in: realityKitContentBundle) {
                earth.position = [0, 1.5, -2]
                earth.scale = [0.5, 0.5, 0.5]

                // Add rotation animation
                let rotation = FromToByAnimation<Transform>(
                    from: .init(rotation: simd_quatf(angle: 0, axis: [0, 1, 0])),
                    to: .init(rotation: simd_quatf(angle: .pi * 2, axis: [0, 1, 0])),
                    duration: 30,
                    bindTarget: .transform
                )
                let resource = try! AnimationResource.generate(with: rotation)
                earth.playAnimation(resource, transitionDuration: 0, startsPaused: false)

                content.add(earth)
                earthEntity = earth
            }

            // Add lighting
            let light = PointLight()
            light.light.intensity = 50000
            light.position = [2, 3, 0]
            content.add(light)

            // Add SwiftUI attachment
            if let panel = attachments.entity(for: "infoPanel") {
                panel.position = [0.5, 1.5, -1.5]
                content.add(panel)
            }
        } update: { content, attachments in
            // Update entities when state changes
        } attachments: {
            Attachment(id: "infoPanel") {
                InfoPanelView()
                    .frame(width: 400, height: 300)
                    .glassBackgroundEffect()
            }
        }
    }
}
```

### Custom Components and Systems

```swift
import RealityKit

// Custom component
struct SpinComponent: Component {
    var speed: Float = 1.0
    var axis: SIMD3<Float> = [0, 1, 0]
}

// System to process spinning entities
struct SpinSystem: System {
    static let query = EntityQuery(where: .has(SpinComponent.self))

    init(scene: RealityKit.Scene) {}

    func update(context: SceneUpdateContext) {
        for entity in context.entities(matching: Self.query, updatingSystemWhen: .rendering) {
            guard let spin = entity.components[SpinComponent.self] else { continue }
            let angle = spin.speed * Float(context.deltaTime)
            entity.transform.rotation *= simd_quatf(angle: angle, axis: spin.axis)
        }
    }
}

// Register at app launch
struct SpatialApp: App {
    init() {
        SpinComponent.registerComponent()
        SpinSystem.registerSystem()
    }
}
```

---

## Model3D for 3D Model Display

```swift
import RealityKit

struct ModelShowcaseView: View {
    @State private var selectedModel = "Shoe"

    var body: some View {
        VStack {
            // Simple model display
            Model3D(named: selectedModel, bundle: realityKitContentBundle) { model in
                model
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(depth: 200)
            } placeholder: {
                ProgressView()
            }
            .frame(width: 300, height: 300)
            .dragRotation(pitchLimit: .degrees(45))

            // Model picker
            Picker("Model", selection: $selectedModel) {
                Text("Shoe").tag("Shoe")
                Text("Chair").tag("Chair")
                Text("Globe").tag("Globe")
            }
            .pickerStyle(.segmented)
        }
    }
}

// Model from URL
struct RemoteModelView: View {
    var body: some View {
        Model3D(url: URL(string: "https://example.com/model.usdz")!) { phase in
            switch phase {
            case .empty:
                ProgressView()
            case .success(let model):
                model.resizable().aspectRatio(contentMode: .fit)
            case .failure(let error):
                Text("Failed: \(error.localizedDescription)")
            @unknown default:
                EmptyView()
            }
        }
    }
}
```

---

## Hand Tracking and Gestures

```swift
import RealityKit

// Standard gestures on entities
struct InteractiveSceneView: View {
    @State private var selectedEntity: Entity?

    var body: some View {
        RealityView { content in
            let sphere = ModelEntity(
                mesh: .generateSphere(radius: 0.1),
                materials: [SimpleMaterial(color: .blue, isMetallic: true)]
            )
            sphere.position = [0, 1.5, -1]
            sphere.generateCollisionShapes(recursive: false)
            sphere.components.set(InputTargetComponent())
            sphere.components.set(HoverEffectComponent())
            content.add(sphere)
        }
        .gesture(
            TapGesture()
                .targetedToAnyEntity()
                .onEnded { value in
                    selectedEntity = value.entity
                }
        )
        .gesture(
            DragGesture()
                .targetedToAnyEntity()
                .onChanged { value in
                    value.entity.position = value.convert(value.location3D, from: .local, to: value.entity.parent!)
                }
        )
        .gesture(
            MagnifyGesture()
                .targetedToAnyEntity()
                .onChanged { value in
                    let scale = Float(value.magnification)
                    value.entity.scale = [scale, scale, scale]
                }
        )
        .gesture(
            RotateGesture3D()
                .targetedToAnyEntity()
                .onChanged { value in
                    let rotation = value.rotation
                    value.entity.orientation = simd_quatf(rotation)
                }
        )
    }
}
```

### ARKit Hand Tracking (Advanced)

```swift
import ARKit

@Observable
class HandTrackingManager {
    let session = ARKitSession()
    let handTracking = HandTrackingProvider()

    var leftHandPosition: SIMD3<Float>?
    var rightHandPosition: SIMD3<Float>?

    func startTracking() async {
        guard HandTrackingProvider.isSupported else { return }
        try? await session.run([handTracking])

        for await update in handTracking.anchorUpdates {
            let anchor = update.anchor
            guard anchor.isTracked else { continue }

            let indexTip = anchor.handSkeleton?.joint(.indexFingerTip)
            guard let tipTransform = indexTip, tipTransform.isTracked else { continue }

            let position = (anchor.originFromAnchorTransform * tipTransform.anchorFromJointTransform).columns.3
            let pos = SIMD3<Float>(position.x, position.y, position.z)

            switch anchor.chirality {
            case .left:  leftHandPosition = pos
            case .right: rightHandPosition = pos
            }
        }
    }
}
```

---

## Eye Tracking

```swift
// Eye tracking requires user permission and entitlement
// com.apple.developer.arkit.eye-tracking

struct EyeTrackingView: View {
    @State private var hoveredItem: String?

    var body: some View {
        HStack(spacing: 40) {
            ForEach(["Photos", "Videos", "Music"], id: \.self) { item in
                Text(item)
                    .font(.title)
                    .padding(30)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(hoveredItem == item ? .blue.opacity(0.3) : .clear)
                    )
                    .hoverEffect(.highlight) // System hover effect
                    .onHover { isHovering in
                        hoveredItem = isHovering ? item : nil
                    }
            }
        }
    }
}

// Custom hover effects
struct CustomHoverView: View {
    var body: some View {
        Text("Look at me")
            .padding()
            .hoverEffect { effect, isActive, _ in
                effect
                    .scaleEffect(isActive ? 1.1 : 1.0)
                    .animation(.spring(duration: 0.3), value: isActive)
            }
    }
}
```

---

## Spatial Audio

```swift
import RealityKit

struct SpatialAudioScene: View {
    var body: some View {
        RealityView { content in
            // Create audio source entity
            let audioEntity = Entity()
            audioEntity.position = [2, 1.5, -3]

            // Load and configure spatial audio
            let resource = try! AudioFileResource.load(
                named: "ambience.wav",
                configuration: .init(
                    loadingStrategy: .preload,
                    shouldLoop: true
                )
            )

            let audioController = audioEntity.prepareAudio(resource)
            audioController.gain = -10 // dB
            audioController.play()

            // Spatial audio is automatic — position in 3D space determines directionality
            content.add(audioEntity)

            // Ambient audio (non-spatial, everywhere)
            let ambientEntity = Entity()
            ambientEntity.spatialAudio = SpatialAudioComponent(directivity: .beam(focus: 0))
            content.add(ambientEntity)
        }
    }
}
```

---

## SharePlay in Spatial Apps

```swift
import GroupActivities

struct WatchTogetherActivity: GroupActivity {
    static let activityIdentifier = "com.app.watchtogether"

    var metadata: GroupActivityMetadata {
        var meta = GroupActivityMetadata()
        meta.title = "Watch Together"
        meta.type = .watchTogether
        meta.supportsContinuationOnTV = true
        return meta
    }
}

@Observable
class SharePlayManager {
    var session: GroupSession<WatchTogetherActivity>?

    func startSharing() async {
        let activity = WatchTogetherActivity()
        let result = await activity.prepareForActivation()

        switch result {
        case .activationPreferred:
            _ = try? await activity.activate()
        case .activationDisabled:
            break
        default: break
        }
    }

    func configureSession() async {
        for await session in WatchTogetherActivity.sessions() {
            self.session = session
            session.join()

            // Spatial Persona template
            let template = SpatialTemplate(
                elements: [
                    .seat(position: .app.offsetBy(x: -0.5)),
                    .seat(position: .app.offsetBy(x: 0.5))
                ]
            )
            session.spatialTemplatePreference = .init(template)

            // Receive messages
            for await message in session.messenger.messages(of: SyncMessage.self) {
                handleMessage(message)
            }
        }
    }
}
```

---

## Ornaments and Attachments

```swift
struct OrnamentedWindow: View {
    @State private var showControls = true

    var body: some View {
        VStack {
            Text("Main Content")
                .font(.largeTitle)
        }
        .frame(width: 600, height: 400)
        .ornament(
            visibility: showControls ? .visible : .hidden,
            attachmentAnchor: .scene(.bottom)
        ) {
            HStack(spacing: 20) {
                Button(action: {}) {
                    Label("Previous", systemImage: "backward.fill")
                }
                Button(action: {}) {
                    Label("Play", systemImage: "play.fill")
                }
                Button(action: {}) {
                    Label("Next", systemImage: "forward.fill")
                }
            }
            .padding()
            .glassBackgroundEffect()
        }
        .ornament(attachmentAnchor: .scene(.trailing)) {
            VStack {
                Button(action: {}) { Image(systemName: "heart") }
                Button(action: {}) { Image(systemName: "square.and.arrow.up") }
                Button(action: {}) { Image(systemName: "info.circle") }
            }
            .padding()
            .glassBackgroundEffect()
        }
    }
}
```

---

## Passthrough and Mixed Reality

```swift
struct MixedRealityView: View {
    @State private var showPassthrough = true

    var body: some View {
        RealityView { content in
            // Content appears in the user's real environment
            let anchor = AnchorEntity(.plane(.horizontal, classification: .table, minimumBounds: [0.3, 0.3]))

            let box = ModelEntity(
                mesh: .generateBox(size: 0.2, cornerRadius: 0.02),
                materials: [SimpleMaterial(color: .blue, isMetallic: true)]
            )
            box.position.y = 0.1
            box.generateCollisionShapes(recursive: false)
            box.components.set(InputTargetComponent())
            anchor.addChild(box)
            content.add(anchor)

            // Occlusion — virtual objects hidden behind real objects
            let occlusionMaterial = OcclusionMaterial()
            let floor = ModelEntity(mesh: .generatePlane(width: 5, depth: 5), materials: [occlusionMaterial])
            content.add(floor)
        }
        .upperLimbVisibility(showPassthrough ? .automatic : .hidden)
    }
}

// World sensing
struct WorldSensingView: View {
    var body: some View {
        RealityView { content in
            // Requires WorldSensing entitlement
            let arSession = ARKitSession()
            let worldTracking = WorldTrackingProvider()
            let planeDetection = PlaneDetectionProvider()

            try? await arSession.run([worldTracking, planeDetection])

            for await update in planeDetection.anchorUpdates {
                let plane = update.anchor
                // Place content on detected surfaces
            }
        }
    }
}
```

---

## visionOS Design Guidelines

| Aspect | Recommendation |
|--------|---------------|
| Window placement | Let system place windows; user repositions |
| Glass material | Use .glassBackgroundEffect() for window backgrounds |
| Depth | Use subtle depth; avoid extreme z-positioning |
| Ergonomics | Place content in comfortable viewing range (1-3m) |
| Eye comfort | Avoid rapid movement; use gentle animations |
| Hover effects | Always provide .hoverEffect for interactive elements |
| Ornaments | Use for controls related to window content |
| Immersion | Start with .mixed; let user choose deeper immersion |
| Hand gestures | Support standard tap, drag, magnify, rotate |
| Spatial audio | Position audio sources to match visual positions |
