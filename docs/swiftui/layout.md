# SwiftUI Layout System

Complete reference for stacks, grids, geometry, custom layouts, scroll views, and spatial positioning.

---

## VStack, HStack, ZStack

The fundamental building blocks of SwiftUI layout.

### VStack (Vertical)

```swift
VStack(alignment: .leading, spacing: 12) {
    Text("Title").font(.headline)
    Text("Subtitle").font(.subheadline)
    Text("Body text goes here").font(.body)
}
```

**Alignment options:** `.leading`, `.center` (default), `.trailing`, `.listRowSeparatorLeading`, `.listRowSeparatorTrailing`

### HStack (Horizontal)

```swift
HStack(alignment: .firstTextBaseline, spacing: 8) {
    Image(systemName: "star.fill")
    Text("4.8")
        .font(.title)
    Text("(128 reviews)")
        .font(.caption)
        .foregroundStyle(.secondary)
}
```

**Alignment options:** `.top`, `.center` (default), `.bottom`, `.firstTextBaseline`, `.lastTextBaseline`

### ZStack (Overlay)

```swift
ZStack(alignment: .bottomTrailing) {
    Image("photo")
        .resizable()
        .aspectRatio(contentMode: .fill)
        .frame(width: 200, height: 200)

    Text("NEW")
        .font(.caption)
        .padding(6)
        .background(.red)
        .foregroundStyle(.white)
        .clipShape(Capsule())
        .padding(8)
}
.clipShape(RoundedRectangle(cornerRadius: 12))
```

**Alignment:** Any combination of horizontal and vertical -- `.topLeading`, `.top`, `.topTrailing`, `.leading`, `.center`, `.trailing`, `.bottomLeading`, `.bottom`, `.bottomTrailing`.

---

## Spacer and Divider

```swift
// Spacer pushes content apart
HStack {
    Text("Leading")
    Spacer()              // Fills all available space
    Text("Trailing")
}

HStack {
    Text("Item")
    Spacer(minLength: 20) // Minimum 20pt gap
    Text("Value")
}

// Divider -- thin line separator
VStack {
    Text("Section 1")
    Divider()
        .background(.blue)   // Custom color
    Text("Section 2")
}

// Horizontal divider in HStack
HStack {
    Text("Left")
    Divider()
        .frame(height: 30)
    Text("Right")
}
```

---

## Grid and GridRow (iOS 16+)

Fixed layout grid with aligned columns -- unlike LazyVGrid, renders all content immediately.

```swift
Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 12) {
    GridRow {
        Text("Name")
            .gridColumnAlignment(.trailing)
        Text("John Doe")
    }
    GridRow {
        Text("Email")
        Text("john@example.com")
    }
    GridRow {
        Text("Bio")
        Text("A longer piece of text that spans the available width")
    }

    Divider()
        .gridCellUnsizedAxes(.horizontal) // Span full width

    GridRow {
        Color.clear
            .gridCellColumns(2)           // Span multiple columns
            .frame(height: 1)
    }

    GridRow {
        Text("Actions")
        HStack {
            Button("Edit") { }
            Button("Delete", role: .destructive) { }
        }
    }
}
```

---

## ViewThatFits (iOS 16+)

Picks the first child view that fits the available space.

```swift
ViewThatFits(in: .horizontal) {
    // First choice: full layout
    HStack {
        Image(systemName: "star.fill")
        Text("Add to Favorites")
        Spacer()
        Text("128 people favorited this")
    }

    // Second choice: compact layout
    HStack {
        Image(systemName: "star.fill")
        Text("Favorite")
        Spacer()
        Text("128")
    }

    // Third choice: icon only
    Image(systemName: "star.fill")
}
```

Commonly used for adaptive layouts that work across iPhone SE to iPad.

---

## GeometryReader and GeometryProxy

Reads the size and position of the parent container.

```swift
GeometryReader { proxy in
    let width = proxy.size.width
    let height = proxy.size.height

    VStack {
        Rectangle()
            .fill(.blue)
            .frame(width: width * 0.8, height: height * 0.3)

        Text("Width: \(Int(width)), Height: \(Int(height))")
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
}
```

### Reading Scroll Position

```swift
ScrollView {
    GeometryReader { proxy in
        Color.clear.preference(
            key: ScrollOffsetKey.self,
            value: proxy.frame(in: .named("scroll")).minY
        )
    }
    .frame(height: 0)

    LazyVStack { /* content */ }
}
.coordinateSpace(name: "scroll")
.onPreferenceChange(ScrollOffsetKey.self) { offset in
    headerOpacity = min(1, max(0, -offset / 100))
}

struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
```

**Warning:** `GeometryReader` is greedy -- it takes all proposed space. Wrap it carefully or use it inside `.background`/`.overlay` to avoid layout issues.

```swift
// Better pattern: read size without affecting layout
Text("Content")
    .background {
        GeometryReader { proxy in
            Color.clear
                .onAppear { contentSize = proxy.size }
                .onChange(of: proxy.size) { _, newSize in
                    contentSize = newSize
                }
        }
    }
```

---

## LazyVGrid and LazyHGrid

### Grid Item Types

```swift
// Fixed: exact width
GridItem(.fixed(100))

// Flexible: fills available space within range
GridItem(.flexible(minimum: 80, maximum: 200))

// Adaptive: fits as many as possible within range
GridItem(.adaptive(minimum: 100, maximum: 150))
```

### LazyVGrid Examples

```swift
// Two equal columns
let twoColumns = [
    GridItem(.flexible()),
    GridItem(.flexible())
]

// Three fixed columns
let threeFixed = [
    GridItem(.fixed(100)),
    GridItem(.fixed(100)),
    GridItem(.fixed(100))
]

// Adaptive (responsive)
let adaptive = [
    GridItem(.adaptive(minimum: 120))
]

ScrollView {
    LazyVGrid(columns: adaptive, spacing: 16) {
        ForEach(items) { item in
            VStack {
                AsyncImage(url: item.imageURL) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray.opacity(0.3)
                }
                .frame(height: 150)
                .clipShape(RoundedRectangle(cornerRadius: 8))

                Text(item.title)
                    .font(.caption)
                    .lineLimit(1)
            }
        }
    }
    .padding()
}
```

### LazyHGrid

```swift
let rows = [
    GridItem(.fixed(80)),
    GridItem(.fixed(80))
]

ScrollView(.horizontal) {
    LazyHGrid(rows: rows, spacing: 12) {
        ForEach(items) { item in
            ItemCell(item: item)
        }
    }
    .padding()
}
```

---

## Frame, Padding, Offset

### .frame()

```swift
// Exact size
Text("Fixed").frame(width: 200, height: 50)

// Flexible constraints
Text("Flexible")
    .frame(minWidth: 100, maxWidth: 300, minHeight: 44)

// Fill available width
Text("Full Width")
    .frame(maxWidth: .infinity, alignment: .leading)

// Fill available space
Color.blue
    .frame(maxWidth: .infinity, maxHeight: .infinity)

// Ideal size (proposed when parent uses .fixedSize)
Text("Ideal").frame(idealWidth: 200, idealHeight: 100)

// fixedSize prevents truncation
Text("This long text will not be truncated")
    .fixedSize(horizontal: true, vertical: false)
```

### .padding()

```swift
Text("Padded")
    .padding()                           // Default on all edges (~16pt)
    .padding(20)                         // Custom amount all edges
    .padding(.horizontal, 16)           // Specific edge set
    .padding(.top, 8)                   // Single edge
    .padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
```

### .offset()

Moves the view visually without changing its layout position.

```swift
Circle()
    .fill(.blue)
    .frame(width: 50, height: 50)
    .offset(x: 20, y: -10)  // Moves right 20, up 10

// Common pattern: notification badge
ZStack(alignment: .topTrailing) {
    Image(systemName: "bell")
        .font(.title)
    Text("3")
        .font(.caption2)
        .padding(4)
        .background(.red)
        .foregroundStyle(.white)
        .clipShape(Circle())
        .offset(x: 8, y: -8)
}
```

---

## Safe Area

### safeAreaInset (iOS 15+)

Adds content in the safe area without overlapping.

```swift
ScrollView {
    LazyVStack {
        ForEach(messages) { message in
            MessageRow(message: message)
        }
    }
}
.safeAreaInset(edge: .bottom) {
    HStack {
        TextField("Message", text: $newMessage)
            .textFieldStyle(.roundedBorder)
        Button("Send", systemImage: "arrow.up.circle.fill") {
            sendMessage()
        }
    }
    .padding()
    .background(.bar)
}
```

### safeAreaPadding (iOS 17+)

Adds padding within the safe area.

```swift
ScrollView(.horizontal) {
    LazyHStack {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
}
.safeAreaPadding(.horizontal, 16)  // Content scrolls edge-to-edge but starts padded
```

### Ignoring Safe Area

```swift
Color.blue
    .ignoresSafeArea()                    // All edges
    .ignoresSafeArea(.keyboard)           // Only keyboard
    .ignoresSafeArea(.container, edges: .bottom) // Only bottom
```

---

## Custom Layout Protocol (iOS 16+)

Create completely custom layout logic.

```swift
struct RadialLayout: Layout {
    var radius: CGFloat
    var startAngle: Angle = .zero

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxSize = subviews.reduce(CGSize.zero) { currentMax, subview in
            let size = subview.sizeThatFits(.unspecified)
            return CGSize(
                width: max(currentMax.width, size.width),
                height: max(currentMax.height, size.height)
            )
        }
        return CGSize(
            width: (radius + maxSize.width) * 2,
            height: (radius + maxSize.height) * 2
        )
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let angleStep = Angle.degrees(360.0 / Double(subviews.count))

        for (index, subview) in subviews.enumerated() {
            let angle = startAngle + angleStep * Double(index)
            let x = bounds.midX + radius * cos(angle.radians)
            let y = bounds.midY + radius * sin(angle.radians)

            subview.place(
                at: CGPoint(x: x, y: y),
                anchor: .center,
                proposal: .unspecified
            )
        }
    }
}

// Usage
RadialLayout(radius: 100) {
    ForEach(0..<8) { i in
        Circle()
            .fill(Color(hue: Double(i) / 8, saturation: 0.8, brightness: 0.9))
            .frame(width: 40, height: 40)
    }
}
```

### Animated Layout Transitions

```swift
struct ContentView: View {
    @State private var useRadial = false

    var body: some View {
        let layout = useRadial ? AnyLayout(RadialLayout(radius: 120)) : AnyLayout(HStackLayout())

        layout {
            ForEach(items) { item in
                ItemView(item: item)
            }
        }
        .animation(.spring, value: useRadial)

        Button("Toggle Layout") { useRadial.toggle() }
    }
}
```

---

## ScrollView and ScrollViewReader

### ScrollViewReader

Programmatic scrolling to specific views.

```swift
ScrollViewReader { proxy in
    ScrollView {
        LazyVStack {
            ForEach(messages) { message in
                MessageRow(message: message)
                    .id(message.id)
            }
        }
    }
    .onChange(of: messages.count) { _, _ in
        withAnimation {
            proxy.scrollTo(messages.last?.id, anchor: .bottom)
        }
    }
}
```

### scrollPosition (iOS 17+)

```swift
@State private var scrollPosition: String?

ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemCard(item: item)
                .id(item.id)
        }
    }
    .scrollTargetLayout()
}
.scrollPosition(id: $scrollPosition)
.onChange(of: scrollPosition) { _, id in
    print("Visible item: \(id ?? "none")")
}
```

### containerRelativeFrame (iOS 17+)

Size views relative to the scroll container.

```swift
ScrollView(.horizontal) {
    LazyHStack(spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
                .containerRelativeFrame(.horizontal, count: 1, spacing: 16)
                // Full width card, one at a time
        }
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.paging) // .paging or .viewAligned
.scrollIndicators(.hidden)
```

### scrollTransition (iOS 17+)

Apply effects as views enter/exit the scroll viewport.

```swift
ScrollView {
    LazyVStack(spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
                .scrollTransition { content, phase in
                    content
                        .opacity(phase.isIdentity ? 1 : 0.3)
                        .scaleEffect(phase.isIdentity ? 1 : 0.8)
                        .blur(radius: phase.isIdentity ? 0 : 2)
                }
        }
    }
}
```

---

## ContentUnavailableView (iOS 17+)

Standard empty state view.

```swift
// Built-in search empty state
ContentUnavailableView.search

// Search with query
ContentUnavailableView.search(text: searchText)

// Custom
ContentUnavailableView {
    Label("No Favorites", systemImage: "heart.slash")
} description: {
    Text("Items you favorite will appear here.")
} actions: {
    Button("Browse Items") { showBrowse = true }
        .buttonStyle(.borderedProminent)
}
```

---

## Layout Tips and Patterns

### Proportional Layout

```swift
GeometryReader { proxy in
    HStack(spacing: 0) {
        LeftPanel()
            .frame(width: proxy.size.width * 0.3)
        RightPanel()
            .frame(width: proxy.size.width * 0.7)
    }
}
```

### Adaptive Layout Based on Size Class

```swift
struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        if sizeClass == .compact {
            VStack { content }
        } else {
            HStack { content }
        }
    }

    @ViewBuilder
    var content: some View {
        SidebarView()
        DetailView()
    }
}
```

### Alignment Guides

```swift
HStack(alignment: .customCenter) {
    Text("Label")
        .alignmentGuide(.customCenter) { d in d[VerticalAlignment.center] }
    Circle()
        .fill(.blue)
        .frame(width: 10, height: 10)
        .alignmentGuide(.customCenter) { d in d[VerticalAlignment.center] }
}

extension VerticalAlignment {
    struct CustomCenter: AlignmentID {
        static func defaultValue(in context: ViewDimensions) -> CGFloat {
            context[VerticalAlignment.center]
        }
    }
    static let customCenter = VerticalAlignment(CustomCenter.self)
}
```
