# Core Data

## NSManagedObjectModel and .xcdatamodeld

Core Data uses an `.xcdatamodeld` file to define your schema visually in Xcode. Each entity maps to an `NSManagedObject` subclass.

```swift
// Auto-generated NSManagedObject subclass (Codegen: Class Definition)
// Or manually define with Codegen: Manual/None

import CoreData

@objc(Task)
public class Task: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var title: String
    @NSManaged public var isCompleted: Bool
    @NSManaged public var createdAt: Date
    @NSManaged public var priority: Int16
    @NSManaged public var category: Category? // Relationship
}

extension Task {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Task> {
        return NSFetchRequest<Task>(entityName: "Task")
    }

    var priorityLevel: Priority {
        get { Priority(rawValue: priority) ?? .medium }
        set { priority = newValue.rawValue }
    }
}

enum Priority: Int16 {
    case low = 0, medium = 1, high = 2
}
```

## Persistent Container Setup

```swift
class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "MyApp")

        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }

        container.loadPersistentStores { description, error in
            if let error = error as NSError? {
                fatalError("Core Data store failed: \(error), \(error.userInfo)")
            }
        }

        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }

    // Preview helper
    static var preview: PersistenceController = {
        let controller = PersistenceController(inMemory: true)
        let ctx = controller.container.viewContext
        for i in 0..<10 {
            let task = Task(context: ctx)
            task.id = UUID()
            task.title = "Sample Task \(i)"
            task.isCompleted = i.isMultiple(of: 3)
            task.createdAt = Date()
            task.priority = Int16(i % 3)
        }
        try? ctx.save()
        return controller
    }()
}

// Inject into SwiftUI
@main
struct MyApp: App {
    let persistence = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistence.container.viewContext)
        }
    }
}
```

## NSManagedObjectContext — View and Background

```swift
// View context (main thread) — for reads and light writes
let viewContext = PersistenceController.shared.container.viewContext

// Background context — for heavy operations
func importData(_ items: [ItemDTO]) async throws {
    let context = PersistenceController.shared.container.newBackgroundContext()
    context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

    try await context.perform {
        for dto in items {
            let task = Task(context: context)
            task.id = dto.id
            task.title = dto.title
            task.isCompleted = dto.completed
            task.createdAt = dto.createdAt
        }
        try context.save()
    }
}

// performBackgroundTask convenience
PersistenceController.shared.container.performBackgroundTask { context in
    // Already on a background queue
    let request = Task.fetchRequest()
    request.predicate = NSPredicate(format: "isCompleted == YES")
    if let completed = try? context.fetch(request) {
        completed.forEach { context.delete($0) }
        try? context.save()
    }
}
```

## NSFetchRequest and NSPredicate

```swift
// Basic fetch
let request = Task.fetchRequest()
request.sortDescriptors = [
    NSSortDescriptor(keyPath: \Task.priority, ascending: false),
    NSSortDescriptor(keyPath: \Task.createdAt, ascending: true),
]
let allTasks = try viewContext.fetch(request)

// Filtered fetch
request.predicate = NSPredicate(format: "isCompleted == %@ AND priority >= %d", NSNumber(value: false), 1)

// Compound predicates
let notCompleted = NSPredicate(format: "isCompleted == NO")
let highPriority = NSPredicate(format: "priority == %d", Priority.high.rawValue)
let searchPredicate = NSPredicate(format: "title CONTAINS[cd] %@", searchText)
request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [notCompleted, highPriority, searchPredicate])

// Fetch limit and batch size
request.fetchLimit = 20
request.fetchBatchSize = 50

// Count instead of fetching objects
let count = try viewContext.count(for: request)

// Fetch specific properties
request.propertiesToFetch = ["title", "priority"]
request.resultType = .dictionaryResultType

// SwiftUI @FetchRequest
struct TaskListView: View {
    @Environment(\.managedObjectContext) private var viewContext

    @FetchRequest(
        sortDescriptors: [SortDescriptor(\.createdAt, order: .reverse)],
        predicate: NSPredicate(format: "isCompleted == NO"),
        animation: .default
    )
    private var tasks: FetchedResults<Task>

    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRow(task: task)
            }
            .onDelete(perform: deleteTasks)
        }
    }

    private func deleteTasks(offsets: IndexSet) {
        offsets.map { tasks[$0] }.forEach(viewContext.delete)
        try? viewContext.save()
    }
}
```

## NSFetchedResultsController

```swift
// Used primarily in UIKit for efficient table/collection view updates
class TaskListViewController: UITableViewController, NSFetchedResultsControllerDelegate {

    private var fetchedResultsController: NSFetchedResultsController<Task>!

    override func viewDidLoad() {
        super.viewDidLoad()

        let request = Task.fetchRequest()
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \Task.priority, ascending: false),
            NSSortDescriptor(keyPath: \Task.title, ascending: true),
        ]
        request.predicate = NSPredicate(format: "isCompleted == NO")

        fetchedResultsController = NSFetchedResultsController(
            fetchRequest: request,
            managedObjectContext: PersistenceController.shared.container.viewContext,
            sectionNameKeyPath: "priority",
            cacheName: "taskCache"
        )
        fetchedResultsController.delegate = self
        try? fetchedResultsController.performFetch()
    }

    // Diffable data source integration
    func controller(
        _ controller: NSFetchedResultsController<NSFetchRequestResult>,
        didChangeContentWith snapshot: NSDiffableDataSourceSnapshotReference
    ) {
        let snapshot = snapshot as NSDiffableDataSourceSnapshot<String, NSManagedObjectID>
        dataSource.apply(snapshot, animatingDifferences: true)
    }
}
```

## Relationships

```swift
// One-to-Many: Category has many Tasks
@objc(Category)
public class Category: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var tasks: NSSet? // One-to-many (inverse of Task.category)
}

extension Category {
    var tasksArray: [Task] {
        let set = tasks as? Set<Task> ?? []
        return set.sorted { $0.createdAt < $1.createdAt }
    }

    @objc(addTasksObject:)
    @NSManaged public func addToTasks(_ value: Task)

    @objc(removeTasksObject:)
    @NSManaged public func removeFromTasks(_ value: Task)
}

// Creating with relationships
let category = Category(context: viewContext)
category.id = UUID()
category.name = "Work"

let task = Task(context: viewContext)
task.id = UUID()
task.title = "Prepare presentation"
task.category = category // Sets both sides with inverse relationship

try viewContext.save()

// Many-to-Many: Tasks can have many Tags, Tags can have many Tasks
// Define in .xcdatamodeld with inverse relationships on both sides
// Both sides generate NSSet properties
```

## Lightweight Migration

```swift
// Automatic lightweight migration (handles simple changes)
let description = NSPersistentStoreDescription()
description.shouldMigrateStoreAutomatically = true
description.shouldInferMappingModelAutomatically = true
container.persistentStoreDescriptions = [description]

// Supported lightweight migrations:
// - Adding a new attribute (with default value)
// - Removing an attribute
// - Renaming an attribute (set renaming identifier in model editor)
// - Adding a new entity
// - Adding/removing a relationship
// - Changing optional <-> non-optional (if default value set)
```

## Core Data with CloudKit

```swift
class CloudPersistenceController {
    static let shared = CloudPersistenceController()

    let container: NSPersistentCloudKitContainer

    init() {
        container = NSPersistentCloudKitContainer(name: "MyApp")

        // Configure for CloudKit sync
        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("No store description")
        }
        description.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
        description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(
            containerIdentifier: "iCloud.com.myapp.data"
        )

        container.loadPersistentStores { _, error in
            if let error { fatalError("CloudKit store failed: \(error)") }
        }

        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

        // Observe remote changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(storeRemoteChange),
            name: .NSPersistentStoreRemoteChange,
            object: container.persistentStoreCoordinator
        )
    }

    @objc private func storeRemoteChange(_ notification: Notification) {
        // Handle remote changes if needed
    }
}
```
