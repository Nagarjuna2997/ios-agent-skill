# iOS Typography System -- Complete Guide for Stunning SwiftUI Text

## Overview

Typography accounts for roughly 80% of a UI's visual surface. Getting it right is the single most impactful design decision. This guide covers Apple's built-in type system, custom fonts, SF Symbols, Dynamic Type, and advanced text effects -- all with compilable SwiftUI code.

---

## 1. Apple's Built-In Text Styles

These styles scale automatically with Dynamic Type and ensure consistency across the system.

```swift
import SwiftUI

struct TextStyleCatalog: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Large Title").font(.largeTitle)    // 34pt, used for top-level headers
                Text("Title").font(.title)               // 28pt, screen titles
                Text("Title 2").font(.title2)            // 22pt, section headers
                Text("Title 3").font(.title3)            // 20pt, sub-section headers
                Text("Headline").font(.headline)         // 17pt semibold, row labels
                Text("Subheadline").font(.subheadline)   // 15pt, secondary row labels
                Text("Body").font(.body)                 // 17pt, primary content
                Text("Callout").font(.callout)           // 16pt, annotation text
                Text("Footnote").font(.footnote)         // 13pt, timestamps, captions
                Text("Caption").font(.caption)           // 12pt, legal text
                Text("Caption 2").font(.caption2)        // 11pt, smallest readable
            }
            .padding(24)
        }
    }
}
```

### Combining Style with Weight

```swift
struct WeightedTextExamples: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Ultralight Title").font(.largeTitle.weight(.ultraLight))
            Text("Thin Title").font(.largeTitle.weight(.thin))
            Text("Light Title").font(.largeTitle.weight(.light))
            Text("Regular Title").font(.largeTitle.weight(.regular))
            Text("Medium Title").font(.largeTitle.weight(.medium))
            Text("Semibold Title").font(.largeTitle.weight(.semibold))
            Text("Bold Title").font(.largeTitle.weight(.bold))
            Text("Heavy Title").font(.largeTitle.weight(.heavy))
            Text("Black Title").font(.largeTitle.weight(.black))
        }
        .padding(24)
    }
}
```

---

## 2. Font Designs

Apple provides four design variants of San Francisco.

```swift
struct FontDesignShowcase: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Default (SF Pro)")
                    .font(.system(.title2, design: .default, weight: .bold))
                Text("Clean and neutral -- ideal for most apps")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Rounded (SF Rounded)")
                    .font(.system(.title2, design: .rounded, weight: .bold))
                Text("Friendly and approachable -- great for wellness, kids, casual")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Serif (New York)")
                    .font(.system(.title2, design: .serif, weight: .bold))
                Text("Editorial and elegant -- perfect for news, reading, luxury")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Monospaced (SF Mono)")
                    .font(.system(.title2, design: .monospaced, weight: .bold))
                Text("Technical and precise -- code editors, data, developer tools")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(24)
    }
}
```

---

## 3. Custom Fonts

### Registering Custom Fonts

1. Add `.ttf` or `.otf` files to your Xcode project.
2. Ensure they are added to the target's "Copy Bundle Resources" build phase.
3. Add each font filename to `Info.plist` under the key `UIAppFonts` (also called "Fonts provided by application").

```xml
<!-- Info.plist entry -->
<key>UIAppFonts</key>
<array>
    <string>Satoshi-Regular.otf</string>
    <string>Satoshi-Bold.otf</string>
    <string>Satoshi-Medium.otf</string>
</array>
```

### Using Custom Fonts in SwiftUI

```swift
struct CustomFontDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Custom Regular")
                .font(.custom("Satoshi-Regular", size: 17))

            Text("Custom Bold")
                .font(.custom("Satoshi-Bold", size: 28))

            // Relative to a text style (scales with Dynamic Type)
            Text("Custom with Dynamic Type")
                .font(.custom("Satoshi-Medium", size: 17, relativeTo: .body))
        }
        .padding(24)
    }
}
```

### Font Extension for Clean Usage

```swift
extension Font {
    static func satoshi(_ weight: SatoshiWeight, size: CGFloat) -> Font {
        .custom(weight.rawValue, size: size)
    }

    static func satoshiRelative(_ weight: SatoshiWeight, size: CGFloat, relativeTo style: TextStyle) -> Font {
        .custom(weight.rawValue, size: size, relativeTo: style)
    }

    enum SatoshiWeight: String {
        case regular = "Satoshi-Regular"
        case medium = "Satoshi-Medium"
        case bold = "Satoshi-Bold"
    }
}

// Usage:
// Text("Hello").font(.satoshi(.bold, size: 24))
```

---

## 4. SF Symbols Integration

SF Symbols 5+ includes over 5,000 symbols that integrate seamlessly with text.

### Basic Usage

```swift
struct SFSymbolsBasic: View {
    var body: some View {
        VStack(spacing: 16) {
            // Inline with text (symbols match font metrics automatically)
            Label("Favorites", systemImage: "heart.fill")
                .font(.title2)

            // Standalone image with font size
            Image(systemName: "arrow.up.right.circle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.blue)

            // Symbol alongside text baseline
            HStack(alignment: .firstTextBaseline) {
                Image(systemName: "clock.fill")
                Text("5 minutes ago")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
    }
}
```

### Symbol Rendering Modes

```swift
struct SymbolRenderingModes: View {
    var body: some View {
        VStack(spacing: 24) {
            // Monochrome -- single color
            Image(systemName: "cloud.sun.rain.fill")
                .symbolRenderingMode(.monochrome)
                .font(.system(size: 48))
                .foregroundStyle(.blue)

            // Hierarchical -- primary color with automatic opacity layers
            Image(systemName: "cloud.sun.rain.fill")
                .symbolRenderingMode(.hierarchical)
                .font(.system(size: 48))
                .foregroundStyle(.blue)

            // Palette -- explicit colors for each layer
            Image(systemName: "cloud.sun.rain.fill")
                .symbolRenderingMode(.palette)
                .font(.system(size: 48))
                .foregroundStyle(.gray, .yellow, .blue)

            // Multicolor -- system-defined colors
            Image(systemName: "cloud.sun.rain.fill")
                .symbolRenderingMode(.multicolor)
                .font(.system(size: 48))
        }
    }
}
```

### Variable Value Symbols

```swift
struct VariableSymbolDemo: View {
    @State private var progress: Double = 0.7

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "speaker.wave.3.fill", variableValue: progress)
                .font(.system(size: 48))
                .foregroundStyle(.blue)
                .contentTransition(.symbolEffect(.automatic))

            Slider(value: $progress, in: 0...1)
                .padding(.horizontal, 40)

            Image(systemName: "wifi", variableValue: progress)
                .font(.system(size: 48))
                .foregroundStyle(.green)
        }
        .padding()
    }
}
```

### Symbol Effects (iOS 17+)

```swift
struct SymbolEffectsDemo: View {
    @State private var isFavorite = false
    @State private var bounceCount = 0

    var body: some View {
        VStack(spacing: 32) {
            // Bounce effect
            Image(systemName: "bell.fill")
                .font(.system(size: 44))
                .foregroundStyle(.orange)
                .symbolEffect(.bounce, value: bounceCount)
                .onTapGesture { bounceCount += 1 }

            // Pulse effect (continuous)
            Image(systemName: "heart.fill")
                .font(.system(size: 44))
                .foregroundStyle(.red)
                .symbolEffect(.pulse)

            // Replace transition
            Button {
                isFavorite.toggle()
            } label: {
                Image(systemName: isFavorite ? "heart.fill" : "heart")
                    .font(.system(size: 44))
                    .foregroundStyle(isFavorite ? .red : .gray)
                    .contentTransition(.symbolEffect(.replace))
            }

            // Breathe effect (continuous)
            Image(systemName: "lungs.fill")
                .font(.system(size: 44))
                .foregroundStyle(.teal)
                .symbolEffect(.breathe)

            // Scale effect
            Image(systemName: "star.fill")
                .font(.system(size: 44))
                .foregroundStyle(.yellow)
                .symbolEffect(.scale.up, isActive: isFavorite)
        }
        .padding()
    }
}
```

---

## 5. Dynamic Type Support

### @ScaledMetric

Scale arbitrary numeric values proportionally to the user's Dynamic Type setting.

```swift
struct ScaledMetricDemo: View {
    @ScaledMetric(relativeTo: .title) var iconSize: CGFloat = 28
    @ScaledMetric(relativeTo: .body) var spacing: CGFloat = 12
    @ScaledMetric(relativeTo: .body) var cardPadding: CGFloat = 16

    var body: some View {
        HStack(spacing: spacing) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: iconSize))
                .foregroundStyle(.blue)

            VStack(alignment: .leading, spacing: 4) {
                Text("John Appleseed")
                    .font(.headline)
                Text("iOS Developer")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(cardPadding)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}
```

### minimumScaleFactor

Prevent text from being clipped while still supporting Dynamic Type.

```swift
struct ScaleFactorDemo: View {
    var body: some View {
        Text("This very long title will shrink instead of truncating")
            .font(.title)
            .minimumScaleFactor(0.5)
            .lineLimit(1)
            .padding()
    }
}
```

---

## 6. Typography Hierarchy Best Practices

A clear hierarchy uses no more than 3-4 sizes with weight variation.

```swift
struct TypographyHierarchyCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Overline -- smallest, uppercase, colored
            Text("FEATURED")
                .font(.caption.weight(.bold))
                .foregroundStyle(Color(hex: "6C63FF"))
                .kerning(1.5)
                .padding(.bottom, 8)

            // Title -- largest element on card
            Text("The Art of Typography")
                .font(.title2.weight(.bold))
                .foregroundStyle(.primary)
                .padding(.bottom, 4)

            // Subtitle -- contextual info
            Text("Design Systems -- March 2026")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.bottom, 16)

            // Body -- main content
            Text("Great typography establishes visual hierarchy, guides the reader, and creates emotional resonance. In iOS, the San Francisco font family provides all the tools needed for world-class type.")
                .font(.body)
                .foregroundStyle(.primary)
                .lineSpacing(4)
                .padding(.bottom, 16)

            // Action -- button text
            Text("Read More")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color(hex: "6C63FF"))
        }
        .padding(24)
        .background(Color(.secondarySystemGroupedBackground))
        .cornerRadius(20)
        .padding(.horizontal, 16)
    }
}
```

---

## 7. Text Effects

### Gradient Text

```swift
struct GradientTextView: View {
    var body: some View {
        Text("Gradient Text")
            .font(.system(size: 48, weight: .black, design: .rounded))
            .foregroundStyle(
                LinearGradient(
                    colors: [Color(hex: "8B5CF6"), Color(hex: "EC4899"), Color(hex: "06B6D4")],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
    }
}
```

### Shadow Text

```swift
struct ShadowTextView: View {
    var body: some View {
        VStack(spacing: 32) {
            // Subtle shadow
            Text("Soft Shadow")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.white)
                .shadow(color: .black.opacity(0.3), radius: 8, y: 4)

            // Glow effect
            Text("Neon Glow")
                .font(.largeTitle.weight(.black))
                .foregroundStyle(Color(hex: "06B6D4"))
                .shadow(color: Color(hex: "06B6D4").opacity(0.6), radius: 12)
                .shadow(color: Color(hex: "06B6D4").opacity(0.3), radius: 24)
        }
        .padding(40)
        .background(.black)
    }
}
```

### Outlined Text (Stroke)

```swift
struct OutlinedTextView: View {
    var body: some View {
        ZStack {
            // Stroke layer
            Text("BOLD")
                .font(.system(size: 72, weight: .black))
                .foregroundStyle(.clear)
                .overlay(
                    Text("BOLD")
                        .font(.system(size: 72, weight: .black))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(hex: "6C63FF"), Color(hex: "EC4899")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .mask(
                            Text("BOLD")
                                .font(.system(size: 72, weight: .black))
                        )
                )
        }
    }
}

// Alternative approach using strokeBorder on custom shape
struct StrokedText: View {
    var body: some View {
        Text("OUTLINE")
            .font(.system(size: 64, weight: .black))
            .foregroundStyle(.clear)
            .overlay(
                Text("OUTLINE")
                    .font(.system(size: 64, weight: .black))
                    .foregroundStyle(
                        .linearGradient(
                            colors: [Color(hex: "FF6B35"), Color(hex: "F7C948")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            )
    }
}
```

### Animated Text

```swift
struct AnimatedCounterText: View {
    @State private var value: Double = 0

    var body: some View {
        VStack(spacing: 16) {
            Text("\(value, specifier: "%.0f")")
                .font(.system(size: 72, weight: .black, design: .rounded))
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color(hex: "2D9F6F"), Color(hex: "22D3EE")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .contentTransition(.numericText())

            Button("Animate") {
                withAnimation(.spring(duration: 0.8, bounce: 0.2)) {
                    value = Double.random(in: 0...9999)
                }
            }
            .buttonStyle(.borderedProminent)
        }
    }
}

struct TypewriterText: View {
    let fullText: String
    @State private var displayedText = ""
    @State private var charIndex = 0

    var body: some View {
        Text(displayedText)
            .font(.title2.weight(.medium))
            .onAppear {
                Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
                    if charIndex < fullText.count {
                        let index = fullText.index(fullText.startIndex, offsetBy: charIndex)
                        displayedText += String(fullText[index])
                        charIndex += 1
                    } else {
                        timer.invalidate()
                    }
                }
            }
    }
}
```

---

## 8. Markdown Support in Text

SwiftUI Text views parse Markdown automatically starting in iOS 15.

```swift
struct MarkdownTextDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("This is **bold** and this is *italic*.")

            Text("Visit [Apple](https://apple.com) for more.")

            Text("Use `code` in your text.")

            Text("~~Strikethrough~~ is supported too.")

            // Combine Markdown with font styling
            Text("**Premium Plan** -- $9.99/month")
                .font(.headline)

            // Multiline Markdown
            Text("""
            # Features
            - **Fast** performance
            - *Beautiful* design
            - `Clean` code
            """)
        }
        .padding(24)
    }
}
```

---

## 9. AttributedString

For rich text that goes beyond Markdown, use `AttributedString`.

```swift
struct AttributedStringDemo: View {
    var attributedGreeting: AttributedString {
        var hello = AttributedString("Hello ")
        hello.font = .title.weight(.light)
        hello.foregroundColor = .secondary

        var name = AttributedString("World")
        name.font = .title.weight(.bold)
        name.foregroundColor = .primary

        var emoji = AttributedString(" !")
        emoji.font = .title

        return hello + name + emoji
    }

    var highlightedText: AttributedString {
        var full = AttributedString("SwiftUI makes building beautiful apps incredibly fast and enjoyable.")
        full.font = .body

        if let range = full.range(of: "beautiful") {
            full[range].foregroundColor = Color(hex: "8B5CF6")
            full[range].font = .body.weight(.bold)
        }

        if let range = full.range(of: "fast") {
            full[range].foregroundColor = Color(hex: "2D9F6F")
            full[range].font = .body.weight(.bold)
        }

        return full
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text(attributedGreeting)
            Text(highlightedText)
                .lineSpacing(4)
        }
        .padding(24)
    }
}
```

### AttributedString with Links and Dates

```swift
struct RichAttributedText: View {
    var formattedText: AttributedString {
        var text = AttributedString("Updated ")
        text.font = .footnote
        text.foregroundColor = .secondary

        var date = AttributedString(Date.now, format: .dateTime.month().day().year())
        date.font = .footnote.weight(.semibold)
        date.foregroundColor = .primary

        var separator = AttributedString(" -- ")
        separator.font = .footnote

        var link = AttributedString("View Source")
        link.font = .footnote.weight(.medium)
        link.foregroundColor = Color(hex: "0A6EBD")
        link.link = URL(string: "https://developer.apple.com")

        return text + date + separator + link
    }

    var body: some View {
        Text(formattedText)
            .padding()
    }
}
```

---

## 10. Stunning Text Treatment Compositions

### Hero Header with Gradient and Blur

```swift
struct HeroTextHeader: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "0B0B1A"), Color(hex: "1A1A2E")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 12) {
                Text("Introducing")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(.white.opacity(0.6))
                    .kerning(3)
                    .textCase(.uppercase)

                Text("Premium")
                    .font(.system(size: 64, weight: .black, design: .serif))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "F472B6"), Color(hex: "A78BFA"), Color(hex: "6C63FF")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )

                Text("Crafted with care for those who\nappreciate the finer details.")
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
        }
        .frame(height: 350)
    }
}
```

### Pill Tag with Custom Typography

```swift
struct StyledTag: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text.uppercased())
            .font(.caption2.weight(.bold))
            .kerning(1.2)
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(color, in: Capsule())
    }
}

struct TagRow: View {
    var body: some View {
        HStack(spacing: 8) {
            StyledTag(text: "SwiftUI", color: Color(hex: "6C63FF"))
            StyledTag(text: "iOS 18", color: Color(hex: "EC4899"))
            StyledTag(text: "New", color: Color(hex: "2D9F6F"))
        }
    }
}
```

### Statistic Display with Mixed Typography

```swift
struct StatDisplay: View {
    let value: String
    let unit: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundStyle(.primary)
                Text(unit)
                    .font(.title3.weight(.medium))
                    .foregroundStyle(.secondary)
            }
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundStyle(.tertiary)
                .textCase(.uppercase)
                .kerning(1)
        }
    }
}

struct StatsRow: View {
    var body: some View {
        HStack(spacing: 32) {
            StatDisplay(value: "2.4", unit: "M", label: "Downloads")
            StatDisplay(value: "4.9", unit: "", label: "Rating")
            StatDisplay(value: "128", unit: "K", label: "Reviews")
        }
        .padding(24)
        .background(Color(.secondarySystemGroupedBackground))
        .cornerRadius(20)
    }
}
```

---

## Quick Reference

| Category           | Key APIs                                                  |
|--------------------|-----------------------------------------------------------|
| Text Styles        | `.largeTitle`, `.title`, `.title2`, `.title3`, `.headline`, `.subheadline`, `.body`, `.callout`, `.footnote`, `.caption`, `.caption2` |
| Font Designs       | `.default`, `.rounded`, `.serif`, `.monospaced`           |
| Weights            | `.ultraLight` through `.black` (9 levels)                 |
| Custom Fonts       | `.custom("Name", size:)`, `.custom("Name", size:, relativeTo:)` |
| SF Symbols         | `.symbolRenderingMode()`, `.symbolEffect()`, `variableValue:` |
| Dynamic Type       | `@ScaledMetric`, `.minimumScaleFactor()`, `relativeTo:`   |
| Text Effects       | `.foregroundStyle()` with gradients, `.shadow()`, `.contentTransition()` |
| Rich Text          | Markdown in `Text()`, `AttributedString`                  |
| Kerning/Tracking   | `.kerning()`, `.tracking()`                               |
| Line Spacing       | `.lineSpacing()`, `.lineLimit()`                          |
