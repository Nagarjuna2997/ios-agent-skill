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
│  @MainActor @Observable final classes             │
│  Business logic; transforms Model data for display│
│  Holds `any Protocol` dependencies — never types  │
└───────────┬─────────────────────┬───────────────┘
            │ reads/writes        │ calls
┌───────────▼──────────┐ ┌───────▼───────────────┐
│    Model Layer        │ │   Service Layer        │
│  Data structures      │ │  Networking, Storage   │
│  Domain entities      │ │  Repositories (actors) │
│  Sendable value types │ │  Behind protocols      │
└──────────────────────┘ └────────────────────────┘
```

Two non-negotiables that make this MVVM rather than "a class with some state":

1. **Every view model is `@MainActor @Observable final class`.** UI state is
   main-actor state. See *ViewModel Isolation* below.
2. **Every dependency is a protocol existential injected through `init`**, with
   no default value that constructs a live implementation. See *Dependency
   Injection* below.

> **Naming warning:** never name a model type `Task`. It shadows
> `_Concurrency.Task`, so `Task { await … }` in the same file fails to compile
> with a confusing "extra trailing closure" error. This document uses `TodoItem`.

---

## Model Layer

Models are plain data types. They hold no business logic and no UI knowledge.
Mark them `Sendable` so they can cross actor boundaries without warnings.

```swift
// Domain model
struct TodoItem: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var notes: String
    var isCompleted: Bool
    var dueDate: Date?
    var priority: Priority
    let createdAt: Date

    enum Priority: String, Codable, CaseIterable, Sendable {
        case low, medium, high
    }
}

// DTO for API responses
struct TodoItemDTO: Decodable {
    let id: String
    let title: String
    let notes: String?
    let completed: Bool
    let dueDate: String?
    let priority: String
    let createdAt: String

    func toDomain() -> TodoItem {
        // ISO8601DateFormatter is expensive — reuse one instance, don't
        // allocate inside a map over hundreds of DTOs.
        let formatter = ISO8601DateFormatter.shared
        return TodoItem(
            id: UUID(uuidString: id) ?? UUID(),
            title: title,
            notes: notes ?? "",
            isCompleted: completed,
            dueDate: dueDate.flatMap(formatter.date(from:)),
            priority: TodoItem.Priority(rawValue: priority) ?? .medium,
            createdAt: createdAt.flatMap(formatter.date(from:)) ?? .now
        )
    }
}

extension ISO8601DateFormatter {
    static let shared = ISO8601DateFormatter()
}
```

The decoder should use `.keyDecodingStrategy = .convertFromSnakeCase` so the DTO
can use Swift-cased property names instead of `due_date`.

---

## ViewModel Layer

ViewModels use `@Observable` (iOS 17+) to publish state changes automatically.

```swift
import Observation

@MainActor
@Observable
final class TodoListViewModel {
    // MARK: - State
    // `private(set)` for anything the view only reads. If the view can write
    // it (a search field, a picker), leave it settable.
    private(set) var items: [TodoItem] = []
    private(set) var isLoading = false
    var searchText = ""
    var selectedFilter: TodoFilter = .all
    var error: AppError?

    // MARK: - Derived state
    // Computed properties are tracked automatically — no @Published equivalent
    // needed, and no manual invalidation.
    var filteredItems: [TodoItem] {
        var result = items
        if !searchText.isEmpty {
            result = result.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
        }
        switch selectedFilter {
        case .all: break
        case .active: result = result.filter { !$0.isCompleted }
        case .completed: result = result.filter(\.isCompleted)
        }
        return result.sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }
    }

    var completionRate: Double {
        guard !items.isEmpty else { return 0 }
        return Double(items.filter(\.isCompleted).count) / Double(items.count)
    }

    // MARK: - Dependencies
    // Protocol existential, injected. No default that builds a live repository.
    private let repository: any TodoRepository

    init(repository: any TodoRepository) {
        self.repository = repository
    }

    // MARK: - Actions

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            items = try await repository.fetchAll()
            error = nil
        } catch is CancellationError {
            // The view disappeared or the task was superseded — not a failure.
        } catch {
            self.error = AppError(from: error)
        }
    }

    func add(title: String, priority: TodoItem.Priority, dueDate: Date?) async {
        let item = TodoItem(
            id: UUID(), title: title, notes: "",
            isCompleted: false, dueDate: dueDate,
            priority: priority, createdAt: .now
        )

        items.append(item)                       // optimistic

        do {
            try await repository.save(item)
        } catch {
            items.removeAll { $0.id == item.id } // revert by identity, not index
            self.error = AppError(from: error)
        }
    }

    func toggleCompletion(for item: TodoItem) async {
        guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }
        items[index].isCompleted.toggle()
        let updated = items[index]

        do {
            try await repository.save(updated)
        } catch {
            // CRITICAL: `index` is stale after the await — the array may have
            // been reloaded, filtered, or reordered while the save was in
            // flight. Re-resolve by id before writing.
            guard let current = items.firstIndex(where: { $0.id == item.id }) else { return }
            items[current].isCompleted = item.isCompleted
            self.error = AppError(from: error)
        }
    }

    func delete(_ item: TodoItem) async {
        let backup = items
        items.removeAll { $0.id == item.id }

        do {
            try await repository.delete(item.id)
        } catch {
            items = backup
            self.error = AppError(from: error)
        }
    }
}

enum TodoFilter: String, CaseIterable {
    case all, active, completed
}
```

---

## ViewModel Isolation (`@MainActor`)

### Why every view model is `@MainActor`

`@Observable` does **not** make a type main-actor-isolated. Without `@MainActor`,
a view model is nonisolated: any background task can mutate its state
concurrently with SwiftUI reading it during layout. Under Swift 6 language mode
that is a compile error; under Swift 5 mode it is a data race that shows up as a
rare, unreproducible crash.

```swift
// WRONG — nonisolated observable state, mutated from a background context.
@Observable
final class FeedViewModel {
    var posts: [Post] = []

    func load() {
        Task.detached {                    // no actor context at all
            let fetched = try? await api.posts()
            self.posts = fetched ?? []     // data race with SwiftUI's read
        }
    }
}

// RIGHT — the whole type is main-actor-isolated.
@MainActor
@Observable
final class FeedViewModel {
    private(set) var posts: [Post] = []
    private let api: any PostService

    init(api: any PostService) { self.api = api }

    func load() async {
        // `api.posts()` suspends and runs its work off the main actor;
        // execution resumes here, back on the main actor, before the assignment.
        posts = (try? await api.posts()) ?? []
    }
}
```

**`@MainActor` does not mean "runs work on the main thread."** An `async`
function called from a main-actor context hops to whatever executor it needs
(`URLSession`, an actor, a global-executor task) and hops back at the `await`.
The main actor is only occupied while your own statements execute.

### Where the actual work runs

Put expensive work behind an `actor` or a `nonisolated` async function. Do not
"solve" a slow main actor by removing `@MainActor` from the view model.

```swift
actor ImageProcessor {
    func downsample(_ data: Data, to size: CGSize) throws -> UIImage { … }
}

@MainActor
@Observable
final class GalleryViewModel {
    private(set) var thumbnails: [UIImage] = []
    private let processor = ImageProcessor()

    func process(_ payloads: [Data]) async {
        // Runs on the ImageProcessor actor, not the main actor.
        var result: [UIImage] = []
        for payload in payloads {
            if let image = try? await processor.downsample(payload, to: .thumbnail) {
                result.append(image)
            }
        }
        thumbnails = result   // back on the main actor
    }
}
```

For CPU-bound work that touches no isolated state, mark the function
`nonisolated` so it can run off the main actor:

```swift
@MainActor
@Observable
final class ReportViewModel {
    private(set) var summary: Summary?

    // `nonisolated async` opts this function out of the main actor: its body
    // runs on the cooperative pool even though the type is @MainActor.
    nonisolated private static func computeSummary(from rows: [Row]) async -> Summary {
        Summary(rows: rows)   // pure, no isolated state touched
    }

    func build(from rows: [Row]) async {
        summary = await Self.computeSummary(from: rows)   // assignment is back on the main actor
    }
}
```

`Row` and `Summary` must be `Sendable` for this to compile without warnings —
which is the type system telling you the data really is safe to hand off.

### Re-entrancy: the trap `@MainActor` does *not* solve

Actor isolation guarantees mutual exclusion **between** suspension points, not
across them. Two overlapping calls to the same async method will interleave.

```swift
// WRONG — a fast second load can finish before a slow first one and be
// overwritten by stale data.
func load() async {
    isLoading = true
    items = try await repository.fetchAll()
    isLoading = false          // also: the first return clears the flag
}                              // while the second call is still running

// RIGHT — one in-flight task, and later callers await the same result.
@MainActor
@Observable
final class TodoListViewModel {
    private var loadTask: Task<Void, Never>?

    func load() async {
        loadTask?.cancel()
        let task = Task { await performLoad() }
        loadTask = task
        await task.value
    }

    private func performLoad() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let fetched = try await repository.fetchAll()
            try Task.checkCancellation()   // don't publish a superseded result
            items = fetched
        } catch is CancellationError {
            return
        } catch {
            self.error = AppError(from: error)
        }
    }
}
```

The simpler alternative, when the trigger is a view lifecycle event, is to let
SwiftUI own the cancellation with `.task(id:)` — see the View Layer below.

### `Task {}` vs `Task.detached {}` inside a view model

| Form | Inherits `@MainActor`? | Use for |
|------|------------------------|---------|
| `await someMethod()` | n/a — already isolated | Almost always. Prefer this. |
| `Task { … }` | **Yes** — inherits the enclosing actor | Fire-and-forget UI follow-up |
| `Task.detached { … }` | **No** — no actor, no priority, no task-locals | Almost never in app code |

`Task.detached` inside a `@MainActor` type is the single most common source of
isolation leaks. If you find yourself needing it, you almost certainly want a
`nonisolated` method or an `actor` instead.

---

## View Layer

Views are lightweight. They observe the ViewModel and delegate all logic to it.

```swift
struct TodoListView: View {
    @State private var viewModel: TodoListViewModel
    @State private var showAddSheet = false

    init(viewModel: TodoListViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.items.isEmpty {
                ProgressView("Loading…")
            } else if viewModel.filteredItems.isEmpty {
                ContentUnavailableView.search(text: viewModel.searchText)
            } else {
                itemList
            }
        }
        .navigationTitle("To-Do")
        .searchable(text: $viewModel.searchText, prompt: "Search")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Add", systemImage: "plus") { showAddSheet = true }
            }
            ToolbarItem(placement: .topBarLeading) { filterPicker }
        }
        .sheet(isPresented: $showAddSheet) {
            AddTodoView(viewModel: viewModel)
        }
        .alert(
            "Error",
            isPresented: Binding(
                get: { viewModel.error != nil },
                set: { if !$0 { viewModel.error = nil } }
            ),
            presenting: viewModel.error
        ) { _ in
            Button("OK", role: .cancel) {}
        } message: { error in
            Text(error.userMessage)
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    private var itemList: some View {
        List {
            ForEach(viewModel.filteredItems) { item in
                TodoRowView(item: item) {
                    Task { await viewModel.toggleCompletion(for: item) }
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                    Button(role: .destructive) {
                        Task { await viewModel.delete(item) }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
    }

    private var filterPicker: some View {
        Picker("Filter", selection: $viewModel.selectedFilter) {
            ForEach(TodoFilter.allCases, id: \.self) { filter in
                Text(filter.rawValue.capitalized).tag(filter)
            }
        }
        .pickerStyle(.segmented)
    }
}
```

`$viewModel.searchText` works because `@State` on an `@Observable` type provides
bindings directly. In a **child** view that receives the view model as a plain
parameter, you need `@Bindable` — see below.

### Child views and the observation traps

`@Observable` tracks at property granularity, but only for properties **read
during `body` evaluation**. Three consequences bite in practice.

**Trap 1 — passing the whole view model down invalidates the child on every
change.** A row that reads only `item.title` should receive the item, not the
view model.

```swift
// WRONG — TodoRowView re-renders whenever ANY property of the view model
// changes, including isLoading and searchText.
struct TodoRowView: View {
    let viewModel: TodoListViewModel
    let id: UUID
    var body: some View {
        Text(viewModel.items.first { $0.id == id }?.title ?? "")
    }
}

// RIGHT — pass the value the child actually renders, plus a closure for intent.
struct TodoRowView: View {
    let item: TodoItem
    let onToggle: () -> Void

    var body: some View {
        HStack {
            Button(action: onToggle) {
                Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.isCompleted ? .green : Color(.tertiaryLabel))
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .strikethrough(item.isCompleted)
                    .foregroundStyle(item.isCompleted ? Color(.secondaryLabel) : Color(.label))
                if let dueDate = item.dueDate {
                    Text(dueDate, style: .date)
                        .font(.caption)
                        .foregroundStyle(Color(.secondaryLabel))
                }
            }

            Spacer()
            PriorityBadge(priority: item.priority)
        }
        .contentShape(Rectangle())
    }
}
```

**Trap 2 — a child that receives an `@Observable` object as a parameter needs
`@Bindable` for `$` syntax, not `@State`.** Using `@State` in the child copies
the reference *once* and detaches it from the parent's replacements.

```swift
// WRONG — the child snapshots the object and ignores a later replacement.
struct AddTodoView: View {
    @State private var viewModel: TodoListViewModel
    init(viewModel: TodoListViewModel) { _viewModel = State(initialValue: viewModel) }
}

// RIGHT — the child borrows it and can still make bindings.
struct AddTodoView: View {
    @Bindable var viewModel: TodoListViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""           // draft state belongs to the view
    @State private var priority: TodoItem.Priority = .medium

    var body: some View {
        NavigationStack {
            Form {
                TextField("Title", text: $title)
                Picker("Priority", selection: $priority) {
                    ForEach(TodoItem.Priority.allCases, id: \.self) {
                        Text($0.rawValue.capitalized).tag($0)
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.add(title: title, priority: priority, dueDate: nil)
                            dismiss()
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
```

Note the draft `title` lives in `@State` on the view, **not** on the view model.
Transient input state that is discarded when the sheet closes is view state.

**Trap 3 — observation only sees reads that happen inside `body`.** Reading a
property in `onAppear`, in a `Task` closure, or in a helper that is not called
from `body` does not register a dependency, so the view will not update when it
changes.

```swift
// WRONG — `status` is read outside body; the view never refreshes.
struct StatusView: View {
    let monitor: ConnectionMonitor       // @Observable
    @State private var label = ""

    var body: some View {
        Text(label)
            .onAppear { label = monitor.status.description }   // read once
    }
}

// RIGHT — read it in body so the dependency is tracked.
struct StatusView: View {
    let monitor: ConnectionMonitor

    var body: some View {
        Text(monitor.status.description)
    }
}
```

### Async work belongs to the view's lifetime

```swift
// WRONG — an unstructured Task outlives the view and can write to a view model
// whose screen is gone.
.onAppear { Task { await viewModel.load() } }

// RIGHT — .task is cancelled automatically when the view disappears.
.task { await viewModel.load() }

// RIGHT — .task(id:) additionally cancels and restarts when the id changes,
// which is exactly the debounce/cancel behaviour a remote search field needs.
// (The list above filters in memory, so it needs no task at all.)
.task(id: searchViewModel.query) {
    try? await Task.sleep(for: .milliseconds(250))   // debounce
    await searchViewModel.runRemoteSearch()
}
```

Because `.task` cancels on disappear, every view model method it calls must
treat `CancellationError` as a non-error — which is why `load()` above catches
it separately.

---

## Dependency Injection

```swift
// Protocol-based DI. Sendable because it will be held by a @MainActor type
// and called across suspension points.
protocol TodoRepository: Sendable {
    func fetchAll() async throws -> [TodoItem]
    func save(_ item: TodoItem) async throws
    func delete(_ id: UUID) async throws
}

// Production implementation
struct RemoteTodoRepository: TodoRepository {
    private let apiClient: APIClient      // an actor
    private let cache: TodoCache          // an actor

    init(apiClient: APIClient, cache: TodoCache) {
        self.apiClient = apiClient
        self.cache = cache
    }

    func fetchAll() async throws -> [TodoItem] {
        let dtos: [TodoItemDTO] = try await apiClient.get("/todos")
        let items = dtos.map { $0.toDomain() }
        await cache.store(items)
        return items
    }

    func save(_ item: TodoItem) async throws {
        try await apiClient.post("/todos", body: item)
    }

    func delete(_ id: UUID) async throws {
        try await apiClient.delete("/todos/\(id)")
    }
}
```

### Never default a dependency to a live implementation

```swift
// WRONG — looks convenient, silently makes every forgotten injection hit the
// network, and makes it impossible to tell from a call site what a test is
// actually exercising.
init(repository: any TodoRepository = RemoteTodoRepository()) { … }

// RIGHT — required parameter. The composition root supplies it.
init(repository: any TodoRepository) { … }
```

### Test and preview doubles

Use a **reference type** for doubles you need to reconfigure after injection —
a struct is copied on injection, so mutating your local copy afterwards has no
effect on the view model's copy.

```swift
// An actor double is Sendable without any unchecked escape hatch.
actor FakeTodoRepository: TodoRepository {
    private(set) var savedItems: [TodoItem] = []
    private var items: [TodoItem]
    private var failure: (any Error)?

    init(items: [TodoItem] = .samples, failure: (any Error)? = nil) {
        self.items = items
        self.failure = failure
    }

    func setFailure(_ error: (any Error)?) { failure = error }

    func fetchAll() async throws -> [TodoItem] {
        if let failure { throw failure }
        return items
    }

    func save(_ item: TodoItem) async throws {
        if let failure { throw failure }
        savedItems.append(item)
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            items[index] = item
        } else {
            items.append(item)
        }
    }

    func delete(_ id: UUID) async throws {
        if let failure { throw failure }
        items.removeAll { $0.id == id }
    }
}

extension Array where Element == TodoItem {
    static var samples: [TodoItem] {
        [
            TodoItem(id: UUID(), title: "Buy groceries", notes: "", isCompleted: false,
                     dueDate: .now, priority: .medium, createdAt: .now),
            TodoItem(id: UUID(), title: "Read book", notes: "", isCompleted: true,
                     dueDate: nil, priority: .low, createdAt: .now)
        ]
    }
}

#Preview("Loaded") {
    NavigationStack {
        TodoListView(viewModel: TodoListViewModel(repository: FakeTodoRepository()))
    }
}

#Preview("Empty") {
    NavigationStack {
        TodoListView(viewModel: TodoListViewModel(repository: FakeTodoRepository(items: [])))
    }
}

#Preview("Offline") {
    NavigationStack {
        TodoListView(viewModel: TodoListViewModel(
            repository: FakeTodoRepository(failure: AppError.networkUnavailable)
        ))
    }
}
```

See `docs/testing/mocking-strategy.md` for the full three-tier double strategy.

---

## Testing Strategy

The view model is `@MainActor`, so the suite must be `@MainActor` too — otherwise
every property read needs its own `await` and the tests become unreadable.

```swift
import Testing

@MainActor
@Suite("TodoListViewModel")
struct TodoListViewModelTests {

    @Test("loads items from the repository")
    func load() async {
        let vm = TodoListViewModel(repository: FakeTodoRepository())

        await vm.load()

        #expect(vm.items.count == 2)
        #expect(vm.isLoading == false)
        #expect(vm.error == nil)
    }

    @Test("filters by search text")
    func searchFilter() async {
        let vm = TodoListViewModel(repository: FakeTodoRepository())
        await vm.load()

        vm.searchText = "groceries"

        #expect(vm.filteredItems.count == 1)
        #expect(vm.filteredItems.first?.title == "Buy groceries")
    }

    @Test("surfaces load failure")
    func loadFailure() async {
        let repo = FakeTodoRepository(failure: AppError.networkUnavailable)
        let vm = TodoListViewModel(repository: repo)

        await vm.load()

        #expect(vm.items.isEmpty)
        #expect(vm.error != nil)
    }

    @Test("toggleCompletion reverts on failure")
    func toggleRevert() async {
        // Reference-type double: reconfiguring it AFTER injection is visible to
        // the view model. A struct double would silently keep succeeding here.
        let repo = FakeTodoRepository()
        let vm = TodoListViewModel(repository: repo)
        await vm.load()
        await repo.setFailure(AppError.saveFailed)

        let item = vm.items[0]
        let original = item.isCompleted
        await vm.toggleCompletion(for: item)

        #expect(vm.items[0].isCompleted == original)
        #expect(vm.error != nil)
    }

    @Test("cancellation is not reported as an error")
    func cancellationIsSilent() async {
        let vm = TodoListViewModel(repository: FakeTodoRepository(failure: CancellationError()))

        await vm.load()

        #expect(vm.error == nil)
    }
}
```

---

## Anti-Patterns

```swift
// 1. Missing @MainActor on an @Observable view model.
@Observable final class VM { var items: [Item] = [] }        // data race
@MainActor @Observable final class VM { … }                  // correct

// 2. Hopping to the main thread by hand inside an already-isolated type.
DispatchQueue.main.async { self.items = fetched }            // obsolete
await MainActor.run { self.items = fetched }                 // redundant
items = fetched                                              // correct

// 3. Storing view-local transient state on the view model.
@Observable final class VM { var isSheetPresented = false }  // belongs in @State

// 4. Concrete dependencies, or dependencies with live defaults.
init(repository: RemoteTodoRepository = .init()) { … }        // untestable
init(repository: any TodoRepository) { … }                    // correct

// 5. Unstructured tasks that outlive the view.
.onAppear { Task { await vm.load() } }                        // leaks
.task { await vm.load() }                                     // cancels correctly

// 6. Writing through a stale index after an await.
items[index].isCompleted = false                              // index may be stale
guard let i = items.firstIndex(where: { $0.id == id }) else { return }

// 7. Task.detached inside a @MainActor type to "get off the main thread".
Task.detached { … }                                           // loses isolation
// Use a nonisolated method or an actor instead.

// 8. A model type named `Task`.
struct Task: Identifiable { … }                               // shadows Swift.Task
struct TodoItem: Identifiable { … }                           // correct
```

---

## Guidelines

| Concern | Belongs in |
|---------|-----------|
| Data structures, validation | Model |
| UI rendering, layout, transient input state | View (`@State`) |
| Business logic, screen state, formatting | ViewModel (`@MainActor @Observable`) |
| API calls, persistence, caching | Repository / Service (behind a protocol) |
| Expensive computation | `actor` or `nonisolated` function |
| Navigation decisions | View or Coordinator (`patterns/coordinator.md`) |
| Dependency wiring | Composition root (`patterns/clean-architecture.md`) |
