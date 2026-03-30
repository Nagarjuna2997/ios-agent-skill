# SwiftData

## @Model Macro and Schema Definition

```swift
import SwiftData

@Model
class Task {
    var id: UUID
    var title: String
    var notes: String
    var isCompleted: Bool
    var priority: Int
    var createdAt: Date
    var dueDate: Date?

    // Relationship
    var category: Category?
    var tags: [Tag]

    // Transient (not persisted)
    @Transient var isSelected = false

    // Unique constraint
    #Unique<Task>([\.id])

    init(title: String, priority: Int = 0) {
        self.id = UUID()
        self.title = title
        self.notes = ""
        self.isCompleted = false
        self.priority = priority
        self.createdAt = Date()
        self.tags = []
    }
}

@Model
class Category {
    var id: UUID
    var name: String
    var color: String

    // Inverse relationship with cascade delete
    @Relationship(deleteRule: .cascade, inverse: \Task.category)
    var tasks: [Task]

    init(name: String, color: String = "blue") {
        self.id = UUID()
        self.name = name
        self.color = color
        self.tasks = []
    }
}

@Model
class Tag {
    var id: UUID
    var name: String

    @Relationship(inverse: \Task.tags)
    var tasks: [Task]

    init(name: String) {
        self.id = UUID()
        self.name = name
        self.tasks = []
    }
}
```

## ModelContainer and ModelContext

```swift
// App setup
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Task.self, Category.self, Tag.self])
    }
}

// Custom configuration
@main
struct MyApp: App {
    let container: ModelContainer

    init() {
        let schema = Schema([Task.self, Category.self, Tag.self])
        let config = ModelConfiguration(
            "MyApp",
            schema: schema,
            isStoredInMemoryOnly: false,
            allowsSave: true,
            groupContainer: .identifier("group.com.myapp.shared")
        )
        do {
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(container)
    }
}

// Using ModelContext directly
struct TaskListView: View {
    @Environment(\.modelContext) private var modelContext

    func addTask(title: String) {
        let task = Task(title: title)
        modelContext.insert(task)
        // SwiftData auto-saves; explicit save if needed:
        // try? modelContext.save()
    }

    func deleteTask(_ task: Task) {
        modelContext.delete(task)
    }
}
```

## @Query for Fetching

```swift
struct TaskListView: View {
    // Basic query with sort
    @Query(sort: \Task.createdAt, order: .reverse)
    private var tasks: [Task]

    // Filtered and sorted query
    @Query(
        filter: #Predicate<Task> { !$0.isCompleted },
        sort: [
            SortDescriptor(\Task.priority, order: .reverse),
            SortDescriptor(\Task.createdAt, order: .reverse),
        ],
        animation: .default
    )
    private var pendingTasks: [Task]

    var body: some View {
        List(pendingTasks) { task in
            TaskRow(task: task)
        }
    }
}

// Dynamic query with init parameter
struct FilteredTaskList: View {
    @Query private var tasks: [Task]

    init(showCompleted: Bool, searchText: String) {
        let filter = #Predicate<Task> { task in
            (showCompleted || !task.isCompleted) &&
            (searchText.isEmpty || task.title.localizedStandardContains(searchText))
        }
        _tasks = Query(
            filter: filter,
            sort: \Task.createdAt,
            order: .reverse
        )
    }

    var body: some View {
        List(tasks) { task in
            TaskRow(task: task)
        }
    }
}
```

## #Predicate Macro for Type-Safe Queries

```swift
// Simple predicate
let highPriority = #Predicate<Task> { $0.priority >= 2 }

// Compound predicate
let urgentIncomplete = #Predicate<Task> { task in
    !task.isCompleted && task.priority >= 2
}

// String search
let searchPredicate = #Predicate<Task> { task in
    task.title.localizedStandardContains("meeting")
}

// Date-based predicate
let today = Calendar.current.startOfDay(for: Date())
let dueTodayPredicate = #Predicate<Task> { task in
    if let dueDate = task.dueDate {
        return dueDate >= today
    }
    return false
}

// Using predicates with FetchDescriptor
func fetchOverdueTasks(context: ModelContext) throws -> [Task] {
    let now = Date()
    let descriptor = FetchDescriptor<Task>(
        predicate: #Predicate { task in
            !task.isCompleted && task.dueDate != nil && task.dueDate! < now
        },
        sortBy: [SortDescriptor(\.dueDate)]
    )
    return try context.fetch(descriptor)
}

// Fetch with limit
func fetchRecentTasks(context: ModelContext, limit: Int = 10) throws -> [Task] {
    var descriptor = FetchDescriptor<Task>(
        sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
    )
    descriptor.fetchLimit = limit
    return try context.fetch(descriptor)
}

// Count
func countIncompleteTasks(context: ModelContext) throws -> Int {
    let descriptor = FetchDescriptor<Task>(
        predicate: #Predicate { !$0.isCompleted }
    )
    return try context.fetchCount(descriptor)
}
```

## SortDescriptor

```swift
// Single sort
@Query(sort: \Task.title) private var tasks: [Task]

// Multiple sorts
@Query(sort: [
    SortDescriptor(\Task.isCompleted),
    SortDescriptor(\Task.priority, order: .reverse),
    SortDescriptor(\Task.createdAt, order: .reverse),
])
private var tasks: [Task]

// Dynamic sorting
struct SortableTaskList: View {
    @State private var sortOrder = [SortDescriptor(\Task.createdAt, order: .reverse)]

    var body: some View {
        TaskListContent(sort: sortOrder)
            .toolbar {
                Menu("Sort") {
                    Button("By Date") {
                        sortOrder = [SortDescriptor(\Task.createdAt, order: .reverse)]
                    }
                    Button("By Priority") {
                        sortOrder = [SortDescriptor(\Task.priority, order: .reverse)]
                    }
                    Button("By Title") {
                        sortOrder = [SortDescriptor(\Task.title)]
                    }
                }
            }
    }
}

struct TaskListContent: View {
    @Query private var tasks: [Task]

    init(sort: [SortDescriptor<Task>]) {
        _tasks = Query(sort: sort)
    }

    var body: some View {
        List(tasks) { task in
            TaskRow(task: task)
        }
    }
}
```

## Relationships and Cascade Rules

```swift
@Model
class Project {
    var name: String

    // Delete rule options: .cascade, .nullify, .deny, .noAction
    @Relationship(deleteRule: .cascade, inverse: \Milestone.project)
    var milestones: [Milestone]

    @Relationship(deleteRule: .nullify, inverse: \TeamMember.projects)
    var members: [TeamMember]

    init(name: String) {
        self.name = name
        self.milestones = []
        self.members = []
    }
}

@Model
class Milestone {
    var title: String
    var project: Project?

    init(title: String) {
        self.title = title
    }
}

@Model
class TeamMember {
    var name: String
    var projects: [Project] // Many-to-many

    init(name: String) {
        self.name = name
        self.projects = []
    }
}

// Working with relationships
func addMilestone(to project: Project, title: String, context: ModelContext) {
    let milestone = Milestone(title: title)
    milestone.project = project // Automatically updates project.milestones
}
```

## Migration with VersionedSchema

```swift
// Version 1
enum SchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)
    static var models: [any PersistentModel.Type] { [TaskV1.self] }

    @Model
    class TaskV1 {
        var id: UUID
        var title: String
        var isCompleted: Bool
        init(title: String) {
            self.id = UUID()
            self.title = title
            self.isCompleted = false
        }
    }
}

// Version 2 — adds priority field
enum SchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)
    static var models: [any PersistentModel.Type] { [TaskV2.self] }

    @Model
    class TaskV2 {
        var id: UUID
        var title: String
        var isCompleted: Bool
        var priority: Int // New field
        init(title: String, priority: Int = 0) {
            self.id = UUID()
            self.title = title
            self.isCompleted = false
            self.priority = priority
        }
    }
}

// Migration plan
enum TaskMigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] { [SchemaV1.self, SchemaV2.self] }

    static var stages: [MigrationStage] {
        [migrateV1toV2]
    }

    static let migrateV1toV2 = MigrationStage.lightweight(
        fromVersion: SchemaV1.self,
        toVersion: SchemaV2.self
    )
}

// Apply migration
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: SchemaV2.TaskV2.self, migrationPlan: TaskMigrationPlan.self)
    }
}
```

## SwiftData with CloudKit

```swift
// CloudKit-enabled container
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Task.self, Category.self]) {
            // Container is configured — CloudKit syncs automatically
            // when the app's CloudKit container is set in entitlements
        }
    }
}

// Requirements for CloudKit compatibility:
// 1. All properties must have default values or be optional
// 2. No unique constraints (CloudKit doesn't support them)
// 3. All relationships must be optional
// 4. Enable "CloudKit" capability in Xcode
// 5. Set the CloudKit container identifier in entitlements

@Model
class CloudTask {
    var id: UUID = UUID()
    var title: String = ""
    var isCompleted: Bool = false
    var priority: Int = 0
    var createdAt: Date = Date()

    // Optional relationship for CloudKit
    var category: CloudCategory?

    init(title: String) {
        self.title = title
    }
}
```
