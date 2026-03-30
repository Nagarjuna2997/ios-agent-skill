# CloudKit

CloudKit is Apple's cloud backend framework providing database storage, authentication, and asset management. It syncs data across devices using iCloud with public, private, and shared databases.

## CKContainer and CKDatabase (Public, Private, Shared)

```swift
import CloudKit

class CloudKitManager: ObservableObject {
    // Default container matches your app's bundle ID
    let container = CKContainer.default()

    // Custom container identifier
    let customContainer = CKContainer(identifier: "iCloud.com.yourapp.name")

    // Access different databases
    lazy var publicDB = container.publicCloudDatabase     // Accessible to all users
    lazy var privateDB = container.privateCloudDatabase    // User's private data (counts toward user's iCloud quota)
    lazy var sharedDB = container.sharedCloudDatabase      // Data shared with this user by others

    // Check iCloud account status
    func checkAccountStatus() async throws -> CKAccountStatus {
        let status = try await container.accountStatus()
        switch status {
        case .available:
            print("iCloud available")
        case .noAccount:
            print("No iCloud account signed in")
        case .restricted:
            print("iCloud restricted by parental controls or MDM")
        case .couldNotDetermine:
            print("Could not determine iCloud status")
        case .temporarilyUnavailable:
            print("iCloud temporarily unavailable")
        @unknown default:
            break
        }
        return status
    }

    // Get current user record ID
    func fetchUserRecordID() async throws -> CKRecord.ID {
        return try await container.userRecordID()
    }

    // Request user discoverability permission
    func requestPermission() async throws -> CKContainer.ApplicationPermissionStatus {
        return try await container.requestApplicationPermission(.userDiscoverability)
    }
}
```

## CKRecord CRUD Operations

### Create

```swift
extension CloudKitManager {
    func createNote(title: String, body: String, image: UIImage?) async throws -> CKRecord {
        let record = CKRecord(recordType: "Note")
        record["title"] = title as CKRecordValue
        record["body"] = body as CKRecordValue
        record["createdAt"] = Date() as CKRecordValue
        record["tags"] = ["swift", "cloudkit"] as CKRecordValue  // Arrays are supported

        // Save an image asset
        if let image = image, let data = image.jpegData(compressionQuality: 0.8) {
            let tempURL = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString + ".jpg")
            try data.write(to: tempURL)
            record["image"] = CKAsset(fileURL: tempURL)
        }

        // Reference another record
        let folderRecordID = CKRecord.ID(recordName: "folder-abc")
        record["folder"] = CKRecord.Reference(recordID: folderRecordID, action: .deleteSelf)
        // .deleteSelf: child is deleted when parent is deleted
        // .none: no cascade behavior

        let savedRecord = try await privateDB.save(record)
        return savedRecord
    }
}
```

### Read

```swift
extension CloudKitManager {
    // Fetch a single record by ID
    func fetchNote(recordID: CKRecord.ID) async throws -> CKRecord {
        return try await privateDB.record(for: recordID)
    }

    // Fetch multiple records efficiently
    func fetchNotes(recordIDs: [CKRecord.ID]) async throws -> [CKRecord] {
        let results = try await privateDB.records(for: recordIDs)
        return results.compactMap { _, result in
            try? result.get()
        }
    }

    // Fetch only specific fields (desiredKeys) to reduce bandwidth
    func fetchNoteTitles(recordIDs: [CKRecord.ID]) async throws -> [CKRecord] {
        let results = try await privateDB.records(for: recordIDs, desiredKeys: ["title", "createdAt"])
        return results.compactMap { _, result in try? result.get() }
    }
}
```

### Update

```swift
extension CloudKitManager {
    func updateNote(recordID: CKRecord.ID, newTitle: String) async throws -> CKRecord {
        // Fetch the existing record first to get its change tag
        let record = try await privateDB.record(for: recordID)
        record["title"] = newTitle as CKRecordValue
        record["modifiedAt"] = Date() as CKRecordValue

        // Save returns the updated record
        return try await privateDB.save(record)
    }
}
```

### Delete

```swift
extension CloudKitManager {
    // Delete a single record
    func deleteNote(recordID: CKRecord.ID) async throws {
        try await privateDB.deleteRecord(withID: recordID)
    }

    // Batch operations using modifyRecords
    func batchSaveAndDelete(
        toSave: [CKRecord],
        toDelete: [CKRecord.ID]
    ) async throws {
        let (saveResults, deleteResults) = try await privateDB.modifyRecords(
            saving: toSave,
            deleting: toDelete,
            savePolicy: .changedKeys,       // Only upload changed fields
            atomicityType: .nonAtomic       // .full for all-or-nothing
        )

        for (id, result) in saveResults {
            switch result {
            case .success(let record):
                print("Saved: \(record.recordID.recordName)")
            case .failure(let error):
                print("Save failed for \(id): \(error)")
            }
        }
        print("Deleted \(deleteResults.count) records")
    }
}
```

## CKQuery with NSPredicate

```swift
extension CloudKitManager {
    // Fetch all records of a type
    func fetchAllNotes() async throws -> [CKRecord] {
        let predicate = NSPredicate(value: true)
        let query = CKQuery(recordType: "Note", predicate: predicate)
        query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]

        let (results, _) = try await privateDB.records(matching: query)
        return results.compactMap { _, result in try? result.get() }
    }

    // Filtered query with string matching
    func searchNotes(containing text: String) async throws -> [CKRecord] {
        // Tokenized field queries use CONTAINS; CloudKit also supports
        // BEGINSWITH, ==, IN, and tokenized full-text search via allTokens
        let predicate = NSPredicate(format: "title CONTAINS %@", text)
        let query = CKQuery(recordType: "Note", predicate: predicate)

        let (results, _) = try await privateDB.records(matching: query)
        return results.compactMap { _, result in try? result.get() }
    }

    // Compound predicates
    func fetchRecentNotes(after date: Date, tag: String) async throws -> [CKRecord] {
        let datePredicate = NSPredicate(format: "createdAt > %@", date as NSDate)
        let tagPredicate = NSPredicate(format: "tags CONTAINS %@", tag)
        let compound = NSCompoundPredicate(
            andPredicateWithSubpredicates: [datePredicate, tagPredicate]
        )

        let query = CKQuery(recordType: "Note", predicate: compound)
        let (results, _) = try await privateDB.records(matching: query)
        return results.compactMap { _, result in try? result.get() }
    }

    // Paginated query using cursor
    func fetchNotesPaginated(
        cursor: CKQueryOperation.Cursor? = nil,
        limit: Int = 20
    ) async throws -> ([CKRecord], CKQueryOperation.Cursor?) {
        if let cursor = cursor {
            let (results, newCursor) = try await privateDB.records(
                continuingMatchFrom: cursor,
                resultsLimit: limit
            )
            let records = results.compactMap { _, result in try? result.get() }
            return (records, newCursor)
        } else {
            let query = CKQuery(recordType: "Note", predicate: NSPredicate(value: true))
            query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]

            let (results, newCursor) = try await privateDB.records(
                matching: query,
                resultsLimit: limit
            )
            let records = results.compactMap { _, result in try? result.get() }
            return (records, newCursor)
        }
    }
}
```

## CKSubscription for Real-Time Push

```swift
extension CloudKitManager {
    // Query subscription: fires when records matching a predicate change
    func subscribeToNoteChanges() async throws {
        let subscription = CKQuerySubscription(
            recordType: "Note",
            predicate: NSPredicate(value: true),
            subscriptionID: "note-changes",
            options: [.firesOnRecordCreation, .firesOnRecordUpdate, .firesOnRecordDeletion]
        )

        let notification = CKSubscription.NotificationInfo()
        notification.title = "Note Updated"
        notification.alertBody = "A note was modified"
        notification.shouldBadge = true
        notification.soundName = "default"
        notification.shouldSendContentAvailable = true  // Silent push for background refresh

        subscription.notificationInfo = notification

        try await privateDB.save(subscription)
    }

    // Database subscription: fires on any change in the database
    func subscribeToDatabaseChanges() async throws {
        let subscription = CKDatabaseSubscription(subscriptionID: "private-db-changes")

        let notification = CKSubscription.NotificationInfo()
        notification.shouldSendContentAvailable = true
        subscription.notificationInfo = notification

        try await privateDB.save(subscription)
    }

    // Fetch changes since last sync using server change tokens
    func fetchChanges(in zoneID: CKRecordZone.ID = .default) async throws {
        // Load saved token
        let tokenData = UserDefaults.standard.data(forKey: "zoneChangeToken-\(zoneID.zoneName)")
        let token = tokenData.flatMap {
            try? NSKeyedUnarchiver.unarchivedObject(ofClass: CKServerChangeToken.self, from: $0)
        }

        let changes = try await privateDB.recordZoneChanges(inZoneWith: zoneID, since: token)

        for modification in changes.modificationResultsByID {
            let (recordID, result) = modification
            switch result {
            case .success(let modification):
                print("Modified: \(recordID.recordName), record: \(modification.record.recordType)")
            case .failure(let error):
                print("Error for \(recordID): \(error)")
            }
        }

        for deletion in changes.deletions {
            print("Deleted: \(deletion.recordID.recordName), type: \(deletion.recordType)")
        }

        // Persist the new change token for next sync
        if let newToken = changes.changeToken,
           let data = try? NSKeyedArchiver.archivedData(
               withRootObject: newToken, requiringSecureCoding: true
           ) {
            UserDefaults.standard.set(data, forKey: "zoneChangeToken-\(zoneID.zoneName)")
        }
    }
}
```

## CKShare and Sharing Records

```swift
extension CloudKitManager {
    // Create a share for a record
    func shareRecord(_ record: CKRecord) async throws -> CKShare {
        let share = CKShare(rootRecord: record)
        share[CKShare.SystemFieldKey.title] = "Shared Note" as CKRecordValue
        share[CKShare.SystemFieldKey.shareType] = "com.app.note" as CKRecordValue
        share.publicPermission = .readOnly  // .none, .readOnly, .readWrite

        // Save both the record and the share atomically
        let (savedResults, _) = try await privateDB.modifyRecords(
            saving: [record, share],
            deleting: []
        )

        guard let savedShare = try? savedResults[share.recordID]?.get() as? CKShare else {
            throw CloudKitError.shareFailed
        }

        // share.url contains the URL to send to participants
        print("Share URL: \(savedShare.url?.absoluteString ?? "none")")

        return savedShare
    }

    // Accept a share from a URL
    func acceptShare(metadata: CKShare.Metadata) async throws {
        try await container.accept(metadata)
    }

    // Fetch records shared with this user
    func fetchSharedRecords() async throws -> [CKRecord] {
        let zones = try await sharedDB.allRecordZones()
        var allRecords: [CKRecord] = []

        for zone in zones {
            let query = CKQuery(recordType: "Note", predicate: NSPredicate(value: true))
            let (results, _) = try await sharedDB.records(
                matching: query,
                inZoneWith: zone.zoneID
            )
            allRecords += results.compactMap { _, result in try? result.get() }
        }
        return allRecords
    }
}

// SwiftUI wrapper for the system sharing controller
struct CloudSharingView: UIViewControllerRepresentable {
    let share: CKShare
    let container: CKContainer

    func makeUIViewController(context: Context) -> UICloudSharingController {
        let controller = UICloudSharingController(share: share, container: container)
        controller.availablePermissions = [.allowReadOnly, .allowReadWrite, .allowPrivate]
        return controller
    }

    func updateUIViewController(_ uiViewController: UICloudSharingController, context: Context) {}
}

enum CloudKitError: Error {
    case shareFailed
    case accountUnavailable
    case recordNotFound
}
```

## CloudKit Dashboard

The CloudKit Dashboard at https://icloud.developer.apple.com provides:

- **Schema**: View and modify record types, fields, and indexes. Add queryable and sortable indexes for any field used in CKQuery predicates or sort descriptors.
- **Data Browser**: Query, create, edit, and delete records in public, private (via Team Development), and shared databases.
- **Logs**: View server-side request logs, error breakdowns, and push notification delivery status.
- **Telemetry**: Monitor request counts, error rates, latency, and data transfer metrics.
- **Subscriptions**: View and manage active CKSubscription objects.
- **Security Roles**: Control public database access with custom roles (e.g., allowing authenticated users to create records).
- **Deployment**: Promote your development schema to production. This is a one-way operation and cannot be reversed.
- **Reset Development**: Reset the development environment schema to match production when needed.

## Integration with SwiftData/CoreData

### NSPersistentCloudKitContainer (CoreData + CloudKit)

```swift
import CoreData

class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentCloudKitContainer

    init() {
        container = NSPersistentCloudKitContainer(name: "Model")

        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("No persistent store description found")
        }

        // Enable CloudKit sync
        description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(
            containerIdentifier: "iCloud.com.yourapp.name"
        )

        // Required: enable remote change notifications
        description.setOption(
            true as NSNumber,
            forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey
        )

        // Required: enable history tracking for CloudKit sync
        description.setOption(
            true as NSNumber,
            forKey: NSPersistentHistoryTrackingKey
        )

        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Core Data store failed to load: \(error)")
            }
        }

        // Automatically merge remote changes into the view context
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

        // Observe remote changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRemoteChange),
            name: .NSPersistentStoreRemoteChange,
            object: container.persistentStoreCoordinator
        )
    }

    @objc func handleRemoteChange(_ notification: Notification) {
        print("Remote change received from CloudKit")
        // Process persistent history if needed
    }
}
```

### SwiftData with CloudKit (iOS 17+)

```swift
import SwiftData

@Model
class Note {
    var title: String
    var body: String
    var createdAt: Date
    var tags: [String]

    // Relationships must be optional for CloudKit compatibility
    var folder: Folder?

    init(title: String, body: String) {
        self.title = title
        self.body = body
        self.createdAt = Date()
        self.tags = []
    }
}

// SwiftData syncs with CloudKit automatically when the iCloud capability is enabled
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Note.self])
    }
}

// Requirements for SwiftData + CloudKit:
// 1. Enable iCloud and CloudKit in Signing & Capabilities
// 2. All stored properties must have default values or be optional
// 3. No unique constraints (CloudKit does not support them)
// 4. Relationships must be optional with no required cascade rules
// 5. @Attribute(.externalStorage) maps to CKAsset for large data
```

## Custom Record Zones

```swift
extension CloudKitManager {
    // Custom zones allow atomic commits and change tracking
    func createCustomZone() async throws -> CKRecordZone {
        let zone = CKRecordZone(zoneName: "NotesZone")
        let savedZone = try await privateDB.save(zone)
        return savedZone
    }

    func saveToCustomZone(title: String) async throws -> CKRecord {
        let zoneID = CKRecordZone.ID(zoneName: "NotesZone")
        let recordID = CKRecord.ID(recordName: UUID().uuidString, zoneID: zoneID)
        let record = CKRecord(recordType: "Note", recordID: recordID)
        record["title"] = title as CKRecordValue
        return try await privateDB.save(record)
    }
}
```

## Modern CloudKit (iOS 17+)

### CKSyncEngine

`CKSyncEngine` is Apple's recommended sync engine that replaces manual change token management, zone fetching, and subscription handling. It encapsulates the full sync lifecycle -- scheduling, batching, retry logic, conflict resolution, and account change handling -- into a single, delegate-driven API.

**Why CKSyncEngine replaces manual change token fetching**: Previously, developers had to manually manage `CKServerChangeToken` objects, handle `CKFetchRecordZoneChangesOperation`, process `CKModifyRecordZonesOperation`, manage retry and error logic, and track database subscriptions. `CKSyncEngine` handles all of this automatically, dramatically reducing boilerplate and the surface area for sync bugs.

```swift
import CloudKit

// MARK: - CKSyncEngine Setup

class SyncManager: CKSyncEngineDelegate {
    let syncEngine: CKSyncEngine

    init() {
        // Load any previously persisted sync engine state
        let lastKnownState = Self.loadSyncEngineState()

        // Configure the sync engine
        let configuration = CKSyncEngine.Configuration(
            database: CKContainer.default().privateCloudDatabase,
            stateSerialization: lastKnownState,
            delegate: self
        )

        syncEngine = CKSyncEngine(configuration)
    }

    // MARK: - CKSyncEngineDelegate Methods

    // Called when the sync engine has events to process
    func handleEvent(_ event: CKSyncEngine.Event, syncEngine: CKSyncEngine) async {
        switch event {
        case .stateUpdate(let stateUpdate):
            // Persist the sync engine state so it can resume after app relaunch
            Self.saveSyncEngineState(stateUpdate.stateSerialization)

        case .accountChange(let event):
            handleAccountChange(event)

        case .fetchedDatabaseChanges(let event):
            // New zones discovered or zones deleted on the server
            for modification in event.modifications {
                print("Zone modified: \(modification.zoneID)")
            }
            for deletion in event.deletions {
                print("Zone deleted: \(deletion.zoneID)")
                // Remove local data for this zone
            }

        case .fetchedRecordZoneChanges(let event):
            handleFetchedChanges(event)

        case .sentDatabaseChanges(let event):
            // Confirmation that zone creates/deletes were sent
            for saved in event.savedZones {
                print("Zone saved to server: \(saved.zoneID)")
            }

        case .sentRecordZoneChanges(let event):
            handleSentChanges(event)

        case .willFetchChanges:
            // Prepare for incoming changes (e.g., show sync indicator)
            break

        case .didFetchChanges:
            // All fetched changes have been processed
            break

        case .willSendChanges:
            break

        case .didSendChanges:
            break

        @unknown default:
            break
        }
    }

    // Called when the engine needs the next batch of records to send
    func nextRecordZoneChangeBatch(
        _ context: CKSyncEngine.SendChangesContext,
        syncEngine: CKSyncEngine
    ) async -> CKSyncEngine.RecordZoneChangeBatch? {
        // Get pending changes from the engine's state
        let pendingChanges = syncEngine.state.pendingRecordZoneChanges

        // Build a batch from your local data
        let batch = await CKSyncEngine.RecordZoneChangeBatch(pendingChanges: pendingChanges) { recordID in
            // Return the CKRecord for this ID from your local store
            return self.buildRecord(for: recordID)
        }

        return batch
    }

    // MARK: - Handling Fetched Changes

    private func handleFetchedChanges(_ event: CKSyncEngine.Event.FetchedRecordZoneChanges) {
        // Process modifications (inserts and updates from the server)
        for modification in event.modifications {
            let record = modification.record
            // Upsert into your local store
            saveLocally(record)
            print("Fetched: \(record.recordType) - \(record.recordID.recordName)")
        }

        // Process deletions
        for deletion in event.deletions {
            deleteLocally(recordID: deletion.recordID)
            print("Deleted remotely: \(deletion.recordID.recordName)")
        }
    }

    // MARK: - Handling Sent Changes and Conflicts

    private func handleSentChanges(_ event: CKSyncEngine.Event.SentRecordZoneChanges) {
        // Records successfully saved to the server
        for saved in event.savedRecords {
            // Update local store with server-assigned system fields
            updateLocalSystemFields(saved)
            print("Sent to server: \(saved.recordID.recordName)")
        }

        // Records that failed to save
        for failed in event.failedRecordSaves {
            let recordID = failed.record.recordID

            switch failed.error.code {
            case .serverRecordChanged:
                // CONFLICT: The server has a newer version
                // Resolve by merging or choosing server/client wins
                if let serverRecord = failed.error.serverRecord {
                    resolveConflict(
                        clientRecord: failed.record,
                        serverRecord: serverRecord
                    )
                }

            case .zoneNotFound:
                // Zone doesn't exist yet; the engine will auto-create it on next sync
                break

            case .unknownItem:
                // Record was already deleted on the server
                deleteLocally(recordID: recordID)

            default:
                print("Failed to save \(recordID): \(failed.error)")
            }
        }

        // Deletions confirmed
        for deletedID in event.deletedRecordIDs {
            print("Server confirmed deletion: \(deletedID.recordName)")
        }
    }

    // MARK: - Conflict Resolution

    private func resolveConflict(clientRecord: CKRecord, serverRecord: CKRecord) {
        // Strategy: merge non-conflicting fields, server wins for conflicts
        let mergedRecord = serverRecord

        // Example: merge by taking the latest modification date per field
        // Or implement custom logic per record type
        if let clientModified = clientRecord.modificationDate,
           let serverModified = serverRecord.modificationDate,
           clientModified > serverModified {
            // Client is newer for this field — apply client changes
            for key in clientRecord.allKeys() {
                mergedRecord[key] = clientRecord[key]
            }
        }

        // Tell the engine to retry with the merged record
        syncEngine.state.add(pendingRecordZoneChanges: [
            .saveRecord(mergedRecord.recordID)
        ])
    }

    // MARK: - Account Changes

    private func handleAccountChange(_ event: CKSyncEngine.Event.AccountChange) {
        switch event.changeType {
        case .signIn:
            // User signed into iCloud — start syncing
            print("iCloud account signed in")

        case .switchAccounts:
            // Different iCloud account — clear local cache and re-sync
            clearLocalData()
            print("iCloud account switched")

        case .signOut:
            // User signed out — optionally keep local data or clear it
            print("iCloud account signed out")

        @unknown default:
            break
        }
    }

    // MARK: - Scheduling Sync

    func addPendingChange(recordID: CKRecord.ID) {
        // Tell the engine there's a local change to sync
        syncEngine.state.add(pendingRecordZoneChanges: [
            .saveRecord(recordID)
        ])
    }

    func addPendingDeletion(recordID: CKRecord.ID) {
        syncEngine.state.add(pendingRecordZoneChanges: [
            .deleteRecord(recordID)
        ])
    }

    // MARK: - State Persistence

    private static func saveSyncEngineState(_ state: CKSyncEngine.State.Serialization) {
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: "ckSyncEngineState")
        }
    }

    private static func loadSyncEngineState() -> CKSyncEngine.State.Serialization? {
        guard let data = UserDefaults.standard.data(forKey: "ckSyncEngineState") else { return nil }
        return try? JSONDecoder().decode(CKSyncEngine.State.Serialization.self, from: data)
    }

    // MARK: - Local Store Helpers (implement with your persistence layer)

    private func buildRecord(for recordID: CKRecord.ID) -> CKRecord? {
        // Fetch your local model and convert to CKRecord
        return nil
    }

    private func saveLocally(_ record: CKRecord) {
        // Insert or update in your local database (SwiftData, CoreData, etc.)
    }

    private func deleteLocally(recordID: CKRecord.ID) {
        // Delete from your local database
    }

    private func updateLocalSystemFields(_ record: CKRecord) {
        // Store the server's changeTag and other system fields locally
    }

    private func clearLocalData() {
        // Clear all local synced data on account switch
    }
}
```

### CKSystemSharingUIObserver

`CKSystemSharingUIObserver` provides modern observation of CloudKit sharing UI events, allowing your app to react when the system sharing controller saves a share or encounters an error.

```swift
import CloudKit

class SharingManager {
    private var sharingObserver: CKSystemSharingUIObserver?

    func observeSharingUI(for container: CKContainer) {
        sharingObserver = CKSystemSharingUIObserver(container)

        // Observe when a share is saved from the system UI
        sharingObserver?.systemSharingUIDidSaveShareBlock = { recordID, result in
            switch result {
            case .success(let share):
                print("Share saved: \(share.url?.absoluteString ?? "no URL")")
                // Update your UI to reflect the share
            case .failure(let error):
                print("Share save failed: \(error)")
            }
        }

        // Observe when a share is stopped from the system UI
        sharingObserver?.systemSharingUIDidStopSharingBlock = { recordID, result in
            switch result {
            case .success:
                print("Sharing stopped for record: \(recordID)")
                // Update your UI to remove sharing indicators
            case .failure(let error):
                print("Stop sharing failed: \(error)")
            }
        }
    }
}
```
