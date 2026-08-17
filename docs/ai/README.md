# AI and Apple Intelligence

## Context

Use this hub when a feature involves Apple Intelligence, Foundation Models, Core AI, Core ML, App Intents, Visual Intelligence, private RAG, evaluations, machine-learning-powered APIs, or AI privacy/security. Route to `machine-learning-brain.md` first for Apple AI & Machine Learning resource routing, then to the detailed framework guides for implementation.

## Decision Matrix

| Need | Prefer | Guide |
|---|---|---|
| Text generation, summarization, structured output, tool calling | Foundation Models | `../frameworks/foundation-models.md` |
| Custom `.aimodel` / `.aimodelc` neural workload | Core AI | `../frameworks/core-ai.md` |
| Existing Core ML model or classic ML pipeline | Core ML | `../frameworks/ml/coreml.md` |
| Siri, Shortcuts, Spotlight action exposure | App Intents | `../frameworks/app-intents.md` |
| App schemas, semantic indexing, View Annotations | App Intents intelligence | `../frameworks/app-intents-intelligence.md` |
| App-local private retrieval | Core Spotlight RAG | `../frameworks/core-spotlight-rag.md` |
| OCR, object detection, image analysis | Vision | `../frameworks/ml/vision.md` |
| Language ID, tokenization, tags, entities | Natural Language | `../frameworks/ml/natural-language.md` |
| Speech-to-text or transcription | Speech | `../frameworks/ml/speech.md` |
| Non-speech sound classification | Sound Analysis | `../frameworks/ml/sound-analysis.md` |
| In-app text translation | Translation | `../frameworks/ml/translation.md` |
| System scanning or Live Text-style UI | VisionKit | `../frameworks/visionkit.md` |
| Quality gates for prompts and tools | Evaluations | `../testing/evaluations.md` |

## Pattern

Design every AI feature as additive:

```swift
enum IntelligenceState: Equatable {
    case unavailable(reason: String)
    case ready
    case generating
    case failed(message: String)
}
```

The UI renders a useful non-AI path first, then upgrades when availability and user consent allow it. Never make a core workflow depend on a model being present.

## Availability Rules

- Compile-time availability only proves symbols exist.
- Runtime availability decides whether the model is usable on this device, language, account, and current settings.
- Guard on the version where the symbol was introduced, not the newest SDK.
- Provide a fallback for unsupported OS versions, unavailable Apple Intelligence, parental/device restrictions, and network loss when using Private Cloud Compute or other providers.

## Privacy and Security

- Do not log prompts, tool arguments, transcripts, extracted text, or retrieval context by default.
- Treat model/tool output as untrusted input until validated.
- Bound every tool call and give `.required` tool calling an exit.
- Keep RAG indexes local unless sync is explicit and documented.
- Label generated content and let the user review before committing irreversible actions.

## Testing and Evaluation

Unit tests use protocols and deterministic fakes. Evaluations test quality over datasets:

```swift
protocol RecipeGenerating {
    func generateRecipe(from ingredients: [String]) async throws -> RecipeDraft
}
```

Assert shape, constraints, and safety behavior in unit tests. Use `../testing/evaluations.md` for prompt quality, tool-call behavior, regression gates, and model-as-judge workflows.

## Common Mistakes

- Prompting for JSON instead of using `@Generable` and `@Guide`.
- Rendering an AI button after only an `#available` check.
- Reusing one language-model session across unrelated tasks.
- Logging transcripts in analytics or crash reports.
- Treating App Intents as a model feature instead of the deterministic action surface.
- Shipping a prompt improvement without an evaluation dataset.

## Production Checklist

- [ ] Non-AI fallback exists and is tested.
- [ ] Compile-time and runtime availability are both checked.
- [ ] Privacy copy matches the actual execution path.
- [ ] Tool calls are bounded, cancellable, and validated.
- [ ] Prompts and retrieval context are not logged.
- [ ] Evaluations cover the release-critical outputs.
- [ ] App Intents are used for deterministic actions.
- [ ] Generated content is reviewable before destructive effects.
