# RealityKit 3D view

`ModelViewer` shows a 3D model in a normal screen with RealityKit's `RealityView`: no AR session, no camera permission. It adds a perspective camera, a two-light rig and orbit controls, and falls back to a generated rounded box when no model name is given or the model fails to load.

## Use

```swift
ModelViewer(modelName: "Chair")   // Chair.usdz in the app target
    .frame(height: 320)
```

## Rules

From [RealityKit](../../docs/frameworks/realitykit.md), section 16:

- `RealityView` on iOS defaults to world tracking; `content.camera = .virtual` opts out.
- A virtual scene has no environment lighting; without lights, physically based materials render black.
- A portrait phone has a narrow horizontal field of view; frame the model close to the camera.
- Requires iOS 18 (`content.camera`, `PerspectiveCamera`, `realityViewCameraControls`). Applying it raises the app's deployment target.
