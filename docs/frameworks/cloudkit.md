# CloudKit

## CKContainer and CKDatabase

```swift
import CloudKit

// Default container (matches bundle ID)
let container = CKContainer.default()

// Named container
let namedContainer = CKContainer(identifier: "iCloud.com.myapp.data")

// Database types
let publicDB = container.publicCloudDatabase   // Visible to all users
let privateDB = container.privateCloudDatabase  // User's private data
let sharedDB = container.sharedCloudDatabase    // Shared with the user by others

// Check account status
func checkCloudKitStatus() async throws -> CKAccountStatus {
    let status = try await container.accountStatus()
    switch status {
    case .available:
        print("iCloud available")
    case .noAccount:
        print("No iCloud account")
    case .restricted:
        print("iCloud restricted")
    case .couldNotDetermine:
        print("Could not determine iCloud status")
    case .temporarilyUnavailable:
        print("Temporarily unavailable")
    @unknown default:
        break
    }
    return status
}

// Get current user record ID
func getCurrentUserID() async throws -> CKRecord.ID {
    return try await container.userRecordID()
}
```

## CKRecord and CKRecordZone

```swift
// Create a record
func createNote(title: String, body: String) async throws -> CKRecord {
    let record = CKRecord(recordType: "Note")
    record["title"] = title as CKRecordValue
    record["body"] = body as CKRecordValue
    record["createdAt"] = Date() as CKRecordValue
    record["priority"] = 1 as CKRecordValue

    return try await CKContainer.default().privateCloudDatabase.save(record)
}

// Save with asset (file/image)
func createNoteWithImage(title: String, imageData: Data) async throws -> CKRecord {
    let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".jpg")
    try imageData.write(to: tempURL)

    let record = CKRecord(recordType: "Note")
    record["title"] = title as CKRecordValue
    record["image"] = CKAsset(fileURL: tempURL) as CKRecordValue

    return try await CKContainer.default().privateCloudDatabase.save(record)
}

// Fetch a record by ID
func fetchNote(id: CKRecord.ID) async throws -> CKRecord {
    return try await CKContainer.default().privateCloudDatabase.record(for: id)
}

// Update a record
func updateNote(recordID: CKRecord.ID, newTitle: String) async throws -> CKRecord {
    let record = try await CKContainer.default().privateCloudDatabase.record(for: recordID)
    record["title"] = newTitle as CKRecordValue
    return try await CKContainer.default().privateCloudDatabase.save(record)
}

// Delete a record
func deleteNote(recordID: CKRecord.ID) async throws {
    try await CKContainer.default().privateCloudDatabase.deleteRecord(withID: recordID)
}

// Custom record zone
func createCustomZone() async throws -> CKRecordZone {
    let zone = CKRecordZone(zoneName: "NotesZone")
    return try await CKContainer.default().privateCloudDatabase.save(zone)
}

// Save record in custom zone
func saveInZone(title: String, zoneID: CKRecordZone.ID) async throws -> CKRecord {
    let recordID = CKRecord.ID(recordName: UUID().uuidString, zoneID: zoneID)
    let record = CKRecord(recordType: "Note", recordID: recordID)
    record["title"] = title as CKRecordValue
    return try await CKContainer.default().privateCloudDatabase.save(record)
}
```

## CKQuery and NSPredicate

```swift
// Basic query
func fetchAllNotes() async throws -> [CKRecord] {
    let predicate = NSPredicate(value: true) // All records
    let query = CKQuery(recordType: "Note", predicate: predicate)
    query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]

    let (results, _) = try await CKContainer.default().privateCloudDatabase.records(
        matching: query,
        resultsLimit: 50
    )

    return results.compactMap { _, result in
        try? result.get()
    }
}

// Filtered query
func fetchHighPriorityNotes() async throws -> [CKRecord] {
    let predicate = NSPredicate(format: "priority >= %d", 2)
    let query = CKQuery(recordType: "Note", predicate: predicate)

    let (results, _) = try await CKContainer.default().privateCloudDatabase.records(matching: query)
    return results.compactMap { _, result in try? result.get() }
}

// Search with text
func searchNotes(text: String) async throws -> [CKRecord] {
    // CONTAINS requires a tokenized string index in the CloudKit dashboard
    let predicate = NSPredicate(format: "self contains %@", text)
    let query = CKQuery(recordType: "Note", predicate: predicate)

    let (results, _) = try await CKContainer.default().privateCloudDatabase.records(matching: query)
    return results.compactMap { _, result in try? result.get() }
}

// Paginated fetch with cursor
func fetchNotesPaginated(cursor: CKQueryOperation.Cursor? = nil) async throws -> ([CKRecord], CKQueryOperation.Cursor?) {
    let db = CKContainer.default().privateCloudDatabase

    if let cursor {
        let (results, newCursor) = try await db.records(continuingMatchFrom: cursor, resultsLimit: 20)
        let records = results.compactMap { _, result in try? result.get() }
        return (records, newCursor)
    } else {
        let query = CKQuery(recordType: "Note", predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        let (results, newCursor) = try await db.records(matching: query, resultsLimit: 20)
        let records = results.compactMap { _, result in try? result.get() }
        return (records, newCursor)
    }
}
```

## CKSubscription for Push Notifications

Enable "CloudKit" and "Remote notifications" in Background Modes capability.

```swift
// Subscribe to new notes
func subscribeToNoteChanges() async throws {
    let predicate = NSPredicate(value: true)
    let subscription = CKQuerySubscription(
        recordType: "Note",
        predicate: predicate,
        subscriptionID: "note-changes",
        options: [.firesOnRecordCreation, .firesOnRecordUpdate, .firesOnRecordDeletion]
    )

    let notification = CKSubscription.NotificationInfo()
    notification.title = "Notes Updated"
    notification.alertBody = "A note was modified"
    notification.shouldSendContentAvailable = true // Silent push for background fetch
    notification.soundName = "default"
    subscription.notificationInfo = notification

    try await CKContainer.default().privateCloudDatabase.save(subscription)
}

// Database subscription (all changes in a zone)
func subscribeToDatabaseChanges() async throws {
    let subscription = CKDatabaseSubscription(subscriptionID: "private-db-changes")

    let notification = CKSubscription.NotificationInfo()
    notification.shouldSendContentAvailable = true
    subscription.notificationInfo = notification

    try await CKContainer.default().privateCloudDatabase.save(subscription)
}

// Handle push notification in AppDelegate
func application(_ application: UIApplication,
                 didReceiveRemoteNotification userInfo: [AnyHashable: Any]) async -> UIBackgroundFetchResult {
    let notification = CKNotification(fromRemoteNotificationDictionary: userInfo)

    if notification?.subscriptionID == "note-changes" {
        // Fetch updated data
        return .newData
    }
    return .noData
}
```

## Sharing (CKShare)

```swift
import CloudKit
import UIKit

// Create a share
func shareRecord(_ record: CKRecord) async throws -> CKShare {
    let share = CKShare(rootRecord: record)
    share[CKShare.SystemFieldKey.title] = "Shared Note" as CKRecordValue
    share.publicPermission = .readOnly

    let db = CKContainer.default().privateCloudDatabase
    let (saveResults, _) = try await db.modifyRecords(saving: [record, share], deleting: [])

    // Verify both saved successfully
    for (_, result) in saveResults {
        _ = try result.get()
    }
    return share
}

// Present sharing UI (UIKit)
func presentSharingController(for share: CKShare, from viewController: UIViewController) {
    let container = CKContainer.default()
    let sharingController = UICloudSharingController(share: share, container: container)
    sharingController.availablePermissions = [.allowReadOnly, .allowReadWrite]
    sharingController.delegate = viewController as? UICloudSharingControllerDelegate
    viewController.present(sharingController, animated: true)
}

// Accept a share (in SceneDelegate or AppDelegate)
func windowScene(_ windowScene: UIWindowScene,
                 userDidAcceptCloudKitShareWith cloudKitShareMetadata: CKShare.Metadata) {
    let container = CKContainer(identifier: cloudKitShareMetadata.containerIdentifier)
    Task {
        do {
            try await container.accept(cloudKitShareMetadata)
            // Fetch shared records from sharedCloudDatabase
        } catch {
            print("Failed to accept share: \(error)")
        }
    }
}

// Fetch shared records
func fetchSharedRecords() async throws -> [CKRecord] {
    let zones = try await CKContainer.default().sharedCloudDatabase.allRecordZones()

    var allRecords: [CKRecord] = []
    for zone in zones {
        let query = CKQuery(recordType: "Note", predicate: NSPredicate(value: true))
        let (results, _) = try await CKContainer.default().sharedCloudDatabase.records(
            matching: query,
            inZoneWith: zone.zoneID
        )
        let records = results.compactMap { _, result in try? result.get() }
        allRecords.append(contentsOf: records)
    }
    return allRecords
}
```

## CloudKit with SwiftData/CoreData

```swift
// CoreData + CloudKit: use NSPersistentCloudKitContainer (see core-data.md)

// SwiftData + CloudKit: automatic when configured
// Requirements:
// 1. All @Model properties must have defaults or be optional
// 2. No #Unique constraints
// 3. CloudKit capability enabled in Xcode

import SwiftData

@Model
class CloudNote {
    var id: UUID = UUID()
    var title: String = ""
    var body: String = ""
    var createdAt: Date = Date()
    var category: CloudCategory?

    init(title: String, body: String = "") {
        self.title = title
        self.body = body
    }
}

@Model
class CloudCategory {
    var id: UUID = UUID()
    var name: String = ""

    @Relationship(deleteRule: .nullify, inverse: \CloudNote.category)
    var notes: [CloudNote] = []

    init(name: String) {
        self.name = name
    }
}

// App setup with CloudKit-enabled container
@main
struct CloudNotesApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [CloudNote.self, CloudCategory.self])
        // CloudKit syncs automatically when entitlements are configured
    }
}
```
