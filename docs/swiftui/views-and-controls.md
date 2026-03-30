# SwiftUI Views and Controls

Comprehensive reference for every major SwiftUI view, control, modifier, and lifecycle hook.

---

## Text and Labels

### Text

Displays one or more lines of read-only text.

```swift
Text("Hello, World!")
    .font(.title)
    .fontWeight(.bold)
    .foregroundStyle(.primary)
    .lineLimit(2)
    .truncationMode(.tail)
    .multilineTextAlignment(.center)

// Markdown support
Text("**Bold** and *italic* and [link](https://apple.com)")

// String interpolation with formatting
Text("Price: \(price, format: .currency(code: "USD"))")
Text("Date: \(date, format: .dateTime.month().day().year())")
Text(timerInterval: Date.now...Date.now.addingTimeInterval(300))

// Concatenation
Text("Hello ").bold() + Text("World").foregroundStyle(.blue)

// AttributedString
var attributed = AttributedString("Styled")
attributed.foregroundColor = .red
attributed.font = .largeTitle
Text(attributed)
```

### Label

Pairs an icon with a title. Adapts rendering based on context (toolbar shows icon only, list shows both).

```swift
Label("Favorites", systemImage: "heart.fill")
Label("Custom", image: "myIcon")
Label {
    Text("Downloads")
        .font(.headline)
} icon: {
    Image(systemName: "arrow.down.circle")
        .foregroundStyle(.blue)
}

// Label styles
Label("Item", systemImage: "star")
    .labelStyle(.titleAndIcon)  // .titleOnly, .iconOnly, .automatic
```

### Image and AsyncImage

```swift
// SF Symbols
Image(systemName: "star.fill")
    .symbolRenderingMode(.multicolor)
    .font(.system(size: 40))
    .symbolEffect(.bounce, value: isFavorite)  // iOS 17+

// Asset catalog
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 200, height: 200)
    .clipShape(RoundedRectangle(cornerRadius: 16))

// AsyncImage (remote images)
AsyncImage(url: URL(string: "https://example.com/photo.jpg")) { phase in
    switch phase {
    case .empty:
        ProgressView()
    case .success(let image):
        image
            .resizable()
            .aspectRatio(contentMode: .fill)
    case .failure:
        Image(systemName: "photo.badge.exclamationmark")
            .foregroundStyle(.secondary)
    @unknown default:
        EmptyView()
    }
}
.frame(width: 300, height: 200)
```

---

## Buttons and Toggles

### Button

```swift
// Basic
Button("Tap Me") { doSomething() }

// With role
Button("Delete", role: .destructive) { deleteItem() }
Button("Cancel", role: .cancel) { dismiss() }

// Custom label
Button {
    performAction()
} label: {
    HStack {
        Image(systemName: "plus.circle.fill")
        Text("Add Item")
    }
    .font(.headline)
    .padding()
    .background(.blue)
    .foregroundStyle(.white)
    .clipShape(Capsule())
}

// Button styles
Button("Bordered") { }
    .buttonStyle(.bordered)       // .automatic, .plain, .borderless
    .tint(.green)

Button("Prominent") { }
    .buttonStyle(.borderedProminent)
    .controlSize(.large)          // .mini, .small, .regular, .large, .extraLarge

// Repeat behavior (iOS 17+)
Button("Increment", repeatBehavior: .enabled) { count += 1 }
```

### Toggle

```swift
@State private var isOn = false

Toggle("Airplane Mode", isOn: $isOn)
Toggle(isOn: $isOn) {
    Label("Wi-Fi", systemImage: "wifi")
}
.toggleStyle(.switch)   // .switch, .button, .checkbox (macOS)
.tint(.orange)
```

### Picker

```swift
@State private var selection = "Red"
let colors = ["Red", "Green", "Blue"]

// Inline
Picker("Color", selection: $selection) {
    ForEach(colors, id: \.self) { Text($0) }
}
.pickerStyle(.segmented)  // .menu, .wheel, .inline, .navigationLink, .palette

// With enum
enum Flavor: String, CaseIterable, Identifiable {
    case chocolate, vanilla, strawberry
    var id: Self { self }
}

@State private var flavor: Flavor = .chocolate

Picker("Flavor", selection: $flavor) {
    ForEach(Flavor.allCases) { flavor in
        Text(flavor.rawValue.capitalized).tag(flavor)
    }
}
```

### Slider, Stepper, DatePicker, ColorPicker

```swift
// Slider
@State private var speed = 50.0
Slider(value: $speed, in: 0...100, step: 5) {
    Text("Speed")
} minimumValueLabel: { Text("0") }
  maximumValueLabel: { Text("100") }

// Stepper
@State private var quantity = 1
Stepper("Quantity: \(quantity)", value: $quantity, in: 1...99)
Stepper("Custom") { quantity += 5 } onDecrement: { quantity -= 5 }

// DatePicker
@State private var date = Date.now
DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
    .datePickerStyle(.graphical)  // .compact, .wheel, .graphical

DatePicker("Range", selection: $date, in: Date.now...)

// ColorPicker
@State private var color = Color.blue
ColorPicker("Theme", selection: $color, supportsOpacity: true)
```

---

## Text Input

```swift
// TextField
@State private var name = ""
TextField("Enter name", text: $name)
    .textFieldStyle(.roundedBorder)
    .textContentType(.name)
    .autocorrectionDisabled()
    .textInputAutocapitalization(.words)
    .submitLabel(.done)
    .onSubmit { saveProfile() }

// With format
@State private var amount = 0.0
TextField("Amount", value: $amount, format: .currency(code: "USD"))
    .keyboardType(.decimalPad)

// With prompt and axis (iOS 16+)
TextField("Bio", text: $bio, prompt: Text("Tell us about yourself"), axis: .vertical)
    .lineLimit(3...6)

// SecureField
@State private var password = ""
SecureField("Password", text: $password)
    .textContentType(.password)

// TextEditor (multiline)
@State private var notes = ""
TextEditor(text: $notes)
    .frame(minHeight: 100)
    .scrollContentBackground(.hidden)  // iOS 16+ to customize background
    .background(Color(.systemGray6))
    .clipShape(RoundedRectangle(cornerRadius: 8))

// Focused state
@FocusState private var isNameFocused: Bool
TextField("Name", text: $name)
    .focused($isNameFocused)

Button("Focus") { isNameFocused = true }
```

---

## Lists and Collections

### List

```swift
// Static
List {
    Text("Row 1")
    Text("Row 2")
    Text("Row 3")
}

// Dynamic
struct Item: Identifiable {
    let id = UUID()
    var title: String
}

List(items) { item in
    Text(item.title)
}

// Mixed static and dynamic
List {
    Section("Favorites") {
        ForEach(favorites) { item in
            Text(item.title)
        }
    }
    Section("All Items") {
        ForEach(allItems) { item in
            Text(item.title)
        }
    }
}
.listStyle(.insetGrouped)  // .plain, .grouped, .sidebar, .inset, .insetGrouped

// Swipe actions
List {
    ForEach(items) { item in
        Text(item.title)
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                Button(role: .destructive) { delete(item) } label: {
                    Label("Delete", systemImage: "trash")
                }
                Button { pin(item) } label: {
                    Label("Pin", systemImage: "pin")
                }
                .tint(.yellow)
            }
            .swipeActions(edge: .leading) {
                Button { archive(item) } label: {
                    Label("Archive", systemImage: "archivebox")
                }
                .tint(.blue)
            }
    }
    .onDelete { indexSet in items.remove(atOffsets: indexSet) }
    .onMove { from, to in items.move(fromOffsets: from, toOffset: to) }
}

// List customization
.listRowBackground(Color.clear)
.listRowSeparator(.hidden)
.listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
.listSectionSeparator(.hidden)
```

### ForEach

```swift
// With Identifiable
ForEach(items) { item in ItemRow(item: item) }

// With id keypath
ForEach(names, id: \.self) { name in Text(name) }

// With index
ForEach(Array(items.enumerated()), id: \.offset) { index, item in
    Text("\(index): \(item.title)")
}

// Range
ForEach(0..<5) { i in Text("Item \(i)") }
```

### ScrollView and Lazy Stacks/Grids

```swift
// Vertical scroll
ScrollView {
    LazyVStack(spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
    .padding()
}

// Horizontal scroll
ScrollView(.horizontal, showsIndicators: false) {
    LazyHStack(spacing: 12) {
        ForEach(items) { item in
            ItemCard(item: item)
                .containerRelativeFrame(.horizontal, count: 3, spacing: 12)
        }
    }
    .scrollTargetLayout()  // iOS 17+
}
.scrollTargetBehavior(.viewAligned)  // iOS 17+ snapping

// Grid
let columns = [
    GridItem(.flexible()),
    GridItem(.flexible()),
    GridItem(.flexible())
]

ScrollView {
    LazyVGrid(columns: columns, spacing: 16) {
        ForEach(items) { item in
            ItemCell(item: item)
        }
    }
}

// Adaptive grid
let adaptiveColumns = [GridItem(.adaptive(minimum: 120, maximum: 200))]

// Pinned headers
ScrollView {
    LazyVStack(pinnedViews: [.sectionHeaders]) {
        ForEach(sections) { section in
            Section {
                ForEach(section.items) { item in ItemRow(item: item) }
            } header: {
                Text(section.title)
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(.bar)
            }
        }
    }
}
```

---

## Form, Section, GroupBox, DisclosureGroup

```swift
Form {
    Section("Profile") {
        TextField("Name", text: $name)
        DatePicker("Birthday", selection: $birthday, displayedComponents: .date)
        Picker("Role", selection: $role) {
            ForEach(Role.allCases) { Text($0.rawValue).tag($0) }
        }
    }

    Section {
        Toggle("Notifications", isOn: $notificationsEnabled)
        Toggle("Sound", isOn: $soundEnabled)
    } header: {
        Text("Preferences")
    } footer: {
        Text("Enable notifications to receive updates.")
    }
}

// GroupBox
GroupBox("Statistics") {
    LabeledContent("Downloads", value: "1,234")
    LabeledContent("Rating", value: "4.8")
}

// LabeledContent for key-value display
LabeledContent("Version") {
    Text("2.1.0").foregroundStyle(.secondary)
}

// DisclosureGroup
@State private var isExpanded = false
DisclosureGroup("Advanced Settings", isExpanded: $isExpanded) {
    Toggle("Debug Mode", isOn: $debugMode)
    Slider(value: $cacheSize, in: 0...1000)
}
```

---

## Menus, Context Menus, Links

```swift
// Menu (pull-down button)
Menu("Options") {
    Button("Duplicate", systemImage: "doc.on.doc") { duplicate() }
    Button("Rename", systemImage: "pencil") { rename() }
    Divider()
    Button("Delete", systemImage: "trash", role: .destructive) { delete() }
    Menu("Sort By") {
        Button("Name") { sort(.name) }
        Button("Date") { sort(.date) }
        Button("Size") { sort(.size) }
    }
}
.menuStyle(.borderedProminent)

// Context menu (long press)
Text("Hold me")
    .contextMenu {
        Button("Copy", systemImage: "doc.on.doc") { copy() }
        Button("Share", systemImage: "square.and.arrow.up") { share() }
    } preview: {
        ItemPreview(item: item)  // Custom preview
            .frame(width: 300, height: 400)
    }

// Link
Link("Visit Apple", destination: URL(string: "https://apple.com")!)
Link(destination: URL(string: "https://apple.com")!) {
    Label("Apple", systemImage: "safari")
}

// ShareLink (iOS 16+)
ShareLink(item: URL(string: "https://apple.com")!) {
    Label("Share", systemImage: "square.and.arrow.up")
}
```

---

## Progress and Gauge

```swift
// Indeterminate
ProgressView()
ProgressView("Loading...")

// Determinate
ProgressView("Downloading", value: progress, total: 100)
    .progressViewStyle(.linear)  // .circular, .linear

// Gauge (iOS 16+)
Gauge(value: batteryLevel, in: 0...100) {
    Text("Battery")
} currentValueLabel: {
    Text("\(Int(batteryLevel))%")
} minimumValueLabel: {
    Text("0")
} maximumValueLabel: {
    Text("100")
}
.gaugeStyle(.accessoryCircular)  // .linearCapacity, .accessoryLinear, .accessoryCircularCapacity
.tint(Gradient(colors: [.red, .yellow, .green]))
```

---

## Custom Views and ViewModifier

```swift
// Custom View
struct ProfileCard: View {
    let name: String
    let role: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(name).font(.headline)
            Text(role).font(.subheadline).foregroundStyle(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// ViewModifier
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// Usage
Text("Styled").cardStyle()

// ViewModifier with configuration
struct ShimmerModifier: ViewModifier {
    let isActive: Bool
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay {
                if isActive {
                    LinearGradient(
                        colors: [.clear, .white.opacity(0.3), .clear],
                        startPoint: .init(x: phase - 0.5, y: 0.5),
                        endPoint: .init(x: phase + 0.5, y: 0.5)
                    )
                    .onAppear {
                        withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                            phase = 1.5
                        }
                    }
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
```

---

## View Lifecycle

```swift
struct ContentView: View {
    @State private var data: [Item] = []

    var body: some View {
        List(data) { item in
            Text(item.title)
        }
        // Called when view appears
        .onAppear { loadCachedData() }

        // Called when view disappears
        .onDisappear { saveState() }

        // Async task tied to view lifetime (cancelled on disappear)
        .task {
            data = await fetchItems()
        }

        // Task with ID (restarts when id changes)
        .task(id: selectedCategory) {
            data = await fetchItems(for: selectedCategory)
        }

        // React to value changes (iOS 17+ syntax)
        .onChange(of: searchText) { oldValue, newValue in
            performSearch(newValue)
        }

        // React to value changes (iOS 14-16 syntax)
        .onChange(of: searchText) { newValue in
            performSearch(newValue)
        }

        // Scene phase
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { saveData() }
        }

        // Receive notifications
        .onReceive(NotificationCenter.default.publisher(for: .didUpdate)) { _ in
            refresh()
        }
    }
}
```

---

## Common Modifiers Reference

```swift
// Typography
.font(.title)                    // .largeTitle, .title, .title2, .title3, .headline,
                                 // .subheadline, .body, .callout, .footnote, .caption, .caption2
.font(.system(size: 18, weight: .semibold, design: .rounded))
.fontDesign(.rounded)            // .default, .rounded, .serif, .monospaced
.fontWidth(.expanded)            // .compressed, .condensed, .standard, .expanded
.bold()
.italic()
.underline()
.strikethrough()
.kerning(2)
.tracking(1)

// Colors and styles
.foregroundStyle(.primary)       // Supports ShapeStyle: colors, gradients, hierarchical
.foregroundStyle(.blue, .secondary)  // Primary, secondary content
.tint(.blue)

// Layout
.padding()                       // All edges, default spacing
.padding(.horizontal, 16)
.padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
.frame(width: 200, height: 100)
.frame(maxWidth: .infinity, alignment: .leading)
.frame(minHeight: 44)

// Background and overlay
.background(.ultraThinMaterial)  // .regularMaterial, .thickMaterial, .bar
.background { RoundedRectangle(cornerRadius: 12).fill(.blue.gradient) }
.background(in: RoundedRectangle(cornerRadius: 12))  // Clips background to shape
.overlay { Badge().offset(x: 10, y: -10) }
.overlay(alignment: .topTrailing) { NotificationBadge() }
.border(.gray, width: 1)

// Shape and clipping
.clipShape(Circle())
.clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
.clipShape(Capsule())
.mask { LinearGradient(colors: [.black, .clear], startPoint: .top, endPoint: .bottom) }

// Shadow
.shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 4)

// Opacity and visibility
.opacity(0.8)
.hidden()                        // Hides but preserves layout space

// Interaction
.disabled(isLoading)
.allowsHitTesting(false)
.contentShape(Rectangle())      // Expand tappable area

// Accessibility
.accessibilityLabel("Close button")
.accessibilityHint("Dismisses the dialog")
.accessibilityAddTraits(.isButton)
.accessibilityHidden(true)

// Conditional modifiers (via extension)
extension View {
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition { transform(self) } else { self }
    }
}

// Redaction
.redacted(reason: .placeholder)
.privacySensitive()              // Redacted in inactive app states

// Environment overrides
.environment(\.colorScheme, .dark)
.dynamicTypeSize(.large ... .accessibility3)
.environment(\.layoutDirection, .rightToLeft)
```

---

## Key Patterns

1. Prefer `LazyVStack`/`LazyHStack` inside `ScrollView` for large collections over `List` when you need custom styling.
2. Use `ViewModifier` to encapsulate reusable styling rather than View extensions with many chained modifiers.
3. Always provide `.accessibilityLabel` for icon-only buttons.
4. Use `.task {}` instead of `.onAppear` for async work -- it automatically cancels on disappear.
5. Prefer `.foregroundStyle` over the deprecated `.foregroundColor`.
6. Use `.background(in: shape)` over `.background().clipShape(shape)` when possible.
