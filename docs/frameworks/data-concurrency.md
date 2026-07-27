# SwiftData and Core Data Concurrency

**Load this when:** importing or syncing data in the background, seeing
"context is not thread safe" or `Sendable` errors around a model type, writing
more than a few dozen objects at once, or a list stutters during a save.

`docs/frameworks/swiftdata.md` and `docs/frameworks/core-data.md` cover the APIs.
This document covers the single rule that both frameworks enforce and the
patterns that follow from it.

---

## The One Rule

**A managed object belongs to the context that fetched it, and that context
belongs to one actor. Never pass the object across a boundary — pass its ID.**

| Framework | Object | Context | Cross-boundary token |
|-----------|--------|---------|----------------------|
| SwiftData | `@Model` class | `ModelContext` | `PersistentIdentifier` |
| Core Data | `NSManagedObject` | `NSManagedObjectContext` | `NSManagedObjectID` |

`@Model` classes are **not** `Sendable`, and neither is `ModelContext`. Any code
that appears to move one between actors is either failing to compile under Swift 6
or silently corrupting the store under Swift 5.

```swift
// WRONG — hands a model object to another actor.
let trip = try context.fetch(descriptor).first!
await backgroundWorker.process(trip)          // Sendable error / crash

// RIGHT — hand over the identifier and re-fetch on the far side.
let id = trip.persistentModelID
await backgroundWorker.process(id)
```

---

## SwiftData

### The main-actor context

`@Environment(\.modelContext)` is main-actor-bound and backed by the container's
`mainContext`. Use it for everything the user directly touches: a tap that
toggles a flag, a form that inserts one record, a `@Query`-driven list.

```swift
struct TripList: View {
    @Query(sort: \Trip.startDate) private var trips: [Trip]
    @Environment(\.modelContext) private var context

    var body: some View {
        List(trips) { trip in
            TripRow(trip: trip)
                .swipeActions {
                    Button(role: .destructive) {
                        context.delete(trip)     // main actor, immediate, correct
                    } label: { Label("Delete", systemImage: "trash") }
                }
        }
    }
}
```

Do not move this work off the main actor. A single insert is microseconds; the
actor hop costs more than the save.

### `@ModelActor` for background work

Import a thousand records, run a migration, reconcile a sync — that belongs on
its own actor with its own context.

```swift
@ModelActor
actor DataImporter {
    /// The macro synthesizes `init(modelContainer:)` plus an isolated
    /// `modelContext` created for THIS actor. Never construct a context yourself.
    func importTrips(from payloads: [TripPayload]) throws {
        for (index, payload) in payloads.enumerated() {
            modelContext.insert(Trip(payload: payload))

            // Batch saves. Saving per-record is orders of magnitude slower;
            // never saving at all balloons memory until the loop ends.
            if index % 500 == 499 {
                try modelContext.save()
            }
        }
        try modelContext.save()
    }

    /// Returns IDs, not objects. The caller re-fetches on its own context.
    func staleTripIDs(before date: Date) throws -> [PersistentIdentifier] {
        let descriptor = FetchDescriptor<Trip>(
            predicate: #Predicate { $0.updatedAt < date }
        )
        return try modelContext.fetch(descriptor).map(\.persistentModelID)
    }
}
```

```swift
// Calling it — the container is Sendable, so it crosses freely.
@MainActor
@Observable
final class TripListModel {
    private let container: ModelContainer
    private(set) var isImporting = false

    init(container: ModelContainer) { self.container = container }

    func runImport(_ payloads: [TripPayload]) async {
        isImporting = true
        defer { isImporting = false }

        let importer = DataImporter(modelContainer: container)
        do {
            try await importer.importTrips(from: payloads)
            // @Query on the main context picks up the change automatically.
        } catch {
            // surface it
        }
    }
}
```

### Re-fetching by identifier

```swift
@ModelActor
actor TripEditor {
    func markComplete(_ id: PersistentIdentifier) throws {
        // `model(for:)` resolves an identifier against THIS actor's context.
        guard let trip = modelContext.model(for: id) as? Trip else { return }
        trip.isComplete = true
        try modelContext.save()
    }
}
```

`PersistentIdentifier` is `Sendable` and stable, which is exactly why it — and
not the object — is what crosses.

### Getting changes back to the UI

Two mechanisms, in order of preference:

1. **`@Query`.** A background save on a context from the same container
   propagates automatically. Nothing to write.
2. **Explicit re-fetch.** When you are not using `@Query`, re-fetch on the main
   context after the background actor finishes.

```swift
func refresh() {
    trips = (try? context.fetch(FetchDescriptor<Trip>(sort: [.init(\.startDate)]))) ?? []
}
```

Do **not** try to observe a background context's objects from the UI. They belong
to the other actor.

### Autosave

`ModelContainer` autosaves by default on the main context. For a background
importer, turn it off so your batching is the only thing writing:

```swift
let container = try ModelContainer(
    for: Trip.self,
    configurations: ModelConfiguration(isStoredInMemoryOnly: false)
)
container.mainContext.autosaveEnabled = true    // default; fine for UI edits
```

### SwiftData anti-patterns

```swift
// 1. Constructing a context by hand for background work.
let context = ModelContext(container)           // not actor-isolated — unsafe
Task.detached { context.insert(…) }
// Use @ModelActor.

// 2. Returning model objects from an actor.
func fetchTrips() -> [Trip] { … }               // Sendable violation
func fetchTripIDs() -> [PersistentIdentifier] { … }   // correct

// 3. Saving inside a tight loop.
for payload in payloads {
    context.insert(Trip(payload: payload))
    try context.save()                          // one transaction per record
}

// 4. Never saving.
for payload in tenThousandPayloads { context.insert(…) }
try context.save()                              // peak memory holds all 10k

// 5. Doing a large import on the main actor.
@MainActor func importAll() { … }               // freezes the UI

// 6. Storing a @Model object on an @Observable view model as source of truth.
@Observable final class VM { var trip: Trip }    // lifetime tied to a context
// Store the ID, or a Sendable value-type snapshot, and re-fetch.
```

---

## Core Data

### Context topology

```
NSPersistentContainer
├── viewContext          (main queue)   — UI reads, @FetchRequest
└── newBackgroundContext (private queue) — imports, batch work
```

```swift
final class PersistenceController {
    static let shared = PersistenceController()
    let container: NSPersistentContainer

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "Model")
        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }
        container.loadPersistentStores { _, error in
            if let error { fatalError("Store failed to load: \(error)") }
        }

        // Background saves merge into the UI context automatically.
        container.viewContext.automaticallyMergesChangesFromParent = true

        // Last write wins on a property-by-property basis. Choose deliberately:
        // this is correct for server-authoritative sync, wrong for local edits
        // the user expects to keep.
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        container.viewContext.undoManager = nil          // perf: UI contexts rarely need it
    }
}
```

### Background work

```swift
extension PersistenceController {
    /// `performBackgroundTask` gives you a context on its own private queue.
    /// The closure body is the ONLY place that context may be touched.
    func importTrips(_ payloads: [TripPayload]) async throws {
        try await container.performBackgroundTask { context in
            context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

            for (index, payload) in payloads.enumerated() {
                let trip = Trip(context: context)
                trip.id = payload.id
                trip.name = payload.name

                if index % 500 == 499 {
                    try context.save()
                    context.reset()          // release the object graph
                }
            }
            if context.hasChanges { try context.save() }
        }
    }
}
```

`context.reset()` after each batch is what keeps memory flat on a large import.
Without it the context retains every object it has ever materialised.

### Crossing the boundary with `NSManagedObjectID`

```swift
// Background -> main
let objectIDs: [NSManagedObjectID] = try await container.performBackgroundTask { context in
    try context.fetch(request).map(\.objectID)
}

await MainActor.run {
    let viewContext = container.viewContext
    let trips = objectIDs.compactMap { viewContext.object(with: $0) as? Trip }
    // safe: these belong to viewContext
}
```

Note `object(with:)` returns a fault and will throw if the row is gone; use
`existingObject(with:)` when the object may have been deleted.

### Batch operations skip the object graph entirely

For deletes and updates of many rows, `NSBatchDeleteRequest` /
`NSBatchUpdateRequest` execute in SQL and never materialise objects — orders of
magnitude faster. The cost is that in-memory contexts do not know, so you must
merge the changes yourself.

```swift
func deleteTrips(olderThan date: Date) async throws {
    try await container.performBackgroundTask { context in
        let fetch = NSFetchRequest<NSFetchRequestResult>(entityName: "Trip")
        fetch.predicate = NSPredicate(format: "updatedAt < %@", date as NSDate)

        let request = NSBatchDeleteRequest(fetchRequest: fetch)
        request.resultType = .resultTypeObjectIDs

        let result = try context.execute(request) as? NSBatchDeleteResult
        guard let ids = result?.result as? [NSManagedObjectID] else { return }

        // Without this the UI keeps showing deleted rows until relaunch.
        NSManagedObjectContext.mergeChanges(
            fromRemoteContextSave: [NSDeletedObjectsKey: ids],
            into: [self.container.viewContext]
        )
    }
}
```

### Core Data anti-patterns

```swift
// 1. Touching a context outside its queue.
let context = container.newBackgroundContext()
context.insert(obj)                              // wrong queue
context.perform { context.insert(obj) }           // correct

// 2. Passing NSManagedObject between queues.
DispatchQueue.main.async { label.text = trip.name }   // trip is not thread-safe
// Read the value inside perform, pass the String.

// 3. Saving viewContext for a large import — blocks the UI.
// 4. Deleting thousands of rows one at a time instead of NSBatchDeleteRequest.
// 5. Forgetting to merge batch-operation results into viewContext.
// 6. automaticallyMergesChangesFromParent left false, then wondering why the
//    UI does not update after a background save.
```

---

## Choosing a Strategy

| Situation | SwiftData | Core Data |
|-----------|-----------|-----------|
| One-off user edit | `@Environment(\.modelContext)` | `viewContext` |
| List display | `@Query` | `@FetchRequest` / `NSFetchedResultsController` |
| Import of 100+ records | `@ModelActor` | `performBackgroundTask` |
| Delete many rows | fetch IDs, delete on a `@ModelActor` | `NSBatchDeleteRequest` + merge |
| Cross-boundary reference | `PersistentIdentifier` | `NSManagedObjectID` |
| Conflict resolution | `ModelConfiguration` | `mergePolicy` |

---

## Testing

Use an in-memory store so tests are isolated and fast.

```swift
// SwiftData
@MainActor
@Suite("TripStore")
struct TripStoreTests {
    private func makeContainer() throws -> ModelContainer {
        try ModelContainer(
            for: Trip.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
    }

    @Test("import writes every record")
    func importAll() async throws {
        let container = try makeContainer()
        let importer = DataImporter(modelContainer: container)

        try await importer.importTrips(from: TripPayload.samples)

        let count = try container.mainContext.fetchCount(FetchDescriptor<Trip>())
        #expect(count == TripPayload.samples.count)
    }
}

// Core Data
let controller = PersistenceController(inMemory: true)
```

Previews get the same treatment — see the SwiftData preview container in
`docs/design/interaction-standards.md`.

---

## Checklist

- [ ] No `@Model` object or `NSManagedObject` crosses an actor or queue boundary.
- [ ] Background work uses `@ModelActor` (SwiftData) or `performBackgroundTask`
      (Core Data) — never a hand-rolled context on a detached task.
- [ ] Bulk writes save in batches (~500) rather than per-record or once at the end.
- [ ] Core Data: `automaticallyMergesChangesFromParent = true` on `viewContext`.
- [ ] Core Data: a deliberate `mergePolicy`, not the default error-on-conflict.
- [ ] Batch delete/update results are merged into `viewContext`.
- [ ] Actors return identifiers, never model objects.
- [ ] Tests and previews use an in-memory store.
