# Core AI -- Custom On-Device AI Models on Apple Silicon

## Overview

Core AI is Apple's framework for bringing custom AI models into an app and running them efficiently on Apple silicon. Use it when you own or ship a model asset and need on-device inference across CPU, GPU, and Neural Engine with Swift APIs, model specialization, caching, ahead-of-time compilation, and Core AI debugging tools.

Use **Foundation Models** when you need language generation, structured output, tools, or Apple Intelligence model access. Use **Core ML** when your model is not a neural network workload, or when an existing Core ML pipeline already covers the feature.

> Core AI is beta in the iOS 27 / Xcode 27 generation. Treat APIs and tool output as subject to change until final SDKs ship.

---

## 1. When to Choose Core AI

| Need | Prefer |
|------|--------|
| Ship a custom neural model in `.aimodel` / `.aimodelc` format | Core AI |
| Prompt Apple Foundation models, PCC, or a server LLM through one API | Foundation Models |
| Use trees, classical ML, tabular feature engineering, or existing `.mlmodel` assets | Core ML |
| Write custom GPU kernels or render/compute pipelines directly | Metal |
| Run MLX models or local agent experiments on macOS | MLX Swift |

Core AI starts from an `.aimodel` source asset. Convert and optimize model assets before app integration using Apple's Core AI PyTorch Extensions and Core AI Optimization tooling.

---

## 2. Xcode Project Setup

1. Add the `.aimodel` file to the app or package target.
2. Confirm the file appears in the target build phases.
3. Install the Metal Toolchain. Builds that include `.aimodel` files fail without the required compiler.
4. Inspect the model in Xcode's model viewer before writing runtime code.

The model viewer should answer:

- What are the model's function names?
- What input and output names does each function expect?
- Are inputs `NDArray` values or images?
- What compute/storage precision does the asset use?
- Is the author/license metadata present?

---

## 3. Load a Model and Function

```swift
import CoreAI
import Foundation

@available(iOS 27.0, macOS 27.0, visionOS 27.0, *)
enum ClassifierError: Error {
    case missingModel
    case missingFunction(String)
    case missingOutput(String)
    case unexpectedOutputType
}

@available(iOS 27.0, macOS 27.0, visionOS 27.0, *)
actor ImageClassifier {
    private let function: InferenceFunction

    init(modelURL: URL) async throws {
        let model = try await AIModel(contentsOf: modelURL, options: .default)

        guard let descriptor = model.functionDescriptor(for: "main") else {
            throw ClassifierError.missingFunction("main")
        }

        // Use the descriptor for logging, validation, or assertions in debug builds.
        debugPrint(descriptor)

        guard let function = try model.loadFunction(named: "main") else {
            throw ClassifierError.missingFunction("main")
        }
        self.function = function
    }
}
```

`AIModel` represents the specialized model asset for the current device. Loading an `InferenceFunction` prepares runnable resources for a specific compute graph and can be expensive, so do it before the first user-visible inference path.

---

## 4. Run `NDArray` Inference

The converted model defines the exact input and output names. Match those names in code.

```swift
@available(iOS 27.0, macOS 27.0, visionOS 27.0, *)
extension ImageClassifier {
    func predict(features: [Float]) async throws -> [Float] {
        var input = NDArray(shape: [1, features.count], scalarType: .float32)
        var mutable = input.mutableView(as: Float.self)

        guard let elements = mutable.contiguousElements else {
            throw ClassifierError.unexpectedOutputType
        }

        for index in features.indices {
            elements[index] = features[index]
        }

        var outputs = try await function.run(inputs: ["input": input])
        guard let predictionValue = outputs.remove("prediction") else {
            throw ClassifierError.missingOutput("prediction")
        }
        guard let prediction = predictionValue.ndArray else {
            throw ClassifierError.unexpectedOutputType
        }

        let view = prediction.view(as: Float.self)
        guard let values = view.contiguousElements else {
            throw ClassifierError.unexpectedOutputType
        }
        return Array(values)
    }
}
```

Keep the model's conversion metadata and the Swift constants together. A mismatch in input names, shapes, or scalar type is an integration defect, not a prompt problem.

---

## 5. Specialization, Caching, and Storage

Loading a `.aimodel` can require device-specific specialization. The default behavior specializes and caches the result so later loads are faster.

Use explicit specialization when you want to control timing or cache policy:

```swift
let model = try await AIModel.specialize(
    contentsOf: modelURL,
    options: .default,
    cachePolicy: .persistent
)

let bookmark = model.bookmarkData
UserDefaults.standard.set(bookmark, forKey: "classifier.model.bookmark")
```

Use persistent cache policy only when the product really needs it. Specialized assets are tied to OS versions, source model content, storage pressure, and compute options. If bookmark resolution fails later, redownload or rebundle the source model and specialize again.

For app groups, use an `AIModelCache(appGroup:)` so related apps/extensions do not duplicate specialized assets.

---

## 6. Ahead-of-Time Compilation

Large models can take too long to specialize on first launch. Use `coreai-build` to move the expensive compile step to the build machine:

```bash
xcodebuild -downloadComponent MetalToolchain
xcrun coreai-build compile MyModel.aimodel --platform iOS --min-deployment-version 27.0 --output compiled/
```

At runtime, choose the compiled asset for the current device architecture:

```swift
let arch = AIModel.deviceArchitectureName
let assetName = "MyModel.\(arch).aimodelc"
```

Host architecture-specific `.aimodelc` assets remotely when they are large. Background Assets can manage downloads and updates.

---

## 7. Debugging and Profiling

Core AI ships with three main debugging surfaces:

- **Xcode model viewer** for metadata, operation distribution, function signatures, precision, and model inspection.
- **Core AI debug gauge** during a debug session for model load, specialization, and inference activity.
- **Core AI instrument** for timing across CPU, GPU, and Neural Engine.
- **Core AI Debugger app** for inspecting `.aimodel` structure and tracing tensor values back to Python source.

Use this workflow:

1. Validate the `.aimodel` in the Core AI Debugger before app integration.
2. Confirm function names and signatures in Xcode.
3. Run with the Xcode gauge while exercising real UI flows.
4. Profile with the Core AI instrument before changing compute options.
5. Compare outputs against reference data whenever conversion or optimization changes.

---

## 8. Security and Product Rules

- Keep model licenses and attribution in the asset metadata and app documentation.
- Treat downloaded models as executable product inputs: sign, version, checksum, and stage rollout.
- Do not run first-time specialization on a critical interaction without progress UI.
- Provide thermal, battery, and storage fallbacks for large models.
- Prefer `.default` compute options until profiling proves a need to override.
- Keep user data on device unless the feature explicitly explains network use.

---

## 9. Review Checklist

- [ ] `.aimodel` target membership and Metal Toolchain setup are documented
- [ ] Function names, input names, output names, shapes, and scalar types are asserted
- [ ] First-run specialization has loading UI and cancellation behavior
- [ ] Cache policy is intentional and storage impact is tested
- [ ] AOT compilation considered for large models
- [ ] Debugger/gauge/Instruments workflow captured in the PR
- [ ] Reference-output regression tests exist for conversion/optimization changes
- [ ] Fallback path exists for unsupported devices, storage pressure, and OS updates

See also: `docs/frameworks/foundation-models.md`, `docs/frameworks/ml/coreml.md`, `docs/frameworks/ml/on-device-ai.md`, `docs/frameworks/metal.md`.
