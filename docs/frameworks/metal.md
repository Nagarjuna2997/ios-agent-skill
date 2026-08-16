# Metal -- GPU Rendering, Compute, and Performance-Critical Graphics

## Overview

Metal gives Swift and Objective-C apps direct access to Apple GPUs for rendering, compute, image processing, data-parallel work, and custom frame pipelines. Use Metal when high-level frameworks such as RealityKit, SceneKit, SpriteKit, Core Image, or SwiftUI cannot provide the performance, visual result, or GPU scheduling control the product needs.

> Reach for Metal deliberately. It is powerful, but it makes the app responsible for pipeline state, memory lifetime, synchronization, shader compilation, frame pacing, and GPU debugging.

---

## 1. Choosing Metal

| Need | Prefer |
|------|--------|
| Common AR / 3D entities, physics, USDZ | RealityKit |
| Existing scene graph and `.scnassets` | SceneKit |
| Custom post-processing, compute, renderer ownership | Metal |
| Image filters without custom kernels | Core Image |
| Charts and UI drawing | SwiftUI / Core Graphics |

Use `MetalKit` for app display setup. Apple documents `MTKView` as the Metal-aware view that owns the drawable setup, render-pass descriptor creation, optional depth/stencil textures, and delegate callbacks. `MTKView` is `@MainActor`, so create and configure it on the main actor.

---

## 2. Minimal `MTKView` Renderer

```swift
import Metal
import MetalKit

@MainActor
final class Renderer: NSObject, MTKViewDelegate {
    private let device: any MTLDevice
    private let commandQueue: any MTLCommandQueue
    private let pipelineState: any MTLRenderPipelineState

    init(view: MTKView) throws {
        guard let device = MTLCreateSystemDefaultDevice(),
              let commandQueue = device.makeCommandQueue() else {
            throw RendererError.metalUnavailable
        }

        self.device = device
        self.commandQueue = commandQueue

        view.device = device
        view.colorPixelFormat = .bgra8Unorm
        view.depthStencilPixelFormat = .depth32Float
        view.framebufferOnly = true
        view.clearColor = MTLClearColor(red: 0.02, green: 0.03, blue: 0.05, alpha: 1)

        let library = try device.makeDefaultLibrary(bundle: .main)
        guard let vertexFunction = library.makeFunction(name: "vertex_main"),
              let fragmentFunction = library.makeFunction(name: "fragment_main") else {
            throw RendererError.missingShaderFunction
        }

        let descriptor = MTLRenderPipelineDescriptor()
        descriptor.vertexFunction = vertexFunction
        descriptor.fragmentFunction = fragmentFunction
        descriptor.colorAttachments[0].pixelFormat = view.colorPixelFormat
        descriptor.depthAttachmentPixelFormat = view.depthStencilPixelFormat
        pipelineState = try device.makeRenderPipelineState(descriptor: descriptor)

        super.init()
        view.delegate = self
    }

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    func draw(in view: MTKView) {
        guard let descriptor = view.currentRenderPassDescriptor,
              let drawable = view.currentDrawable,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor) else {
            return
        }

        encoder.setRenderPipelineState(pipelineState)
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()

        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}

enum RendererError: Error {
    case metalUnavailable
    case missingShaderFunction
    case bufferAllocationFailed
}
```

SwiftUI wrapper:

```swift
import MetalKit
import SwiftUI

struct MetalView: UIViewRepresentable {
    func makeUIView(context: Context) -> MTKView {
        let view = MTKView()
        context.coordinator.attach(to: view)
        return view
    }

    func updateUIView(_ uiView: MTKView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    @MainActor
    final class Coordinator {
        private var renderer: Renderer?

        func attach(to view: MTKView) {
            renderer = try? Renderer(view: view)
        }
    }
}
```

---

## 3. Minimal Shader File

Add a `.metal` file to the app target. Xcode compiles it into `default.metallib`.

```metal
#include <metal_stdlib>
using namespace metal;

struct VertexOut {
    float4 position [[position]];
    float3 color;
};

vertex VertexOut vertex_main(uint vertexID [[vertex_id]]) {
    float2 positions[3] = {
        float2( 0.0,  0.6),
        float2(-0.6, -0.6),
        float2( 0.6, -0.6)
    };

    float3 colors[3] = {
        float3(1.0, 0.2, 0.2),
        float3(0.2, 1.0, 0.4),
        float3(0.2, 0.4, 1.0)
    };

    VertexOut out;
    out.position = float4(positions[vertexID], 0.0, 1.0);
    out.color = colors[vertexID];
    return out;
}

fragment float4 fragment_main(VertexOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}
```

Keep shader names stable and fail fast if a function is missing. A nil shader function usually means the `.metal` file is not in target membership or the Swift name no longer matches the shader function.

---

## 4. Vertex Buffers

```swift
struct Vertex {
    var position: SIMD3<Float>
    var color: SIMD3<Float>
}

let vertices: [Vertex] = [
    Vertex(position: [-0.5, -0.5, 0], color: [1, 0, 0]),
    Vertex(position: [ 0.5, -0.5, 0], color: [0, 1, 0]),
    Vertex(position: [ 0.0,  0.5, 0], color: [0, 0, 1]),
]

guard let vertexBuffer = device.makeBuffer(
    bytes: vertices,
    length: MemoryLayout<Vertex>.stride * vertices.count,
    options: [.storageModeShared]
) else {
    throw RendererError.bufferAllocationFailed
}
```

Prefer immutable buffers for static geometry. Use ring buffers or multiple in-flight buffers for per-frame uniforms so the CPU does not overwrite data the GPU is still reading.

---

## 5. Uniforms and In-Flight Frames

```swift
struct Uniforms {
    var modelViewProjectionMatrix: simd_float4x4
    var time: Float
}

private let maxFramesInFlight = 3
private let frameSemaphore = DispatchSemaphore(value: 3)
private var frameIndex = 0
private var uniformBuffers: [MTLBuffer] = []

func beginFrame() {
    frameSemaphore.wait()
    frameIndex = (frameIndex + 1) % maxFramesInFlight
}

func endFrame(commandBuffer: MTLCommandBuffer) {
    commandBuffer.addCompletedHandler { [frameSemaphore] _ in
        frameSemaphore.signal()
    }
}
```

Never mutate a shared uniform buffer immediately after encoding it unless you know the GPU has finished using it.

---

## 6. Textures with MetalKit

```swift
import MetalKit

let loader = MTKTextureLoader(device: device)
let texture = try loader.newTexture(
    name: "albedo",
    scaleFactor: UIScreen.main.scale,
    bundle: .main,
    options: [
        .textureUsage: MTLTextureUsage.shaderRead.rawValue,
        .textureStorageMode: MTLStorageMode.private.rawValue,
        .SRGB: true,
    ]
)
```

Use private storage for GPU-only textures. Use shared storage only when the CPU must read or write the resource.

---

## 7. Compute Kernels

```metal
#include <metal_stdlib>
using namespace metal;

kernel void brighten(texture2d<float, access::read> source [[texture(0)]],
                     texture2d<float, access::write> output [[texture(1)]],
                     uint2 id [[thread_position_in_grid]]) {
    if (id.x >= output.get_width() || id.y >= output.get_height()) {
        return;
    }

    float4 pixel = source.read(id);
    output.write(float4(min(pixel.rgb * 1.15, 1.0), pixel.a), id);
}
```

```swift
let width = pipeline.threadExecutionWidth
let height = max(1, pipeline.maxTotalThreadsPerThreadgroup / width)
let threadsPerGroup = MTLSize(width: width, height: height, depth: 1)
let threadsPerGrid = MTLSize(width: output.width, height: output.height, depth: 1)

encoder.setComputePipelineState(pipeline)
encoder.setTexture(source, index: 0)
encoder.setTexture(output, index: 1)
encoder.dispatchThreads(threadsPerGrid, threadsPerThreadgroup: threadsPerGroup)
```

Dispatch with bounds checks in the shader. Texture dimensions are rarely exact multiples of the threadgroup size.

---

## 8. Depth, Stencil, and Render State

```swift
let depthDescriptor = MTLDepthStencilDescriptor()
depthDescriptor.depthCompareFunction = .less
depthDescriptor.isDepthWriteEnabled = true
let depthState = device.makeDepthStencilState(descriptor: depthDescriptor)

encoder.setDepthStencilState(depthState)
```

Pipeline state is expensive to create. Apple recommends creating shared objects such as command queues, pipelines, buffers, and textures during initialization instead of time-critical paths. Build render and compute pipeline states before `draw(in:)`.

---

## 9. ARKit Camera Frames and Metal

ARKit gives each `ARFrame` a camera image as a `CVPixelBuffer`. Use `CVMetalTextureCache` to wrap camera planes as Metal textures without copying.

```swift
import ARKit
import CoreVideo
import Metal

var textureCache: CVMetalTextureCache?
CVMetalTextureCacheCreate(nil, nil, device, nil, &textureCache)

func makeTexture(from pixelBuffer: CVPixelBuffer,
                 plane: Int,
                 pixelFormat: MTLPixelFormat) -> MTLTexture? {
    guard let textureCache else { return nil }

    let width = CVPixelBufferGetWidthOfPlane(pixelBuffer, plane)
    let height = CVPixelBufferGetHeightOfPlane(pixelBuffer, plane)
    var cvTexture: CVMetalTexture?

    let status = CVMetalTextureCacheCreateTextureFromImage(
        nil,
        textureCache,
        pixelBuffer,
        nil,
        pixelFormat,
        width,
        height,
        plane,
        &cvTexture
    )

    guard status == kCVReturnSuccess else { return nil }
    return cvTexture.flatMap(CVMetalTextureGetTexture)
}
```

Use RealityKit unless the product needs custom camera compositing, segmentation, reconstruction rendering, or research-grade visualization.

---

## 10. Swift Concurrency Boundaries

Metal objects are reference types that often represent GPU resources. Treat the renderer as owning them on one execution context. Because `MTKView` is `@MainActor`, keep view configuration and delegate attachment on the main actor.

```swift
@MainActor
final class RenderModel {
    private var renderer: Renderer?

    func attach(view: MTKView) {
        renderer = try? Renderer(view: view)
    }
}
```

For asset preparation, decode or generate CPU-side data off the main actor, then hand immutable bytes to the renderer for buffer creation. Keep command encoding serialized unless you have a clear multi-queue design.

---

## 11. Debugging and Profiling

- Enable Metal API Validation in debug schemes.
- Capture GPU frames in Xcode and inspect render passes, attachments, and pipeline state.
- Use Instruments' Metal System Trace for frame pacing and GPU/CPU overlap.
- Give command buffers and resources labels so captures are readable.
- Watch for pixel format mismatches between `MTKView`, pipeline descriptors, and render pass attachments.

```swift
commandBuffer.label = "Main scene command buffer"
pipelineDescriptor.label = "Opaque mesh pipeline"
vertexBuffer.label = "Static mesh vertices"
```

---

## 12. Common Pitfalls

1. **Creating pipeline state during rendering** -- compile it during setup.
2. **Forgetting target membership for `.metal` files** -- `makeDefaultLibrary()` will not contain the shader.
3. **Writing to buffers still in use by the GPU** -- use in-flight buffers or command-buffer completion handlers.
4. **Mismatched pixel formats** -- the pipeline descriptor must match the render pass.
5. **Assuming one threadgroup fits all textures** -- bounds-check compute kernels.
6. **Skipping labels** -- unlabeled GPU captures are slow to debug.

---

## 13. Review Checklist

- [ ] `MTLCreateSystemDefaultDevice()` failure has a user-facing fallback
- [ ] `MTKView` setup and delegate attachment happen on the main actor
- [ ] Pipeline states are created outside the draw loop
- [ ] `.metal` functions are checked and failures are actionable
- [ ] Per-frame data uses in-flight buffers or synchronization
- [ ] Textures use private storage unless CPU access is required
- [ ] Render pass formats match pipeline descriptors
- [ ] Command buffers/resources are labeled in debug builds
- [ ] GPU work is profiled before lower-level rewrites

See also: `docs/frameworks/realitykit.md`, `docs/frameworks/scenekit.md`, `docs/frameworks/arkit.md`, `docs/frameworks/accelerate.md`.
