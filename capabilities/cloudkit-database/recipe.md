# CloudKit database

`CloudKitStore` reads and writes the private database of the container `iCloud.<bundle id>`. `CKRecord` values never leave the store's functions; callers get their own `Sendable` types.

## Use

```swift
struct Favorite: CloudRecordConvertible {
    static let recordType = "Favorite"
    var id: String
    var name: String

    init(id: String = UUID().uuidString, name: String) { self.id = id; self.name = name }
    init?(record: CKRecord) {
        guard let name = record["name"] as? String else { return nil }
        self.init(id: record.recordID.recordName, name: name)
    }
    func fill(_ record: CKRecord) { record["name"] = name }
}

try await store.save(Favorite(name: "Sample Kitchen"))
let favorites: [Favorite] = try await store.fetchAll()
```

## Rules

From [CloudKit](../../docs/frameworks/cloudkit.md) and [CloudKit backend](../../docs/backend/cloudkit.md):

- Check the account status; a signed-out user is a normal state, not a crash.
- The development and production environments have separate schemas; deploy the schema before release.
- Needs a paid developer account for the container; the simulator must be signed into iCloud to test.
