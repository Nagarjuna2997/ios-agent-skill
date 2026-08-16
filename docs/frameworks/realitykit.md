# RealityKit -- Complete Guide for 3D Rendering, AR, and Spatial Apps

## Overview

RealityKit is Apple's modern 3D engine and the default renderer for AR on iOS/iPadOS and for spatial content on visionOS. It uses a Swift-first **Entity Component System (ECS)**, ships with PBR materials, physics, audio, networking sync, and tightly integrates with USDZ and Reality Composer Pro. Pair it with **ARKit** for sensor data on iOS, or with `RealityView` / `ImmersiveSpace` on visionOS.

> Available on **iOS 13+**, **macOS 10.15+**, **tvOS 16+**, and **visionOS 1.0+**. SwiftUI integration via `RealityView` requires iOS 18+ / visionOS 1+ / macOS 15+ for the unified API; older code uses `ARView` (UIKit) wrapped in `UIViewRepresentable`.

---

## 1. Core Concepts: Entity Component System

```swift
import RealityKit

// Entity: a node in the scene graph
let cube = ModelEntity(
    mesh: .generateBox(size: 0.2),
    materials: [SimpleMaterial(color: .systemBlue, isMetallic: false)]
)

// Components: data attached to entities
cube.components.set(InputTargetComponent())
cube.components.set(CollisionComponent(shapes: [.generateBox(size: [0.2, 0.2, 0.2])]))
cube.components.set(HoverEffectComponent())                // visionOS hover

// Anchor: where in the world the subtree lives
let anchor = AnchorEntity(world: .zero)
anchor.addChild(cube)
```

The full hierarchy: `Scene` -> `AnchorEntity` -> `Entity` (with components and children).

---

## 2. SwiftUI: `RealityView` (iOS 18 / visionOS 1+)

```swift
import SwiftUI
import RealityKit

struct GalaxyView: View {
    var body: some View {
        RealityView { content in
            // Initial setup -- runs once
            let sphere = ModelEntity(
                mesh: .generateSphere(radius: 0.1),
                materials: [SimpleMaterial(color: .orange, roughness: 0.3, isMetallic: true)]
            )
            sphere.position = [0, 1.5, -1]
            content.add(sphere)
        } update: { content in
            // Re-runs whenever bound state changes
        }
    }
}
```

### Loading a USDZ asset

```swift
RealityView { content in
    if let model = try? await Entity(named: "Toy_robot", in: .main) {
        model.position = [0, 0, -1]
        content.add(model)
    }
}
```

### Reality Composer Pro scenes (visionOS)

```swift
RealityView { content in
    if let scene = try? await Entity(named: "GalaxyScene", in: realityKitContentBundle) {
        content.add(scene)
    }
}
```

---

## 3. UIKit: `ARView` for iOS AR

```swift
import RealityKit
import ARKit

let arView = ARView(frame: .zero, cameraMode: .ar, automaticallyConfigureSession: true)

// Place an entity 1 meter in front of the camera
let anchor = AnchorEntity(plane: .horizontal, classification: .floor, minimumBounds: [0.5, 0.5])
let modelEntity = try ModelEntity.load(named: "Robot")
anchor.addChild(modelEntity)
arView.scene.addAnchor(anchor)
```

`ARView` automatically composites people occlusion, depth, and lighting estimation when the session opts in -- see `docs/frameworks/arkit.md`.

---

## 4. Materials and Lighting

### PBR (PhysicallyBasedMaterial)

```swift
var material = PhysicallyBasedMaterial()
material.baseColor = .init(tint: .systemTeal)
material.metallic = 0.9
material.roughness = 0.2
material.emissiveColor = .init(color: .blue)
material.emissiveIntensity = 0.5

// Texture maps
material.baseColor = .init(texture: .init(try .load(named: "albedo")))
material.normal = .init(texture: .init(try .load(named: "normal")))

let entity = ModelEntity(mesh: .generateSphere(radius: 0.1), materials: [material])
```

### Unlit / shaded surface materials

```swift
let unlit = UnlitMaterial(color: .white)
```

### Custom shader graphs

Author shaders visually in **Reality Composer Pro**, then bind parameters at runtime:

```swift
guard var material = entity.model?.materials.first as? ShaderGraphMaterial else { return }
try material.setParameter(name: "Tint", value: .color(.systemPink))
entity.model?.materials = [material]
```

---

## 5. Animation

### Built-in skeletal animations

```swift
let robot = try ModelEntity.load(named: "Robot")
if let animation = robot.availableAnimations.first {
    robot.playAnimation(animation.repeat(duration: .infinity), transitionDuration: 0.5)
}
```

### Transform animation (move/scale/rotate)

```swift
let move = FromToByAnimation<Transform>(
    name: "slide",
    from: .init(translation: [0, 0, 0]),
    to: .init(translation: [0.5, 0, 0]),
    duration: 1.0,
    bindTarget: .transform
)

let resource = try AnimationResource.generate(with: move)
entity.playAnimation(resource)
```

---

## 6. Physics

```swift
// 1. Generate collision shapes from the mesh
entity.generateCollisionShapes(recursive: true)

// 2. Add a physics body
entity.components.set(
    PhysicsBodyComponent(
        massProperties: .init(mass: 1.0),
        material: .generate(friction: 0.4, restitution: 0.2),
        mode: .dynamic
    )
)

// 3. Apply forces / impulses
entity.applyLinearImpulse([0, 2, 0], relativeTo: nil)
```

`PhysicsBodyComponent.mode`: `.dynamic`, `.kinematic`, or `.static`.

---

## 7. Input and Gestures (visionOS)

```swift
RealityView { content in
    let cube = ModelEntity(mesh: .generateBox(size: 0.2),
                           materials: [SimpleMaterial(color: .green, isMetallic: false)])
    cube.components.set(InputTargetComponent())
    cube.components.set(CollisionComponent(shapes: [.generateBox(size: [0.2, 0.2, 0.2])]))
    content.add(cube)
}
.gesture(
    DragGesture()
        .targetedToAnyEntity()
        .onChanged { value in
            value.entity.position = value.convert(value.location3D, from: .local, to: value.entity.parent!)
        }
)
```

For iOS, use `arView.installGestures([.translation, .rotation, .scale], for: entity)`.

---

## 8. Audio

```swift
let resource = try AudioFileResource.load(named: "spaceship.wav",
                                          configuration: .init(shouldLoop: true))
let controller = entity.prepareAudio(resource)
controller.gain = -6
controller.play()
```

Spatial audio is automatic when the entity has a position; head-tracked rendering happens for free on visionOS / AirPods Pro.

---

## 9. Lighting (visionOS / macOS)

```swift
let light = DirectionalLight()
light.light.intensity = 5000
light.light.color = .white
light.shadow = .init(maximumDistance: 10, depthBias: 0.001)
light.orientation = simd_quatf(angle: -.pi / 4, axis: [1, 0, 0])
content.add(light)
```

For image-based lighting:

```swift
let env = try await EnvironmentResource(named: "studio_small")
content.environment.lighting.resource = env
```

iOS AR uses real-world lighting estimation automatically -- do not add manual lights unless you want extra fill.

---

## 10. Networking and Multipeer Sync

```swift
import MultipeerConnectivity

let session = MCSession(peer: MCPeerID(displayName: UIDevice.current.name))
arView.scene.synchronizationService = try? MultipeerConnectivityService(session: session)

// Tag entities you want replicated
entity.synchronization?.ownershipTransferMode = .autoAccept
```

All entities with a `SynchronizationComponent` (added by default to AnchorEntity) are kept in sync across peers.

---

## 11. ECS: Custom Components and Systems

### Component

```swift
struct SpinComponent: Component {
    var radiansPerSecond: Float = .pi
}
```

### System

```swift
final class SpinSystem: System {
    static let query = EntityQuery(where: .has(SpinComponent.self))

    init(scene: Scene) {}

    func update(context: SceneUpdateContext) {
        for entity in context.scene.performQuery(Self.query) {
            guard let spin = entity.components[SpinComponent.self] else { continue }
            entity.transform.rotation *= simd_quatf(
                angle: spin.radiansPerSecond * Float(context.deltaTime),
                axis: [0, 1, 0]
            )
        }
    }
}

// Register once at app start
SpinComponent.registerComponent()
SpinSystem.registerSystem()
```

Now any entity with `SpinComponent()` rotates automatically -- no per-entity update logic.

---

## 12. Object Capture (iOS 17+)

```swift
import RealityKit

let session = ObjectCaptureSession()
session.start(imagesDirectory: capturesURL,
              configuration: .init(isOverCaptureEnabled: true))

// Later, generate the model
let photogrammetry = try PhotogrammetrySession(input: capturesURL)
try photogrammetry.process(requests: [
    .modelFile(url: outputURL, detail: .reduced)
])
```

Requires LiDAR for guided capture; works on Macs for cloud-quality processing.

---

## 13. Performance Tips

1. **Reuse mesh and material resources** -- `MeshResource.generateBox(...)` is cheap, but loading a USDZ multiple times is not. Load once, clone with `entity.clone(recursive: true)`.
2. **Disable shadows on high-poly entities** when frame-rate dips -- `model.components[ShadowComponent.self] = nil`.
3. **Cap physics body count** -- mark static geometry as `.static`; only player/interactable items as `.dynamic`.
4. **Use `LowLevelMesh` (iOS 18+)** for procedural geometry instead of regenerating `MeshResource` every frame.
5. **Profile with the RealityKit Trace template in Instruments** -- shows GPU time per pass and ECS update breakdown.
6. **Bake lighting into Reality Composer Pro scenes** rather than adding runtime lights when possible.

---

## 14. Common Pitfalls

1. **Forgetting `generateCollisionShapes(recursive:)`** -- raycasts and gestures silently miss the entity.
2. **Adding entities outside an `AnchorEntity`** -- nothing renders. Always parent under an anchor or `content`.
3. **Using `SimpleMaterial` for production** -- it lacks PBR. Switch to `PhysicallyBasedMaterial`.
4. **Modifying `entity.transform` from a background thread** -- RealityKit is **main-thread only**. Schedule updates inside `RealityView.update` or a `System`.
5. **Skipping `registerComponent()` / `registerSystem()`** -- custom ECS code silently does nothing if not registered.
6. **Loading USDZ synchronously** -- use `try await Entity(named:)` to avoid stalling the render loop.
7. **Confusing iOS RealityKit with visionOS RealityKit** -- `ImmersiveSpace`, hand tracking, and eye tracking are visionOS-only. **`RealityView` and its content closure are not**: they exist on iOS 18+ and macOS 15+, where the content type is `RealityViewCameraContent`. See the platform table immediately below, and section 16 for building non-AR 3D on iOS.

---

## 15. Platform Differences

| Capability | iOS | macOS | visionOS |
|-----------|:---:|:-----:|:--------:|
| `RealityView` (SwiftUI) | iOS 18+ | macOS 15+ | visionOS 1+ |
| `ARView` (UIKit/AppKit) | All | All | -- |
| AR session | ARKit | -- | ARKit-for-visionOS |
| Hand/eye input | -- | -- | Yes |
| Reality Composer Pro scenes | Yes | Yes | Yes |
| Object capture | iOS 17+ | macOS 12+ | -- |

---

## 16. 3D Content in an Ordinary iOS Screen (non-AR)

**Load this when** you want 3D in a normal app screen — a product viewer, a
card carousel, a data sculpture — with no camera and no world tracking.

This is the most common 3D request on iOS and the easiest one to get wrong,
because **`RealityView` on iOS defaults to world tracking**. Follow the AR
sections above for a non-AR screen and you get a camera-permission prompt and a
live camera feed behind your content — on a screen that was never meant to see
through the phone.

### The two lines that opt out

```swift
import RealityKit
import SwiftUI

struct GalleryView: View {
    var body: some View {
        RealityView { content in
            // 1. Opt out of world tracking. Without this the view starts an AR
            //    session, prompts for camera access, and composites your scene
            //    over the camera feed.
            content.camera = .virtual

            // 2. Having opted out, you own the camera. There is no default one,
            //    so without this the scene renders from the origin.
            let camera = PerspectiveCamera()
            camera.camera.fieldOfViewInDegrees = 55
            camera.look(at: .zero, from: [0, 0.35, 1.6], relativeTo: nil)
            content.add(camera)

            content.add(makeLightRig())
            content.add(makeScene())
        }
    }
}
```

`content.camera` and `PerspectiveCamera` require **iOS 18+**. On iOS 17 the
equivalent is `ARView(frame:cameraMode:automaticallyConfigureSession:)` with
`cameraMode: .nonAR`, wrapped in a `UIViewRepresentable`:

```swift
struct LegacyRealityView: UIViewRepresentable {
    func makeUIView(context: Context) -> ARView {
        // .nonAR is the iOS 17 equivalent of `content.camera = .virtual`.
        let view = ARView(frame: .zero, cameraMode: .nonAR, automaticallyConfigureSession: false)
        view.environment.background = .color(.clear)
        return view
    }

    func updateUIView(_ view: ARView, context: Context) {}
}
```

### A light rig, because non-AR scenes have no environment

An AR scene inherits real-world lighting estimation. A virtual one inherits
nothing, so `PhysicallyBasedMaterial` renders black until you light it. The
minimum that reads well:

```swift
private func makeLightRig() -> Entity {
    let rig = Entity()

    let key = DirectionalLight()
    key.light.intensity = 2_500
    key.light.color = .white
    key.look(at: .zero, from: [1.2, 1.8, 1.4], relativeTo: nil)
    rig.addChild(key)

    let fill = DirectionalLight()
    fill.light.intensity = 800
    fill.look(at: .zero, from: [-1.5, 0.4, 1.0], relativeTo: nil)
    rig.addChild(fill)

    return rig
}
```

### Framing on a phone: you have about 27 degrees, not 55

`PerspectiveCamera.camera.fieldOfViewInDegrees` is the **vertical** field.
Horizontal is derived from the aspect ratio, and a portrait iPhone is roughly
0.46 wide-to-tall:

```
horizontal = 2 · atan( tan(vertical / 2) · aspect )
           = 2 · atan( tan(55° / 2) · 0.46 )
           ≈ 27°
```

**Twenty-seven degrees is narrow.** The natural first idea — a ring of cards
around the camera — puts all but one of them outside the frustum: you see one
card face and the backs of its neighbours. There is no warning; the content is
simply not there.

The rule that follows: **on iPhone, spend depth and height, not width.** A
vertical stack receding into the distance reads well in portrait; a horizontal
carousel does not, unless the items are close to the camera and few.

| Layout | Portrait phone | Landscape / iPad |
|---|---|---|
| Vertical stack, receding in Z | Works | Works |
| Depth-sorted deck toward camera | Works | Works |
| Horizontal ring or carousel | Falls out of frame | Works |

### Orbit controls silently override your camera

`.realityViewCameraControls(.orbit)` is the quickest way to make a scene
inspectable. Combined with `content.cameraTarget`, it **auto-frames the
target's bounds and discards the `PerspectiveCamera` transform you just set.**

Two failures follow, both easy to hit:

```swift
// WRONG — the target is assigned before its contents exist.
// Entities built in an async task have not been added yet, so the target has
// no bounds. The camera frames nothing and parks at the origin, inside the
// scene, looking at the backs of the cards.
content.cameraTarget = gallery
Task { await populate(gallery) }

// RIGHT — populate first, then hand it over.
await populate(gallery)
content.cameraTarget = gallery
```

```swift
// WRONG — auto-framing with no floor on scene size.
// With one small entity the bounds are tiny, so the camera zooms in until that
// single card fills the screen.
content.cameraTarget = gallery

// RIGHT — give the target a minimum extent so small scenes frame sanely.
let bounds = gallery.visualBounds(relativeTo: nil)
if bounds.boundingRadius < 0.25 {
    gallery.addChild(makeInvisibleFramingBox(radius: 0.25))
}
content.cameraTarget = gallery
```

### Text in 3D: `MeshResource.generateText` does not exist on iOS

It is macOS and visionOS only — it is not in the iOS SDK at all, so the fix is
not an availability guard, it is a different approach. Render a SwiftUI view to
an image and use it as a texture:

```swift
@MainActor
func makeLabel(_ text: String) throws -> ModelEntity {
    let renderer = ImageRenderer(content:
        Text(text)
            .font(.system(.title2, design: .rounded).weight(.semibold))
            .foregroundStyle(.white)
            .padding(24)
    )
    renderer.scale = 3

    guard let cgImage = renderer.cgImage else { throw LabelError.renderFailed }

    let texture = try TextureResource(image: cgImage, options: .init(semantic: .color))
    var material = UnlitMaterial()
    material.color = .init(texture: .init(texture))
    material.blending = .transparent(opacity: 1)

    let plane = MeshResource.generatePlane(width: 0.4, height: 0.1)
    return ModelEntity(mesh: plane, materials: [material])
}
```

`UnlitMaterial`, not `PhysicallyBasedMaterial`: rendered text should not pick up
scene lighting, or it dims as the camera moves and stops looking like text.

### `Scene` is ambiguous when both frameworks are imported

RealityKit and SwiftUI each declare a `Scene`. The `@main` App file is where
they collide, because that is where components and systems get registered:

```swift
// WRONG — `some Scene` no longer resolves.
import RealityKit
import SwiftUI

@main
struct GalleryApp: App {
    var body: some Scene { WindowGroup { GalleryView() } }   // ambiguous
}

// RIGHT — qualify it, or keep RealityKit out of this file entirely.
var body: some SwiftUI.Scene { WindowGroup { GalleryView() } }
```

Preferably the second: register components from the view that uses them, and
the `@main` file never imports RealityKit.

### Checklist for non-AR 3D on iOS

- [ ] `content.camera = .virtual` set — no camera prompt, no live feed
- [ ] A `PerspectiveCamera` added, since opting out removes the default
- [ ] A light rig added; PBR materials render black without one
- [ ] Layout spends depth and height, not width, on portrait phones
- [ ] `cameraTarget` assigned only after the target has contents
- [ ] Small scenes given a minimum framing extent
- [ ] No `MeshResource.generateText` — texture route for labels
- [ ] `SwiftUI.Scene` qualified, or RealityKit kept out of the `@main` file
- [ ] iOS 17 fallback via `ARView(cameraMode: .nonAR)` if the target allows it

---

See also: `docs/frameworks/arkit.md`, `docs/platforms/visionos.md`.
