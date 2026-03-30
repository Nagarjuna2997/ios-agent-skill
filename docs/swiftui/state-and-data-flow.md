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

The modern way to create observable data models. Replaces `ObservableObject` and `@Published`.

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
// Model layer
@Observable
class Store {
    var items: [Item] = []
    var isLoading = false
    var errorMessage: String?

    func fetchItems() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await api.getItems()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// App entry point
@main
struct MyApp: App {
    @State private var store = Store()

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
