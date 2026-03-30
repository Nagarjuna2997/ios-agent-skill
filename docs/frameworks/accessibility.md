# Accessibility

## VoiceOver Support

```swift
import SwiftUI

// Basic labels and hints
struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack {
            AsyncImage(url: product.imageURL)
                .accessibilityLabel("Photo of \(product.name)")

            Text(product.name)
            Text(product.price, format: .currency(code: "USD"))
        }
        // Combine children into a single accessible element
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(product.name), \(product.price.formatted(.currency(code: "USD")))")
        .accessibilityHint("Double tap to view details")
    }
}

// Accessibility value for state
struct RatingView: View {
    @Binding var rating: Int
    let maxRating = 5

    var body: some View {
        HStack {
            ForEach(1...maxRating, id: \.self) { star in
                Image(systemName: star <= rating ? "star.fill" : "star")
                    .foregroundStyle(star <= rating ? .yellow : .gray)
                    .onTapGesture { rating = star }
            }
        }
        .accessibilityElement()
        .accessibilityLabel("Rating")
        .accessibilityValue("\(rating) out of \(maxRating) stars")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment:
                if rating < maxRating { rating += 1 }
            case .decrement:
                if rating > 1 { rating -= 1 }
            @unknown default:
                break
            }
        }
    }
}

// Hide decorative elements
struct DecorativeHeader: View {
    var body: some View {
        HStack {
            Image(systemName: "sparkles")
                .accessibilityHidden(true) // Decorative, hide from VoiceOver
            Text("Featured")
            Image(systemName: "sparkles")
                .accessibilityHidden(true)
        }
    }
}

// Group related elements
struct OrderSummary: View {
    let items: [OrderItem]
    let total: Double

    var body: some View {
        VStack {
            ForEach(items) { item in
                HStack {
                    Text(item.name)
                    Spacer()
                    Text(item.price, format: .currency(code: "USD"))
                }
                .accessibilityElement(children: .combine)
            }
            Divider()
            HStack {
                Text("Total")
                    .fontWeight(.bold)
                Spacer()
                Text(total, format: .currency(code: "USD"))
                    .fontWeight(.bold)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Total: \(total.formatted(.currency(code: "USD")))")
        }
    }
}
```

## Dynamic Type

```swift
// Use built-in text styles (automatically scale)
struct TypographyExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Large Title").font(.largeTitle)
            Text("Title").font(.title)
            Text("Headline").font(.headline)
            Text("Body text").font(.body)
            Text("Caption").font(.caption)
            Text("Footnote").font(.footnote)
        }
    }
}

// @ScaledMetric for custom values that scale with Dynamic Type
struct ScaledCard: View {
    @ScaledMetric(relativeTo: .body) private var iconSize: CGFloat = 24
    @ScaledMetric(relativeTo: .body) private var padding: CGFloat = 16
    @ScaledMetric(relativeTo: .body) private var spacing: CGFloat = 12

    var body: some View {
        HStack(spacing: spacing) {
            Image(systemName: "star.fill")
                .frame(width: iconSize, height: iconSize)
            VStack(alignment: .leading) {
                Text("Featured")
                    .font(.headline)
                Text("Recommended for you")
                    .font(.subheadline)
            }
        }
        .padding(padding)
    }
}

// Respond to current Dynamic Type size
struct AdaptiveLayout: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        if dynamicTypeSize >= .accessibility1 {
            // Stack vertically for very large text
            VStack(alignment: .leading) {
                label
                value
            }
        } else {
            // Side by side for normal sizes
            HStack {
                label
                Spacer()
                value
            }
        }
    }

    private var label: some View {
        Text("Temperature")
            .font(.headline)
    }

    private var value: some View {
        Text("72 F")
            .font(.body)
            .foregroundStyle(.secondary)
    }
}

// Limit Dynamic Type range if needed
struct ConstrainedText: View {
    var body: some View {
        Text("Fixed range text")
            .dynamicTypeSize(.small ... .xxxLarge) // Prevents accessibility sizes
    }
}
```

## Color and Contrast

```swift
struct AccessibleColorView: View {
    // Respect system color inversion
    var body: some View {
        VStack {
            // Images that should not be inverted (photos)
            Image("userPhoto")
                .accessibilityIgnoresInvertColors(true)

            // Use semantic colors — they adapt automatically
            Text("Primary text")
                .foregroundStyle(.primary)
            Text("Secondary text")
                .foregroundStyle(.secondary)

            // Custom colors: always provide enough contrast (4.5:1 for text)
            Text("Important")
                .foregroundStyle(Color("HighContrast")) // Define in asset catalog with light/dark variants

            // Check if user has increased contrast enabled
            ContrastAwareButton()
        }
    }
}

struct ContrastAwareButton: View {
    @Environment(\.colorSchemeContrast) private var contrast

    var body: some View {
        Button("Action") {}
            .padding()
            .background(contrast == .increased ? Color.primary : Color.accentColor)
            .foregroundStyle(contrast == .increased ? Color(uiColor: .systemBackground) : .white)
            .cornerRadius(8)
    }
}

// Differentiate without color alone (use shapes, labels, patterns)
struct StatusIndicator: View {
    let status: Status

    enum Status {
        case success, warning, error
    }

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: statusIcon)
                .foregroundStyle(statusColor)
            Text(statusText)
                .foregroundStyle(statusColor)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(statusText)
    }

    private var statusIcon: String {
        switch status {
        case .success: return "checkmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .error: return "xmark.circle.fill"
        }
    }

    private var statusColor: Color {
        switch status {
        case .success: return .green
        case .warning: return .orange
        case .error: return .red
        }
    }

    private var statusText: String {
        switch status {
        case .success: return "Success"
        case .warning: return "Warning"
        case .error: return "Error"
        }
    }
}
```

## Reduce Motion

```swift
struct AnimatedView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isExpanded = false

    var body: some View {
        VStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(.blue)
                .frame(height: isExpanded ? 300 : 100)
                .animation(reduceMotion ? .none : .spring(duration: 0.5), value: isExpanded)

            Button(isExpanded ? "Collapse" : "Expand") {
                if reduceMotion {
                    // Instant change, no animation
                    isExpanded.toggle()
                } else {
                    withAnimation(.spring(duration: 0.5)) {
                        isExpanded.toggle()
                    }
                }
            }
        }
    }
}

// Conditional animation helper
extension View {
    func accessibleAnimation<V: Equatable>(_ animation: Animation?, value: V) -> some View {
        self.modifier(AccessibleAnimationModifier(animation: animation, value: value))
    }
}

struct AccessibleAnimationModifier<V: Equatable>: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let animation: Animation?
    let value: V

    func body(content: Content) -> some View {
        content.animation(reduceMotion ? nil : animation, value: value)
    }
}
```

## Custom Actions

```swift
struct MessageRow: View {
    let message: Message
    var onReply: () -> Void
    var onForward: () -> Void
    var onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading) {
            Text(message.sender)
                .font(.headline)
            Text(message.body)
                .font(.body)
            Text(message.date, style: .relative)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(message.sender): \(message.body)")
        // Custom actions available via VoiceOver rotor
        .accessibilityAction(named: "Reply") { onReply() }
        .accessibilityAction(named: "Forward") { onForward() }
        .accessibilityAction(named: "Delete") { onDelete() }
    }
}

// Custom scroll action
struct PagedContent: View {
    @State private var currentPage = 0
    let pageCount = 5

    var body: some View {
        TabView(selection: $currentPage) {
            ForEach(0..<pageCount, id: \.self) { index in
                Text("Page \(index + 1)")
                    .tag(index)
            }
        }
        .tabViewStyle(.page)
        .accessibilityLabel("Content pages")
        .accessibilityValue("Page \(currentPage + 1) of \(pageCount)")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment:
                if currentPage < pageCount - 1 { currentPage += 1 }
            case .decrement:
                if currentPage > 0 { currentPage -= 1 }
            @unknown default:
                break
            }
        }
    }
}
```

## Accessibility Containers and Rotors

```swift
// Custom rotor for quick navigation
struct ArticleView: View {
    let headings: [Heading]
    let body: String

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ForEach(headings) { heading in
                    Text(heading.text)
                        .font(.title2)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)
                }
                Text(body)
                    .font(.body)
            }
        }
        .accessibilityRotor("Headings") {
            ForEach(headings) { heading in
                AccessibilityRotorEntry(heading.text, id: heading.id)
            }
        }
    }
}

// Sort priority for VoiceOver traversal order
struct CustomOrderView: View {
    var body: some View {
        ZStack {
            // Visually at the bottom but read first
            Text("Important alert")
                .accessibilitySortPriority(2)

            // Visually at the top but read second
            Text("Title")
                .accessibilitySortPriority(1)
        }
    }
}

// Announce changes to VoiceOver
struct LiveUpdateView: View {
    @State private var statusMessage = ""

    var body: some View {
        VStack {
            Text(statusMessage)
                .accessibilityLiveRegion(.polite) // .assertive for urgent updates

            Button("Refresh") {
                statusMessage = "Data updated successfully"
                // VoiceOver will automatically announce the change
            }
        }
    }
}
```

## Testing Accessibility

1. **Accessibility Inspector** (Xcode > Open Developer Tool): inspect any element's labels, hints, traits.
2. **VoiceOver** (Settings > Accessibility > VoiceOver): test with real screen reader.
3. **Xcode Accessibility Audit** (Debug navigator > Audit): automated checks.

```swift
// UI testing for accessibility
import XCTest

class AccessibilityUITests: XCTestCase {

    func testProductCardAccessibility() {
        let app = XCUIApplication()
        app.launch()

        // Verify accessible elements exist
        let productCard = app.staticTexts["Running Shoes, $129.99"]
        XCTAssertTrue(productCard.exists)

        // Verify button accessibility
        let addToCart = app.buttons["Add to cart"]
        XCTAssertTrue(addToCart.exists)
        XCTAssertTrue(addToCart.isEnabled)
    }

    func testVoiceOverOrder() {
        let app = XCUIApplication()
        app.launch()

        // Check that elements are in expected order
        let elements = app.descendants(matching: .any).allElementsBoundByAccessibilityElement
        // Verify logical reading order
    }

    func testDynamicType() {
        let app = XCUIApplication()
        // Launch with large text
        app.launchArguments += ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityXXXL"]
        app.launch()

        // Verify layout adapts (no truncation, no overlapping)
        let title = app.staticTexts["Welcome"]
        XCTAssertTrue(title.exists)
    }
}

// WCAG 2.1 AA Checklist:
// - Text contrast ratio >= 4.5:1 (3:1 for large text)
// - All interactive elements have labels
// - Touch targets >= 44x44 points
// - No information conveyed by color alone
// - Content reflows at 200% text size
// - Animations can be paused/disabled
// - Focus order is logical
// - Error messages are associated with inputs
```
