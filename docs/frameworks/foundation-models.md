# Foundation Models

**Load this when:** adding on-device or Private Cloud Compute language-model
features, generating structured Swift data from a prompt, building tool-calling
or agentic behavior, or integrating a third-party LLM through Apple's model
abstraction.

Foundation Models gives you a Swift API over Apple's language models — on-device
via `SystemLanguageModel`, server-side via `PrivateCloudComputeLanguageModel`,
and any other model through the open `LanguageModel` protocol.

`docs/frameworks/ml/on-device-ai.md` covers the wider on-device AI landscape
(MLX Swift, Core ML). This document is the Foundation Models reference.

**Availability:** the framework and `SystemLanguageModel` are iOS 26+/macOS 26+.
`PrivateCloudComputeLanguageModel`, Dynamic Profiles, image attachments, and the
open `LanguageModel` protocol are **iOS 27+**. Guard accordingly — see
*Availability* below.

---

## 1. Basic session

```swift
import FoundationModels

@available(iOS 26.0, macOS 26.0, *)
@MainActor
@Observable
final class SummarizerModel {
    private(set) var summary: String = ""
    private(set) var isResponding = false

    private let session: LanguageModelSession

    init() {
        session = LanguageModelSession(
            instructions: "You summarize articles in two sentences. Be concrete."
        )
    }

    func summarize(_ article: String) async {
        isResponding = true
        defer { isResponding = false }

        do {
            let response = try await session.respond(to: article)
            summary = response.content
        } catch is CancellationError {
            return
        } catch {
            summary = ""
            // surface the error — see Error handling below
        }
    }
}
```

`LanguageModelSession` is **stateful**: every prompt and response is appended to
its `transcript`, and that transcript is what the model sees on the next turn.
One session per conversation; do not reuse one session for unrelated tasks.

### Check availability before you show UI

The model is not present on every device or in every region. Branch on it rather
than letting the call fail:

```swift
switch SystemLanguageModel.default.availability {
case .available:
    ShowFeature()
case .unavailable(let reason):
    // .deviceNotEligible, .appleIntelligenceNotEnabled, .modelNotReady
    FeatureUnavailableView(reason: reason)
}
```

Never ship an entry point that only fails at tap time. This is the
`@available` check's runtime counterpart, and both are required.

---

## 2. Structured output with `@Generable`

Do not ask for JSON and parse it yourself. `@Generable` constrains decoding so
the model returns a real Swift value.

```swift
@available(iOS 26.0, macOS 26.0, *)
@Generable
struct Recipe {
    @Guide(description: "Dish name, title case, no punctuation")
    let name: String

    @Guide(description: "Ingredients with quantities", .count(3...12))
    let ingredients: [String]

    @Guide(description: "Total minutes, cooking plus prep", .range(5...240))
    let minutes: Int

    @Guide(description: "Difficulty for a home cook")
    let difficulty: Difficulty

    @Generable
    enum Difficulty: String {
        case easy, medium, hard
    }
}

let response = try await session.respond(
    to: "A weeknight pasta using pantry staples.",
    generating: Recipe.self
)
let recipe: Recipe = response.content   // typed, no JSON parsing
```

`@Guide` is what makes the output usable. A bare `let minutes: Int` invites any
integer; `.range(5...240)` makes an out-of-range answer unrepresentable.

### Streaming partial results

`@Generable` synthesizes a `PartiallyGenerated` type whose properties fill in as
the model produces them — the right way to avoid a spinner on a long generation.

```swift
@MainActor
@Observable
final class RecipeModel {
    private(set) var partial: Recipe.PartiallyGenerated?

    func generate(_ prompt: String) async throws {
        let stream = session.streamResponse(to: prompt, generating: Recipe.self)
        for try await partial in stream {
            self.partial = partial       // main-actor write, view updates per chunk
        }
    }
}

// In the view — render what exists, leave the rest as placeholders.
if let name = model.partial?.name {
    Text(name).font(.headline)
} else {
    Text("Generating…").redacted(reason: .placeholder)
}
```

---

## 3. Tool calling

A `Tool` lets the model call your code. Use it for anything the model cannot
know: live data, the user's own content, or an action with a side effect.

```swift
@available(iOS 26.0, macOS 26.0, *)
struct FindRecipesTool: Tool {
    let name = "findRecipes"
    let description = "Search the user's saved recipes by ingredient."

    // Non-Sendable dependencies must be captured safely — this store is an actor.
    let store: RecipeStore

    @Generable
    struct Arguments {
        @Guide(description: "Ingredient to search for, singular, lowercase")
        let ingredient: String
    }

    func call(arguments: Arguments) async throws -> String {
        let matches = try await store.search(ingredient: arguments.ingredient)
        guard !matches.isEmpty else { return "No saved recipes with that ingredient." }
        return matches.map(\.name).joined(separator: ", ")
    }
}

let session = LanguageModelSession(
    tools: [FindRecipesTool(store: store)],
    instructions: "Help the user cook using recipes they have saved."
)
```

Tool rules that matter in practice:

- **`description` is the routing signal.** The model decides whether to call your
  tool by reading it. Vague description, tool never fires.
- **Tools must be `Sendable`** and are called from a concurrent context. Hold
  dependencies as actors or immutable values — see *Concurrency* below.
- **Return a short, factual string.** Not JSON, not prose. The model reads it.
- **Throwing ends the tool call.** Handle expected failures by returning a
  sentence the model can use ("no results"), and reserve `throw` for real errors.

### Built-in system tools (iOS 27+)

Vision-backed tools ship with the framework — do not reimplement them:

| Tool | Does |
|------|------|
| `OCRTool` | Text extraction from an image |
| `BarcodeReaderTool` | Barcode and QR reading |
| Spotlight search tool | Local retrieval (RAG) over the user's indexed content |

### Controlling when tools are used

```swift
let response = try await session.respond(
    to: "Write out the instructions for folding a paper crane.",
    options: GenerationOptions(toolCallingMode: .required)   // .allowed | .disallowed | .required
)
```

`.required` forces a tool call — and can loop forever if nothing ends it. Always
give it an exit: flip to `.disallowed` once the tool has run, or have the tool
throw `CancellationError` to break the loop.

---

## 4. Multimodal prompts (iOS 27+)

Images attach directly to a prompt. Accepted: `UIImage`, `NSImage`, `CGImage`,
Core Image images, `CVPixelBuffer`, and file URLs.

```swift
@available(iOS 27.0, *)
func identify(_ image: UIImage) async throws -> String {
    let response = try await session.respond {
        "What animal is this? Answer with the species only."
        Attachment(image)
    }
    return response.content
}
```

Combine with `@Generable` when you need structure rather than a sentence.

---

## 5. Model selection

| Model | Where it runs | Use for |
|-------|---------------|---------|
| `SystemLanguageModel` | On device | Default. Private, offline, free, low latency |
| `PrivateCloudComputeLanguageModel` (iOS 27+) | Private Cloud Compute | Larger context (32K), harder reasoning |
| `CoreAILanguageModel`, `MLXLanguageModel` | On device | Open-source conformances for custom weights |
| Third-party packages | Varies | Anthropic and Google publish conforming Swift packages |

```swift
@available(iOS 27.0, *)
let session = LanguageModelSession(
    model: PrivateCloudComputeLanguageModel(),
    instructions: "You are a careful technical reviewer."
)

let response = try await session.respond(
    to: prompt,
    contextOptions: ContextOptions(reasoningLevel: .deep)   // .light | .deep
)
```

**Default to on-device.** Reach for Private Cloud Compute only when the task
genuinely needs the bigger context or deeper reasoning — it costs latency and
requires a network. PCC retains no prompt data; see
`docs/frameworks/apple-intelligence.md` for the privacy model.

### Bringing your own model (iOS 27+)

The abstraction is open. A custom provider conforms to two protocols:

```swift
public protocol LanguageModel: Sendable {
    var capabilities: LanguageModelCapabilities { get }
    var executorConfiguration: Executor.Configuration { get }
}

public protocol LanguageModelExecutor: Sendable {
    init(configuration: Configuration) throws
    func prewarm(model: Model, transcript: Transcript)
    func respond(
        to request: LanguageModelExecutorGenerationRequest,
        model: Model,
        streamingInto channel: LanguageModelExecutorGenerationChannel
    ) async throws
}
```

```swift
@available(iOS 27.0, *)
struct MyLanguageModel: LanguageModel {
    typealias Executor = MyLanguageModelExecutor

    var capabilities: LanguageModelCapabilities {
        LanguageModelCapabilities(capabilities: [.toolCalling, .guidedGeneration, .reasoning])
    }

    var executorConfiguration: Executor.Configuration {
        Executor.Configuration(endpoint: endpoint, apiKeyIdentifier: keyID)
    }
}
```

Two things to get right:

- **`Configuration` is the cache key.** The framework caches executors by its
  hash, which is what preserves the KV cache across calls. Do not put per-request
  values in it.
- **Always implement streaming.** The one-shot API collects deltas internally, so
  a streaming `respond` gives you both for free.

Declare only capabilities you actually support — claiming `.guidedGeneration`
you cannot honor produces malformed output rather than a clean error.

---

## 6. Dynamic Profiles (iOS 27+)

A `DynamicProfile` swaps instructions, tools, and even the model **within one
session**, based on your app's state. This is the primitive for agentic features.

```swift
@available(iOS 27.0, *)
struct CookingProfile: LanguageModelSession.DynamicProfile {
    let state: CookingState

    var body: some DynamicProfile {
        switch state.mode {
        case .browsing:
            Profile {
                Instructions("Help the user pick a recipe. Be brief.")
                FindRecipesTool(store: state.store)
            }
            .model(state.systemModel)

        case .cooking:
            Profile {
                Instructions("Guide the user step by step. One step at a time.")
                TimerTool()
            }
            .model(state.pccModel)
            .reasoningLevel(.deep)
        }
    }
}

let session = LanguageModelSession(profile: CookingProfile(state: state))
```

The transcript is preserved across mode switches, so the model keeps context
while its instructions and tools change underneath it.

### Two orchestration patterns

**Baton pass** — profiles share the full transcript; a tool flips the mode:

```swift
Profile {
    BrainstormInstructions()
    HandoffTool()
}
.onToolCall { state.mode = .planning }
```

**Phone a friend** — a tool spawns a short-lived child session with its own
isolated transcript, so a subtask cannot pollute the main conversation:

```swift
struct SummarizeTool: Tool {
    let name = "summarize"
    let description = "Summarize the discussion so far into one paragraph."

    func call(arguments: Arguments) async throws -> String {
        let child = LanguageModelSession(profile: SummaryProfile())
        return try await child.respond(to: arguments.text).content
    }
}
```

This mirrors the subagent model in `docs/orchestration/subagents.md`: isolated
context for the subtask, one result handed back to the caller.

---

## 7. Context, tokens, and cost

Context is finite. Long conversations will hit the window.

```swift
let model = SystemLanguageModel()
print(model.contextSize)                                  // e.g. 8192
let count = try await model.tokenCount(for: prompt)       // iOS 26.4+

let response = try await session.respond(to: prompt)
print(response.usage.input.totalTokenCount)
print(response.usage.input.cachedTokenCount)
print(response.usage.output.totalTokenCount)
```

When a transcript grows past the window, transform it rather than letting the
call fail — a rolling window, or dropping completed tool calls:

```swift
Profile { CoachInstructions() }
    .historyTransform { history in
        // Keep the most recent exchanges; drop resolved tool traffic.
        history.suffix(40)
    }
```

**Appending preserves the KV cache; rewriting history invalidates it** and adds
latency. Prefer appending. Measure before you optimize — Xcode's Foundation
Models instrument shows cache behavior directly.

---

## 8. Concurrency

Foundation Models is `async` throughout and interacts with the isolation rules in
`docs/swift/swift-concurrency.md`.

```swift
// RIGHT — @MainActor model, session owned by it, tool dependencies are actors.
@available(iOS 26.0, *)
@MainActor
@Observable
final class ChatModel {
    private(set) var messages: [Message] = []
    private let session: LanguageModelSession
    private var task: Task<Void, Never>?

    func send(_ text: String) async {
        task?.cancel()                       // supersede the in-flight response
        let task = Task { await stream(text) }
        self.task = task
        await task.value
    }

    private func stream(_ text: String) async {
        do {
            for try await partial in session.streamResponse(to: text) {
                try Task.checkCancellation()
                messages[messages.count - 1].body = partial
            }
        } catch is CancellationError {
            return
        } catch {
            // surface it
        }
    }
}
```

Rules:

- `LanguageModelSession` is **not** re-entrant in a useful way. Check
  `session.isResponding`, or hold a single in-flight `Task`, before sending
  another prompt. Overlapping calls interleave into one transcript.
- **Tools run off the main actor.** Their dependencies must be `Sendable` —
  use an `actor` store rather than `@unchecked Sendable`.
- Streaming loops must honour cancellation, since `.task` cancels on disappear.
- Never hold a `LanguageModelSession` in a nonisolated `@Observable` — same
  data-race rule as any other UI-facing model.

---

## 9. Error handling

```swift
do {
    let response = try await session.respond(to: prompt)
    handle(response.content)
} catch is CancellationError {
    return                                        // user moved on — not a failure
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .exceededContextWindowSize:
        await compactTranscript()                 // then retry
    case .guardrailViolation:
        message = String(localized: "Let's try a different question.")
    case .unsupportedLanguageOrLocale:
        message = String(localized: "Not available in this language yet.")
    default:
        message = String(localized: "Something went wrong. Try again.")
    }
} catch {
    message = String(localized: "Something went wrong. Try again.")
}
```

Guardrail violations are **expected**, not exceptional — the model declining is
normal operation. Handle it as a product state with a real message, never as a
crash or a silent empty result.

---

## 10. Availability

Two versions are in play. Do not collapse them.

```swift
// Baseline framework + on-device model.
@available(iOS 26.0, macOS 26.0, *)

// PCC model, Dynamic Profiles, image attachments, custom LanguageModel providers.
@available(iOS 27.0, *)
```

```swift
func makeSession() -> LanguageModelSession? {
    if #available(iOS 27.0, *) {
        return LanguageModelSession(profile: CookingProfile(state: state))
    } else if #available(iOS 26.0, *) {
        return LanguageModelSession(instructions: fallbackInstructions)
    } else {
        return nil          // feature hidden entirely below iOS 26
    }
}
```

An app supporting iOS 17+ (this skill's baseline) must treat every Foundation
Models feature as additive. The non-AI path is the product; the AI path is an
enhancement.

---

## 11. Testing and evaluation

Model output is non-deterministic, so assert on **shape and constraints**, not
exact strings.

```swift
@Test("recipe generation respects guides")
func recipeConstraints() async throws {
    let response = try await session.respond(to: "A quick pasta.", generating: Recipe.self)
    let recipe = response.content

    #expect((5...240).contains(recipe.minutes))
    #expect((3...12).contains(recipe.ingredients.count))
    #expect(!recipe.name.isEmpty)
}
```

For UI and unit tests, put the model behind a protocol like every other
dependency (`docs/testing/mocking-strategy.md`), so tests do not invoke a real
model:

```swift
protocol RecipeGenerating: Sendable {
    func generate(from prompt: String) async throws -> Recipe
}

struct StubRecipeGenerator: RecipeGenerating {
    var result: Recipe = .sample
    func generate(from prompt: String) async throws -> Recipe { result }
}
```

For measuring output *quality* across prompt changes, use the **Evaluations
framework** rather than eyeballing — it quantifies whether a prompt tweak
actually helped.

---

## Anti-Patterns

```swift
// 1. Asking for JSON and parsing it by hand.
let json = try await session.respond(to: "Return JSON with name and minutes")
let recipe = try JSONDecoder().decode(Recipe.self, from: Data(json.content.utf8))
// Use @Generable. The model is not a reliable JSON emitter.

// 2. A @Generable type with no @Guide.
@Generable struct Recipe { let minutes: Int }        // accepts 0, accepts 99999
@Generable struct Recipe {
    @Guide(description: "Total minutes", .range(5...240)) let minutes: Int
}

// 3. Shipping the feature without an availability check.
LanguageModelSession(...)                            // fails on ineligible devices
// Check SystemLanguageModel.default.availability first, and gate the entry point.

// 4. One session reused for unrelated tasks.
// The transcript is shared — earlier turns leak into later answers.
// One session per conversation.

// 5. Overlapping prompts on one session.
Button("Send") { Task { await model.send(text) } }   // tap twice, transcripts interleave
// Guard with session.isResponding or a single in-flight Task.

// 6. Treating a guardrail violation as a crash.
let response = try! await session.respond(to: userText)
// Declining is normal. Handle it as a product state.

// 7. A tool whose description does not say when to use it.
let description = "Recipe tool"                      // never gets called
let description = "Search the user's saved recipes by ingredient."

// 8. Non-Sendable state captured in a Tool.
struct MyTool: Tool { let cache: NSMutableDictionary }  // data race
struct MyTool: Tool { let cache: CacheActor }

// 9. Private Cloud Compute by default.
LanguageModelSession(model: PrivateCloudComputeLanguageModel())
// Costs latency and needs a network. Default on-device; escalate deliberately.

// 10. .required tool calling with no exit condition.
// Loops until the context window fills. Flip to .disallowed after the call.

// 11. Blocking the UI on a long generation.
// Stream with PartiallyGenerated and render as it arrives.

// 12. Asserting exact model output in a test.
#expect(recipe.name == "Garlic Pasta")               // flaky by construction
#expect(!recipe.name.isEmpty)                        // assert shape and constraints
```

---

## Checklist

- [ ] `@available` guard matches the feature: iOS 26 for the baseline, iOS 27 for
      PCC, Dynamic Profiles, attachments, and custom providers.
- [ ] `SystemLanguageModel.default.availability` checked before the entry point
      is shown, with a real unavailable state.
- [ ] Structured output uses `@Generable` with `@Guide` constraints — never
      hand-parsed JSON.
- [ ] Long generations stream via `PartiallyGenerated`.
- [ ] Every `Tool` has a description saying **when** to use it, and is `Sendable`.
- [ ] `.required` tool calling has an exit condition.
- [ ] One session per conversation; overlapping prompts are guarded.
- [ ] Guardrail violations and context-window overflow are handled as product
      states with real messages.
- [ ] Cancellation is honoured in streaming loops.
- [ ] On-device is the default; PCC is a deliberate escalation.
- [ ] Tests assert shape and constraints, and unit tests use a protocol double.
- [ ] The feature is additive — the app still works with no model available.
