# MVVM Pattern (Model-View-ViewModel)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    View Layer                     │
│  SwiftUI Views observe ViewModel via @Observable  │
└───────────────────────┬─────────────────────────┘
                        │ binds to
┌───────────────────────▼─────────────────────────┐
│                 ViewModel Layer                   │
│  @Observable classes with business logic          │
│  Transforms Model data for display                │
└───────────┬─────────────────────┬───────────────┘
            │ reads/writes        │ calls
┌───────────▼──────────┐ ┌───────▼───────────────┐
│    Model Layer        │ │   Service Layer        │
│  Data structures      │ │  Networking, Storage   │
│  Domain entities      │ │  Repositories          │
└──────────────────────┘ └────────────────────────┘
```

---

## Model Layer

Models are plain data types. They hold no business logic and no UI knowledge.

```swift
// Domain model
struct Task: Identifiable, Codable, Hashable {
    let id: UUID
    var title: String
    var notes: String
    var isCompleted: Bool
    var dueDate: Date?
    var priority: Priority
    let createdAt: Date

    enum Priority: String, Codable, CaseIterable {
        case low, medium, high
    }
}

// DTO for API responses
struct TaskDTO: Decodable {
    let id: String
    let title: String
    let notes: String?
    let completed: Bool
    let due_date: String?
    let priority: String
    let created_at: String

    func toDomain() -> Task {
        Task(
            id: UUID(uuidString: id) ?? UUID(),
            title: title,
            notes: notes ?? "",
            isCompleted: completed,
            dueDate: ISO8601DateFormatter().date(from: due_date ?? ""),
            priority: Task.Priority(rawValue: priority) ?? .medium,
            createdAt: ISO8601DateFormatter().date(from: created_at) ?? .now
        )
    }
}
```

---

## ViewModel Layer

ViewModels use `@Observable` (iOS 17+) to publish state changes automatically.

```swift
import Observation

@Observable
class TaskListViewModel {
    // MARK: - Published state
    var tasks: [Task] = []
    var searchText = ""
    var selectedFilter: TaskFilter = .all
    var isLoading = false
    var error: AppError?
    var showError = false

    // MARK: - Computed properties
    var filteredTasks: [Task] {
        var result = tasks
        if !searchText.isEmpty {
            result = result.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
        }
        switch selectedFilter {
        case .all: break
        case .active: result = result.filter { !$0.isCompleted }
        case .completed: result = result.filter { $0.isCompleted }
        }
        return result.sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }
    }

    var completionRate: Double {
        guard !tasks.isEmpty else { return 0 }
        return Double(tasks.filter(\.isCompleted).count) / Double(tasks.count)
    }

    // MARK: - Dependencies
    private let repository: TaskRepositoryProtocol

    init(repository: TaskRepositoryProtocol = TaskRepository()) {
        self.repository = repository
    }

    // MARK: - Actions

    func loadTasks() async {
        isLoading = true
        defer { isLoading = false }

        do {
            tasks = try await repository.fetchAll()
        } catch {
            self.error = AppError(from: error)
            showError = true
        }
    }

    func addTask(title: String, priority: Task.Priority, dueDate: Date?) async {
        let task = Task(
            id: UUID(), title: title, notes: "",
            isCompleted: false, dueDate: dueDate,
            priority: priority, createdAt: .now
        )

        // Optimistic update
        tasks.append(task)

        do {
            try await repository.save(task)
        } catch {
            tasks.removeAll { $0.id == task.id }
            self.error = AppError(from: error)
            showError = true
        }
    }

    func toggleCompletion(for task: Task) async {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].isCompleted.toggle()

        do {
            try await repository.save(tasks[index])
        } catch {
            tasks[index].isCompleted.toggle() // Revert
        }
    }

    func deleteTask(_ task: Task) async {
        let backup = tasks
        tasks.removeAll { $0.id == task.id }

        do {
            try await repository.delete(task.id)
        } catch {
            tasks = backup // Revert
        }
    }
}

enum TaskFilter: String, CaseIterable {
    case all, active, completed
}
```

---

## View Layer

Views are lightweight. They observe the ViewModel and delegate all logic to it.

```swift
struct TaskListView: View {
    @State private var viewModel = TaskListViewModel()
    @State private var showAddSheet = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.tasks.isEmpty {
                    ProgressView("Loading tasks...")
                } else if viewModel.filteredTasks.isEmpty {
                    ContentUnavailableView.search(text: viewModel.searchText)
                } else {
                    taskList
                }
            }
            .navigationTitle("Tasks")
            .searchable(text: $viewModel.searchText, prompt: "Search tasks")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add", systemImage: "plus") { showAddSheet = true }
                }
                ToolbarItem(placement: .topBarLeading) {
                    filterPicker
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddTaskView(viewModel: viewModel)
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK") {}
            } message: {
                Text(viewModel.error?.userMessage ?? "Something went wrong")
            }
            .task { await viewModel.loadTasks() }
            .refreshable { await viewModel.loadTasks() }
        }
    }

    private var taskList: some View {
        List {
            ForEach(viewModel.filteredTasks) { task in
                TaskRowView(task: task) {
                    Task { await viewModel.toggleCompletion(for: task) }
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                    Button(role: .destructive) {
                        Task { await viewModel.deleteTask(task) }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
    }

    private var filterPicker: some View {
        Picker("Filter", selection: $viewModel.selectedFilter) {
            ForEach(TaskFilter.allCases, id: \.self) { filter in
                Text(filter.rawValue.capitalized).tag(filter)
            }
        }
        .pickerStyle(.segmented)
    }
}

struct TaskRowView: View {
    let task: Task
    let onToggle: () -> Void

    var body: some View {
        HStack {
            Button(action: onToggle) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(task.isCompleted ? .green : .secondary)
                    .font(.title3)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .strikethrough(task.isCompleted)
                    .foregroundStyle(task.isCompleted ? .secondary : .primary)
                if let dueDate = task.dueDate {
                    Text(dueDate, style: .date)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            PriorityBadge(priority: task.priority)
        }
        .contentShape(Rectangle())
    }
}
```

---

## Dependency Injection

```swift
// Protocol-based DI
protocol TaskRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [Task]
    func save(_ task: Task) async throws
    func delete(_ id: UUID) async throws
}

// Production implementation
struct TaskRepository: TaskRepositoryProtocol {
    private let apiClient: APIClient
    private let cache: TaskCache

    init(apiClient: APIClient = .shared, cache: TaskCache = .shared) {
        self.apiClient = apiClient
        self.cache = cache
    }

    func fetchAll() async throws -> [Task] {
        let dtos: [TaskDTO] = try await apiClient.get("/tasks")
        let tasks = dtos.map { $0.toDomain() }
        await cache.store(tasks)
        return tasks
    }

    func save(_ task: Task) async throws {
        try await apiClient.post("/tasks", body: task)
    }

    func delete(_ id: UUID) async throws {
        try await apiClient.delete("/tasks/\(id)")
    }
}

// Mock for testing and previews
struct MockTaskRepository: TaskRepositoryProtocol {
    var tasks: [Task] = Task.samples
    var shouldFail = false

    func fetchAll() async throws -> [Task] {
        if shouldFail { throw AppError.networkUnavailable }
        return tasks
    }

    func save(_ task: Task) async throws {
        if shouldFail { throw AppError.saveFailed }
    }

    func delete(_ id: UUID) async throws {
        if shouldFail { throw AppError.deleteFailed }
    }
}

// SwiftUI Preview usage
#Preview {
    TaskListView()
}
```

---

## Testing Strategy

```swift
import Testing

@Suite("TaskListViewModel Tests")
struct TaskListViewModelTests {

    @Test("loads tasks from repository")
    func loadTasks() async {
        let repo = MockTaskRepository(tasks: Task.samples)
        let vm = TaskListViewModel(repository: repo)

        await vm.loadTasks()

        #expect(vm.tasks.count == Task.samples.count)
        #expect(vm.isLoading == false)
    }

    @Test("filters tasks by search text")
    func searchFilter() async {
        let repo = MockTaskRepository(tasks: [
            Task(id: UUID(), title: "Buy groceries", notes: "", isCompleted: false, dueDate: nil, priority: .medium, createdAt: .now),
            Task(id: UUID(), title: "Read book", notes: "", isCompleted: false, dueDate: nil, priority: .low, createdAt: .now)
        ])
        let vm = TaskListViewModel(repository: repo)
        await vm.loadTasks()

        vm.searchText = "groceries"

        #expect(vm.filteredTasks.count == 1)
        #expect(vm.filteredTasks.first?.title == "Buy groceries")
    }

    @Test("handles load failure gracefully")
    func loadFailure() async {
        let repo = MockTaskRepository(shouldFail: true)
        let vm = TaskListViewModel(repository: repo)

        await vm.loadTasks()

        #expect(vm.tasks.isEmpty)
        #expect(vm.showError == true)
        #expect(vm.error != nil)
    }

    @Test("toggleCompletion reverts on failure")
    func toggleRevert() async {
        var repo = MockTaskRepository(tasks: Task.samples)
        repo.shouldFail = true
        let vm = TaskListViewModel(repository: repo)
        await vm.loadTasks()
        repo.shouldFail = true

        let task = vm.tasks[0]
        let originalState = task.isCompleted
        await vm.toggleCompletion(for: task)

        #expect(vm.tasks[0].isCompleted == originalState)
    }
}
```

---

## Guidelines

| Concern | Belongs in |
|---------|-----------|
| Data structures, validation | Model |
| UI rendering, layout | View |
| Business logic, state, formatting | ViewModel |
| API calls, persistence | Repository / Service |
| Navigation decisions | View or Coordinator |
