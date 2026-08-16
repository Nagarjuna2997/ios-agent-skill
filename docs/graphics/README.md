# Graphics, 3D, and Spatial Development

## Context

Use this hub for Core Graphics, Core Image, SwiftUI Canvas, shaders, SpriteKit, GameplayKit, RealityKit, RealityView, Model3D, ARKit, SceneKit migration, Metal, particles, spatial UI, and immersive content.

## Decision Tree

| Requirement | Use |
|---|---|
| Simple card tilt or perspective | SwiftUI transforms |
| Custom drawing in a 2D view | SwiftUI `Canvas` or Core Graphics |
| Image filters and pipelines | Core Image |
| Sprite game, 2D particles, simple physics | SpriteKit |
| Interactive 3D model or product viewer | RealityKit |
| SwiftUI-integrated 3D scene | `RealityView` |
| Static model presentation | `Model3D` |
| AR placement/tracking | ARKit + RealityKit |
| Legacy scene graph maintenance | SceneKit, with migration plan |
| Custom GPU rendering/compute | Metal |
| Shader effects in SwiftUI | SwiftUI shaders first, Metal for deeper control |

## Architecture Rules

- Keep asset loading asynchronous and cancellable.
- Separate scene state from SwiftUI view state.
- Provide loading and error views for 3D assets.
- Do not block the main actor while decoding images, USDZ, or shader resources.
- Hide platform-specific spatial APIs behind feature gates.
- Provide non-3D alternatives for essential controls.

## Example Routing

```text
"Make a Three.js-style product globe"
-> If real 3D model and native screen: RealityKit / Model3D
-> If custom shader globe: Metal
-> If existing web asset must run unchanged: WKWebView
```

## Performance

- Keep draw work proportional to visible pixels.
- Avoid per-frame allocation in Metal render loops.
- Downsample images before display.
- Reuse materials, meshes, buffers, and pipeline state.
- Measure frame pacing before optimizing.
- Test thermal and battery behavior for long-running motion or AR.

## Accessibility

- Essential interactions need a non-spatial path.
- 3D controls need labels and alternative actions.
- Avoid rapid camera motion.
- Respect Reduce Motion for orbit, parallax, and particle-heavy backgrounds.
- Do not place readable text on moving, low-contrast backgrounds.

## Related Guides

- `../frameworks/realitykit.md`
- `../frameworks/arkit.md`
- `../frameworks/scenekit.md`
- `../frameworks/metal.md`
- `../platforms/visionos.md`
- `../web/native-vs-web-animation.md`
