# Data and Persistence

## Context

Use this hub for SwiftData, Core Data, CloudKit, documents, files, Codable, SQLite, keychain storage, migrations, offline-first sync, conflict resolution, and private searchable content.

## Decision Matrix

| Need | Prefer |
|---|---|
| Modern app model persistence | SwiftData |
| Mature complex object graph / legacy store | Core Data |
| User-private Apple sync/sharing | CloudKit |
| Documents the user owns | FileManager + document architecture |
| Secrets or tokens | Keychain, never UserDefaults |
| Lightweight structured cache | Codable file cache or SQLite |
| App-local AI retrieval | Core Spotlight index + Foundation Models tool |

## Architecture Rules

- Persistence stays behind protocols at the domain boundary.
- UI models should not hold live database contexts directly.
- Cross actor boundaries with identifiers, not live model objects.
- Migrations are release features with tests and rollback decisions.
- Sync conflict handling is product behavior, not an implementation detail.

## Example

```swift
protocol NoteRepository: Sendable {
    func notes() async throws -> [Note]
    func save(_ note: Note) async throws
}
```

SwiftUI previews use an in-memory fake, not a live production store.

## Common Mistakes

- Storing secrets in `UserDefaults`.
- Doing schema migration without fixtures from older app versions.
- Treating CloudKit conflict resolution as "last write wins" without product approval.
- Passing SwiftData/Core Data model objects across actor boundaries.
- Blocking the main actor with JSON decoding or file I/O.

## Related Guides

- `../frameworks/swiftdata.md`
- `../frameworks/core-data.md`
- `../frameworks/cloudkit.md`
- `../frameworks/data-concurrency.md`
- `../frameworks/core-spotlight-rag.md`
- `../testing/mocking-strategy.md`
