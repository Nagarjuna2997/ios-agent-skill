# CoreML -- Complete Guide for On-Device Machine Learning

## Overview

CoreML is Apple's framework for running machine learning models on-device with hardware-accelerated inference across CPU, GPU, and the Neural Engine. It supports vision, natural language, audio, and tabular models with a unified API surface. Every code example below compiles and follows production best practices.

---

## 1. Loading an MLModel

### From the App Bundle (Compiled .mlmodelc)

When you drag a `.mlmodel` file into Xcode, it auto-generates a Swift class. You can also load manually.

```swift
import CoreML

// Auto-generated class usage (Xcode compiles the model at build time)
let imageClassifier = try MobileNetV2(configuration: MLModelConfiguration())

// Manual loading from the bundle
let bundleURL = Bundle.main.url(forResource: "MobileNetV2", withExtension: "mlmodelc")!
let model = try MLModel(contentsOf: bundleURL)
```

### From a Compiled Model URL

```swift
import CoreML

func loadModel(from compiledURL: URL) async throws -> MLModel {
    let configuration = MLModelConfiguration()
    configuration.computeUnits = .all
    return try MLModel(contentsOf: compiledURL, configuration: configuration)
}
```

### From a Downloaded .mlmodel (Runtime Compilation)

```swift
import CoreML

func compileAndLoad(downloadedModelURL: URL) async throws -> MLModel {
    // Compile the .mlmodel into .mlmodelc at runtime
    let compiledURL = try await MLModel.compileModel(at: downloadedModelURL)

    // Move to a permanent location (compiled models are placed in a temp directory)
    let permanentURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("Models")
        .appendingPathComponent(compiledURL.lastPathComponent)

    try FileManager.default.createDirectory(
        at: permanentURL.deletingLastPathComponent(),
        withIntermediateDirectories: true
    )

    if FileManager.default.fileExists(atPath: permanentURL.path) {
        try FileManager.default.removeItem(at: permanentURL)
    }
    try FileManager.default.moveItem(at: compiledURL, to: permanentURL)

    let configuration = MLModelConfiguration()
    configuration.computeUnits = .all
    return try MLModel(contentsOf: permanentURL, configuration: configuration)
}
```

---

## 2. Compute Unit Configuration

Control where inference runs: CPU only, CPU and GPU, CPU and Neural Engine, or all available hardware.

```swift
import CoreML

func configuredModel() throws -> MLModel {
    let config = MLModelConfiguration()

    // Options:
    // .cpuOnly        -- safest, always available
    // .cpuAndGPU      -- good for large matrix operations
    // .cpuAndNeuralEngine -- best power efficiency for supported models
    // .all            -- let CoreML decide the optimal hardware (recommended)
    config.computeUnits = .all

    // Optionally allow low-precision accumulation for speed
    config.allowLowPrecisionAccumulationOnGPU = true

    return try MLModel(contentsOf: Bundle.main.url(forResource: "MyModel", withExtension: "mlmodelc")!,
                       configuration: config)
}
```

---

## 3. MLMultiArray for Input and Output

MLMultiArray is the primary numeric tensor type for CoreML model inputs and outputs.

```swift
import CoreML

// Create a multi-array with shape [1, 3, 224, 224] (batch, channels, height, width)
let inputArray = try MLMultiArray(shape: [1, 3, 224, 224], dataType: .float32)

// Fill with data
for i in 0..<inputArray.count {
    inputArray[i] = NSNumber(value: Float.random(in: 0...1))
}

// Access specific elements using a flat index
let value = inputArray[0].floatValue

// Access with multi-dimensional subscript
let multiIndex = [0, 1, 112, 112] as [NSNumber]
let pixel = inputArray[multiIndex].floatValue
```

### Using MLTensor (iOS 18+)

MLTensor provides a more ergonomic, Accelerate-backed tensor API.

```swift
import CoreML

@available(iOS 18.0, *)
func tensorOperations() {
    // Create from shape and scalar
    let zeros = MLTensor(zeros: [1, 3, 224, 224], scalarType: Float.self)

    // Create from an array
    let data = MLTensor([1.0, 2.0, 3.0, 4.0] as [Float])

    // Reshape
    let reshaped = data.reshaped(to: [2, 2])

    // Arithmetic
    let scaled = data * 2.0
    let summed = data + MLTensor([0.5, 0.5, 0.5, 0.5] as [Float])

    // Convert to MLMultiArray for model input
    let multiArray = zeros.shapedArray(of: Float.self)
}
```

---

## 4. Making Predictions

### Synchronous Prediction

```swift
import CoreML

func predict(with model: MLModel, input: MLMultiArray) throws -> MLFeatureProvider {
    let inputFeature = try MLDictionaryFeatureProvider(
        dictionary: ["input_tensor": MLFeatureValue(multiArray: input)]
    )

    let options = MLPredictionOptions()
    options.usesCPUOnly = false  // allow GPU and Neural Engine

    let output = try model.prediction(from: inputFeature, options: options)
    return output
}
```

### Async Prediction (iOS 17+)

```swift
import CoreML

@available(iOS 17.0, *)
func asyncPredict(with model: MLModel, input: MLMultiArray) async throws -> MLFeatureProvider {
    let inputFeature = try MLDictionaryFeatureProvider(
        dictionary: ["input_tensor": MLFeatureValue(multiArray: input)]
    )

    let options = MLPredictionOptions()
    let output = try await model.prediction(from: inputFeature, options: options)
    return output
}
```

### Batch Prediction

```swift
import CoreML

func batchPredict(with model: MLModel, inputs: [MLDictionaryFeatureProvider]) throws -> [MLFeatureProvider] {
    let batchProvider = MLArrayBatchProvider(array: inputs)
    let options = MLPredictionOptions()

    let batchResults = try model.predictions(from: batchProvider, options: options)

    var results: [MLFeatureProvider] = []
    for i in 0..<batchResults.count {
        results.append(batchResults.features(at: i))
    }
    return results
}
```

---

## 5. VNCoreMLRequest -- Vision + CoreML Pipeline

Combine Vision preprocessing (resize, crop, normalize) with a CoreML model in a single pipeline.

```swift
import CoreML
import Vision
import UIKit

func classifyImage(_ image: UIImage) async throws -> [(String, Float)] {
    guard let cgImage = image.cgImage else {
        throw NSError(domain: "ImageError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid image"])
    }

    let configuration = MLModelConfiguration()
    configuration.computeUnits = .all
    let mlModel = try MobileNetV2(configuration: configuration).model
    let vnModel = try VNCoreMLModel(for: mlModel)

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNCoreMLRequest(model: vnModel) { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            guard let results = request.results as? [VNClassificationObservation] else {
                continuation.resume(returning: [])
                return
            }

            let topResults = results.prefix(5).map { ($0.identifier, $0.confidence) }
            continuation.resume(returning: topResults)
        }

        // Configure image preprocessing
        request.imageCropAndScaleOption = .centerCrop

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 6. Complete Image Classification Example

A full SwiftUI view that loads an image and classifies it with CoreML.

```swift
import SwiftUI
import CoreML
import Vision
import PhotosUI

@Observable
final class ImageClassifierViewModel {
    var classifications: [(label: String, confidence: Float)] = []
    var selectedImage: UIImage?
    var isProcessing = false
    var errorMessage: String?

    @MainActor
    func classify() async {
        guard let image = selectedImage, let cgImage = image.cgImage else { return }

        isProcessing = true
        errorMessage = nil

        do {
            let config = MLModelConfiguration()
            config.computeUnits = .all
            let mlModel = try MobileNetV2(configuration: config).model
            let vnModel = try VNCoreMLModel(for: mlModel)

            let results: [(String, Float)] = try await withCheckedThrowingContinuation { continuation in
                let request = VNCoreMLRequest(model: vnModel) { request, error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }
                    let observations = (request.results as? [VNClassificationObservation]) ?? []
                    let top5 = observations.prefix(5).map { ($0.identifier, $0.confidence) }
                    continuation.resume(returning: top5)
                }
                request.imageCropAndScaleOption = .centerCrop

                let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
                do {
                    try handler.perform([request])
                } catch {
                    continuation.resume(throwing: error)
                }
            }

            classifications = results.map { (label: $0.0, confidence: $0.1) }
        } catch {
            errorMessage = error.localizedDescription
        }

        isProcessing = false
    }
}

struct ImageClassifierView: View {
    @State private var viewModel = ImageClassifierViewModel()
    @State private var photoItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if let image = viewModel.selectedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: .black.opacity(0.2), radius: 12, y: 6)
                } else {
                    ContentUnavailableView("Select a Photo",
                                           systemImage: "photo.on.rectangle",
                                           description: Text("Choose an image to classify"))
                }

                PhotosPicker(selection: $photoItem, matching: .images) {
                    Label("Choose Photo", systemImage: "photo.badge.plus")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(.tint, in: RoundedRectangle(cornerRadius: 12))
                        .foregroundStyle(.white)
                }

                if viewModel.isProcessing {
                    ProgressView("Classifying...")
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                }

                if !viewModel.classifications.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Results")
                            .font(.headline)

                        ForEach(viewModel.classifications, id: \.label) { item in
                            HStack {
                                Text(item.label)
                                    .font(.body)
                                Spacer()
                                Text("\(item.confidence * 100, specifier: "%.1f")%")
                                    .font(.body.monospacedDigit())
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                }

                Spacer()
            }
            .padding()
            .navigationTitle("Image Classifier")
            .onChange(of: photoItem) { _, newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self),
                       let uiImage = UIImage(data: data) {
                        viewModel.selectedImage = uiImage
                        await viewModel.classify()
                    }
                }
            }
        }
    }
}
```

---

## 7. Text Prediction Example

Using a CoreML model trained on tabular or text data to make predictions.

```swift
import CoreML

struct SentimentPredictor {
    private let model: MLModel

    init() throws {
        let config = MLModelConfiguration()
        config.computeUnits = .cpuOnly  // text models often run best on CPU
        self.model = try SentimentClassifier(configuration: config).model
    }

    func predict(text: String) throws -> (label: String, confidence: Double) {
        let input = try MLDictionaryFeatureProvider(
            dictionary: ["text": MLFeatureValue(string: text)]
        )

        let output = try model.prediction(from: input)

        let label = output.featureValue(for: "label")?.stringValue ?? "unknown"
        let probabilities = output.featureValue(for: "labelProbability")?.dictionaryValue ?? [:]

        let confidence = (probabilities[label as NSObject] as? NSNumber)?.doubleValue ?? 0.0
        return (label: label, confidence: confidence)
    }

    func predictBatch(texts: [String]) throws -> [(label: String, confidence: Double)] {
        let inputs: [MLDictionaryFeatureProvider] = try texts.map { text in
            try MLDictionaryFeatureProvider(dictionary: ["text": MLFeatureValue(string: text)])
        }

        let batchProvider = MLArrayBatchProvider(array: inputs)
        let batchResults = try model.predictions(from: batchProvider)

        var results: [(label: String, confidence: Double)] = []
        for i in 0..<batchResults.count {
            let output = batchResults.features(at: i)
            let label = output.featureValue(for: "label")?.stringValue ?? "unknown"
            let probs = output.featureValue(for: "labelProbability")?.dictionaryValue ?? [:]
            let confidence = (probs[label as NSObject] as? NSNumber)?.doubleValue ?? 0.0
            results.append((label: label, confidence: confidence))
        }
        return results
    }
}
```

---

## 8. Model Caching and Performance Optimization

```swift
import CoreML

actor ModelCache {
    static let shared = ModelCache()

    private var cache: [String: MLModel] = [:]

    func model(named name: String, computeUnits: MLComputeUnits = .all) throws -> MLModel {
        if let cached = cache[name] {
            return cached
        }

        guard let url = Bundle.main.url(forResource: name, withExtension: "mlmodelc") else {
            throw ModelCacheError.modelNotFound(name)
        }

        let config = MLModelConfiguration()
        config.computeUnits = computeUnits

        let model = try MLModel(contentsOf: url, configuration: config)
        cache[name] = model
        return model
    }

    func preload(modelNames: [String]) async throws {
        for name in modelNames {
            _ = try model(named: name)
        }
    }

    func evict(named name: String) {
        cache.removeValue(forKey: name)
    }

    func evictAll() {
        cache.removeAll()
    }
}

enum ModelCacheError: LocalizedError {
    case modelNotFound(String)

    var errorDescription: String? {
        switch self {
        case .modelNotFound(let name):
            return "Model '\(name)' not found in the app bundle."
        }
    }
}
```

---

## 9. Converting Models with coremltools (Overview)

Use Python's `coremltools` to convert models from PyTorch, TensorFlow, or ONNX into `.mlmodel` format.

```python
# Install: pip install coremltools torch torchvision

import coremltools as ct
import torch
import torchvision

# Load a pretrained PyTorch model
torch_model = torchvision.models.mobilenet_v2(pretrained=True)
torch_model.eval()

# Trace the model with example input
example_input = torch.randn(1, 3, 224, 224)
traced_model = torch.jit.trace(torch_model, example_input)

# Convert to CoreML
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.ImageType(name="image", shape=(1, 3, 224, 224), scale=1/255.0)],
    classifier_config=ct.ClassifierConfig("imagenet_classes.txt"),
    compute_units=ct.ComputeUnit.ALL,
    minimum_deployment_target=ct.target.iOS17,
)

# Save
coreml_model.save("MobileNetV2.mlpackage")
```

Key conversion options:
- `compute_precision` -- use `ct.precision.FLOAT16` for smaller models and faster Neural Engine inference.
- `minimum_deployment_target` -- set to the lowest iOS version you support for maximum compatibility.
- `ct.ImageType` -- declares the input as an image so Vision can preprocess it automatically.
- `ct.ClassifierConfig` -- adds classification metadata so results come as `VNClassificationObservation`.

---

## 10. Performance Tips

| Technique | Benefit |
|-----------|---------|
| Use `.all` compute units | Let CoreML pick the fastest hardware |
| Float16 quantization | 2x smaller model, faster on Neural Engine |
| Batch predictions | Amortize model setup overhead |
| Cache loaded models | Avoid repeated disk I/O and compilation |
| Background thread inference | Keep UI responsive |
| Model warmup | Run a dummy prediction at launch to prime the pipeline |
| Use MLPackage over MLModel | Modern format with better optimization support |
| Profile with Instruments | Use the CoreML Instrument to find bottlenecks |

```swift
import CoreML

// Warmup: run a dummy prediction to prime the model pipeline
func warmup(model: MLModel, inputName: String, shape: [NSNumber]) throws {
    let dummyInput = try MLMultiArray(shape: shape, dataType: .float32)
    let provider = try MLDictionaryFeatureProvider(
        dictionary: [inputName: MLFeatureValue(multiArray: dummyInput)]
    )
    _ = try model.prediction(from: provider)
}
```

---

## Quick Reference

| Class / Protocol | Purpose |
|------------------|---------|
| `MLModel` | Core class for loading and running models |
| `MLModelConfiguration` | Configure compute units, precision |
| `MLMultiArray` | N-dimensional numeric array for model I/O |
| `MLTensor` | Modern tensor API (iOS 18+) |
| `MLFeatureProvider` | Protocol for model input/output |
| `MLDictionaryFeatureProvider` | Dictionary-based feature provider |
| `MLArrayBatchProvider` | Batch multiple inputs for prediction |
| `MLPredictionOptions` | Options for prediction (CPU-only flag) |
| `VNCoreMLModel` | Bridge a CoreML model into the Vision pipeline |
| `VNCoreMLRequest` | Vision request that uses a CoreML model |
