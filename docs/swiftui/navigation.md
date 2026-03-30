# SwiftUI Navigation

Complete reference for NavigationStack, NavigationSplitView, sheets, alerts, tabs, deep linking, and programmatic navigation.

---

## NavigationStack

The primary navigation container (iOS 16+). Replaces the deprecated `NavigationView`.

```swift
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List(items) { item in
                NavigationLink(item.title) {
                    DetailView(item: item)
                }
            }
            .navigationTitle("Items")
            .navigationBarTitleDisplayMode(.large) // .inline, .large, .automatic
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add", systemImage: "plus") { addItem() }
                }
            }
        }
    }
}
```

### Value-Based NavigationLink with .navigationDestination

The preferred pattern -- decouples the link from its destination.

```swift
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("Show Profile", value: Route.profile("user-123"))
                NavigationLink("Settings", value: Route.settings)

                ForEach(items) { item in
                    NavigationLink(value: item) {
                        ItemRow(item: item)
                    }
                }
            }
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
            .navigationDestination(for: Route.self) { route in
                switch route {
                case .profile(let id):
                    ProfileView(userId: id)
                case .settings:
                    SettingsView()
                }
            }
        }
    }
}

enum Route: Hashable {
    case profile(String)
    case settings
    case detail(Item)
}
```

### NavigationPath (Programmatic Navigation)

A type-erased path that supports heterogeneous value types.

```swift
@Observable
class Router {
    var path = NavigationPath()

    func goToProfile(_ id: String) {
        path.append(Route.profile(id))
    }

    func goToDetail(_ item: Item) {
        path.append(item)
    }

    func popToRoot() {
        path = NavigationPath()
    }

    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }
}

struct AppView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    routeView(for: route)
                }
                .navigationDestination(for: Item.self) { item in
                    ItemDetailView(item: item)
                }
        }
        .environment(router)
    }

    @ViewBuilder
    func routeView(for route: Route) -> some View {
        switch route {
        case .profile(let id): ProfileView(userId: id)
        case .settings: SettingsView()
        case .detail(let item): ItemDetailView(item: item)
        }
    }
}

// Deep push from anywhere
struct SomeChildView: View {
    @Environment(Router.self) private var router

    var body: some View {
        Button("Go to Profile") {
            router.goToProfile("user-456")
        }
    }
}
```

### Typed path (homogeneous)

```swift
@State private var path: [Item] = []

NavigationStack(path: $path) {
    List(items) { item in
        NavigationLink(value: item) { Text(item.title) }
    }
    .navigationDestination(for: Item.self) { item in
        DetailView(item: item)
    }
}
```

---

## NavigationSplitView

Multi-column navigation for iPad and Mac. Falls back to stack on iPhone.

### Two-Column

```swift
struct TwoColumnView: View {
    @State private var selectedItem: Item?

    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(items, selection: $selectedItem) { item in
                NavigationLink(value: item) {
                    Text(item.title)
                }
            }
            .navigationTitle("Items")
        } detail: {
            if let item = selectedItem {
                ItemDetailView(item: item)
            } else {
                ContentUnavailableView("No Selection",
                    systemImage: "doc.text",
                    description: Text("Select an item from the sidebar"))
            }
        }
    }
}
```

### Three-Column

```swift
struct ThreeColumnView: View {
    @State private var selectedCategory: Category?
    @State private var selectedItem: Item?

    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(categories, selection: $selectedCategory) { cat in
                Label(cat.name, systemImage: cat.icon)
            }
            .navigationTitle("Categories")
        } content: {
            // Content list
            if let category = selectedCategory {
                List(category.items, selection: $selectedItem) { item in
                    Text(item.title)
                }
                .navigationTitle(category.name)
            }
        } detail: {
            // Detail
            if let item = selectedItem {
                ItemDetailView(item: item)
            } else {
                ContentUnavailableView.search
            }
        }
        .navigationSplitViewStyle(.balanced) // .balanced, .prominentDetail, .automatic
        .navigationSplitViewColumnWidth(min: 200, ideal: 250, max: 350)
    }
}
```

---

## Sheets, Full Screen Covers, and Popovers

### .sheet()

```swift
@State private var showSettings = false
@State private var selectedItem: Item?

var body: some View {
    VStack {
        Button("Settings") { showSettings = true }

        ForEach(items) { item in
            Button(item.title) { selectedItem = item }
        }
    }
    // Boolean-driven
    .sheet(isPresented: $showSettings) {
        SettingsView()
            .presentationDetents([.medium, .large])       // iOS 16+
            .presentationDragIndicator(.visible)
            .presentationCornerRadius(24)                  // iOS 16.4+
            .presentationBackground(.ultraThinMaterial)    // iOS 16.4+
            .interactiveDismissDisabled()                  // Prevent swipe dismiss
    }
    // Item-driven (auto-dismisses when nil)
    .sheet(item: $selectedItem) { item in
        ItemDetailView(item: item)
    }
}
```

### Presentation Detents (Bottom Sheet Sizes)

```swift
.sheet(isPresented: $showSheet) {
    SheetContent()
        .presentationDetents([.height(200), .medium, .large])
        .presentationDetents([.fraction(0.25), .medium])

        // Custom detent
        .presentationDetents([.custom(MyDetent.self)])
}

struct MyDetent: CustomPresentationDetent {
    static func height(in context: Context) -> CGFloat? {
        max(context.maxDetentValue * 0.3, 300)
    }
}
```

### .fullScreenCover()

```swift
@State private var showOnboarding = false

.fullScreenCover(isPresented: $showOnboarding) {
    OnboardingView()
}
```

### .popover()

```swift
@State private var showPopover = false

Button("Info") { showPopover = true }
    .popover(isPresented: $showPopover, arrowEdge: .top) {
        VStack {
            Text("Helpful info")
            Text("More details here")
        }
        .padding()
        .frame(minWidth: 200)
    }
```

---

## Alerts and Confirmation Dialogs

### .alert()

```swift
@State private var showAlert = false
@State private var error: AppError?

// Boolean-driven
.alert("Delete Item?", isPresented: $showAlert) {
    Button("Delete", role: .destructive) { deleteItem() }
    Button("Cancel", role: .cancel) { }
} message: {
    Text("This action cannot be undone.")
}

// Error-driven with item binding
.alert("Error", isPresented: .constant(error != nil), presenting: error) { _ in
    Button("Retry") { retry() }
    Button("OK", role: .cancel) { error = nil }
} message: { error in
    Text(error.localizedDescription)
}
```

### .confirmationDialog()

Action sheet style on iPhone, popover on iPad.

```swift
@State private var showDialog = false

.confirmationDialog("Sort By", isPresented: $showDialog, titleVisibility: .visible) {
    Button("Name") { sort = .name }
    Button("Date") { sort = .date }
    Button("Size") { sort = .size }
    Button("Cancel", role: .cancel) { }
} message: {
    Text("Choose how to sort your items")
}
```

---

## .inspector() (iOS 17+)

A trailing column overlay for supplementary content.

```swift
@State private var showInspector = false

NavigationStack {
    ContentView()
        .toolbar {
            Button("Inspector", systemImage: "info.circle") {
                showInspector.toggle()
            }
        }
        .inspector(isPresented: $showInspector) {
            InspectorView()
                .inspectorColumnWidth(min: 200, ideal: 300, max: 400)
        }
}
```

---

## TabView

### Basic TabView

```swift
struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(0)

            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(2)
                .badge(3)  // Notification badge
        }
    }
}
```

### TabView with Enum

```swift
enum AppTab: String, CaseIterable {
    case home, search, favorites, profile

    var title: String { rawValue.capitalized }
    var icon: String {
        switch self {
        case .home: "house"
        case .search: "magnifyingglass"
        case .favorites: "heart"
        case .profile: "person"
        }
    }
}

struct MainView: View {
    @State private var selectedTab: AppTab = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(AppTab.allCases, id: \.self) { tab in
                NavigationStack {
                    tabContent(for: tab)
                }
                .tabItem { Label(tab.title, systemImage: tab.icon) }
                .tag(tab)
            }
        }
    }
}
```

### iOS 18+ Tab API

```swift
TabView {
    Tab("Home", systemImage: "house") {
        HomeView()
    }

    Tab("Search", systemImage: "magnifyingglass") {
        SearchView()
    }

    TabSection("Library") {
        Tab("Favorites", systemImage: "heart") {
            FavoritesView()
        }
        Tab("Downloads", systemImage: "arrow.down.circle") {
            DownloadsView()
        }
    }

    Tab("Profile", systemImage: "person") {
        ProfileView()
    }
}
.tabViewStyle(.sidebarAdaptable) // Sidebar on iPad, tab bar on iPhone
```

---

## Deep Linking with URL Handling

```swift
@main
struct MyApp: App {
    @State private var router = Router()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(router)
                .onOpenURL { url in
                    router.handle(url)
                }
        }
    }
}

@Observable
class Router {
    var path = NavigationPath()
    var selectedTab: AppTab = .home

    func handle(_ url: URL) {
        // myapp://items/123
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else { return }

        path = NavigationPath() // Reset

        switch host {
        case "items":
            selectedTab = .home
            if let id = components.path.split(separator: "/").first.map(String.init) {
                path.append(Route.detail(id))
            }
        case "profile":
            selectedTab = .profile
        case "settings":
            selectedTab = .home
            path.append(Route.settings)
        default:
            break
        }
    }
}
```

**Info.plist URL scheme:**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>
```

---

## Toolbar and Navigation Bar Customization

```swift
.toolbar {
    // Placement options
    ToolbarItem(placement: .topBarLeading) {
        Button("Edit") { }
    }
    ToolbarItem(placement: .topBarTrailing) {
        Menu("Sort", systemImage: "arrow.up.arrow.down") {
            Button("Name") { }
            Button("Date") { }
        }
    }
    ToolbarItem(placement: .bottomBar) {
        Text("\(items.count) items")
    }
    ToolbarItem(placement: .primaryAction) {
        Button("Add", systemImage: "plus") { }
    }

    // Group multiple items
    ToolbarItemGroup(placement: .topBarTrailing) {
        Button("Filter", systemImage: "line.3.horizontal.decrease.circle") { }
        Button("Add", systemImage: "plus") { }
    }
}
.toolbarBackground(.visible, for: .navigationBar)
.toolbarBackground(.ultraThinMaterial, for: .navigationBar)
.toolbarColorScheme(.dark, for: .navigationBar)
.toolbarTitleDisplayMode(.inline)

// Searchable
.searchable(text: $searchText, prompt: "Search items")
.searchSuggestions {
    ForEach(suggestions) { suggestion in
        Text(suggestion.title)
            .searchCompletion(suggestion.title)
    }
}
.searchScopes($scope) {
    Text("All").tag(SearchScope.all)
    Text("Recent").tag(SearchScope.recent)
}
```

---

## Dismiss and Navigation Actions

```swift
struct SheetView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form { /* content */ }
                .navigationTitle("New Item")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Save") {
                            save()
                            dismiss()
                        }
                    }
                }
        }
    }
}
```

---

## Type-Safe Routing Pattern

```swift
enum Route: Hashable {
    case itemList(Category)
    case itemDetail(Item)
    case profile(userId: String)
    case settings
    case settingsDetail(SettingsSection)
}

@Observable
class Router {
    var path = NavigationPath()
    var sheet: Sheet?
    var alert: AlertItem?

    enum Sheet: Identifiable {
        case newItem
        case editItem(Item)
        var id: String {
            switch self {
            case .newItem: "newItem"
            case .editItem(let item): "edit-\(item.id)"
            }
        }
    }

    func push(_ route: Route) { path.append(route) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path = NavigationPath() }
    func present(_ sheet: Sheet) { self.sheet = sheet }
}

struct RootView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeScreen()
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                }
        }
        .sheet(item: $router.sheet) { sheet in
            sheetContent(for: sheet)
        }
        .environment(router)
    }

    @ViewBuilder
    func destination(for route: Route) -> some View {
        switch route {
        case .itemList(let category): ItemListView(category: category)
        case .itemDetail(let item): ItemDetailView(item: item)
        case .profile(let id): ProfileView(userId: id)
        case .settings: SettingsView()
        case .settingsDetail(let section): SettingsDetailView(section: section)
        }
    }

    @ViewBuilder
    func sheetContent(for sheet: Router.Sheet) -> some View {
        switch sheet {
        case .newItem: NewItemView()
        case .editItem(let item): EditItemView(item: item)
        }
    }
}
```
