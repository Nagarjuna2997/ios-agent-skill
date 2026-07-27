# SwiftUI State and Data Flow

Complete reference for property wrappers, the Observation framework, and data flow patterns.

---

## @State

Owns mutable state local to a view. SwiftUI manages storage; the view re-renders when the value changes.

```swift
struct CounterView: View {
    @State private var count = 0
    @State private var items: [String] = []

    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
            Button("Add Item") { items.append("Item \(items.count)") }
        }
    }
}
```

**Rules:**
- Always mark `@State` properties `private`.
- Do not initialize `@State` from an initializer parameter when the view may be recreated -- use `@Binding` or a model instead.
- Works with value types (structs, enums, primitives) and, on iOS 17+, with `@Observable` classes.

---

## @Binding

A two-way reference to state owned by a parent view. Does not own the data.

```swift
struct ToggleRow: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        Toggle(title, isOn: $isOn)
    }
}

struct SettingsView: View {
    @State private var wifiEnabled = true

    var body: some View {
        ToggleRow(title: "Wi-Fi", isOn: $wifiEnabled)
    }
}
```

**Constant binding (for previews or tests):**

```swift
ToggleRow(title: "Preview", isOn: .constant(true))
```

**Custom binding:**

```swift
let binding = Binding<Bool>(
    get: { preferences.isDarkMode },
    set: { preferences.isDarkMode = $0 }
)
Toggle("Dark Mode", isOn: binding)
```

---

## @Observable (iOS 17+, Observation Framework)

**The Observation framework is the default for all new code.** `ObservableObject`
+ `@Published` is legacy: it is coarser (any published change invalidates every
observing view), it needs a wrapper on every property, and it forces
`@StateObject`/`@ObservedObject` distinctions that `@State` handles on its own.
Use it only when you must support iOS 16 or earlier, or when integrating with an
existing Combine pipeline — and label those as legacy where they appear.

Every sample in this document uses `@Observable` with `@MainActor` on any type
the UI renders. That pairing is not stylistic: see *@Observable and Actor
Isolation* below for why the annotation is required rather than optional.

```swift
import Observation

@Observable
class UserProfile {
    var name = ""
    var email = ""
    var avatarURL: URL?

    // Computed properties are automatically tracked
    var isComplete: Bool {
        !name.isEmpty && !email.isEmpty
    }
}

struct ProfileView: View {
    // Just use @State for owned observable objects
    @State private var profile = UserProfile()

    var body: some View {
        Form {
            TextField("Name", text: $profile.name)
            TextField("Email", text: $profile.email)
            if profile.isComplete {
                Text("Profile complete!")
            }
        }
    }
}

// Pass to child views as plain parameters -- no wrapper needed
struct ProfileHeader: View {
    var profile: UserProfile  // Automatically tracks changes

    var body: some View {
        Text(profile.name)
    }
}
```

**Key advantages over ObservableObject:**
- Fine-grained tracking: only properties actually read by a view trigger re-renders.
- No need for `@Published` on every property.
- Child views do not need `@ObservedObject` -- just accept as a regular parameter.
- Works with `@State` for ownership.

---

## @Observable and Actor Isolation

`@Observable` is **not** an isolation annotation. It generates observation
plumbing and nothing else. An `@Observable` class with no other annotation is
`nonisolated`, which means any task on any thread may mutate it while SwiftUI is
reading it during layout.

```swift
// WRONG -- nonisolated observable state mutated from a background task.
@Observable
final class SearchModel {
    var results: [Result] = []

    func search(_ query: String) {
        Task.detached {
            let found = await api.search(query)
            self.results = found        // races with SwiftUI's read of `results`
        }
    }
}

// RIGHT -- isolate the whole type to the main actor.
@MainActor
@Observable
final class SearchModel {
    private(set) var results: [Result] = []
    private let api: any SearchService

    init(api: any SearchService) { self.api = api }

    func search(_ query: String) async {
        results = await api.search(query)   // resumes on the main actor
    }
}
```

**Rule: any `@Observable` type that a view renders is `@MainActor`.** Under
Swift 6 language mode the compiler enforces this; under Swift 5 mode it is a
silent data race.

Isolating the type costs nothing at runtime for UI work. `await api.search(query)`
still runs its network work off the main actor -- the main actor is occupied only
while your own statements execute, not across the suspension.

### Where the `@MainActor` goes

```swift
// Preferred -- one annotation, whole type isolated, no accidental gaps.
@MainActor @Observable final class ViewModel { … }

// Fragile -- per-member isolation leaves `items` nonisolated and mutable
// from anywhere, which is exactly the race you were trying to prevent.
@Observable final class ViewModel {
    var items: [Item] = []
    @MainActor func reload() async { … }
}
```

Mark the type `final` as well: `@Observable` on a non-final class allows a
subclass to add unobserved stored properties, and it costs a dynamic dispatch on
every access.

### Observable models that are not view models

A shared `@Observable` model touched from background work should be an `actor`
that publishes to a `@MainActor` projection, not a nonisolated observable:

```swift
actor SyncEngine {
    func pendingCount() async -> Int { … }
}

@MainActor
@Observable
final class SyncStatusModel {
    private(set) var pending = 0
    private let engine: SyncEngine

    init(engine: SyncEngine) { self.engine = engine }

    func refresh() async {
        pending = await engine.pendingCount()
    }
}
```

---

## Observation Traps in Child Views

`@Observable` tracks the properties a view reads **during `body` evaluation**.
Everything below follows from that one sentence.

### Trap 1: reads outside `body` are never tracked

```swift
// WRONG -- `status` is read in onAppear, so no dependency is registered and
// the label never updates when status changes.
struct StatusBadge: View {
    let monitor: ConnectionMonitor          // @Observable
    @State private var label = ""

    var body: some View {
        Text(label)
            .onAppear { label = monitor.status.description }
    }
}

// RIGHT -- read it in body.
struct StatusBadge: View {
    let monitor: ConnectionMonitor

    var body: some View {
        Text(monitor.status.description)
    }
}
```

The same applies to reads inside `Task { }` closures, gesture handlers, and any
helper method not called from `body`. If a view must react to a property it does
not render, observe it explicitly:

```swift
.onChange(of: monitor.status) { _, newValue in
    analytics.record(newValue)
}
```

### Trap 2: passing the whole model down over-invalidates the child

```swift
// WRONG -- CartBadge re-renders on EVERY change to the store, including
// unrelated properties like isLoading or searchText.
struct CartBadge: View {
    let store: AppStore
    var body: some View { Text("\(store.cart.count)") }
}

// RIGHT -- pass only the value the child renders.
struct CartBadge: View {
    let count: Int
    var body: some View { Text("\(count)") }
}
```

Fine-grained tracking works at the *property* level, not the *object* level: a
child that reads `store.cart` is invalidated by any write to `store.cart`, but a
child handed `count: Int` is invalidated only when that number actually changes.

### Trap 3: the wrong wrapper in the child detaches it from the parent

```swift
// WRONG -- @State in a child captures the object ONCE. If the parent later
// hands down a different instance, the child keeps rendering the old one.
struct DetailView: View {
    @State private var model: ItemModel
    init(model: ItemModel) { _model = State(initialValue: model) }
}

// RIGHT -- borrow it. Plain `let` for read-only, @Bindable when you need `$`.
struct DetailView: View {
    let model: ItemModel                    // read-only
}

struct EditView: View {
    @Bindable var model: ItemModel          // needs TextField bindings
}
```

| In the child you need to… | Use |
|---------------------------|-----|
| Read properties only | `let model: Model` |
| Create `$` bindings | `@Bindable var model: Model` |
| Own and create the object | `@State private var model = Model()` |
| Read it from far up the tree | `@Environment(Model.self) private var model` |

### Trap 4: mutating observable state during `body`

Writing to observed state while SwiftUI is evaluating `body` causes
"Modifying state during view update" warnings and undefined update behaviour.

```swift
// WRONG
var body: some View {
    if model.items.isEmpty { model.loadPlaceholder() }   // mutation during update
    return List(model.items) { … }
}

// RIGHT -- move it into a lifecycle modifier.
var body: some View {
    List(model.items) { … }
        .task { await model.loadIfNeeded() }
}
```

### Trap 5: a collection element replaced wholesale invalidates every row

```swift
// If `items` is [Item] (value type), replacing the array re-evaluates every row.
// For large lists where individual elements change frequently, make the element
// an @Observable reference type so only the changed row re-renders.
@Observable final class RowModel: Identifiable {
    let id: UUID
    var isFavorite: Bool
    init(id: UUID, isFavorite: Bool) { self.id = id; self.isFavorite = isFavorite }
}

struct FeedView: View {
    let rows: [RowModel]
    var body: some View {
        List(rows) { row in
            RowView(row: row)               // only the toggled row re-renders
        }
    }
}
```

This is a trade-off, not a rule: value-type elements are simpler and correct by
default. Reach for observable elements only when profiling shows list-wide
invalidation is the bottleneck.

---

## Async Boundaries in Views

### `.task` over `Task { }` in `onAppear`

```swift
// WRONG -- the task outlives the view. It keeps running after the screen is
// popped and can write to a model whose UI no longer exists.
.onAppear { Task { await model.load() } }

// RIGHT -- .task is bound to the view's lifetime and cancelled on disappear.
.task { await model.load() }

// RIGHT -- .task(id:) cancels and restarts when the id changes.
.task(id: selectedID) { await model.loadDetail(selectedID) }
```

Because `.task` cancels, every async method it calls must treat
`CancellationError` as a deliberate no-op rather than a user-facing failure:

```swift
func load() async {
    do {
        items = try await service.fetch()
    } catch is CancellationError {
        return                              // superseded or dismissed
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

### State written after an await may be stale

Actor isolation guarantees exclusivity *between* suspension points, not across
them. Anything you captured before an `await` may be out of date after it.

```swift
// WRONG -- `index` was computed before the await; the array may have been
// reloaded, filtered, or reordered in the meantime.
func toggle(at index: Int) async {
    let item = items[index]
    try? await service.save(item)
    items[index].isSynced = true            // may write to the wrong row -- or crash
}

// RIGHT -- re-resolve by identity after the await.
func toggle(id: UUID) async {
    guard let item = items.first(where: { $0.id == id }) else { return }
    try? await service.save(item)
    guard let index = items.firstIndex(where: { $0.id == id }) else { return }
    items[index].isSynced = true
}
```

### Overlapping calls need an explicit in-flight task

```swift
@MainActor
@Observable
final class FeedModel {
    private(set) var posts: [Post] = []
    private var loadTask: Task<Void, Never>?

    func load() async {
        loadTask?.cancel()                  // supersede the previous load
        let task = Task { await performLoad() }
        loadTask = task
        await task.value
    }

    private func performLoad() async {
        do {
            let fetched = try await service.posts()
            try Task.checkCancellation()    // don't publish a superseded result
            posts = fetched
        } catch {
            // handle
        }
    }
}
```

Without this, a slow first request can land *after* a fast second one and
overwrite fresh data with stale data -- a bug that only reproduces on bad
networks.

---

## @Bindable (iOS 17+)

Creates bindings to properties of an `@Observable` object that is not owned via `@State`.

```swift
struct EditProfileView: View {
    @Bindable var profile: UserProfile  // passed in, not owned

    var body: some View {
        Form {
            TextField("Name", text: $profile.name)
            TextField("Email", text: $profile.email)
        }
    }
}

// Parent
struct ParentView: View {
    @State private var profile = UserProfile()

    var body: some View {
        EditProfileView(profile: profile)
    }
}
```

Use `@Bindable` when you receive an `@Observable` object as a parameter and need `$` binding syntax.

---

## @ObservableObject and @Published (Legacy, pre-iOS 17)

```swift
class SettingsStore: ObservableObject {
    @Published var fontSize: Double = 14
    @Published var isDarkMode = false
    @Published var username = ""
}
```

### @StateObject vs @ObservedObject

```swift
struct ParentView: View {
    // @StateObject: OWNS the object. Created once, survives re-renders.
    @StateObject private var store = SettingsStore()

    var body: some View {
        ChildView(store: store)
    }
}

struct ChildView: View {
    // @ObservedObject: BORROWS the object. Does not own it.
    @ObservedObject var store: SettingsStore

    var body: some View {
        Text("Font: \(store.fontSize)")
    }
}
```

**Critical rule:** Use `@StateObject` for creation, `@ObservedObject` for injection. Using `@ObservedObject` for creation causes the object to be recreated on every parent re-render.

---

## @Environment

Reads values from the SwiftUI environment.

```swift
struct DetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.horizontalSizeClass) private var sizeClass
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.locale) private var locale
    @Environment(\.calendar) private var calendar
    @Environment(\.openURL) private var openURL
    @Environment(\.isSearching) private var isSearching
    @Environment(\.editMode) private var editMode

    var body: some View {
        VStack {
            Text(colorScheme == .dark ? "Dark Mode" : "Light Mode")
            Button("Done") { dismiss() }
            Button("Open Link") {
                openURL(URL(string: "https://apple.com")!)
            }
        }
    }
}
```

### Custom EnvironmentKey

```swift
// 1. Define the key
struct ThemeKey: EnvironmentKey {
    static let defaultValue = AppTheme.standard
}

// 2. Extend EnvironmentValues
extension EnvironmentValues {
    var theme: AppTheme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

// 3. Set in parent
ContentView()
    .environment(\.theme, AppTheme.premium)

// 4. Read in child
struct ThemedButton: View {
    @Environment(\.theme) private var theme

    var body: some View {
        Button("Action") { }
            .tint(theme.accentColor)
    }
}
```

### Environment with @Observable (iOS 17+)

```swift
@Observable
class AppSettings {
    var accentColor: Color = .blue
    var fontSize: Double = 16
}

// Inject via environment
ContentView()
    .environment(AppSettings())

// Read in any descendant
struct ChildView: View {
    @Environment(AppSettings.self) private var settings

    var body: some View {
        // For bindings, use @Bindable locally
        @Bindable var settings = settings
        Slider(value: $settings.fontSize, in: 12...24)
    }
}
```

---

## @EnvironmentObject (Legacy)

Injects an `ObservableObject` into the view hierarchy.

```swift
class AuthManager: ObservableObject {
    @Published var isLoggedIn = false
    @Published var currentUser: User?
}

// Inject at root
ContentView()
    .environmentObject(AuthManager())

// Read in any descendant
struct ProfileView: View {
    @EnvironmentObject var auth: AuthManager

    var body: some View {
        if let user = auth.currentUser {
            Text(user.name)
        }
    }
}
```

**Warning:** Crashes at runtime if the object is not provided in the hierarchy. Prefer `@Environment` with `@Observable` on iOS 17+.

---

## @AppStorage and @SceneStorage

### @AppStorage

Reads and writes to `UserDefaults`. The view updates when the value changes.

```swift
struct SettingsView: View {
    @AppStorage("username") private var username = "Guest"
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("fontSize") private var fontSize = 14.0
    @AppStorage("selectedTab") private var selectedTab = 0

    // Custom suite
    @AppStorage("token", store: UserDefaults(suiteName: "group.com.app.shared"))
    private var token = ""

    var body: some View {
        Form {
            TextField("Username", text: $username)
            Toggle("Dark Mode", isOn: $isDarkMode)
            Slider(value: $fontSize, in: 10...30)
        }
    }
}
```

**Supported types:** `Bool`, `Int`, `Double`, `String`, `URL`, `Data`, and `RawRepresentable` where `RawValue` is `Int` or `String`.

```swift
enum AppTab: String {
    case home, search, profile
}

@AppStorage("currentTab") private var currentTab: AppTab = .home
```

### @SceneStorage

Persists state per scene (restored after app relaunch). Ideal for scroll positions, selected tabs, draft text.

```swift
struct EditorView: View {
    @SceneStorage("draft") private var draft = ""
    @SceneStorage("scrollPosition") private var scrollPosition: String?

    var body: some View {
        TextEditor(text: $draft)
    }
}
```

---

## @Query (SwiftData Integration)

Fetches model objects from SwiftData and keeps the view updated.

```swift
import SwiftData

@Model
class Task {
    var title: String
    var isComplete: Bool
    var createdAt: Date

    init(title: String, isComplete: Bool = false) {
        self.title = title
        self.isComplete = isComplete
        self.createdAt = .now
    }
}

struct TaskListView: View {
    @Query(sort: \Task.createdAt, order: .reverse)
    private var tasks: [Task]

    // With filter
    @Query(filter: #Predicate<Task> { !$0.isComplete },
           sort: \Task.createdAt)
    private var pendingTasks: [Task]

    @Environment(\.modelContext) private var context

    var body: some View {
        List(tasks) { task in
            Text(task.title)
        }
    }
}

// Dynamic queries with init
struct FilteredTaskList: View {
    @Query private var tasks: [Task]

    init(showComplete: Bool) {
        let predicate = #Predicate<Task> { task in
            showComplete || !task.isComplete
        }
        _tasks = Query(filter: predicate, sort: \Task.createdAt)
    }

    var body: some View {
        List(tasks) { task in Text(task.title) }
    }
}
```

---

## Data Flow Patterns and Best Practices

### When to Use Which Property Wrapper

| Wrapper | Ownership | Use Case | iOS |
|---------|-----------|----------|-----|
| `@State` | Owns | Simple value types, local UI state | 13+ |
| `@State` + `@Observable` | Owns | Observable model created by this view | 17+ |
| `@Binding` | Borrows | Two-way reference to parent state | 13+ |
| `@Bindable` | Borrows | Bindings to Observable object properties | 17+ |
| `@Environment` | Reads | System or custom environment values | 13+ |
| `@Environment(Type.self)` | Reads | Observable objects via environment | 17+ |
| `@AppStorage` | Owns | UserDefaults-backed persistence | 14+ |
| `@SceneStorage` | Owns | Per-scene state restoration | 14+ |
| `@Query` | Reads | SwiftData model queries | 17+ |
| `@StateObject` | Owns | ObservableObject creation (legacy) | 14+ |
| `@ObservedObject` | Borrows | ObservableObject injection (legacy) | 13+ |
| `@EnvironmentObject` | Reads | ObservableObject via environment (legacy) | 13+ |

### Recommended Architecture (iOS 17+)

```swift
// Model layer -- isolated, final, protocol-injected.
@MainActor
@Observable
final class Store {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    var errorMessage: String?

    private let api: any ItemService

    init(api: any ItemService) { self.api = api }

    func fetchItems() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await api.getItems()
            errorMessage = nil
        } catch is CancellationError {
            return
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// App entry point
@main
struct MyApp: App {
    @State private var store = Store(api: LiveItemService())

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}

// Feature view
struct ItemListView: View {
    @Environment(Store.self) private var store

    var body: some View {
        List(store.items) { item in
            ItemRow(item: item)
        }
        .overlay {
            if store.isLoading {
                ProgressView()
            }
        }
        .task {
            await store.fetchItems()
        }
    }
}
```

### State Hoisting Pattern

Keep state at the lowest common ancestor that needs it.

```swift
// Parent owns the state
struct FilterableList: View {
    @State private var searchText = ""
    @State private var sortOrder: SortOrder = .name

    var body: some View {
        VStack {
            SearchBar(text: $searchText)           // Binding down
            SortPicker(selection: $sortOrder)       // Binding down
            ResultsList(query: searchText, sort: sortOrder)  // Values down
        }
    }
}
```

### Action Closure Pattern

Pass actions down instead of state up.

```swift
struct ItemRow: View {
    let item: Item
    let onDelete: () -> Void
    let onToggle: (Bool) -> Void

    var body: some View {
        HStack {
            Text(item.title)
            Spacer()
            Toggle("", isOn: Binding(
                get: { item.isComplete },
                set: { onToggle($0) }
            ))
        }
        .swipeActions {
            Button(role: .destructive) { onDelete() } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}
```

### Avoiding Common Pitfalls

```swift
// BAD: Creating @StateObject/@State Observable in a child view that gets recreated
struct ParentView: View {
    @State private var toggle = false
    var body: some View {
        VStack {
            ChildView()  // ChildView recreated when toggle changes
            Button("Toggle") { toggle.toggle() }
        }
    }
}

struct ChildView: View {
    // BAD with ObservableObject -- this resets on every parent re-render
    @ObservedObject var vm = ViewModel()
    // GOOD -- use @StateObject instead
    @StateObject private var vm = ViewModel()
}

// On iOS 17+, @State with @Observable handles this correctly:
struct ChildView: View {
    @State private var vm = ViewModel()  // Survives re-renders
}
```

### Property Wrapper Decision Checklist

Before writing any state declaration, answer these in order:

1. **Does this view create the value, or receive it?** Creates → `@State`.
   Receives → `@Binding` (value), `let` (read-only object), `@Bindable`
   (object you need `$` on), or `@Environment` (from far up the tree).
2. **Is it transient UI state (sheet flags, draft text, focus, scroll offset)?**
   → `@State` on the view. It does **not** belong on a view model.
3. **Is it screen state derived from data (loaded items, error, isLoading)?**
   → a `@MainActor @Observable` model owned by `@State` at the screen root.
4. **Is it app-wide (session, theme, feature flags)?** → `@Observable` injected
   with `.environment(_:)`, read with `@Environment(Type.self)`.
5. **Does it need to survive relaunch?** → `@AppStorage` (user preference) or
   `@SceneStorage` (per-scene restoration). Neither is a place for a model.
6. **Is it persisted model data?** → `@Query` with SwiftData.

### Anti-Patterns Summary

```swift
// 1. Observable model without isolation.
@Observable final class VM { var items: [Item] = [] }        // race
@MainActor @Observable final class VM { … }                  // correct

// 2. Non-final observable class -- allows unobserved subclass state.
@Observable class VM { }                                     // avoid
@Observable final class VM { }                               // correct

// 3. View-local transient state stored on the model.
@Observable final class VM { var showSheet = false }         // belongs in @State

// 4. @State in a child for an object the parent owns.
@State private var model: Model                              // detaches
@Bindable var model: Model                                   // correct

// 5. Reading observable properties outside body and expecting updates.
.onAppear { label = model.title }                            // never re-reads
Text(model.title)                                            // correct

// 6. Mutating observed state during body evaluation.
var body: some View { model.prepare(); return List(…) }      // warning + UB

// 7. Unstructured Task in onAppear instead of .task.
.onAppear { Task { await model.load() } }                    // leaks past dismissal

// 8. Hand-rolled main-thread hops inside an already-isolated type.
DispatchQueue.main.async { self.items = new }                // obsolete
await MainActor.run { self.items = new }                     // redundant
items = new                                                  // correct

// 9. @EnvironmentObject / @ObservedObject in new iOS 17+ code.
@EnvironmentObject var auth: AuthManager                     // legacy, crashes if unset
@Environment(AuthManager.self) private var auth              // correct
```
