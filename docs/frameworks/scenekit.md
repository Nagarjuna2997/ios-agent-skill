# SceneKit -- Legacy 3D Scenes, Animation, and AR Rendering

## Overview

SceneKit is Apple's high-level scene graph framework for 3D content. It can load `.scn`, `.dae`, and USD-family assets, animate node hierarchies, run physics, play positional audio, and render through `SCNView`, `SceneView`, `SCNLayer`, or `SCNRenderer`.

> Apple now marks SceneKit as deprecated and recommends RealityKit for new 3D and spatial work. Use SceneKit when maintaining an existing app, when a project relies on SceneKit shader modifiers or scene assets, or when migration risk is higher than the value of moving immediately.

---

## 1. Choosing SceneKit vs RealityKit vs Metal

| Need | Prefer |
|------|--------|
| New AR, spatial, USDZ, physics, SharePlay sync | RealityKit |
| Existing `.scnassets`, `SCNNode` graphs, shader modifiers | SceneKit |
| Custom render passes, compute, low-level GPU ownership | Metal |
| AR camera tracking with legacy SceneKit rendering | ARKit + `ARSCNView` |

Use RealityKit for new features unless the app already has substantial SceneKit investment.

---

## 2. SwiftUI `SceneView`

```swift
import SwiftUI
import SceneKit

struct ModelPreview: View {
    private let scene: SCNScene = {
        let scene = SCNScene()

        let node = SCNNode(geometry: SCNSphere(radius: 0.35))
        node.geometry?.firstMaterial?.diffuse.contents = UIColor.systemTeal
        node.geometry?.firstMaterial?.roughness.contents = 0.45
        scene.rootNode.addChildNode(node)

        let camera = SCNNode()
        camera.camera = SCNCamera()
        camera.position = SCNVector3(0, 0, 2.2)
        scene.rootNode.addChildNode(camera)

        let light = SCNNode()
        light.light = SCNLight()
        light.light?.type = .omni
        light.position = SCNVector3(0, 1.2, 1.5)
        scene.rootNode.addChildNode(light)

        scene.background.contents = UIColor.systemBackground
        return scene
    }()

    var body: some View {
        SceneView(
            scene: scene,
            options: [.allowsCameraControl, .autoenablesDefaultLighting]
        )
        .ignoresSafeArea()
    }
}
```

`SceneView` is convenient for previews and simple viewers. For advanced control, wrap `SCNView` so you can own renderer delegates, hit testing, camera configuration, and lifecycle.

---

## 3. UIKit `SCNView`

```swift
import SceneKit
import UIKit

final class SceneViewController: UIViewController {
    private let sceneView = SCNView()
    private let scene = SCNScene()

    override func viewDidLoad() {
        super.viewDidLoad()

        view.addSubview(sceneView)
        sceneView.frame = view.bounds
        sceneView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        sceneView.scene = scene
        sceneView.allowsCameraControl = true
        sceneView.autoenablesDefaultLighting = true
        sceneView.backgroundColor = .systemBackground

        addCamera()
        addContent()
    }

    private func addCamera() {
        let cameraNode = SCNNode()
        cameraNode.camera = SCNCamera()
        cameraNode.position = SCNVector3(0, 1, 4)
        scene.rootNode.addChildNode(cameraNode)
        sceneView.pointOfView = cameraNode
    }

    private func addContent() {
        let box = SCNNode(geometry: SCNBox(width: 1, height: 1, length: 1, chamferRadius: 0.06))
        box.geometry?.firstMaterial?.diffuse.contents = UIColor.systemBlue
        scene.rootNode.addChildNode(box)

        let spin = SCNAction.repeatForever(.rotateBy(x: 0, y: .pi * 2, z: 0, duration: 4))
        box.runAction(spin)
    }
}
```

---

## 4. Loading Assets

```swift
import SceneKit

enum SceneAssetError: Error {
    case missingAsset(String)
    case missingNode(String)
}

func loadNode(named nodeName: String, from sceneName: String) throws -> SCNNode {
    guard let scene = SCNScene(named: sceneName) else {
        throw SceneAssetError.missingAsset(sceneName)
    }
    guard let node = scene.rootNode.childNode(withName: nodeName, recursively: true) else {
        throw SceneAssetError.missingNode(nodeName)
    }
    return node.clone()
}
```

Store SceneKit assets in `.scnassets`. Keep asset names stable and isolate loading behind a small factory so the rest of the app does not know file names.

---

## 5. Nodes, Transforms, and Animation

```swift
let ship = SCNNode()
ship.position = SCNVector3(0, 0, -2)
ship.eulerAngles = SCNVector3(0, Float.pi / 4, 0)
ship.scale = SCNVector3(0.5, 0.5, 0.5)

let moveUp = SCNAction.moveBy(x: 0, y: 0.4, z: 0, duration: 0.8)
moveUp.timingMode = .easeInEaseOut

let bob = SCNAction.sequence([moveUp, moveUp.reversed()])
ship.runAction(.repeatForever(bob), forKey: "idle-bob")
```

Prefer named action keys so you can stop or replace animations deterministically.

---

## 6. Materials and Lighting

```swift
let material = SCNMaterial()
material.lightingModel = .physicallyBased
material.diffuse.contents = UIColor.systemOrange
material.metalness.contents = 0.8
material.roughness.contents = 0.25

let sphere = SCNNode(geometry: SCNSphere(radius: 0.25))
sphere.geometry?.materials = [material]

let keyLight = SCNNode()
keyLight.light = SCNLight()
keyLight.light?.type = .area
keyLight.light?.intensity = 700
keyLight.position = SCNVector3(0, 2, 2)
```

Use physically based materials for modern assets. Avoid mixing many lighting models in one scene unless you are matching existing art.

---

## 7. Hit Testing and Selection

```swift
@objc
func handleTap(_ recognizer: UITapGestureRecognizer) {
    let point = recognizer.location(in: sceneView)
    let results = sceneView.hitTest(point, options: [
        .searchMode: SCNHitTestSearchMode.closest.rawValue,
        .boundingBoxOnly: false,
    ])

    guard let hit = results.first else { return }
    hit.node.geometry?.firstMaterial?.emission.contents = UIColor.systemYellow
}
```

For SwiftUI wrappers, keep gesture handling in a coordinator and send domain-level events back through closures.

---

## 8. Physics

```swift
let floor = SCNNode(geometry: SCNFloor())
floor.physicsBody = SCNPhysicsBody.static()

let ball = SCNNode(geometry: SCNSphere(radius: 0.2))
ball.position = SCNVector3(0, 2, 0)
ball.physicsBody = SCNPhysicsBody(type: .dynamic, shape: nil)
ball.physicsBody?.mass = 0.4
ball.physicsBody?.restitution = 0.7

scene.rootNode.addChildNode(floor)
scene.rootNode.addChildNode(ball)
```

Physics bodies are tied to node geometry and transforms. If you change geometry after creating the physics body, recreate the body or provide an explicit `SCNPhysicsShape`.

---

## 9. ARKit with `ARSCNView`

```swift
import ARKit
import SceneKit

final class ARSceneController: UIViewController, ARSCNViewDelegate {
    private let sceneView = ARSCNView()

    override func viewDidLoad() {
        super.viewDidLoad()
        sceneView.delegate = self
        sceneView.scene = SCNScene()
        view = sceneView
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        guard ARWorldTrackingConfiguration.isSupported else { return }

        let configuration = ARWorldTrackingConfiguration()
        configuration.planeDetection = [.horizontal, .vertical]
        configuration.environmentTexturing = .automatic
        sceneView.session.run(configuration)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        sceneView.session.pause()
    }

    func renderer(_ renderer: SCNSceneRenderer, didAdd node: SCNNode, for anchor: ARAnchor) {
        guard let planeAnchor = anchor as? ARPlaneAnchor else { return }

        let plane = SCNPlane(width: CGFloat(planeAnchor.extent.x),
                             height: CGFloat(planeAnchor.extent.z))
        plane.firstMaterial?.diffuse.contents = UIColor.systemBlue.withAlphaComponent(0.2)

        let planeNode = SCNNode(geometry: plane)
        planeNode.eulerAngles.x = -.pi / 2
        planeNode.position = SCNVector3(planeAnchor.center.x, 0, planeAnchor.center.z)
        node.addChildNode(planeNode)
    }
}
```

New AR features should usually use RealityKit's `ARView`; keep `ARSCNView` for legacy SceneKit renderers.

---

## 10. Custom Rendering and Metal Interop

Use SceneKit customization in this order:

1. `SCNMaterial` and built-in physically based lighting.
2. `SCNShadable` shader modifiers for localized material changes.
3. `SCNTechnique` for multipass post-processing.
4. `SCNRenderer` inside an existing Metal pipeline.
5. A full Metal renderer when SceneKit's frame graph is the constraint.

```swift
let renderer = SCNRenderer(device: metalDevice, options: nil)
renderer.scene = scene

// In your Metal render loop:
renderer.render(atTime: currentTime,
                viewport: viewport,
                commandBuffer: commandBuffer,
                passDescriptor: renderPassDescriptor)
```

SceneKit can coexist with Metal, but once you need deterministic command-buffer ownership, resource heaps, tile shaders, or compute-heavy passes, move that work to Metal directly.

---

## 11. Performance Checklist

- Keep draw calls low by merging static geometry where practical.
- Reuse `SCNMaterial` instances for repeated objects.
- Prefer lower-poly preview assets on mobile and load high-detail models only when needed.
- Pause rendering when offscreen: `sceneView.isPlaying = false`.
- Avoid continuously mutating large node hierarchies from SwiftUI state updates.
- Profile with Instruments and Xcode's GPU tools before rewriting rendering code.

---

## 12. Common Pitfalls

1. **Using SceneKit for new immersive visionOS apps** -- use RealityKit and `RealityView` instead.
2. **Forgetting camera and microphone purpose strings in AR** -- AR sessions need `NSCameraUsageDescription`; audio capture also needs microphone text.
3. **Creating physics bodies before final geometry setup** -- collision shapes can become stale.
4. **Blocking the main thread while loading assets** -- load heavy assets before presentation or behind a loading state.
5. **Letting SwiftUI recreate scenes on every body pass** -- store scene state in a model or wrapper.

---

## 13. Migration Notes to RealityKit

| SceneKit | RealityKit |
|----------|------------|
| `SCNNode` | `Entity` |
| `SCNGeometry` | `MeshResource` / `ModelComponent` |
| `SCNMaterial` | `SimpleMaterial`, `PhysicallyBasedMaterial`, `ShaderGraphMaterial` |
| `SCNAction` | `AnimationResource`, systems, timeline animation |
| `ARSCNView` | `ARView` |
| `.scnassets` | USDZ / Reality Composer Pro packages |

Migrate feature by feature. Start with leaf scenes or previews before replacing AR session ownership.

---

## 14. Review Checklist

- [ ] New work justified against RealityKit
- [ ] `.scnassets` loading isolated behind factories
- [ ] Scene lifecycle pauses when view disappears
- [ ] AR usage includes camera purpose strings and device support checks
- [ ] Materials reuse textures and avoid duplicate large allocations
- [ ] Physics shapes match final geometry
- [ ] SwiftUI wrappers keep SceneKit state out of `body`
- [ ] Migration path documented for deprecated SceneKit surfaces

See also: `docs/frameworks/realitykit.md`, `docs/frameworks/arkit.md`, `docs/frameworks/metal.md`.
