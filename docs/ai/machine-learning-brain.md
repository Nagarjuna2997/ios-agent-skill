# AI And Machine Learning Brain

## Context

Load this first when a feature mentions AI, machine learning, Apple Intelligence, generative AI, Core AI, Foundation Models, Core ML, Vision, Natural Language, Speech, Sound Analysis, Translation, MLX, model conversion, model debugging, AI HIG, model evaluation, Apple machine-learning research, or "Apple AI resources."

This file is the routing brain. It chooses the right Apple technology before code is written, and it should be useful without opening any external page.

## Internal memory contract

When an agent loads this file, it must remember these defaults:

- Apple AI work is on-device first unless the user explicitly asks for server AI or Private Cloud Compute is the selected Apple route.
- A task-specific Apple API beats a custom model when it solves the job: Vision for images, Natural Language for text analysis, Speech for spoken audio, Sound Analysis for non-speech audio, Translation for language translation.
- Foundation Models is for language-model behavior: generation, summarization, extraction, structured output, tool calling, multimodal reasoning, and provider abstraction.
- Core AI is for owned custom model assets, especially large neural/generative models brought from PyTorch-style workflows into Apple-silicon deployment.
- Core ML is for mature `.mlmodel` / `.mlpackage` / `.mlmodelc` pipelines, Create ML output, converted classical models, and task-specific model integration.
- App Intents is for deterministic actions. Do not ask a model to perform an action that should be a typed intent.
- Every AI feature needs fallback UI, availability checks, privacy review, cancellation, performance measurement, and quality evaluation.
- Never claim an AI feature is verified from one happy-path output. Verification needs tests, evals, device runs, profiler evidence, or a clear UNVERIFIED label.

## Apple AI landscape memory

The Apple AI and Machine Learning surface is grouped like this:

- Core AI for custom on-device models and generative workloads.
- Foundation Models for Swift access to Apple Foundation Models, Private Cloud Compute, and model-provider abstractions.
- Core ML for traditional model integration, prediction, update, and conversion.
- Machine-learning-powered APIs: Vision, Natural Language, Speech, Sound Analysis, and Translation.
- Design resources: Human Interface Guidelines for generative AI and machine-learning experiences.
- Learning resources: videos, sample code, documentation, Apple research, developer forums, Feedback Assistant, and support.

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

## First decision tree

Ask these questions in order:

1. Is the task an app action, shortcut, Siri command, Spotlight action, or user-controlled operation?
   Use App Intents first. Add Foundation Models only if language understanding or generation is needed around the action.

2. Is the task language generation, summarization, extraction, classification, tool calling, or chat?
   Use Foundation Models first. Use Core AI only if the user owns a custom model asset that must run locally.

3. Is the task "run this model" with `.aimodel`, PyTorch-to-production, large generative model deployment, specialization, or model debugger needs?
   Use Core AI.

4. Is the task "run this model" with `.mlmodel`, `.mlpackage`, Create ML, Core ML Tools, tabular/classical ML, image classifier, or converted model?
   Use Core ML.

5. Is the task image or video understanding?
   Use Vision. Use VisionKit if Apple-provided camera/document UI is the product requirement.

6. Is the task text analysis without generation?
   Use Natural Language.

7. Is the task spoken-word transcription?
   Use Speech.

8. Is the task non-speech audio classification?
   Use Sound Analysis.

9. Is the task translating text between languages?
   Use Translation.

10. Is the task model research/fine-tuning/experimentation on Apple silicon?
    Use MLX for research workflows, then decide whether production should become Core AI, Core ML, or Foundation Models.

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

## Implementation memory by lifecycle

Every AI feature has a lifecycle. Do not jump straight to code.

1. Define the job: generation, classification, extraction, translation, transcription, detection, retrieval, action, or model inference.
2. Choose the smallest Apple framework that solves that job.
3. Check OS, device, region, language, entitlement, model, and runtime availability.
4. Design fallback UI and non-AI behavior.
5. Decide the data path: on-device, Private Cloud Compute, server, downloaded model, bundled model, live camera, live audio, local index.
6. Add privacy copy and logging rules before implementation.
7. Implement behind a protocol or service boundary.
8. Add cancellation, progress, timeout, and error states.
9. Add tests or evaluations before tuning prompts/models.
10. Measure latency, memory, battery, and thermal behavior on realistic input.
11. Report VERIFIED, INSPECTED, or UNVERIFIED.

## Core AI brain

Use Core AI when the app owns a custom model and needs to deploy it on Apple silicon, especially full-scale LLMs and other generative models. Core AI is the route for `.aimodel` and `.aimodelc`, model specialization, caching, Core AI Debugger, Core AI Instruments, and PyTorch-to-production workflows.

Lifecycle memory:

1. Start with model ownership: source, license, weights, training origin, conversion toolchain, optimization strategy, and deployment size.
2. Convert the source model to `.aimodel`.
3. Optimize/compress before app integration.
4. Inspect function names, input names, output names, shapes, precision, metadata, and operation distribution.
5. Decide whether the app bundles the model, downloads it, or ships architecture-specific compiled assets.
6. Specialize and cache intentionally. First-run specialization needs progress UI and cancellation.
7. Use ahead-of-time compilation for large models when runtime specialization is too slow.
8. Validate outputs against reference vectors from the source model.
9. Profile CPU, GPU, Neural Engine, memory, battery, and thermal behavior before changing compute options.
10. Ship downloaded models with signature, checksum, version, staged rollout, rollback, and storage-pressure recovery.

Use Core AI for:

- Custom `.aimodel` or `.aimodelc` assets.
- Custom full-scale LLM or generative model deployment.
- PyTorch-to-Apple-silicon production workflows.
- Model specialization, caching, and Core AI Debugger work.
- Replacing model operations with lower-level optimized pieces.

Avoid Core AI for:

- Simple text generation with Apple Foundation Models.
- Existing `.mlmodel` assets that Core ML already handles.
- Vision/Natural Language/Speech/Sound/Translation tasks with system APIs.
- Research-only experiments that are not ready for product deployment.

Do not use Core AI just because a feature says "AI." Use it when there is a model asset and on-device inference requirement.

## Foundation Models brain

Use Foundation Models when the app needs language generation, summarization, extraction, classification, structured Swift values, tool calling, multimodal prompts, Dynamic Profiles, or provider abstraction through `LanguageModel`.

Lifecycle memory:

1. Decide whether the model is system on-device, Private Cloud Compute, or a custom provider through `LanguageModel`.
2. Check compile-time availability and runtime model availability before showing the feature.
3. Create one `LanguageModelSession` per conversation/task. The transcript is state.
4. Put product behavior into instructions, not hidden view code.
5. Use `@Generable` and `@Guide` for structured output instead of JSON prompts.
6. Use streaming partial output when the user benefits from seeing progress.
7. Wrap live data and app actions as bounded tools.
8. Use App Intents for deterministic actions; a model can choose or explain, but typed code performs the action.
9. Add cancellation and a maximum tool-call loop/exit.
10. Evaluate output quality and tool behavior with datasets before release.

Use Foundation Models for:

- Summaries, drafts, rewriting, extraction, classification, personal assistance, multimodal reasoning, structured Swift values, and tool calling.
- Apple Foundation Models on-device/PCC availability flows.
- Abstracting alternate model providers through Apple's protocol shape.

Avoid Foundation Models for:

- Exact deterministic calculations that normal Swift can do.
- Unreviewed destructive actions.
- Medical/legal/financial certainty.
- Background surveillance or hidden user profiling.
- Translation, OCR, transcription, or sound detection when task-specific APIs are enough.

Foundation Models is the first choice for Apple-platform LLM features that do not require shipping your own model.

## Core ML brain

Use Core ML when the app integrates `.mlmodel`, `.mlpackage`, `.mlmodelc`, Create ML output, converted TensorFlow/PyTorch/sklearn/XGBoost-style models, tabular models, image classifiers, custom Vision models, or update/fine-tuning workflows that Core ML supports.

Lifecycle memory:

1. Identify model source: bundled, downloaded, Create ML, Core ML Tools conversion, or app-trained/updateable.
2. Inspect model inputs, outputs, labels, metadata, image preprocessing, and supported compute units in Xcode.
3. Choose generated wrapper for simple bundled models; use manual `MLModel` loading for downloaded/configurable models.
4. Configure compute units intentionally.
5. Normalize inputs exactly as the model was trained.
6. Keep inference off the main actor.
7. Use Vision when image preprocessing, orientation, cropping, or `VNCoreMLRequest` improves correctness.
8. Version downloaded models and support rollback.
9. Test representative inputs, bad inputs, performance, memory, and low-power/thermal states.

Use Core ML for:

- Existing `.mlmodel`, `.mlpackage`, `.mlmodelc`.
- Core ML Tools conversion output.
- Create ML output.
- Vision plus custom model pipelines.
- Traditional ML/classical model integration.

Avoid Core ML for:

- Full-scale LLM deployment better suited to Core AI.
- Text generation better suited to Foundation Models.
- Built-in image/text/audio/language tasks already covered by system frameworks.

Core ML is not the default route for full-scale LLM deployment; Apple points that work to Core AI.

## Machine-learning-powered APIs brain

These frameworks are usually better than a custom model because Apple already provides optimized task-specific models.

Vision memory:

- Use for image/video analysis, OCR, barcode, detection, tracking, segmentation, and Vision plus Core ML pipelines.
- Normalize orientation and crop/scale behavior before blaming the model.
- Batch compatible requests over the same image when possible.
- Keep camera capture in AVFoundation or VisionKit; keep analysis in Vision.
- Verify orientation, crop/scale options, camera permissions, performance, and privacy.

Natural Language memory:

- Use for language identification, tokenization, tagging, named entities, sentiment-style analysis where supported, and embeddings.
- Use it before Foundation Models when the output is a deterministic linguistic label.
- Test mixed-language, emoji, punctuation, names, and short text.
- Verify locale behavior and multilingual text.

Speech memory:

- Use for speech recognition and transcription.
- Check authorization, recognizer availability, locale support, background limits, and device/server behavior.
- Use modern analyzer/transcriber APIs when the target OS supports them.
- Keep audio session ownership explicit.
- Show recording/listening state clearly.
- Do not assume speech recognition works in background.

Sound Analysis memory:

- Use for non-speech audio classification from files or streams.
- Keep observers strongly referenced.
- Use built-in classifiers for general sounds and custom Core ML models for product-specific categories.
- Separate Speech and Sound Analysis: spoken words go to Speech; acoustic events go to Sound Analysis.
- Debounce low-confidence classifications before UI or automation.

Translation memory:

- Use for in-app text translation.
- Choose system UI for simple translation and `TranslationSession` for custom flows.
- Check `LanguageAvailability` before showing controls.
- Plan for model download permission and offline availability.
- Keep original text available.
- Do not silently replace safety-critical, legal, medical, or financial text.

## Framework reflexes

Use these quick reflexes when reading a user request:

- "Summarize this note" -> Foundation Models.
- "Extract fields into a Swift struct" -> Foundation Models with `@Generable`.
- "Let Siri create a task" -> App Intents, optionally Foundation Models around it.
- "Detect objects in camera" -> Vision or VisionKit depending on UI needs.
- "Scan a receipt and reason over it" -> Vision/VisionKit for OCR, then Foundation Models for structured reasoning.
- "Transcribe a meeting" -> Speech.
- "Detect coughing or applause" -> Sound Analysis.
- "Translate chat messages" -> Translation.
- "Classify images with my `.mlmodel`" -> Core ML plus Vision if image preprocessing matters.
- "Run my PyTorch LLM locally" -> Core AI.
- "Fine-tune/research model on Mac" -> MLX, then decide production route.
- "Create custom GPU neural rendering" -> Metal.

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

Memory rule: research tells you what Apple is exploring; documentation and SDKs tell you what the app can ship.

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

## Source anchors

Use these only to verify APIs, availability, and Apple wording. The working memory is above.

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
