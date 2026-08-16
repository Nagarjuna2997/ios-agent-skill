# RealityKit Patterns

Use RealityKit for native interactive 3D, AR placement, product viewers, spatial entities, physics, and RealityView integration.

| Pattern | Use | Checklist |
|---|---|---|
| model viewer | product detail or preview | loading/error states, scale, lighting |
| AR placement | place object in world | camera permission, unsupported-device fallback |
| entity interaction | tap/drag/select objects | input/collision components |
| spatial onboarding | explain 3D feature | non-3D alternative |
| material preview | inspect PBR variants | color management and lighting |

Do not use RealityKit for a simple card tilt; SwiftUI transforms are enough.
