# Apple On-Device AI -- Complete Guide for Foundation Models and Local Inference

## Overview

Apple provides multiple paths for running AI models on-device: the Foundation Models framework (iOS 26+/macOS 26+) for Apple's built-in large language model, MLX Swift for custom model inference, and integration points with Apple Intelligence features. This guide covers each approach with compilable code examples and production best practices.

---

## 1. Foundation Models Framework (iOS 26 / macOS 26)

The Foundation Models framework gives apps direct access to Apple's on-device large language model. It runs entirely on-device with no network dependency and no data leaving the device.

### Basic Setup and Session Management

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
struct OnDeviceChat {
    let session: LanguageModelSession

    init() {
        // Create a session with the system language model
        self.session = LanguageModelSession()
    }

    func ask(_ prompt: String) async throws -> String {
        let response = try await session.respond(to: prompt)
        return response.content
    }
}

// Check availability before using
@available(iOS 26.0, macOS 26.0, *)
func checkModelAvailability() -> Bool {
    let availability = SystemLanguageModel.default.availability
    switch availability {
    case .available:
        return true
    case .unavailable:
        return false
    @unknown default:
        return false
    }
}
```

### Session Configuration and Instructions

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
func createConfiguredSession() -> LanguageModelSession {
    // Provide a system instruction to shape the model's behavior
    let instructions = """
    You are a helpful cooking assistant. You provide concise recipes \
    and cooking tips. Always include estimated cooking times. \
    Respond in a friendly, encouraging tone.
    """

    let session = LanguageModelSession(instructions: instructions)
    return session
}

@available(iOS 26.0, macOS 26.0, *)
func conversationalSession() async throws {
    let session = LanguageModelSession(
        instructions: "You are a knowledgeable fitness coach."
    )

    // Multi-turn conversation -- the session maintains context
    let response1 = try await session.respond(to: "I want to start running. Any tips?")
    print(response1.content)

    // Follow-up retains context from the previous turn
    let response2 = try await session.respond(to: "How about a weekly plan for beginners?")
    print(response2.content)
}
```

---

## 2. Prompt Engineering with Apple's On-Device LLM

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
struct PromptPatterns {
    let session: LanguageModelSession

    init(instructions: String = "") {
        self.session = LanguageModelSession(instructions: instructions)
    }

    // Summarization
    func summarize(_ text: String) async throws -> String {
        let prompt = """
        Summarize the following text in 2-3 sentences:

        \(text)
        """
        let response = try await session.respond(to: prompt)
        return response.content
    }

    // Extraction
    func extractKeyPoints(_ text: String) async throws -> String {
        let prompt = """
        Extract the key points from the following text as a bulleted list:

        \(text)
        """
        let response = try await session.respond(to: prompt)
        return response.content
    }

    // Classification
    func classifyIntent(_ userMessage: String) async throws -> String {
        let prompt = """
        Classify the following user message into one of these categories: \
        question, complaint, compliment, request, feedback.

        Respond with only the category name.

        Message: \(userMessage)
        """
        let response = try await session.respond(to: prompt)
        return response.content.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }

    // Rewriting
    func rewriteFormal(_ text: String) async throws -> String {
        let prompt = """
        Rewrite the following text in a formal, professional tone. \
        Keep the same meaning but make it suitable for business communication.

        \(text)
        """
        let response = try await session.respond(to: prompt)
        return response.content
    }
}
```

---

## 3. Guided Generation with Structured Output

Use `@Generable` to constrain the model output to a specific Swift type.

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
@Generable
struct RecipeOutput {
    @Guide(description: "Name of the dish")
    var name: String

    @Guide(description: "List of ingredients with quantities")
    var ingredients: [String]

    @Guide(description: "Step-by-step cooking instructions")
    var steps: [String]

    @Guide(description: "Estimated total time in minutes")
    var totalTimeMinutes: Int

    @Guide(description: "Difficulty level: easy, medium, or hard")
    var difficulty: String
}

@available(iOS 26.0, macOS 26.0, *)
func generateRecipe(for dish: String) async throws -> RecipeOutput {
    let session = LanguageModelSession(
        instructions: "You are a professional chef. Generate detailed recipes."
    )

    let response = try await session.respond(
        to: "Create a recipe for \(dish)",
        generating: RecipeOutput.self
    )

    return response.content
}

// More complex structured output
@available(iOS 26.0, macOS 26.0, *)
@Generable
struct SentimentAnalysisOutput {
    @Guide(description: "Overall sentiment: positive, negative, or neutral")
    var sentiment: String

    @Guide(description: "Confidence score between 0.0 and 1.0")
    var confidence: Double

    @Guide(description: "Key phrases that influenced the sentiment")
    var keyPhrases: [String]

    @Guide(description: "Brief explanation of the analysis")
    var explanation: String
}

@available(iOS 26.0, macOS 26.0, *)
func analyzeSentimentStructured(_ text: String) async throws -> SentimentAnalysisOutput {
    let session = LanguageModelSession(
        instructions: "You are a sentiment analysis expert. Analyze text precisely."
    )

    let response = try await session.respond(
        to: "Analyze the sentiment of: \(text)",
        generating: SentimentAnalysisOutput.self
    )

    return response.content
}
```

---

## 4. Tool Calling with On-Device Models

Define tools that the model can invoke to perform actions or retrieve data.

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
@Tool
struct WeatherLookup {
    @Guide(description: "The city to look up weather for")
    var city: String

    func call() async throws -> String {
        // In a real app, this would call a weather API or local data source
        return "Currently 72 degrees F and sunny in \(city)"
    }
}

@available(iOS 26.0, macOS 26.0, *)
@Tool
struct UnitConverter {
    @Guide(description: "The numeric value to convert")
    var value: Double

    @Guide(description: "The source unit (e.g., miles, kg, celsius)")
    var fromUnit: String

    @Guide(description: "The target unit (e.g., km, lbs, fahrenheit)")
    var toUnit: String

    func call() async throws -> String {
        // Simplified conversion logic
        let result: Double
        switch (fromUnit.lowercased(), toUnit.lowercased()) {
        case ("miles", "km"):
            result = value * 1.60934
        case ("km", "miles"):
            result = value / 1.60934
        case ("kg", "lbs"):
            result = value * 2.20462
        case ("lbs", "kg"):
            result = value / 2.20462
        case ("celsius", "fahrenheit"):
            result = value * 9 / 5 + 32
        case ("fahrenheit", "celsius"):
            result = (value - 32) * 5 / 9
        default:
            return "Conversion from \(fromUnit) to \(toUnit) not supported"
        }
        return "\(value) \(fromUnit) = \(String(format: "%.2f", result)) \(toUnit)"
    }
}

@available(iOS 26.0, macOS 26.0, *)
func sessionWithTools() async throws -> String {
    let session = LanguageModelSession(
        instructions: "You are a helpful assistant with access to weather and unit conversion tools.",
        tools: [WeatherLookup.self, UnitConverter.self]
    )

    let response = try await session.respond(to: "What is the weather in San Francisco?")
    return response.content
}
```

---

## 5. Streaming Responses

Stream tokens as they are generated for a responsive UI.

```swift
import FoundationModels
import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
@Observable
@MainActor
final class StreamingChatViewModel {
    var messages: [(role: String, content: String)] = []
    var currentResponse = ""
    var isGenerating = false

    private let session: LanguageModelSession

    init() {
        self.session = LanguageModelSession(
            instructions: "You are a helpful, concise assistant."
        )
    }

    func send(_ prompt: String) async {
        messages.append((role: "user", content: prompt))
        currentResponse = ""
        isGenerating = true

        do {
            let stream = session.streamResponse(to: prompt)

            for try await partial in stream {
                currentResponse = partial.content
            }

            messages.append((role: "assistant", content: currentResponse))
            currentResponse = ""
        } catch {
            messages.append((role: "error", content: error.localizedDescription))
        }

        isGenerating = false
    }
}

@available(iOS 26.0, macOS 26.0, *)
struct StreamingChatView: View {
    @State private var viewModel = StreamingChatViewModel()
    @State private var inputText = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(viewModel.messages.enumerated()), id: \.offset) { _, message in
                            MessageBubble(role: message.role, content: message.content)
                        }

                        if !viewModel.currentResponse.isEmpty {
                            MessageBubble(role: "assistant", content: viewModel.currentResponse)
                        }
                    }
                    .padding()
                }

                Divider()

                HStack(spacing: 12) {
                    TextField("Ask something...", text: $inputText)
                        .textFieldStyle(.roundedBorder)

                    Button {
                        let prompt = inputText
                        inputText = ""
                        Task { await viewModel.send(prompt) }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                    }
                    .disabled(inputText.isEmpty || viewModel.isGenerating)
                }
                .padding()
            }
            .navigationTitle("On-Device Chat")
        }
    }
}

@available(iOS 26.0, macOS 26.0, *)
struct MessageBubble: View {
    let role: String
    let content: String

    var body: some View {
        HStack {
            if role == "user" { Spacer() }

            Text(content)
                .padding(12)
                .background(
                    role == "user" ? Color.accentColor : Color(.systemGray5),
                    in: RoundedRectangle(cornerRadius: 16)
                )
                .foregroundStyle(role == "user" ? .white : .primary)

            if role != "user" { Spacer() }
        }
    }
}
```

---

## 6. MLX Swift for Custom Model Inference

MLX Swift is an open-source framework from Apple for running custom machine learning models using the MLX array framework, optimized for Apple Silicon.

### Loading and Running a Model

```swift
// Requires: swift package dependency on mlx-swift and mlx-swift-examples
// https://github.com/ml-explore/mlx-swift

import MLX
import MLXNN
import MLXRandom

// Example: running a simple neural network with MLX
func mlxBasicOperations() {
    // Create tensors
    let a = MLXArray([1.0, 2.0, 3.0, 4.0])
    let b = MLXArray([5.0, 6.0, 7.0, 8.0])

    // Arithmetic
    let sum = a + b
    let product = a * b
    let dotProduct = (a * b).sum()

    // Matrix operations
    let matrix = MLXArray([1.0, 2.0, 3.0, 4.0]).reshaped([2, 2])
    let identity = MLXArray.eye(2)
    let result = matmul(matrix, identity)

    // Evaluate lazily-computed results
    eval(sum, product, dotProduct, result)

    print("Sum: \(sum)")
    print("Dot product: \(dotProduct)")
}
```

### Loading a Language Model with MLX

```swift
import MLX
import MLXLLM
import MLXLMCommon

@Observable
@MainActor
final class MLXLanguageModel {
    var outputText = ""
    var isGenerating = false

    private var modelContainer: ModelContainer?

    func loadModel() async throws {
        // Load a model from Hugging Face (downloaded and cached locally)
        let configuration = ModelConfiguration.llama3_2_1B_4bit

        let container = try await LLMModelFactory.shared.create(configuration: configuration)
        self.modelContainer = container
    }

    func generate(prompt: String, maxTokens: Int = 256) async throws -> String {
        guard let container = modelContainer else {
            throw MLXModelError.modelNotLoaded
        }

        isGenerating = true
        outputText = ""

        let result = try await container.perform { (model, tokenizer) in
            let tokens = tokenizer.encode(text: prompt)
            let inputArray = MLXArray(tokens).expandedDimensions(axis: 0)

            var generatedTokens: [Int] = []
            var currentInput = inputArray

            for _ in 0..<maxTokens {
                let logits = model(currentInput)
                let lastLogits = logits[0..., -1, 0...]
                let nextToken = lastLogits.argMax(axis: -1).item(Int.self)

                if tokenizer.isSpecialToken(id: nextToken) { break }

                generatedTokens.append(nextToken)
                currentInput = MLXArray([nextToken]).expandedDimensions(axis: 0)
            }

            return tokenizer.decode(tokens: generatedTokens)
        }

        outputText = result
        isGenerating = false
        return result
    }
}

enum MLXModelError: LocalizedError {
    case modelNotLoaded

    var errorDescription: String? {
        switch self {
        case .modelNotLoaded:
            return "Model has not been loaded. Call loadModel() first."
        }
    }
}
```

### Streaming Generation with MLX

```swift
import MLX
import MLXLLM
import MLXLMCommon

@available(iOS 17.0, *)
@Observable
@MainActor
final class MLXStreamingModel {
    var generatedText = ""
    var isGenerating = false
    var tokensPerSecond: Double = 0

    private var modelContainer: ModelContainer?

    func loadModel(configuration: ModelConfiguration) async throws {
        self.modelContainer = try await LLMModelFactory.shared.create(configuration: configuration)
    }

    func streamGenerate(prompt: String, maxTokens: Int = 512) async throws {
        guard let container = modelContainer else {
            throw MLXModelError.modelNotLoaded
        }

        isGenerating = true
        generatedText = ""

        let startTime = Date()
        var tokenCount = 0

        let result = try await container.perform { (model, tokenizer) in
            let promptTokens = tokenizer.encode(text: prompt)

            return try MLXLMCommon.generate(
                input: .init(text: .init(tokens: MLXArray(promptTokens))),
                parameters: .init(temperature: 0.7, topP: 0.9),
                model: model,
                tokenizer: tokenizer,
                extraEOSTokens: nil
            ) { token in
                tokenCount += 1

                let elapsed = Date().timeIntervalSince(startTime)
                if elapsed > 0 {
                    Task { @MainActor in
                        self.tokensPerSecond = Double(tokenCount) / elapsed
                    }
                }

                if tokenCount >= maxTokens {
                    return .stop
                }
                return .more
            }
        }

        generatedText = result.output
        isGenerating = false
    }
}
```

---

## 7. Performance Considerations

### Memory Management

```swift
import Foundation

struct AIPerformanceGuide {
    // Memory thresholds for on-device models
    static let maxRecommendedMemoryGB: Double = {
        let totalMemory = ProcessInfo.processInfo.physicalMemory
        let totalGB = Double(totalMemory) / 1_073_741_824
        // Use at most 50% of device RAM for model inference
        return totalGB * 0.5
    }()

    // Model size guidelines
    // iPhone 15 Pro (8GB RAM): up to 4GB models (4-bit quantized 7B)
    // iPhone 15 (6GB RAM): up to 3GB models (4-bit quantized 3B)
    // iPad Pro M4 (16GB RAM): up to 8GB models (4-bit quantized 13B)

    static func estimateModelMemory(parameterCount: Int, bitsPerWeight: Int) -> Double {
        // Rough estimate: parameters * bits / 8 = bytes, plus ~20% overhead
        let baseBytes = Double(parameterCount) * Double(bitsPerWeight) / 8.0
        return baseBytes * 1.2 / 1_073_741_824  // in GB
    }
}
```

### Thermal Management

```swift
import Foundation

@Observable
final class ThermalMonitor {
    var thermalState: ProcessInfo.ThermalState = .nominal
    var shouldThrottleInference: Bool { thermalState == .serious || thermalState == .critical }

    init() {
        NotificationCenter.default.addObserver(
            forName: ProcessInfo.thermalStateDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.thermalState = ProcessInfo.processInfo.thermalState
        }
    }

    var stateDescription: String {
        switch thermalState {
        case .nominal:  return "Normal -- full inference speed"
        case .fair:     return "Warm -- consider reducing batch size"
        case .serious:  return "Hot -- throttle inference, reduce token count"
        case .critical: return "Critical -- pause inference, let device cool"
        @unknown default: return "Unknown"
        }
    }
}
```

---

## 8. Apple Intelligence Integration Points

Apple Intelligence features that apps can integrate with (iOS 18+):

```swift
import SwiftUI

// Writing Tools integration -- automatic for any TextEditor/TextField
struct WritingToolsView: View {
    @State private var text = "Enter your text here and use Writing Tools to refine it."

    var body: some View {
        TextEditor(text: $text)
            .padding()
            // Writing Tools (Proofread, Rewrite, Summarize) appear automatically
            // in the text selection menu on iOS 18+ with Apple Intelligence
    }
}

// Genmoji -- users can create custom emoji in any text field
// No additional code needed; it is a system-level feature on iOS 18+

// Image Playground -- available as a system framework
import ImagePlayground

@available(iOS 18.0, *)
struct ImagePlaygroundExample: View {
    @State private var showPlayground = false
    @State private var generatedImageURL: URL?

    var body: some View {
        VStack {
            if let url = generatedImageURL {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    ProgressView()
                }
            }

            Button("Create with Image Playground") {
                showPlayground = true
            }
            .imagePlaygroundSheet(
                isPresented: $showPlayground,
                concepts: [.text("A serene mountain landscape at sunset")],
                onCompletion: { url in
                    generatedImageURL = url
                }
            )
        }
    }
}
```

### Siri and App Intents Integration

```swift
import AppIntents

struct AskAssistantIntent: AppIntent {
    static var title: LocalizedStringResource = "Ask Assistant"
    static var description: IntentDescription = "Ask the on-device AI assistant a question"

    @Parameter(title: "Question")
    var question: String

    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        // Use Foundation Models or your own on-device model here
        // This makes your AI features available through Siri and Shortcuts
        let answer = "Processed: \(question)"
        return .result(value: answer)
    }
}
```

---

## 9. Model Format Support

| Format | Framework | Use Case |
|--------|-----------|----------|
| `.mlmodel` / `.mlpackage` | CoreML | Vision, NLP, tabular models |
| `.mlmodelc` | CoreML | Pre-compiled CoreML models |
| Foundation Models | FoundationModels | Apple's built-in LLM (iOS 26+) |
| MLX weights | MLX Swift | Custom LLMs on Apple Silicon |
| GGUF | llama.cpp / MLX | Quantized LLMs, community models |
| safetensors | MLX Swift | Hugging Face model weights |

---

## 10. Choosing the Right Approach

| Need | Recommended Approach |
|------|---------------------|
| Text generation, chat, summarization | Foundation Models (iOS 26+) or MLX Swift |
| Image classification, object detection | CoreML + Vision |
| Text classification, NER | NaturalLanguage framework or CoreML |
| Speech to text | Speech framework |
| Custom fine-tuned LLM | MLX Swift with safetensors/GGUF |
| Writing assistance | Apple Intelligence Writing Tools (iOS 18+) |
| Image generation | Image Playground (iOS 18+) |
| Structured data extraction from text | Foundation Models with @Generable |
| Offline-first AI features | Foundation Models or CoreML (both fully on-device) |

---

## Quick Reference

| Framework / Class | Platform | Purpose |
|-------------------|----------|---------|
| `FoundationModels` | iOS 26+, macOS 26+ | Apple's on-device LLM |
| `LanguageModelSession` | iOS 26+ | Manage conversations with the on-device LLM |
| `SystemLanguageModel` | iOS 26+ | Check model availability |
| `@Generable` | iOS 26+ | Constrain LLM output to a Swift type |
| `@Tool` | iOS 26+ | Define callable tools for the LLM |
| `MLX` | iOS 17+, macOS 14+ | Array computation framework for Apple Silicon |
| `MLXLLM` | iOS 17+, macOS 14+ | Run LLMs with MLX Swift |
| `ImagePlayground` | iOS 18+ | System image generation UI |
| `CoreML` | iOS 11+ | General ML model inference |
| `NaturalLanguage` | iOS 12+ | Text processing and NLP |
| `Speech` | iOS 10+ | Speech recognition |
