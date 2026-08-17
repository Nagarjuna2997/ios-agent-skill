# AI And Machine Learning Brain

## Context

Load this first when a feature mentions AI, machine learning, Apple Intelligence, generative AI, Core AI, Foundation Models, Core ML, Vision, Natural Language, Speech, Sound Analysis, Translation, MLX, model conversion, model debugging, AI HIG, model evaluation, Apple machine-learning research, or "Apple AI resources."

Apple's current AI and Machine Learning resources group the area into:

- Core AI for custom on-device models and generative workloads.
- Foundation Models for Swift access to Apple Foundation Models, Private Cloud Compute, and model-provider abstractions.
- Core ML for traditional model integration, prediction, update, and conversion.
- Machine-learning-powered APIs: Vision, Natural Language, Speech, Sound Analysis, and Translation.
- Design resources: Human Interface Guidelines for generative AI and machine-learning experiences.
- Learning resources: videos, sample code, documentation, Apple research, developer forums, Feedback Assistant, and support.

This file is the routing brain. It chooses the right Apple technology before code is written.

## Canonical Apple sources

- AI and Machine Learning overview: <https://developer.apple.com/machine-learning/>
- AI and Machine Learning resources: <https://developer.apple.com/machine-learning/resources/>
- Core AI: <https://developer.apple.com/documentation/coreai>
- Foundation Models: <https://developer.apple.com/documentation/foundationmodels>
- Core ML: <https://developer.apple.com/documentation/coreml>
- Vision: <https://developer.apple.com/documentation/vision>
- Natural Language: <https://developer.apple.com/documentation/naturallanguage>
- Speech: <https://developer.apple.com/documentation/speech>
- Sound Analysis: <https://developer.apple.com/documentation/soundanalysis>
- Translation: <https://developer.apple.com/documentation/translation>
- Generative AI HIG: <https://developer.apple.com/design/human-interface-guidelines/generative-ai>
- Apple Machine Learning Research: <https://machinelearning.apple.com/>

## Load order

For broad AI work:

1. `docs/ai/machine-learning-brain.md`
2. `docs/ai/README.md`
3. The selected framework guide:
   - `docs/frameworks/core-ai.md`
   - `docs/frameworks/foundation-models.md`
   - `docs/frameworks/ml/coreml.md`
   - `docs/frameworks/ml/vision.md`
   - `docs/frameworks/ml/natural-language.md`
   - `docs/frameworks/ml/speech.md`
   - `docs/frameworks/ml/sound-analysis.md`
   - `docs/frameworks/ml/translation.md`
4. `docs/testing/evaluations.md` for prompt/model quality gates.
5. `docs/security/README.md` when prompts, transcripts, models, or user data are involved.
6. `docs/performance/README.md` when latency, memory, battery, thermal state, GPU, Neural Engine, or MetricKit matters.

For narrow work, load this file plus the matching framework guide.

## Decision matrix

| User need | Prefer | Why |
|---|---|---|
| Generate, summarize, classify, extract structured text | Foundation Models | Native Swift LLM API with structured output, tool calling, and on-device/PCC routes |
| Run a custom full-scale LLM or generative model locally | Core AI | Designed for `.aimodel`, specialization, Apple silicon, Core AI Debugger, and large neural workloads |
| Ship a classical or existing `.mlmodel` pipeline | Core ML | Mature unified representation, conversion tools, Xcode model preview, CPU/GPU/Neural Engine scheduling |
| Image/video OCR, object detection, segmentation, barcode, visual requests | Vision | Task-specific image/video analysis APIs |
| System document scanning or Live Text-style UI | VisionKit | Apple-provided camera/document UI and interaction patterns |
| Tokenization, language ID, parts of speech, named entities, embeddings | Natural Language | Text-analysis framework, not a generative model |
| Speech-to-text, long-form transcription, audio speech modules | Speech | Speech recognition and newer analyzer/transcriber workflows |
| Non-speech sound classification | Sound Analysis | Built-in and custom Core ML sound classifiers over files or streams |
| In-app text translation | Translation | System translation UI and custom `TranslationSession` workflows |
| User action exposure to Siri/Shortcuts/Spotlight/Apple Intelligence | App Intents | Deterministic action surface, not a prompt |
| Private app-local retrieval for an LLM | Core Spotlight RAG | Local indexing plus Foundation Models tool routing |
| Model experimentation and research on Apple silicon | MLX | Research/training/fine-tuning workflows, especially on Mac |
| GPU kernels, neural rendering, or shader-level ML | Metal | Low-level GPU control and Metal 4 features |

## Core AI brain

Use Core AI when the app owns a custom model and needs to deploy it on Apple silicon, especially full-scale LLMs and other generative models. Core AI is the route for `.aimodel` and `.aimodelc`, model specialization, caching, Core AI Debugger, Core AI Instruments, and PyTorch-to-production workflows.

Rules:

- Start from model ownership: source model, license, weights, conversion path, optimization path, and deployment size.
- Convert and optimize before app integration.
- Inspect function names, input names, output names, shapes, precision, metadata, and model operations in Xcode/Core AI Debugger.
- Specialize and cache intentionally; first-run specialization is a product event, not an implementation detail.
- Use AOT compilation for large models when first-run compile time is not acceptable.
- Profile before forcing compute choices.
- Keep model downloads signed, versioned, checksummed, and rolled out safely.

Do not use Core AI just because a feature says "AI." Use it when there is a model asset and on-device inference requirement.

## Foundation Models brain

Use Foundation Models when the app needs language generation, summarization, extraction, classification, structured Swift values, tool calling, multimodal prompts, Dynamic Profiles, or provider abstraction through `LanguageModel`.

Rules:

- Check compile-time availability and runtime model availability.
- Use `@Generable` and `@Guide` for structured output instead of asking for JSON.
- One session per task/conversation; do not reuse one transcript across unrelated work.
- Treat tool calls as untrusted, bounded, cancellable inputs.
- Use App Intents for deterministic system/user actions.
- Use Evaluations before shipping prompt or tool behavior changes.
- Never log prompts, transcripts, extracted private data, or tool arguments by default.

Foundation Models is the first choice for Apple-platform LLM features that do not require shipping your own model.

## Core ML brain

Use Core ML when the app integrates `.mlmodel`, `.mlpackage`, `.mlmodelc`, Create ML output, converted TensorFlow/PyTorch/sklearn/XGBoost-style models, tabular models, image classifiers, custom Vision models, or update/fine-tuning workflows that Core ML supports.

Rules:

- Prefer Xcode's generated model wrapper for simple bundled models.
- Use manual `MLModel` loading for downloaded, compiled, or configurable models.
- Keep model configuration explicit: compute units, low-precision options, and prediction options.
- Move heavy inference off the main actor.
- Validate input shapes, feature names, normalization, color space, and output labels.
- Use Vision wrappers for image preprocessing when possible.
- Version downloaded models and keep rollback paths.

Core ML is not the default route for full-scale LLM deployment; Apple points that work to Core AI.

## Machine-learning-powered APIs brain

These frameworks are usually better than a custom model because Apple already provides optimized task-specific models.

Vision:

- Use for image/video analysis, OCR, barcode, detection, tracking, segmentation, and Vision plus Core ML pipelines.
- Verify orientation, crop/scale options, camera permissions, performance, and privacy.

Natural Language:

- Use for language identification, tokenization, tagging, named entities, sentiment-style analysis where supported, and embeddings.
- Verify locale behavior and multilingual text.

Speech:

- Use for speech recognition and transcription.
- Check authorization, recognizer availability, locale support, background limits, and device/server behavior.
- Use modern analyzer/transcriber APIs when the target OS supports them.

Sound Analysis:

- Use for non-speech audio classification from files or streams.
- Keep observers strongly referenced.
- Use built-in classifiers for general sounds and custom Core ML models for product-specific categories.

Translation:

- Use for in-app text translation.
- Choose system UI for simple translation and `TranslationSession` for custom flows.
- Check `LanguageAvailability` before showing controls.
- Plan for model download permission and offline availability.

## HIG and product brain

AI features must be useful, reviewable, and honest.

Rules:

- A non-AI path should exist for core workflows.
- Label generated or transformed content when user trust depends on it.
- Let users review AI output before destructive or irreversible actions.
- Explain what data is analyzed and where it runs.
- Do not overpromise accuracy, creativity, medical/legal/financial judgment, or personal certainty.
- Show progress, cancellation, and recovery.
- Prefer reflective prompts and constrained outputs over vague open-ended prompts.
- Use accessibility, localization, privacy, and safety review before release.

## Research and resources brain

Use Apple research, WWDC videos, sample code, and forums as learning/evidence sources, not as a substitute for API docs.

Rules:

- Use Apple documentation for API signatures and availability.
- Use videos for intent, architecture, design guidance, and newly introduced workflows.
- Use sample code to learn lifecycle and setup, then adapt to the local architecture.
- Use Feedback Assistant for suspected framework/tool bugs.
- Use Developer Forums for ambiguous behavior, but do not treat forum answers as canonical unless Apple staff confirms and docs align.
- Track research posts separately from shippable API promises.

## Privacy and security brain

AI data is sensitive by default.

Rules:

- Do not log prompts, transcripts, audio, images, OCR text, embeddings, model outputs, or retrieval context by default.
- Keep local indexes local unless sync is explicit.
- Treat generated output as untrusted input.
- Validate tool-call arguments and outputs.
- Sign and checksum downloaded model assets.
- Keep model licenses, attribution, and export constraints documented.
- Do not upload user data for training unless the product has explicit consent and policy coverage.
- Run privacy-manifest and App Review checks before release.

## Performance brain

AI features fail when they feel slow, heat the device, or eat memory.

Rules:

- Measure latency, memory, battery, thermal state, and cancellation.
- Warm up models only when it does not hurt launch or battery.
- Stream model output when users benefit from partial results.
- Downsample images and audio before analysis when possible.
- Batch work when it improves throughput, but keep UI responsive.
- Use Instruments, MetricKit, Xcode gauges, Core AI Debugger, Core AI Instruments, Foundation Models Instruments, and Metal/System Trace when relevant.

## Verification template

```text
Status: VERIFIED / INSPECTED / UNVERIFIED
Apple area: Core AI / Foundation Models / Core ML / Vision / Natural Language / Speech / Sound Analysis / Translation
Apple source: URL checked
Local guides loaded: docs/ai/... and docs/frameworks/...
Model/data path: bundled / downloaded / system model / local index / live audio / live camera / text
Privacy path: on-device / PCC / server / unknown
Evidence: build, tests, simulator/device run, Instruments, model debugger, sample output, evaluation result
Remaining risk: OS availability, hardware, entitlement, model download, locale, privacy, performance, App Review
```

## Anti-patterns

- Choosing a generative model for deterministic app actions.
- Building a custom model when Vision, Speech, Natural Language, Sound Analysis, or Translation already solves the task.
- Shipping a prompt-only parser instead of `@Generable` structured output.
- Logging transcripts or audio samples for debugging.
- Running heavy inference on the main actor.
- Treating one happy-path model response as an evaluation.
- Assuming all devices, regions, languages, and accounts have the same model availability.
- Shipping downloaded models without signatures, checksums, versions, and rollback.

