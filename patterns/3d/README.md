# 3D Pattern Library

Translate Three.js-style requests into native Apple frameworks.

| Pattern | Preferred Stack | Notes |
|---------|-----------------|-------|
| Rotating product | `Model3D` or RealityKit | Use real USDZ assets and controlled lighting |
| Interactive globe | RealityKit; Metal for custom shaders | Watch texture size and gesture accessibility |
| Floating object | RealityKit in `RealityView` | Keep scale and camera stable |
| 3D card | SwiftUI transforms for simple tilt | Do not use a full renderer for perspective only |
| Particle background | SwiftUI Canvas for light effects, Metal for dense GPU particles | Must not reduce readability |
| RealityKit scene | entities/components/systems | Main-thread lifecycle and performance budget |
| Model3D viewer | `Model3D`, orbit controls where available | Include loading/error states |
| AR object placement | ARKit + RealityKit | Camera permission, support checks, coaching UI |

References: `docs/frameworks/realitykit.md`, `docs/frameworks/arkit.md`,
`docs/frameworks/scenekit.md`, `docs/frameworks/metal.md`, `docs/platforms/visionos.md`.
