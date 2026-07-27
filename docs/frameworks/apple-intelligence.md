# Apple Intelligence

**Load this when:** deciding how an app should surface AI features, integrating
with Siri and system intelligence, using Private Cloud Compute, generating
images, or reasoning about the privacy guarantees you can state to users.

Apple Intelligence is the system layer, not a single API. Apps reach it through
several frameworks; this document routes you to the right one and covers the
privacy model that governs all of them.

---

## 1. Which framework does what

| You want to… | Use | Doc |
|--------------|-----|-----|
| Run a prompt, generate structured data, call tools | **Foundation Models** | `foundation-models.md` |
| Let Siri and Spotlight invoke your app's actions | **App Intents** | `app-intents.md` |
| Generate images | **Image Playground API** | this doc, §4 |
| Identify things in images and act on them | **Visual Intelligence / VisionKit** | this doc, §5 |
| Run your own ML model | **Core ML** | `ml/coreml.md` |
| OCR, detection, segmentation | **Vision** | `ml/vision.md` |

**The most common mistake is reaching for a language model when App Intents is
the answer.** If the user's goal is "do a thing in my app," that is an intent —
it is faster, deterministic, testable, and works without a model being available.
Use Foundation Models for open-ended generation, not for dispatching actions.

---

## 2. The privacy model

This is the part you must get right, because it determines what you may tell
users.

**On-device (`SystemLanguageModel`)**
- The prompt never leaves the device.
- Works offline. No account, no API key, no cost.
- Bounded by device capability: smaller context, lighter reasoning.

**Private Cloud Compute (`PrivateCloudComputeLanguageModel`, iOS 27+)**
- Runs on Apple silicon servers built for this purpose.
- **Prompts are not retained.** Data is used to serve the request and nothing else.
- No account setup, authentication, or API key required.
- Requires a network. Adds latency.
- Free for developers under the small-business download threshold.

**Third-party models** (via a custom `LanguageModel` conformance)
- **Apple's privacy guarantees do not extend to these.** A prompt sent to a
  third-party endpoint is governed by that vendor's terms.
- If your app can route to one, say so in your privacy policy and — where the
  content is sensitive — in the UI at the point of use.

### What you may claim

```
On-device only        "Processed on your device."                    ✅
Private Cloud Compute "Processed by Apple. Your data isn't stored."  ✅
Third-party model     "Processed on your device."                    ❌ false
Any path              "We never see your data" (if you log prompts)  ❌ false
```

Do not log prompt or response content to your own analytics and simultaneously
describe the feature as private. If you log, say so.

### Declare it

User-facing AI features that process personal data need the corresponding entries
in `PrivacyInfo.xcprivacy`, and any third-party model SDK carries its own privacy
manifest requirements. See `docs/design/interaction-standards.md` §7.

---

## 3. App Intents — the front door to Siri

App Intents is how Apple Intelligence discovers what your app can do. It is not
optional plumbing; it is the integration surface.

```swift
struct AddRecipeIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Recipe"
    static let description = IntentDescription("Saves a recipe to the user's collection.")

    @Parameter(title: "Name")
    var name: String

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await RecipeStore.shared.add(named: name)
        return .result(dialog: "Saved \(name).")
    }
}
```

Points that matter:

- **Adopt system-defined schemas** where one fits your domain. A schema-conforming
  intent gets natural-language handling for free, and does not depend on you
  guessing phrasings.
- **Do not hardcode invocation phrases.** The system maps language to intents and
  keeps improving; hardcoded phrases freeze you at today's behavior.
- **Index your content** with Core Spotlight so semantic search and on-device
  retrieval can find it.
- **New this year:** a View Annotations API for mapping on-screen entities, and an
  App Intents testing framework that validates intents without UI automation —
  use it instead of XCUITest for intent coverage.

Full reference: `docs/frameworks/app-intents.md`.

---

## 4. Image Playground

Generates images on Private Cloud Compute — photorealistic or stylized, from text
or a source photo.

```swift
import ImagePlayground

struct ComposeView: View {
    @State private var showGenerator = false
    @State private var generatedURL: URL?

    var body: some View {
        Button("Generate image") { showGenerator = true }
            .imagePlaygroundSheet(isPresented: $showGenerator) { url in
                generatedURL = url
            }
    }
}
```

Treat generation as **optional and fallible**: it needs a network, can be
unavailable by region, and the user can cancel. The compose flow must work
without it.

---

## 5. Visual Intelligence

Lets the system surface your app's content when the user points at something in
the real world or on screen. You supply entities and the intents that act on them
(open, play, buy), and the system routes matches to your app.

Worth adopting when your app has a catalogue of real-world things — products,
plants, landmarks, media. Not worth it for a to-do list.

---

## 6. Designing an AI feature that degrades

Apple Intelligence is not available on every device, in every region, or in every
language. Availability is a runtime condition, not a compile-time one.

```swift
@MainActor
@Observable
final class SmartComposeModel {
    enum Mode { case intelligent, manual }

    private(set) var mode: Mode = .manual

    func configure() {
        guard #available(iOS 26.0, *) else { return }
        if case .available = SystemLanguageModel.default.availability {
            mode = .intelligent
        }
    }
}
```

Design rules:

- **The non-AI path is the product.** The AI path is an enhancement layered on it.
  If removing the model breaks the feature, the feature is mis-scoped.
- **Never show a disabled AI button with no explanation.** Either hide the entry
  point or state why it is unavailable.
- **Label generated content.** Users should be able to tell what a model produced,
  especially before they send or publish it.
- **Always allow editing before commit.** Do not auto-send, auto-post, or
  auto-purchase from generated output.
- **Latency is a design problem.** Stream partial results; do not block the UI on
  a round trip. See `foundation-models.md` §2.

---

## Anti-Patterns

```swift
// 1. A language model where an App Intent belongs.
"Parse the user's sentence and figure out which screen to open."
// Use App Intents. Deterministic, testable, works with no model.

// 2. Claiming privacy you do not provide.
Text("Processed entirely on your device.")   // while routing to a third-party API

// 3. Assuming availability.
let session = LanguageModelSession()          // fails on ineligible devices/regions
// Check SystemLanguageModel.default.availability.

// 4. An AI-only feature with no fallback.
// Unusable for every user without Apple Intelligence.

// 5. Auto-committing generated content.
send(generatedReply)                          // user never saw it
// Always let the user read and edit first.

// 6. Private Cloud Compute as the default.
// Costs latency and a network dependency. Start on-device.

// 7. Hardcoded Siri phrases.
// Freezes you at today's phrasing. Use schemas.

// 8. Logging prompts to analytics while marketing the feature as private.
```

---

## Checklist

- [ ] The right framework is used — App Intents for actions, Foundation Models for
      generation.
- [ ] Availability is checked at runtime, not just with `@available`.
- [ ] The feature degrades to a working non-AI path.
- [ ] Privacy claims match the actual execution path, including third-party models.
- [ ] `PrivacyInfo.xcprivacy` reflects any personal data processed.
- [ ] Generated content is labelled and editable before it is committed.
- [ ] Long generations stream rather than blocking.
- [ ] App content is indexed in Spotlight for retrieval and semantic search.
- [ ] Intents are covered by the App Intents testing framework.
