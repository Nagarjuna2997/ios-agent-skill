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

---

## iOS 18 Zoom Navigation Transitions

iOS 18 introduces the `NavigationTransition` protocol and built-in zoom transitions that create fluid, context-preserving animations between source and destination views. This replaces many custom `matchedGeometryEffect` patterns for navigation-based hero animations.

### Core Concepts

The zoom transition system has three parts:

1. **`.navigationTransition(.zoom(sourceID:in:))`** -- applied to the destination view to define how it animates in.
2. **`.matchedTransitionSource(id:in:)`** -- applied to the source view (a grid cell, list row, etc.) to mark the origin of the zoom.
3. **`@Namespace`** -- a shared namespace that links the source and destination together.

Unlike `matchedGeometryEffect`, which requires manual `ZStack` layering and conditional rendering, zoom navigation transitions work directly with `NavigationStack` and `NavigationLink`. The system handles the interpolation between source and destination frames automatically.

### Basic Usage

```swift
struct PhotoGridView: View {
    @Namespace private var zoomTransition

    let photos: [Photo]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: 2)], spacing: 2) {
                    ForEach(photos) { photo in
                        NavigationLink(value: photo) {
                            AsyncImage(url: photo.thumbnailURL) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Color.gray.opacity(0.3)
                            }
                            .frame(minHeight: 100)
                            .clipped()
                        }
                        .matchedTransitionSource(id: photo.id, in: zoomTransition)
                    }
                }
            }
            .navigationTitle("Photos")
            .navigationDestination(for: Photo.self) { photo in
                PhotoDetailView(photo: photo)
                    .navigationTransition(.zoom(sourceID: photo.id, in: zoomTransition))
            }
        }
    }
}
```

### Complete Example: Photo Grid with Zoom Transition

```swift
import SwiftUI

struct Photo: Identifiable, Hashable {
    let id: UUID
    let imageName: String
    let title: String
    let date: Date
}

struct PhotoGalleryView: View {
    @Namespace private var zoomNamespace

    let photos: [Photo] = [
        Photo(id: UUID(), imageName: "photo1", title: "Sunset", date: .now),
        Photo(id: UUID(), imageName: "photo2", title: "Mountain", date: .now),
        Photo(id: UUID(), imageName: "photo3", title: "Ocean", date: .now),
        Photo(id: UUID(), imageName: "photo4", title: "Forest", date: .now),
        Photo(id: UUID(), imageName: "photo5", title: "City", date: .now),
        Photo(id: UUID(), imageName: "photo6", title: "Desert", date: .now),
    ]

    private let columns = [
        GridItem(.adaptive(minimum: 120), spacing: 4)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 4) {
                    ForEach(photos) { photo in
                        NavigationLink(value: photo) {
                            PhotoThumbnail(photo: photo)
                        }
                        .buttonStyle(.plain)
                        .matchedTransitionSource(id: photo.id, in: zoomNamespace)
                    }
                }
                .padding(4)
            }
            .navigationTitle("Gallery")
            .navigationDestination(for: Photo.self) { photo in
                PhotoDetailView(photo: photo)
                    .navigationTransition(.zoom(sourceID: photo.id, in: zoomNamespace))
            }
        }
    }
}

struct PhotoThumbnail: View {
    let photo: Photo

    var body: some View {
        Image(photo.imageName)
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(minHeight: 120)
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct PhotoDetailView: View {
    let photo: Photo

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Image(photo.imageName)
                    .resizable()
                    .aspectRatio(contentMode: .fit)

                VStack(alignment: .leading, spacing: 8) {
                    Text(photo.title)
                        .font(.title)
                        .fontWeight(.bold)

                    Text(photo.date, style: .date)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)

                Spacer()
            }
        }
        .navigationTitle(photo.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

### Using Zoom Transitions with Lists

Zoom transitions also work with `List` rows:

```swift
struct ItemListView: View {
    @Namespace private var listZoom

    let items: [Item]

    var body: some View {
        NavigationStack {
            List(items) { item in
                NavigationLink(value: item) {
                    HStack {
                        Image(systemName: item.icon)
                            .font(.title2)
                            .frame(width: 44, height: 44)
                            .background(.blue.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))

                        VStack(alignment: .leading) {
                            Text(item.title)
                                .font(.headline)
                            Text(item.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .matchedTransitionSource(id: item.id, in: listZoom)
            }
            .navigationTitle("Items")
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
                    .navigationTransition(.zoom(sourceID: item.id, in: listZoom))
            }
        }
    }
}
```

### Customizing the Transition Source Appearance

You can style the matched transition source with a clip shape and additional modifiers:

```swift
NavigationLink(value: photo) {
    PhotoThumbnail(photo: photo)
}
.matchedTransitionSource(id: photo.id, in: zoomNamespace) { source in
    source
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(radius: 4)
}
```

### When to Use Zoom Transitions vs matchedGeometryEffect

| Scenario | Use |
|----------|-----|
| NavigationStack push/pop with grid or list | **Zoom transition** -- built-in, automatic, works with NavigationLink |
| Custom overlay expansions (ZStack-based) | **matchedGeometryEffect** -- full control over both states |
| Tab switches with shared elements | **matchedGeometryEffect** -- zoom transitions only work within NavigationStack |
| Sheet or full-screen cover presentations | **matchedGeometryEffect** -- zoom transitions are navigation-only |
| iOS 17 and earlier support required | **matchedGeometryEffect** -- zoom transitions require iOS 18+ |
| Simple navigation hero animations | **Zoom transition** -- far less boilerplate, fewer edge cases |

**Key differences:**
- **Zoom transitions** are managed entirely by the navigation system. You do not need `ZStack`, conditional rendering, or manual animation triggers.
- **matchedGeometryEffect** requires you to manage both source and destination visibility yourself and wrap state changes in `withAnimation`.
- Zoom transitions only work with `NavigationStack` push/pop. They do not work with sheets, full-screen covers, or custom presentation controllers.
- Zoom transitions gracefully degrade on older OS versions (the standard push animation plays instead).
