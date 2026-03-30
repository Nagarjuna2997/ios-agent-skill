# Accessibility

Apple's accessibility APIs make apps usable for everyone, including people with visual, motor, hearing, and cognitive disabilities. SwiftUI provides built-in accessibility support with modifiers for VoiceOver, Dynamic Type, Reduce Motion, and more.

## VoiceOver Labels, Hints, Values, and Traits

```swift
import SwiftUI

struct AccessibleCardView: View {
    let title: String
    let rating: Double
    let isFavorite: Bool

    var body: some View {
        VStack {
            Image("product")
                .resizable()
                .aspectRatio(contentMode: .fit)
                // Label: concise description of what the element IS (read first)
                .accessibilityLabel("Product photo of \(title)")

            Text(title)

            HStack {
                ForEach(1...5, id: \.self) { star in
                    Image(systemName: star <= Int(rating) ? "star.fill" : "star")
                }
            }
            // Combine child elements into a single accessible element
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(Int(rating)) out of 5 stars")
            // Value: current state of a dynamic element
            .accessibilityValue("\(rating, specifier: "%.1f") rating")

            Button(action: { /* toggle favorite */ }) {
                Image(systemName: isFavorite ? "heart.fill" : "heart")
            }
            .accessibilityLabel(isFavorite ? "Remove from favorites" : "Add to favorites")
            // Hint: describes what happens when the element is activated (read after a pause)
            .accessibilityHint("Double tap to \(isFavorite ? "remove from" : "add to") favorites")
            // Traits: describe the behavior and purpose of the element
            .accessibilityAddTraits(.isButton)
            .accessibilityRemoveTraits(.isImage)
        }
    }
}
```

## accessibilityLabel, accessibilityHint, accessibilityValue

```swift
struct AccessibilityModifiersExample: View {
    @State private var volume: Double = 0.5
    @State private var isPlaying = false

    var body: some View {
        VStack(spacing: 20) {
            // Decorative images should be hidden from VoiceOver
            Image("decorative-divider")
                .accessibilityHidden(true)

            // Slider with full accessibility support
            Slider(value: $volume, in: 0...1)
                .accessibilityLabel("Volume")
                .accessibilityValue("\(Int(volume * 100)) percent")
                .accessibilityAdjustableAction { direction in
                    switch direction {
                    case .increment: volume = min(volume + 0.1, 1.0)
                    case .decrement: volume = max(volume - 0.1, 0.0)
                    @unknown default: break
                    }
                }

            // Play/Pause button
            Button(action: { isPlaying.toggle() }) {
                Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 60))
            }
            .accessibilityLabel(isPlaying ? "Pause" : "Play")
            .accessibilityHint("Double tap to \(isPlaying ? "pause" : "play") the track")
            .accessibilityAddTraits(.startsMediaSession)

            // Combine related elements into one VoiceOver target
            HStack {
                Image(systemName: "clock")
                Text("5 min ago")
            }
            .accessibilityElement(children: .combine)
            // Or override completely:
            // .accessibilityElement(children: .ignore)
            // .accessibilityLabel("Posted 5 minutes ago")

            // Control reading order with sort priority (higher = read first)
            ForEach(0..<3) { index in
                Text("Item \(index)")
                    .accessibilitySortPriority(Double(3 - index))
            }
        }
    }
}
```

### Common Accessibility Traits

```
.isButton                    — Element behaves like a button
.isLink                      — Element opens a URL
.isHeader                    — Section header (enables heading navigation in rotor)
.isImage                     — Image content
.isStaticText                — Text that does not change
.isSearchField               — Search input field
.isSelected                  — Currently selected item in a group
.playsSound                  — Plays audio when activated
.startsMediaSession          — Starts media playback
.isModal                     — Blocks interaction with elements behind it
.isSummaryElement            — Summary of current screen state
.updatesFrequently           — Content changes often (e.g., a timer)
.allowsDirectInteraction     — Can be interacted with directly (bypasses VoiceOver gestures)
.isKeyboardKey               — Custom keyboard key
.isToggle                    — Toggle/switch element
```

## Dynamic Type Support (@ScaledMetric, dynamicTypeSize)

```swift
struct DynamicTypeView: View {
    // ScaledMetric scales a numeric value proportionally to Dynamic Type changes
    @ScaledMetric(relativeTo: .body) var iconSize: CGFloat = 24
    @ScaledMetric(relativeTo: .title) var heroHeight: CGFloat = 200
    @ScaledMetric var padding: CGFloat = 16

    @Environment(\.dynamicTypeSize) var dynamicTypeSize

    var body: some View {
        VStack(spacing: padding) {
            // Icon scales with text size
            Image(systemName: "star.fill")
                .frame(width: iconSize, height: iconSize)

            // Built-in text styles scale automatically
            Text("Title").font(.title)
            Text("Body text").font(.body)
            Text("Caption").font(.caption)

            // Limit scaling range for specific views
            Text("Limited scaling")
                .font(.system(size: 14))
                .dynamicTypeSize(.xSmall ... .accessibility1)

            // Adapt layout for larger accessibility text sizes
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading) {
                    labelContent
                    valueContent
                }
            } else {
                HStack {
                    labelContent
                    Spacer()
                    valueContent
                }
            }
        }
        .dynamicTypeSize(.xSmall ... .xxxLarge) // Limit range for the entire subtree
    }

    var labelContent: some View {
        Text("Balance")
            .font(.subheadline)
            .foregroundStyle(.secondary)
    }

    var valueContent: some View {
        Text("$1,234.56")
            .font(.title2.bold())
    }
}

// ViewThatFits automatically picks the largest layout that fits the available space
struct AdaptiveLayout: View {
    var body: some View {
        ViewThatFits {
            // Try horizontal first
            HStack {
                Image(systemName: "person.fill")
                Text("John Appleseed")
                Spacer()
                Text("Online")
            }
            // Fall back to vertical if horizontal overflows
            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "person.fill")
                    Text("John Appleseed")
                }
                Text("Online")
            }
        }
    }
}
```

## Color Contrast and accessibilityIgnoresInvertColors

```swift
struct ColorAccessibilityView: View {
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.colorSchemeContrast) var contrast

    var body: some View {
        VStack {
            // Use semantic colors that adapt to light/dark and increased contrast
            Text("Primary text")
                .foregroundStyle(.primary)
            Text("Secondary text")
                .foregroundStyle(.secondary)

            // Adjust for increased contrast setting
            Text("Status")
                .foregroundColor(contrast == .increased ? .red : .orange)

            // Photos and images that should not be inverted when Smart Invert is on
            Image("photo")
                .accessibilityIgnoresInvertColors(true)
        }
    }
}

// WCAG contrast requirements:
// - AA: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
// - AAA: 7:1 for normal text, 4.5:1 for large text

// Differentiate without color alone
struct ColorBlindFriendlyView: View {
    @Environment(\.accessibilityDifferentiateWithoutColor) var differentiateWithoutColor
    let taskComplete: Bool

    var body: some View {
        HStack {
            Circle()
                .fill(taskComplete ? .green : .red)
                .frame(width: 12, height: 12)

            // When the user has enabled "Differentiate Without Color",
            // provide additional non-color indicators
            if differentiateWithoutColor {
                Image(systemName: taskComplete ? "checkmark" : "xmark")
                    .font(.caption)
            }

            Text(taskComplete ? "Complete" : "Incomplete")
        }
    }
}
```

## Reduce Motion (@Environment(\.accessibilityReduceMotion))

```swift
struct MotionSensitiveView: View {
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @State private var isVisible = false

    var body: some View {
        VStack {
            Circle()
                .scaleEffect(isVisible ? 1 : 0.5)
                .opacity(isVisible ? 1 : 0)
                // Use .none animation when user prefers reduced motion
                .animation(reduceMotion ? .none : .spring(duration: 0.6), value: isVisible)

            Button("Show") {
                if reduceMotion {
                    isVisible = true  // Instant change, no animation
                } else {
                    withAnimation(.spring()) {
                        isVisible = true
                    }
                }
            }

            // Use transaction to conditionally disable animation
            Text("Animated text")
                .offset(y: isVisible ? 0 : 50)
                .transaction { transaction in
                    if reduceMotion {
                        transaction.animation = nil
                    }
                }
        }
    }
}

// Reduce transparency
struct TransparencyView: View {
    @Environment(\.accessibilityReduceTransparency) var reduceTransparency

    var body: some View {
        Text("Content")
            .padding()
            .background(
                reduceTransparency
                    ? AnyShapeStyle(Color(.systemBackground))
                    : AnyShapeStyle(.ultraThinMaterial)
            )
    }
}
```

## Custom Accessibility Actions

```swift
struct MessageRow: View {
    let message: Message
    @State private var isStarred = false

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(message.sender).font(.headline)
                Text(message.body).font(.body)
            }
            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(message.sender) says \(message.body)")

        // Custom actions appear when VoiceOver user swipes up/down on the element
        .accessibilityAction(named: "Star message") {
            isStarred.toggle()
        }
        .accessibilityAction(named: "Reply") {
            // Open reply
        }
        .accessibilityAction(named: "Delete") {
            // Delete message
        }
        .accessibilityAction(named: "Forward") {
            // Forward message
        }

        // Custom scroll action
        .accessibilityScrollAction { edge in
            switch edge {
            case .top: print("Scroll to top")
            case .bottom: print("Scroll to bottom")
            default: break
            }
        }
    }
}

struct Message: Identifiable {
    let id = UUID()
    let sender: String
    let body: String
}
```

## Accessibility Containers and Rotors

```swift
struct RotorExampleView: View {
    let items: [NewsItem]

    var body: some View {
        ScrollView {
            LazyVStack {
                ForEach(items) { item in
                    NewsCard(item: item)
                }
            }
        }
        // Custom rotor allows VoiceOver users to navigate directly between headlines
        .accessibilityRotor("Headlines") {
            ForEach(items) { item in
                AccessibilityRotorEntry(item.headline, id: item.id)
            }
        }
        // Another rotor for navigating by category
        .accessibilityRotor("Categories") {
            ForEach(uniqueCategories, id: \.self) { category in
                AccessibilityRotorEntry(category, id: category)
            }
        }
    }

    var uniqueCategories: [String] {
        Array(Set(items.map(\.category)))
    }
}

struct NewsCard: View {
    let item: NewsItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(item.headline)
                .font(.headline)
                .accessibilityAddTraits(.isHeader) // Enables heading navigation in VoiceOver rotor

            Text(item.summary)
                .font(.body)

            HStack {
                Text(item.category)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .background(.blue.opacity(0.1))
                    .cornerRadius(4)
                Spacer()
                Text(item.date, style: .relative)
                    .font(.caption)
            }
        }
        .padding()
        .accessibilityElement(children: .combine)
    }
}

struct NewsItem: Identifiable {
    let id = UUID()
    let headline: String
    let summary: String
    let category: String
    let date: Date
}

// Grouping elements as a summary
struct DashboardSummaryView: View {
    var body: some View {
        VStack {
            Text("Sales").font(.headline)
            Text("$12,345").font(.title)
            Text("+15% this month").font(.caption)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Sales, $12,345, up 15% this month")
        .accessibilityAddTraits(.isSummaryElement)
    }
}
```

## AccessibilityRepresentation for Custom Views

```swift
// Provide a standard accessibility representation for a custom-drawn view
struct CustomRatingControl: View {
    @Binding var rating: Int
    let maxRating = 5

    var body: some View {
        Canvas { context, size in
            let starWidth = size.width / CGFloat(maxRating)
            for i in 0..<maxRating {
                let rect = CGRect(
                    x: CGFloat(i) * starWidth, y: 0,
                    width: starWidth, height: size.height
                )
                let symbol = context.resolveSymbol(id: i < rating ? "filled" : "empty")!
                context.draw(symbol, in: rect)
            }
        } symbols: {
            Image(systemName: "star.fill").foregroundStyle(.yellow).tag("filled")
            Image(systemName: "star").foregroundStyle(.gray).tag("empty")
        }
        .frame(height: 44)
        .contentShape(Rectangle())
        // VoiceOver interacts with this as a slider rather than an opaque canvas
        .accessibilityRepresentation {
            Slider(value: .init(
                get: { Double(rating) },
                set: { rating = Int($0) }
            ), in: 0...Double(maxRating), step: 1) {
                Text("Rating")
            }
        }
    }
}

// Custom chart with Audio Graphs support
struct AccessibleChart: View {
    let data: [ChartDataPoint]

    var body: some View {
        Canvas { context, size in
            // Custom bar chart drawing
        }
        .accessibilityElement()
        .accessibilityLabel("Bar chart showing weekly progress")
        .accessibilityValue(chartSummary)
        .accessibilityChartDescriptor(self)
    }

    var chartSummary: String {
        let maxPoint = data.max(by: { $0.value < $1.value })
        let average = data.map(\.value).reduce(0, +) / Double(data.count)
        return "Highest: \(maxPoint?.label ?? "") at \(Int(maxPoint?.value ?? 0)). Average: \(Int(average))"
    }
}

// Implement AXChartDescriptorRepresentable for Audio Graphs (VoiceOver plays a tone)
extension AccessibleChart: AXChartDescriptorRepresentable {
    func makeChartDescriptor() -> AXChartDescriptor {
        let xAxis = AXCategoricalDataAxisDescriptor(
            title: "Day",
            categoryOrder: data.map(\.label)
        )
        let yAxis = AXNumericDataAxisDescriptor(
            title: "Steps",
            range: 0...Double(data.map(\.value).max() ?? 100),
            gridlinePositions: []
        )
        let series = AXDataSeriesDescriptor(
            name: "Daily Steps",
            isContinuous: false,
            dataPoints: data.map { point in
                AXDataPoint(x: point.label, y: point.value)
            }
        )

        return AXChartDescriptor(
            title: "Weekly Steps",
            summary: chartSummary,
            xAxis: xAxis,
            yAxis: yAxis,
            additionalAxes: [],
            series: [series]
        )
    }
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
}
```

## Testing with VoiceOver and Accessibility Inspector

### VoiceOver Testing Checklist

1. Enable VoiceOver: Settings > Accessibility > VoiceOver (or triple-click the side button)
2. Swipe right through every element on each screen and verify meaningful labels
3. Confirm that reading order is logical and follows visual layout
4. Test custom actions by swiping up/down on elements
5. Verify that heading navigation works via the rotor
6. Confirm decorative images are hidden and informative images have labels
7. Test dynamic content updates produce announcements

### Programmatic Announcements

```swift
// Announce dynamic changes to VoiceOver
func postAnnouncement(_ message: String) {
    UIAccessibility.post(notification: .announcement, argument: message)
}

// Notify that the layout changed (VoiceOver refocuses)
func notifyLayoutChanged(focusElement: Any? = nil) {
    UIAccessibility.post(notification: .layoutChanged, argument: focusElement)
}

// Notify that a new screen appeared
func notifyScreenChanged(focusElement: Any? = nil) {
    UIAccessibility.post(notification: .screenChanged, argument: focusElement)
}

// SwiftUI approach (iOS 17+)
struct LiveUpdateView: View {
    @State private var status = "Loading..."

    var body: some View {
        Text(status)
            .onChange(of: status) { _, newValue in
                AccessibilityNotification.Announcement(newValue).post()
            }
    }
}
```

### Accessibility Inspector (Xcode)

Open from Xcode menu: Xcode > Open Developer Tool > Accessibility Inspector.

- **Inspect**: Click any element to see its label, value, traits, frame, and actions
- **Audit**: Run an automated scan for common issues (missing labels, small hit regions, low contrast)
- **Settings**: Simulate Dynamic Type, Bold Text, Reduce Motion, Increase Contrast, Invert Colors

### XCTest Accessibility Audit (iOS 17+)

```swift
import XCTest

final class AccessibilityTests: XCTestCase {
    func testAccessibilityAudit() throws {
        let app = XCUIApplication()
        app.launch()

        // Run a full automated accessibility audit
        try app.performAccessibilityAudit()

        // Audit specific categories only
        try app.performAccessibilityAudit(for: [
            .dynamicType,                   // Text scales properly
            .sufficientElementDescription,  // Elements have labels
            .contrast,                      // Color contrast meets minimum
            .hitRegion,                     // Touch targets >= 44x44 pt
            .textClipped                    // Text is not cut off
        ])

        // Audit with known issue filtering
        try app.performAccessibilityAudit { issue in
            // Return true to ignore (pass) the issue
            if issue.auditType == .contrast && issue.element?.label == "decorative" {
                return true
            }
            return false
        }
    }

    func testButtonAccessibility() {
        let app = XCUIApplication()
        app.launch()

        let button = app.buttons["Add to cart"]
        XCTAssertTrue(button.exists, "Button must exist")
        XCTAssertFalse(button.label.isEmpty, "Button must have a label")

        // Verify minimum touch target size (44x44 pt)
        XCTAssertGreaterThanOrEqual(button.frame.width, 44)
        XCTAssertGreaterThanOrEqual(button.frame.height, 44)
    }
}
```

### All Accessibility Environment Values

```swift
struct AccessibilityAwareView: View {
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @Environment(\.accessibilityReduceTransparency) var reduceTransparency
    @Environment(\.accessibilityDifferentiateWithoutColor) var differentiateWithoutColor
    @Environment(\.accessibilityShowButtonShapes) var showButtonShapes
    @Environment(\.accessibilityVoiceOverEnabled) var voiceOverEnabled
    @Environment(\.accessibilitySwitchControlEnabled) var switchControlEnabled
    @Environment(\.dynamicTypeSize) var dynamicTypeSize
    @Environment(\.legibilityWeight) var legibilityWeight   // Bold Text setting
    @Environment(\.colorSchemeContrast) var contrast         // Increase Contrast setting

    var body: some View {
        VStack {
            Text("Accessibility-Aware View")
                .fontWeight(legibilityWeight == .bold ? .bold : .regular)

            if showButtonShapes {
                Button("Action") { }
                    .buttonStyle(.bordered) // Visible shape for underlined-buttons preference
            } else {
                Button("Action") { }
            }

            if voiceOverEnabled {
                Text("Swipe right to navigate items")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
```
