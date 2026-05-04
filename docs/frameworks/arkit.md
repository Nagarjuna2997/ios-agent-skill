# ARKit -- Complete Guide for Augmented Reality on iOS and iPadOS

## Overview

ARKit is Apple's framework for building augmented reality experiences on iPhone and iPad with LiDAR-class devices. It fuses motion sensors and camera input to produce world tracking, plane detection, scene reconstruction, image/object recognition, body tracking, face tracking, and people occlusion. ARKit produces the *data* (anchors, meshes, transforms); rendering is done by **RealityKit** (preferred), SceneKit, Metal, or SpriteKit.

> Use ARKit on **iOS 11+** / **iPadOS 11+**. Many modern features (mesh reconstruction, motion capture, geo-anchors, scene depth) require LiDAR or A12+ chips. ARKit is **not available on visionOS** -- use ARKit-for-visionOS APIs (`import ARKit` from `visionOS`) which expose a different surface.

---

## 1. Permissions and Info.plist

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to deliver augmented reality features.</string>

<!-- For face/world tracking with audio -->
<key>NSMicrophoneUsageDescription</key>
<string>Audio is captured to enrich AR experiences.</string>

<!-- For ARGeoTrackingConfiguration -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Location is used to anchor AR content to real-world coordinates.</string>
```

Always check device support **before** instantiating a session:

```swift
import ARKit

guard ARWorldTrackingConfiguration.isSupported else {
    // Fall back to a non-AR experience
    return
}
```

---

## 2. Choosing a Configuration

| Configuration | Use Case | Min Device |
|---------------|----------|------------|
| `ARWorldTrackingConfiguration` | 6-DOF camera + plane/mesh detection | A9+ |
| `ARFaceTrackingConfiguration` | Face anchors, blendshapes, Animoji-style | TrueDepth camera |
| `ARImageTrackingConfiguration` | Track moving 2D images (no world tracking) | A9+ |
| `ARObjectScanningConfiguration` | Author `.arobject` reference files | A11+ |
| `ARBodyTrackingConfiguration` | Skeleton tracking | A12+ |
| `ARGeoTrackingConfiguration` | World-locked content via VPS | A12+, supported cities |
| `ARPositionalTrackingConfiguration` | 6-DOF only (lowest power) | A9+ |

```swift
let configuration = ARWorldTrackingConfiguration()
configuration.planeDetection = [.horizontal, .vertical]
configuration.environmentTexturing = .automatic
configuration.frameSemantics.insert(.sceneDepth)         // LiDAR
configuration.sceneReconstruction = .meshWithClassification // LiDAR
configuration.userFaceTrackingEnabled = true             // Front+back camera fusion
```

Always confirm optional capabilities before opting in:

```swift
if ARWorldTrackingConfiguration.supportsSceneReconstruction(.meshWithClassification) {
    configuration.sceneReconstruction = .meshWithClassification
}

if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
    configuration.frameSemantics.insert(.sceneDepth)
}
```

---

## 3. Running an AR Session with RealityKit (Recommended)

```swift
import SwiftUI
import RealityKit
import ARKit

struct ARContainerView: UIViewRepresentable {
    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero, cameraMode: .ar, automaticallyConfigureSession: false)

        let configuration = ARWorldTrackingConfiguration()
        configuration.planeDetection = [.horizontal]
        configuration.environmentTexturing = .automatic

        arView.session.delegate = context.coordinator
        arView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])

        // Place a model when the user taps on a detected plane
        let tap = UITapGestureRecognizer(target: context.coordinator,
                                         action: #selector(Coordinator.handleTap(_:)))
        arView.addGestureRecognizer(tap)
        context.coordinator.arView = arView
        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, ARSessionDelegate {
        weak var arView: ARView?

        @objc func handleTap(_ gesture: UITapGestureRecognizer) {
            guard let arView else { return }
            let location = gesture.location(in: arView)

            // Ray-cast against estimated planes
            let results = arView.raycast(from: location,
                                         allowing: .estimatedPlane,
                                         alignment: .horizontal)
            guard let first = results.first else { return }

            let anchor = AnchorEntity(world: first.worldTransform)
            let model = ModelEntity(mesh: .generateBox(size: 0.1),
                                    materials: [SimpleMaterial(color: .systemBlue, isMetallic: false)])
            model.generateCollisionShapes(recursive: true)
            anchor.addChild(model)
            arView.scene.addAnchor(anchor)
        }
    }
}
```

### SwiftUI lifecycle

```swift
struct ContentView: View {
    var body: some View {
        ARContainerView()
            .ignoresSafeArea()
    }
}
```

---

## 4. Plane and Mesh Detection

### Plane anchors

```swift
func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
    for case let plane as ARPlaneAnchor in anchors {
        // plane.alignment, plane.classification, plane.geometry
    }
}
```

### LiDAR scene reconstruction

```swift
configuration.sceneReconstruction = .meshWithClassification

func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
    for case let mesh as ARMeshAnchor in anchors {
        let geometry = mesh.geometry
        // geometry.vertices, geometry.faces, geometry.classification
    }
}
```

Mesh classifications include `.wall`, `.floor`, `.ceiling`, `.table`, `.seat`, `.window`, `.door`, `.none`.

---

## 5. Image and Object Tracking

```swift
guard let referenceImages = ARReferenceImage.referenceImages(
    inGroupNamed: "ARImages", bundle: .main
) else { fatalError("Missing AR Resources group") }

let configuration = ARWorldTrackingConfiguration()
configuration.detectionImages = referenceImages
configuration.maximumNumberOfTrackedImages = 4
```

For physical objects, scan a `.arobject` with the official Apple sample, then:

```swift
guard let referenceObjects = ARReferenceObject.referenceObjects(
    inGroupNamed: "ARObjects", bundle: .main
) else { return }
configuration.detectionObjects = referenceObjects
```

---

## 6. Face Tracking and Blendshapes

```swift
guard ARFaceTrackingConfiguration.isSupported else { return }

let config = ARFaceTrackingConfiguration()
config.maximumNumberOfTrackedFaces = 1
arView.session.run(config)

func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
    for case let face as ARFaceAnchor in anchors {
        let smile = face.blendShapes[.mouthSmileLeft]?.floatValue ?? 0
        let blink = face.blendShapes[.eyeBlinkLeft]?.floatValue ?? 0
        // Drive an avatar with these values
    }
}
```

---

## 7. Body Tracking (Motion Capture)

```swift
guard ARBodyTrackingConfiguration.isSupported else { return }

let config = ARBodyTrackingConfiguration()
arView.session.run(config)

let characterAnchor = AnchorEntity()
arView.scene.addAnchor(characterAnchor)

func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
    for case let body as ARBodyAnchor in anchors {
        characterAnchor.transform = Transform(matrix: body.transform)
        // body.skeleton.jointModelTransforms drives a rigged BodyTrackedEntity
    }
}
```

---

## 8. People Occlusion and Person Segmentation

```swift
if ARWorldTrackingConfiguration.supportsFrameSemantics(.personSegmentationWithDepth) {
    configuration.frameSemantics.insert(.personSegmentationWithDepth)
}
```

RealityKit's `ARView` automatically composites people in front of virtual content when this is enabled.

---

## 9. Geo Anchors (City-Locked AR)

```swift
guard ARGeoTrackingConfiguration.isSupported else { return }

ARGeoTrackingConfiguration.checkAvailability { available, error in
    guard available else { return }

    let config = ARGeoTrackingConfiguration()
    arView.session.run(config)

    let coordinate = CLLocationCoordinate2D(latitude: 37.3349, longitude: -122.0090)
    let anchor = ARGeoAnchor(coordinate: coordinate, altitude: 25.0)
    arView.session.add(anchor: anchor)
}
```

Only supported in select metropolitan areas -- always call `checkAvailability` first.

---

## 10. Saving and Loading World Maps

```swift
arView.session.getCurrentWorldMap { map, error in
    guard let map else { return }
    let data = try? NSKeyedArchiver.archivedData(withRootObject: map, requiringSecureCoding: true)
    try? data?.write(to: worldMapURL)
}

let data = try Data(contentsOf: worldMapURL)
let map = try NSKeyedUnarchiver.unarchivedObject(ofClass: ARWorldMap.self, from: data)

let config = ARWorldTrackingConfiguration()
config.initialWorldMap = map
arView.session.run(config)
```

For multi-user shared experiences, replace world maps with **ARKit collaborative sessions** (`isCollaborationEnabled = true`) and a `MultipeerConnectivity` transport.

---

## 11. Lifecycle, Interruptions, and Cleanup

```swift
final class SessionDelegate: NSObject, ARSessionDelegate {
    func session(_ session: ARSession, didFailWithError error: Error) {
        // Surface an alert; ARError.Code tells you what failed
    }

    func sessionWasInterrupted(_ session: ARSession) {
        // Camera was occluded or app backgrounded
    }

    func sessionInterruptionEnded(_ session: ARSession) {
        // Reset tracking to recover quickly
        guard let configuration = session.configuration else { return }
        session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    }

    func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
        switch camera.trackingState {
        case .notAvailable: break
        case .limited(let reason): break // .initializing, .relocalizing, .insufficientFeatures, .excessiveMotion
        case .normal: break
        }
    }
}
```

Always pause the session when the view disappears:

```swift
.onDisappear { arView.session.pause() }
```

---

## 12. Common Pitfalls

1. **Forgetting `NSCameraUsageDescription`** -- the app crashes silently on first session run.
2. **Running `ARWorldTrackingConfiguration` on the simulator** -- it isn't supported. Guard with `#if !targetEnvironment(simulator)`.
3. **Not gating by capability** (`isSupported`, `supportsFrameSemantics(_:)`) -- causes runtime crashes on older devices.
4. **Holding strong references to `ARFrame`** -- frames are pooled. Copy what you need (transforms, pixel buffer) and release the frame promptly.
5. **Mixing front and back camera tracking carelessly** -- enabling `userFaceTrackingEnabled` requires both cameras to be available; check first.
6. **Recreating the `ARView` on every SwiftUI update** -- `UIViewRepresentable.makeUIView` runs once; do session setup there, not in `updateUIView`.
7. **Skipping `arView.session.pause()`** on disappear -- drains battery, keeps camera light on.

---

## 13. When to Pick Each Renderer

| Renderer | Use When |
|----------|----------|
| **RealityKit** (default) | Modern iOS 13+ apps, USDZ, photorealistic PBR materials, ECS gameplay |
| **SceneKit** | Existing SceneKit codebases, custom shader modifiers, advanced animations |
| **Metal** | Custom render pipelines, post-processing, shipping a custom renderer |
| **SpriteKit** | 2D AR overlays, simple gameplay |

---

## 14. Migration Notes

- **iOS 17+**: `ARView` gained explicit object capture APIs via `ObjectCaptureSession` (in RealityKit).
- **iOS 18+**: Room Plan, improved hand tracking on visionOS pair, expanded geo coverage.
- **visionOS**: ARKit on visionOS uses **data providers** (`HandTrackingProvider`, `WorldTrackingProvider`) instead of `ARSession`. Code is not source-compatible.

See also: `docs/frameworks/realitykit.md`, `docs/platforms/visionos.md`.
