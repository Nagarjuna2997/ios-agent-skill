# Core Spotlight RAG -- Private App-Local Retrieval for Foundation Models

## Overview

Core Spotlight indexes app content on device. In the iOS 27 generation, Apple adds `SpotlightSearchTool`, a Foundation Models `Tool` that lets a `LanguageModelSession` use app-indexed content as private retrieval context.

Use this for app-local RAG: notes, documents, tasks, messages, projects, photos, or any user-owned content the app already manages.

> Core Spotlight indexes remain private to the device owner. Do not mirror this content to a server unless the product explicitly requires sync and explains it.

---

## 1. Architecture

```text
App content store
  -> CSSearchableItem + CSSearchableItemAttributeSet
  -> CSSearchableIndex
  -> SpotlightSearchTool
  -> LanguageModelSession
  -> grounded answer with app-local context
```

Core Spotlight is not just a search UI feature. It becomes the retrieval substrate the model can query through a tool.

---

## 2. Index App Content

```swift
import CoreSpotlight
import UniformTypeIdentifiers

struct Note: Identifiable {
    let id: String
    let title: String
    let body: String
    let modifiedAt: Date
}

func searchableItem(for note: Note) -> CSSearchableItem {
    let attributes = CSSearchableItemAttributeSet(contentType: .text)
    attributes.title = note.title
    attributes.contentDescription = note.body
    attributes.subject = note.title
    attributes.contentCreationDate = note.modifiedAt

    return CSSearchableItem(
        uniqueIdentifier: note.id,
        domainIdentifier: "notes",
        attributeSet: attributes
    )
}

func index(notes: [Note]) async throws {
    let items = notes.map(searchableItem(for:))
    try await CSSearchableIndex.default().indexSearchableItems(items)
}
```

Index content as it changes. A model cannot retrieve what the app never indexed, and stale indexes create stale answers.

---

## 3. Use `SpotlightSearchTool`

```swift
import CoreSpotlight
import FoundationModels

@available(iOS 27.0, macOS 27.0, *)
func makeNotesSession() -> LanguageModelSession {
    var source = CoreSpotlightSource(
        fetchAttributes: [.subject, .contentDescription, .contentCreationDate]
    )
    source.maximumResultCount = 12

    let configuration = SpotlightSearchTool.Configuration(
        sources: [.coreSpotlight(source)]
    )
    let searchTool = SpotlightSearchTool(configuration: configuration)

    return LanguageModelSession(
        tools: [searchTool],
        instructions: """
        Answer using the user's indexed notes when relevant.
        Cite note titles when you use note content.
        Say when the notes do not contain enough information.
        """
    )
}
```

Configure the source narrowly. Fetch only attributes the answer needs, set a bounded result count, and provide instructions for attribution and uncertainty.

---

## 4. Contact and Identity Queries

Searches involving "me", "my manager", or people in messages can require identity resolution. If your app supports person-centric retrieval, implement Apple's contact resolution hooks with your app's account/profile source.

Rules:

- Do not infer identity from Contacts without permission and purpose.
- Prefer the signed-in app profile when it is authoritative.
- Keep identity resolution deterministic in tests.
- Redact or avoid sensitive attributes unless the answer needs them.

---

## 5. Grounding Rules

The answer should distinguish retrieved facts from model reasoning:

- Include source titles or stable item names in UI.
- Use a "not found" answer when retrieval returns nothing relevant.
- Do not let the model invent records that are absent from the index.
- Reindex immediately after edits, deletes, imports, and sync conflict resolution.
- Delete index entries when app content is deleted.

---

## 6. Testing

Create a deterministic test index:

1. Seed a few known `CSSearchableItem` values.
2. Ask queries with expected hits.
3. Ask queries with expected misses.
4. Verify the model calls the Spotlight tool before answering.
5. Verify answers cite retrieved item titles.

For model behavior, pair this with `docs/testing/evaluations.md` and a `ToolCallEvaluator`.

---

## 7. Review Checklist

- [ ] Indexed fields are minimal, useful, and privacy-reviewed
- [ ] Index updates run on create/update/delete/import/sync
- [ ] `SpotlightSearchTool` result count and attributes are bounded
- [ ] Instructions require source attribution and uncertainty
- [ ] Deleted app content is removed from the Spotlight index
- [ ] Tests cover hit, miss, stale-index, and tool-failure paths
- [ ] No server RAG is used for private app-local content without explicit product need

See also: `docs/frameworks/foundation-models.md`, `docs/frameworks/app-intents-intelligence.md`, `docs/frameworks/usernotifications.md`, `docs/testing/evaluations.md`.
