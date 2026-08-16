# App Intents, Schemas, Spotlight, and View Annotations

## Overview

Modern App Intents integration is no longer only "make a shortcut." Apple Intelligence and Siri use App Intents schemas, entity schemas, Spotlight semantic indexing, and view annotations to understand what your app can do, what content it owns, and what visible item a person is referring to.

Load this with `docs/frameworks/app-intents.md` when the task mentions Siri, Apple Intelligence, semantic indexing, App Entities, Spotlight discovery, or phrases like "this photo" and "the second message."

---

## 1. The Integration Stack

| Layer | Purpose |
|-------|---------|
| `AppIntent` | The action the system can run |
| Intent schema | System-understood action shape for a domain |
| `AppEntity` / entity schema | App content the system can reason about |
| Spotlight semantic index | Runtime discovery of specific entity instances |
| View annotations | Connect visible SwiftUI content to entities |
| App Intents Testing | Validate Siri, Shortcuts, and Spotlight pathways |

Use schemas when Apple provides one for your domain. A schema lets Siri understand the action semantically instead of relying only on custom phrases.

---

## 2. Entity Modeling Rules

Good Apple Intelligence integrations start with good entities:

- stable identifier
- localized display representation
- query support for finding entities
- schema conformance when available
- Spotlight donation/indexing for runtime discovery
- privacy review for every exposed field

```swift
import AppIntents

struct PhotoMemoryEntity: AppEntity, Identifiable {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Photo Memory"
    static var defaultQuery = PhotoMemoryQuery()

    let id: String
    let title: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)")
    }
}

struct PhotoMemoryQuery: EntityQuery {
    func entities(for identifiers: [PhotoMemoryEntity.ID]) async throws -> [PhotoMemoryEntity] {
        try await MemoryStore.shared.find(ids: identifiers)
    }
}
```

Keep entity IDs stable across launches, sync, and reinstall where the product expects continuity.

---

## 3. Spotlight Semantic Indexing

Schemas tell the system what kinds of content and actions exist. Spotlight indexing lets the system find concrete instances.

```swift
import CoreSpotlight
import UniformTypeIdentifiers

func donateMemory(_ memory: PhotoMemoryEntity, summary: String) async throws {
    let attributes = CSSearchableItemAttributeSet(contentType: .image)
    attributes.title = memory.title
    attributes.contentDescription = summary

    let item = CSSearchableItem(
        uniqueIdentifier: memory.id,
        domainIdentifier: "photo-memory",
        attributeSet: attributes
    )
    try await CSSearchableIndex.default().indexSearchableItems([item])
}
```

Index the content people naturally ask about. Remove index entries when the underlying entity is deleted or no longer available.

---

## 4. View Annotations

View annotations let the system connect visible SwiftUI content to app entities so a user can say "send this photo" or "open the second message."

Because the API is beta, prefer this implementation pattern over hardcoding assumptions:

```swift
struct MemoryRow: View {
    let memory: PhotoMemoryEntity

    var body: some View {
        HStack {
            thumbnail
            Text(memory.title)
        }
        // Apply the current SDK's view-annotation modifier here.
        // The annotation should associate this visible row with `memory`.
    }
}
```

Rules:

- Annotate the smallest visible view that maps to the entity.
- Do not annotate decorative chrome.
- Keep row order stable while Siri is resolving a reference.
- Make annotated entities transferable when another app may receive them.
- Test ambiguous screens with repeated labels and multiple similar entities.

---

## 5. Intent Schemas and System Actions

When a system schema exists, use it instead of inventing a custom intent shape. Schemas give Siri a domain model it already understands, and future language improvements flow through without requiring phrase rewrites.

Review:

- Does the app category have an Apple-provided intent schema?
- Does each parameter map to a schema field instead of a generic string?
- Does each `AppEntity` map to a schema where available?
- Does the intent return enough result data for Siri to continue the conversation?
- Does the app handle unavailable content gracefully?

---

## 6. Testing

Use App Intents Testing for real system pathways where possible. Cover:

- Siri phrase resolution
- Shortcuts execution
- Spotlight discovery
- entity query lookup
- view annotation reference resolution
- localization of display names
- deleted or permission-restricted entities

Do not rely only on UI automation. Siri and Spotlight bugs often live in schema, donation, indexing, or entity-query code.

---

## 7. Review Checklist

- [ ] App Intent uses a system schema when one fits
- [ ] App Entities have stable IDs and localized display representations
- [ ] Concrete entities are indexed/donated for discovery
- [ ] View annotations map visible content to entities, not decoration
- [ ] Deleted/private content is removed or hidden from discovery
- [ ] Siri/Shortcuts/Spotlight flows have App Intents tests
- [ ] Ambiguous visible references are tested
- [ ] Privacy review covers every exposed entity field

See also: `docs/frameworks/app-intents.md`, `docs/frameworks/core-spotlight-rag.md`, `docs/frameworks/apple-intelligence.md`, `docs/testing/evaluations.md`.
