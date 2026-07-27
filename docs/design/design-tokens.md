# Design Tokens, Adaptive Color, and Liquid Glass

**Load this when:** building or reviewing an app's design system, adding a theme,
auditing dark-mode or Dynamic Type compliance, or applying glass/material
effects.

`docs/design/color-system.md` gives you *palettes* (hex values, gradients).
This document gives you the *system*: how those values are structured so a single
change propagates everywhere, and how the result stays legible in dark mode, at
accessibility text sizes, and under increased-contrast settings.

---

## 1. The Three-Tier Token Architecture

Never let a raw color or number appear at a call site. Tokens flow in one
direction through three tiers:

```
Tier 1 — Primitive   Tier 2 — Semantic        Tier 3 — Component
(raw values)          (intent)                  (usage)
blue500  #0A84FF  →   accent                →   Button.background
gray900  #1C1C1E  →   textPrimary           →   Card.titleColor
space4   16pt     →   spacing.contentInset  →   Card.padding
```

**Rules**

- Views reference **Tier 3 or Tier 2 only**. A view that names `blue500` is a bug.
- Tier 1 is `private` to the token module. It has no dark-mode variant — it is
  literally just a number.
- Tier 2 is where light/dark, high-contrast, and theme switching resolve.
- Adding a theme means adding one Tier 2 implementation, not editing views.

### Implementation

```swift
// DesignSystem/Tokens/Primitives.swift
// Tier 1 — raw values. Never referenced from a View.
enum Primitive {
    static let blue500  = Color(hex: 0x0A84FF)
    static let blue600  = Color(hex: 0x0060DF)
    static let indigo500 = Color(hex: 0x5E5CE6)
    static let red500   = Color(hex: 0xFF3B30)
    static let green500 = Color(hex: 0x34C759)
    static let amber500 = Color(hex: 0xFF9F0A)

    // Spacing scale — a 4pt rhythm. Nothing else is permitted.
    static let space1: CGFloat = 4
    static let space2: CGFloat = 8
    static let space3: CGFloat = 12
    static let space4: CGFloat = 16
    static let space5: CGFloat = 24
    static let space6: CGFloat = 32
    static let space7: CGFloat = 48

    // Radii
    static let radiusS: CGFloat = 8
    static let radiusM: CGFloat = 16
    static let radiusL: CGFloat = 24
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red:   Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >>  8) & 0xFF) / 255,
            blue:  Double( hex        & 0xFF) / 255,
            opacity: opacity
        )
    }
}
```

```swift
// DesignSystem/Tokens/Theme.swift
// Tier 2 — semantic intent. This is the swappable layer.
protocol Theme: Sendable {
    // Surfaces
    var background: Color { get }        // the page
    var surface: Color { get }           // cards, sheets
    var surfaceElevated: Color { get }   // popovers, menus

    // Content — must meet contrast against the surface it sits on
    var textPrimary: Color { get }
    var textSecondary: Color { get }
    var textOnAccent: Color { get }

    // Intent
    var accent: Color { get }
    var accentPressed: Color { get }
    var destructive: Color { get }
    var success: Color { get }
    var warning: Color { get }

    // Separators and elevation
    var separator: Color { get }
    var shadow: Color { get }
}

struct OceanTheme: Theme {
    // Apple's semantic colors already resolve light/dark AND increased contrast.
    // Prefer them for surfaces and text; reserve custom hex for brand accents.
    var background      = Color(.systemBackground)
    var surface         = Color(.secondarySystemBackground)
    var surfaceElevated = Color(.tertiarySystemBackground)

    var textPrimary   = Color(.label)
    var textSecondary = Color(.secondaryLabel)
    var textOnAccent  = Color.white

    var accent        = Primitive.blue500
    var accentPressed = Primitive.blue600
    var destructive   = Color(.systemRed)
    var success       = Color(.systemGreen)
    var warning       = Color(.systemOrange)

    var separator = Color(.separator)
    var shadow    = Color.black.opacity(0.08)
}
```

```swift
// DesignSystem/Tokens/Spacing.swift — Tier 2 for layout
enum Space {
    static let hairline    = Primitive.space1   // icon-to-label
    static let tight       = Primitive.space2   // within a control
    static let element     = Primitive.space3   // between related elements
    static let contentInset = Primitive.space4  // card padding, screen margins
    static let section     = Primitive.space5   // between sections
    static let major       = Primitive.space6   // above a page title
}

enum Radius {
    static let control = Primitive.radiusS      // buttons, chips
    static let card    = Primitive.radiusM      // cards, tiles
    static let sheet   = Primitive.radiusL      // modals
}
```

### Injecting the theme

```swift
private struct ThemeKey: EnvironmentKey {
    static let defaultValue: any Theme = OceanTheme()
}

extension EnvironmentValues {
    var theme: any Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            RootView().environment(\.theme, OceanTheme())
        }
    }
}
```

### Tier 3 — component tokens as ViewModifiers

```swift
struct CardStyle: ViewModifier {
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .padding(Space.contentInset)
            .background(theme.surface, in: .rect(cornerRadius: Radius.card))
            .shadow(color: theme.shadow, radius: 8, y: 4)
    }
}

extension View {
    func cardStyle() -> some View { modifier(CardStyle()) }
}

// Usage — no raw values anywhere.
VStack(alignment: .leading, spacing: Space.element) {
    Text("Monthly total").font(.headline).foregroundStyle(theme.textPrimary)
    Text("$1,240").font(.largeTitle.bold()).foregroundStyle(theme.accent)
}
.cardStyle()
```

### Anti-patterns

```swift
// WRONG — raw values at the call site. Changing the brand means grepping.
.padding(16)
.background(Color(red: 0.04, green: 0.52, blue: 1.0))
.cornerRadius(16)

// WRONG — a Tier 1 primitive leaking into a view.
.foregroundStyle(Primitive.blue500)

// WRONG — a semantic name that describes appearance, not intent.
var lightGray: Color { … }        // what happens in dark mode?
var textSecondary: Color { … }    // correct

// RIGHT
.padding(Space.contentInset)
.background(theme.accent, in: .rect(cornerRadius: Radius.card))
```

---

## 2. Dark Mode Compliance

### Prefer semantic system colors for surfaces and text

They adapt to light/dark **and** to Increase Contrast and Reduce Transparency —
three accessibility settings for the price of one.

| Role | Token | Light | Dark |
|------|-------|-------|------|
| Page | `Color(.systemBackground)` | white | black |
| Card | `Color(.secondarySystemBackground)` | light gray | dark gray |
| Elevated | `Color(.tertiarySystemBackground)` | white | lighter gray |
| Primary text | `Color(.label)` | near-black | near-white |
| Secondary text | `Color(.secondaryLabel)` | 60% | 60% |
| Divider | `Color(.separator)` | thin gray | thin gray |

### Custom brand colors need both variants

A brand accent tuned for white backgrounds usually fails on black. Define both
and resolve at render time:

```swift
extension Color {
    /// Resolves per trait collection — works in both modes without an asset catalog.
    static func adaptive(light: Color, dark: Color) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

struct MidnightTheme: Theme {
    var accent = Color.adaptive(
        light: Primitive.blue500,   // vivid on white
        dark:  Color(hex: 0x64B5FF) // lightened so it stays visible on black
    )
    // …
}
```

The asset-catalog equivalent (`Color("Accent")` with Any/Dark appearances) is
preferable when designers own the values; the code form is preferable when the
theme is swappable at runtime.

### Elevation reads differently in each mode

- **Light mode:** elevation = shadow. A card is white on light gray with
  `.shadow(color: theme.shadow, radius: 8, y: 4)`.
- **Dark mode:** shadows are nearly invisible on black. Elevation = a *lighter*
  surface. `secondarySystemBackground` already does this; do not add a heavier
  shadow to compensate.

```swift
@Environment(\.colorScheme) private var scheme

.shadow(color: theme.shadow, radius: scheme == .dark ? 0 : 8, y: 4)
.overlay(                                  // a hairline stroke reads better in dark
    RoundedRectangle(cornerRadius: Radius.card)
        .strokeBorder(theme.separator, lineWidth: scheme == .dark ? 1 : 0)
)
```

### Verify, don't assume

```swift
#Preview("Light") { ContentView().preferredColorScheme(.light) }
#Preview("Dark")  { ContentView().preferredColorScheme(.dark) }
#Preview("Increased Contrast") {
    ContentView().environment(\.colorSchemeContrast, .increased)
}
```

Every screen ships with all three previews. A pairing that only exists in one
mode is not done.

---

## 3. Dynamic Type Compliance

### Never use a fixed point size

```swift
// WRONG — ignores the user's text size entirely.
.font(.system(size: 17))
.frame(height: 44)                       // clips at accessibility sizes

// RIGHT — semantic styles scale automatically.
.font(.headline)
.frame(minHeight: 44)                    // a floor, not a ceiling

// RIGHT — a custom font that still scales.
.font(.custom("Inter-SemiBold", size: 17, relativeTo: .headline))
```

### Layouts must reflow, not clip

The accessibility sizes (`.accessibility1` … `.accessibility5`) can triple text
height. Horizontal rows must become vertical stacks.

```swift
struct StatRow: View {
    @Environment(\.dynamicTypeSize) private var typeSize
    let label: String
    let value: String

    var body: some View {
        // ViewThatFits picks the first layout that fits — no manual breakpoint.
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Space.element) {
                Text(label)
                Spacer()
                Text(value).fontWeight(.semibold)
            }
            VStack(alignment: .leading, spacing: Space.hairline) {
                Text(label)
                Text(value).fontWeight(.semibold)
            }
        }
    }
}

// Or branch explicitly when the two layouts differ structurally.
if typeSize.isAccessibilitySize {
    VStack(alignment: .leading) { icon; label }
} else {
    HStack { icon; label }
}
```

### Cap Dynamic Type only where it is genuinely unavoidable

```swift
// Acceptable: a fixed-height chart axis label or a tab bar item.
.dynamicTypeSize(...DynamicTypeSize.accessibility1)

// NOT acceptable: body copy, form fields, buttons, or list rows.
.dynamicTypeSize(.large)   // hard-pins every user to one size — never do this
```

### Compliance checklist

- [ ] No `.font(.system(size:))` without `relativeTo:`.
- [ ] No fixed `.frame(height:)` on a container holding text — use `minHeight`.
- [ ] Every `HStack` of label+value has a vertical fallback (`ViewThatFits` or
      an `isAccessibilitySize` branch).
- [ ] Icons paired with text use `.imageScale(.medium)` or a scaled symbol so
      they grow together.
- [ ] Tap targets stay ≥ 44×44pt at every size.
- [ ] Previewed at `.xSmall` **and** `.accessibility5`:

```swift
#Preview("XS")  { ContentView().dynamicTypeSize(.xSmall) }
#Preview("A11y5") { ContentView().dynamicTypeSize(.accessibility5) }
```

### Respect the other accessibility settings too

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion
@Environment(\.accessibilityReduceTransparency) private var reduceTransparency

.animation(reduceMotion ? nil : .spring(duration: 0.3), value: isExpanded)
.background(reduceTransparency ? AnyShapeStyle(theme.surface)
                               : AnyShapeStyle(.ultraThinMaterial))
```

---

## 4. Materials and Liquid Glass

### The one rule for any blur effect

**A material is only correct when there is content behind it.** Applied to a
solid background it renders as flat gray mud — the single most common way a
SwiftUI UI looks unfinished.

```swift
// WRONG — nothing behind it. This is just a muddy gray rectangle.
VStack { … }
    .background(.ultraThinMaterial)
    .background(theme.background)

// RIGHT — content scrolls beneath a floating bar.
ScrollView { content }
    .safeAreaInset(edge: .bottom) {
        HStack { … }
            .padding(Space.contentInset)
            .background(.ultraThinMaterial)
    }
```

| Material | Blur | Use for |
|----------|------|---------|
| `.ultraThinMaterial` | lightest | Floating toolbars over content |
| `.thinMaterial` | light | Sheet backgrounds, overlays |
| `.regularMaterial` | medium | Sidebars, popovers |
| `.thickMaterial` | heavy | Modal scrims |
| `.bar` | system | Custom nav/tab bars |

### Liquid Glass (iOS 26+, refined in iOS 27)

Liquid Glass is a dynamic material that refracts and reflects what is behind it
and responds to motion. It supersedes hand-rolled "glassmorphism" (a blur plus a
white stroke plus a gradient), which you should stop writing.

> **Availability: guard on iOS 26, not iOS 27.** The Liquid Glass APIs
> (`glassEffect`, `GlassEffectContainer`, `glassEffectID`, `.buttonStyle(.glass)`)
> were introduced in **iOS 26**. iOS 27 continues and refines the design system,
> but it did not reintroduce the API. Writing `if #available(iOS 27, *)` around
> `glassEffect` would drop every iOS 26 device to the fallback path for no reason
> — a silent regression for a large installed base. **Guard on the version where
> the symbol became available, never on the newest version you happen to be
> building with.** That rule holds for every API, not just this one.

```swift
if #available(iOS 26.0, *) {
    Text("Now Playing")
        .padding(Space.contentInset)
        .glassEffect()                                    // .regular, in a Capsule
}

// Shape, tint, and interactivity
.glassEffect(
    .regular
        .tint(theme.accent.opacity(0.7))
        .interactive(),                                   // reacts to touch
    in: .rect(cornerRadius: Radius.card)
)

// Buttons
Button("Play") { … }
    .buttonStyle(.glass)                                  // standard glass
Button("Subscribe") { … }
    .buttonStyle(.glassProminent)                         // accent-filled glass
```

**Grouping and morphing.** Sibling glass elements must live in a
`GlassEffectContainer` so they blend and merge instead of stacking blurs — each
independent `.glassEffect()` is a separate expensive render pass.

```swift
@available(iOS 26.0, *)
struct PlayerControls: View {
    @Namespace private var namespace
    @State private var isExpanded = false

    var body: some View {
        GlassEffectContainer(spacing: Space.tight) {
            HStack(spacing: Space.tight) {
                Button { … } label: { Image(systemName: "backward.fill") }
                    .glassEffect()
                    .glassEffectID("back", in: namespace)

                Button { isExpanded.toggle() } label: {
                    Image(systemName: isExpanded ? "pause.fill" : "play.fill")
                }
                .glassEffect()
                .glassEffectID("play", in: namespace)

                if isExpanded {
                    Button { … } label: { Image(systemName: "forward.fill") }
                        .glassEffect()
                        .glassEffectID("forward", in: namespace)
                }
            }
        }
        .animation(.spring(duration: 0.4), value: isExpanded)
    }
}
```

**Guidelines**

- Glass goes on the **navigation layer** — floating controls, toolbars, tab bars,
  overlays. Not on content itself, and never on a whole scrolling list.
- Never place glass on glass. One layer, over content.
- Text on glass uses `Color(.label)`, never a reduced opacity. The material
  already lowers effective contrast; do not lower it further.
- Keep the count small. Every glass surface is a render pass; a grid of twenty
  glass cards will drop frames on older devices.

### Availability fallback

Ship one modifier, branch once:

```swift
extension View {
    /// Liquid Glass on iOS 26+, an equivalent material treatment below it.
    func adaptiveGlass(cornerRadius: CGFloat = Radius.card) -> some View {
        modifier(AdaptiveGlass(cornerRadius: cornerRadius))
    }
}

private struct AdaptiveGlass: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.theme) private var theme
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        if reduceTransparency {
            // Accessibility wins over aesthetics — opaque surface, no blur.
            content.background(theme.surface, in: .rect(cornerRadius: cornerRadius))
        } else if #available(iOS 26.0, *) {
            content.glassEffect(.regular, in: .rect(cornerRadius: cornerRadius))
        } else {
            content
                .background(.ultraThinMaterial, in: .rect(cornerRadius: cornerRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .strokeBorder(.white.opacity(0.15), lineWidth: 1)
                )
        }
    }
}
```

---

## 5. Contrast Verification

The readability rules in `SKILL.md` are testable. Compute the ratio rather than
eyeballing it:

```swift
extension Color {
    /// WCAG relative luminance.
    private var relativeLuminance: Double {
        let components = UIColor(self).cgColor.components ?? [0, 0, 0]
        func channel(_ value: CGFloat) -> Double {
            let v = Double(value)
            return v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * channel(components[0])
             + 0.7152 * channel(components[safe: 1] ?? components[0])
             + 0.0722 * channel(components[safe: 2] ?? components[0])
    }

    /// WCAG contrast ratio, 1.0 (identical) to 21.0 (black on white).
    func contrastRatio(against other: Color) -> Double {
        let a = relativeLuminance, b = other.relativeLuminance
        let lighter = max(a, b), darker = min(a, b)
        return (lighter + 0.05) / (darker + 0.05)
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
```

Then assert it in the test target so a palette change cannot regress
accessibility:

```swift
@Test("theme meets WCAG AA in both modes")
func themeContrast() {
    let theme = OceanTheme()
    #expect(theme.textPrimary.contrastRatio(against: theme.surface) >= 4.5)
    #expect(theme.textOnAccent.contrastRatio(against: theme.accent) >= 4.5)
    #expect(theme.textSecondary.contrastRatio(against: theme.surface) >= 4.5)
}
```

| Content | Minimum ratio |
|---------|---------------|
| Body text | 4.5:1 |
| Large text (18pt+, or 14pt bold) | 3:1 |
| UI controls, icons, focus rings | 3:1 |
| Decorative, disabled | no requirement |

---

## Quick Reference

| Need | Use |
|------|-----|
| Page background | `theme.background` → `Color(.systemBackground)` |
| Card background | `theme.surface` → `Color(.secondarySystemBackground)` |
| Any spacing value | `Space.*` — never a literal |
| Any corner radius | `Radius.*` — never a literal |
| Brand accent | `Color.adaptive(light:dark:)` or an asset-catalog color |
| Floating bar over content | `.ultraThinMaterial`, or `.glassEffect()` on iOS 26+ |
| Multiple glass elements | one `GlassEffectContainer` |
| Text size | semantic styles, or `.custom(_:size:relativeTo:)` |
| Row that must reflow | `ViewThatFits` or `typeSize.isAccessibilitySize` |
| Verifying a pairing | `contrastRatio(against:)` in a test |
