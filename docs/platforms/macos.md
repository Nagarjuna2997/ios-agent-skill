# macOS Platform Guide

## Menu Bar and NSMenu

### Main Menu Customization

```swift
// SwiftUI CommandMenu
@main
struct MyMacApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            // Replace existing group
            CommandGroup(replacing: .newItem) {
                Button("New Document") { createDocument() }
                    .keyboardShortcut("n")
                Button("New from Template...") { showTemplates() }
                    .keyboardShortcut("n", modifiers: [.command, .shift])
            }

            // Add custom menu
            CommandMenu("Tools") {
                Button("Run Analysis") { runAnalysis() }
                    .keyboardShortcut("r", modifiers: [.command, .shift])
                Divider()
                Toggle("Auto-Save", isOn: $autoSave)
            }

            // Toolbar commands
            CommandGroup(after: .toolbar) {
                Button("Toggle Sidebar") { toggleSidebar() }
                    .keyboardShortcut("s", modifiers: [.command, .control])
            }
        }
    }
}
```

### Menu Bar Extra (Status Bar App)

```swift
@main
struct StatusBarApp: App {
    var body: some Scene {
        MenuBarExtra("My App", systemImage: "star.fill") {
            VStack(spacing: 12) {
                Text("Status: Active")
                    .font(.headline)
                Divider()
                Button("Open Dashboard") { openDashboard() }
                    .keyboardShortcut("d")
                Button("Preferences...") { openPreferences() }
                    .keyboardShortcut(",")
                Divider()
                Button("Quit") { NSApplication.shared.terminate(nil) }
                    .keyboardShortcut("q")
            }
            .padding()
        }
        .menuBarExtraStyle(.window) // .menu for simple dropdown
    }
}
```

---

## NSWindow Customization

```swift
// SwiftUI window styling
WindowGroup {
    ContentView()
}
.windowStyle(.hiddenTitleBar)
.windowResizability(.contentSize)
.defaultSize(width: 800, height: 600)
.defaultPosition(.center)

// Full NSWindow control via NSViewRepresentable
struct WindowAccessor: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async {
            if let window = view.window {
                window.isMovableByWindowBackground = true
                window.titlebarAppearsTransparent = true
                window.titleVisibility = .hidden
                window.styleMask.insert(.fullSizeContentView)
                window.backgroundColor = .clear
                window.isOpaque = false

                // Custom traffic light position
                let buttons = [window.standardWindowButton(.closeButton),
                               window.standardWindowButton(.miniaturizeButton),
                               window.standardWindowButton(.zoomButton)]
                buttons.compactMap { $0 }.enumerated().forEach { i, button in
                    button.frame.origin = CGPoint(x: 12 + CGFloat(i) * 20, y: 12)
                }
            }
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {}
}
```

---

## Toolbar and Sidebar Patterns

```swift
struct ContentView: View {
    @State private var selectedItem: SidebarItem? = .inbox
    @State private var columnVisibility = NavigationSplitViewVisibility.all

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            // Sidebar
            List(selection: $selectedItem) {
                Section("Favorites") {
                    Label("Inbox", systemImage: "tray")
                        .tag(SidebarItem.inbox)
                    Label("Sent", systemImage: "paperplane")
                        .tag(SidebarItem.sent)
                }
                Section("Folders") {
                    Label("Archive", systemImage: "archivebox")
                        .tag(SidebarItem.archive)
                }
            }
            .listStyle(.sidebar)
            .navigationSplitViewColumnWidth(min: 180, ideal: 220, max: 300)
        } content: {
            // Content list
            if let selectedItem {
                ItemListView(category: selectedItem)
            }
        } detail: {
            // Detail
            DetailView()
        }
        .navigationTitle("Mail")
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                Button(action: compose) {
                    Label("Compose", systemImage: "square.and.pencil")
                }
            }
            ToolbarItem(placement: .navigation) {
                Button(action: toggleSidebar) {
                    Label("Sidebar", systemImage: "sidebar.leading")
                }
            }
        }
    }
}
```

---

## Document-Based Apps

```swift
@main
struct TextEditorApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: TextDocument()) { file in
            DocumentEditorView(document: file.$document)
        }
        .commands {
            TextFormattingCommands()
        }

        // Additional window types
        Window("Activity Log", id: "activity") {
            ActivityLogView()
        }
        .keyboardShortcut("0", modifiers: [.command, .shift])
        .defaultSize(width: 400, height: 300)
    }
}

// Reference-type document (for complex data)
@Observable
class ProjectDocument: ReferenceFileDocument {
    static var readableContentTypes: [UTType] { [.json] }

    var project: Project

    required init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents else {
            throw CocoaError(.fileReadCorruptFile)
        }
        project = try JSONDecoder().decode(Project.self, from: data)
    }

    func snapshot(contentType: UTType) throws -> Data {
        try JSONEncoder().encode(project)
    }

    func fileWrapper(snapshot: Data, configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: snapshot)
    }
}
```

---

## Sandboxing and Entitlements

### Common Entitlements

```xml
<!-- App.entitlements -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>           <true/>
    <key>com.apple.security.files.user-selected.read-write</key> <true/>
    <key>com.apple.security.files.bookmarks.app-scope</key>      <true/>
    <key>com.apple.security.network.client</key>         <true/>
    <key>com.apple.security.network.server</key>         <true/>
    <key>com.apple.security.print</key>                  <true/>
</dict>
</plist>
```

### Security-Scoped Bookmarks

```swift
// Persist access to user-selected files
func saveBookmark(for url: URL) throws {
    let bookmarkData = try url.bookmarkData(
        options: .withSecurityScope,
        includingResourceValuesForKeys: nil,
        relativeTo: nil
    )
    UserDefaults.standard.set(bookmarkData, forKey: "savedFile")
}

func resolveBookmark() throws -> URL {
    guard let data = UserDefaults.standard.data(forKey: "savedFile") else {
        throw AppError.noBookmark
    }
    var isStale = false
    let url = try URL(
        resolvingBookmarkData: data,
        options: .withSecurityScope,
        relativeTo: nil,
        bookmarkDataIsStale: &isStale
    )
    guard url.startAccessingSecurityScopedResource() else {
        throw AppError.accessDenied
    }
    // Remember to call url.stopAccessingSecurityScopedResource() when done
    return url
}
```

---

## AppKit-SwiftUI Interop

### NSViewRepresentable

```swift
struct WebView: NSViewRepresentable {
    let url: URL

    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        webView.load(URLRequest(url: url))
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("Page loaded")
        }
    }
}

// NSViewControllerRepresentable
struct LegacyEditorView: NSViewControllerRepresentable {
    func makeNSViewController(context: Context) -> EditorViewController {
        EditorViewController()
    }

    func updateNSViewController(_ controller: EditorViewController, context: Context) {}
}
```

### Hosting SwiftUI in AppKit

```swift
let swiftUIView = SettingsContentView()
let hostingController = NSHostingController(rootView: swiftUIView)

// As a popover
let popover = NSPopover()
popover.contentViewController = hostingController
popover.behavior = .transient
popover.show(relativeTo: button.bounds, of: button, preferredEdge: .maxY)
```

---

## Settings / Preferences Window

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }

        Settings {
            TabView {
                GeneralSettingsView()
                    .tabItem { Label("General", systemImage: "gear") }
                AppearanceSettingsView()
                    .tabItem { Label("Appearance", systemImage: "paintbrush") }
                AdvancedSettingsView()
                    .tabItem { Label("Advanced", systemImage: "gearshape.2") }
            }
            .frame(width: 450, height: 300)
        }
    }
}

struct GeneralSettingsView: View {
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("checkForUpdates") private var checkForUpdates = true

    var body: some View {
        Form {
            Toggle("Launch at Login", isOn: $launchAtLogin)
            Toggle("Check for Updates Automatically", isOn: $checkForUpdates)
            Picker("Default View", selection: $defaultView) {
                Text("List").tag(ViewMode.list)
                Text("Grid").tag(ViewMode.grid)
            }
        }
        .padding()
    }
}
```

---

## Drag and Drop

```swift
struct DragDropView: View {
    @State private var items: [DragItem] = []
    @State private var isTargeted = false

    var body: some View {
        VStack {
            // Draggable items
            ForEach(items) { item in
                Text(item.name)
                    .draggable(item) // Requires Transferable conformance
            }

            // Drop target
            RoundedRectangle(cornerRadius: 12)
                .fill(isTargeted ? Color.accentColor.opacity(0.2) : Color.gray.opacity(0.1))
                .frame(height: 200)
                .overlay { Text("Drop files here") }
                .dropDestination(for: URL.self) { urls, location in
                    handleDrop(urls: urls)
                    return true
                } isTargeted: { targeted in
                    isTargeted = targeted
                }
        }
    }
}

// Transferable conformance
struct DragItem: Identifiable, Codable, Transferable {
    let id: UUID
    let name: String

    static var transferRepresentation: some TransferRepresentation {
        CodableRepresentation(contentType: .data)
        ProxyRepresentation(exporting: \.name) // Fallback as plain text
    }
}

// NSFilePromiseProvider for files (AppKit interop)
class FilePromiseProvider: NSFilePromiseProvider {
    override func fileType() -> String { UTType.png.identifier }

    override func operationQueue() -> OperationQueue { .main }

    override func provideFile(at url: URL) throws {
        let data = generateFileData()
        try data.write(to: url)
    }
}
```

---

## macOS-Specific Patterns Summary

| Feature | API | Notes |
|---------|-----|-------|
| Menu Bar Extra | MenuBarExtra | SwiftUI-native in macOS 13+ |
| Settings Window | Settings scene | Replaces NSPreferencesWindow |
| Sidebar | NavigationSplitView | 3-column layout |
| Toolbar | .toolbar modifier | Placement: .primaryAction, .navigation |
| Drag & Drop | Transferable | SwiftUI-native; NSFilePromiseProvider for files |
| Entitlements | .entitlements file | Required for sandboxed apps |
| Window styling | .windowStyle | .hiddenTitleBar, .plain |
| Keyboard shortcuts | .keyboardShortcut | Global via CommandMenu |
