# SwiftData local persistence

Stores the app's data on the device. The template adds `PersistenceController` for building a container explicitly and an in-memory container for previews.

## Use

```swift
@Model
final class Note {
    var title: String
    var body: String
    var createdAt: Date

    init(title: String, body: String, createdAt: Date = .now) {
        self.title = title
        self.body = body
        self.createdAt = createdAt
    }
}

@main
struct NotesApp: App {
    var body: some Scene {
        WindowGroup { RootView() }
            .modelContainer(for: [Note.self])
    }
}
```

Views read with `@Query(sort: \Note.createdAt, order: .reverse) private var notes: [Note]` and insert or delete through `@Environment(\.modelContext)`.

## Rules

From [SwiftData](../../docs/frameworks/swiftdata.md):

- A `@Model` is a persistence type. Keep one container for the app, created in one place.
- Do not pass model objects across actors; pass `PersistentIdentifier` or value copies.
- Previews and tests use an in-memory store so they never touch the user's data.
- Use SwiftData only for data that must survive relaunch; transient UI state stays in `@State` or view models.
