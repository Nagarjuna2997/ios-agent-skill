# On-device AI (Foundation Models)

`OnDeviceAI` wraps the Foundation Models framework so an app with an iOS 17 deployment target can offer the feature only where the on-device model exists. The framework is weakly linked.

## Use

```swift
if OnDeviceAI.isAvailable {
    Button("Summarize reviews") {
        Task { summary = try await OnDeviceAI.respond(to: reviews.joined(separator: "\n"), instructions: "Summarize in two sentences.") }
    }
}
```

## Rules

From [Foundation Models](../../docs/frameworks/foundation-models.md):

- Check availability before showing the entry point; the model is missing on older devices, in some regions and when Apple Intelligence is off.
- A session keeps its transcript; use one per conversation.
- Prefer `@Generable` types over asking for JSON.
