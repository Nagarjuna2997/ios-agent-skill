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
7. **Confusing iOS RealityKit with visionOS RealityKit** -- some APIs (e.g., `RealityView` content, `ImmersiveSpace`) only exist on visionOS.

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

See also: `docs/frameworks/arkit.md`, `docs/platforms/visionos.md`.
