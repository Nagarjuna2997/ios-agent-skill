# Metal Patterns

Use Metal when SwiftUI, Core Image, SpriteKit, or RealityKit cannot express the rendering or compute workload.

| Pattern | Use | Watch for |
|---|---|---|
| shader background | custom GPU visual | reduced motion, text contrast |
| particle field | thousands of particles | buffer reuse, thermal cost |
| image compute | custom filter/pipeline | pixel formats and color space |
| AR texture processing | camera frame effects | frame ownership and latency |
| data parallel compute | non-UI heavy math | command scheduling and memory |

Never allocate pipeline state, command queues, or large buffers per frame.
