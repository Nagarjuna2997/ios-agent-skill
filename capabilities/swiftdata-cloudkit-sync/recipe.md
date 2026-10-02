# SwiftData iCloud sync

Adds `PersistenceController.syncedContainer(for:)`, which stores SwiftData in the private database of `iCloud.<bundle id>`, and the iCloud, push and background-mode settings it needs.

## Use

```swift
@main
struct ShopApp: App {
    let container: ModelContainer = {
        do { return try PersistenceController.syncedContainer(for: [Order.self]) }
        catch { fatalError("Could not open the store: \(error)") }
    }()

    var body: some Scene {
        WindowGroup { RootView() }
            .modelContainer(container)
    }
}
```

## Rules

From [SwiftData](../../docs/frameworks/swiftdata.md) and [CloudKit](../../docs/frameworks/cloudkit.md):

- CloudKit-compatible models: defaults or optionals everywhere, optional relationships, no unique constraints.
- Sync needs a paid developer account and a device or simulator signed into iCloud.
- Changing a synced schema later is additive only.
