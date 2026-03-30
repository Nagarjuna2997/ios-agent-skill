# iOS Color System -- Complete Guide for Stunning SwiftUI UIs

## Overview

Color is the single most powerful tool for creating emotional impact in iOS applications. This guide covers every aspect of the SwiftUI color system, from Apple's semantic tokens to custom brand palettes, gradients, materials, and accessibility. Every code example compiles and produces production-quality results.

---

## 1. Apple's Semantic Colors

Semantic colors adapt automatically to light mode, dark mode, and increased contrast settings. Always prefer these over hardcoded values.

```swift
import SwiftUI

struct SemanticColorsShowcase: View {
    var body: some View {
        VStack(spacing: 16) {
            // Label colors -- automatically adapt to appearance
            Text("Primary Label")
                .foregroundStyle(.primary)
            Text("Secondary Label")
                .foregroundStyle(.secondary)
            Text("Tertiary Label")
                .foregroundStyle(.tertiary)
            Text("Quaternary Label")
                .foregroundStyle(.quaternary)

            Divider()

            // Tint / accent color
            Button("Accent Color Button") {}
                .tint(.accentColor)

            // Semantic intent colors
            HStack(spacing: 12) {
                Circle().fill(.red).frame(width: 32, height: 32)    // Destructive
                Circle().fill(.orange).frame(width: 32, height: 32) // Warning
                Circle().fill(.green).frame(width: 32, height: 32)  // Success
                Circle().fill(.blue).frame(width: 32, height: 32)   // Informational
                Circle().fill(.yellow).frame(width: 32, height: 32) // Caution
            }
        }
        .padding(24)
    }
}
```

### System Grouped Colors

These create the layered card-on-background look native to iOS Settings and many Apple apps.

```swift
struct SystemBackgroundsDemo: View {
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                // Primary surface card
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.secondarySystemGroupedBackground))
                    .frame(height: 120)
                    .overlay(
                        Text("Secondary Grouped Background")
                            .foregroundStyle(.primary)
                    )

                // Nested surface
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.tertiarySystemGroupedBackground))
                    .frame(height: 120)
                    .overlay(
                        Text("Tertiary Grouped Background")
                            .foregroundStyle(.secondary)
                    )
            }
            .padding(20)
        }
    }
}
```

### Flat Background Hierarchy

For non-grouped layouts (full-bleed content rather than inset cards).

```swift
struct FlatBackgroundsDemo: View {
    var body: some View {
        ZStack {
            Color(.systemBackground)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Rectangle()
                    .fill(Color(.secondarySystemBackground))
                    .frame(height: 80)
                    .overlay(Text("Secondary").foregroundStyle(.primary))

                Rectangle()
                    .fill(Color(.tertiarySystemBackground))
                    .frame(height: 80)
                    .overlay(Text("Tertiary").foregroundStyle(.primary))
            }
        }
    }
}
```

### Fill Colors

Use fills for shapes and backgrounds within cells.

```swift
struct FillColorsDemo: View {
    var body: some View {
        VStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.systemFill))
                .frame(height: 50)
                .overlay(Text("System Fill"))

            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.secondarySystemFill))
                .frame(height: 50)
                .overlay(Text("Secondary Fill"))

            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.tertiarySystemFill))
                .frame(height: 50)
                .overlay(Text("Tertiary Fill"))

            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.quaternarySystemFill))
                .frame(height: 50)
                .overlay(Text("Quaternary Fill"))
        }
        .padding()
    }
}
```

---

## 2. Material Effects

Materials create frosted-glass blur over underlying content. They are essential for modern iOS design.

```swift
struct MaterialShowcase: View {
    var body: some View {
        ZStack {
            // Rich background to show blur effect
            LinearGradient(
                colors: [.purple, .blue, .cyan, .mint],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    materialCard("Ultra Thin Material", material: .ultraThinMaterial)
                    materialCard("Thin Material", material: .thinMaterial)
                    materialCard("Regular Material", material: .regularMaterial)
                    materialCard("Thick Material", material: .thickMaterial)
                    materialCard("Ultra Thick Material", material: .ultraThickMaterial)
                }
                .padding(20)
            }
        }
    }

    func materialCard(_ title: String, material: Material) -> some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(material)
            .frame(height: 100)
            .overlay(
                Text(title)
                    .font(.headline)
                    .foregroundStyle(.primary)
            )
            .shadow(color: .black.opacity(0.1), radius: 10, y: 5)
    }
}
```

### Combining Materials with Borders

```swift
struct GlassCard: View {
    var body: some View {
        ZStack {
            Image(systemName: "photo.artframe")
                .resizable()
                .scaledToFill()
                .frame(width: 400, height: 600)
                .clipped()

            VStack(alignment: .leading, spacing: 8) {
                Text("Glass Card")
                    .font(.title2.weight(.bold))
                Text("Beautiful frosted glass with a subtle border that catches light.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24))
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .padding(20)
        }
    }
}
```

---

## 3. Dark Mode Support

### Automatic Adaptation

SwiftUI semantic colors adapt automatically. For custom colors, use Asset Catalog entries with "Any" and "Dark" appearances.

### Manual Color Scheme Override

```swift
struct DarkModeDemo: View {
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: 20) {
            Text("Current: \(colorScheme == .dark ? "Dark" : "Light")")
                .font(.headline)

            // Adaptive custom color
            RoundedRectangle(cornerRadius: 16)
                .fill(colorScheme == .dark
                    ? Color(hex: "1A1A2E")
                    : Color(hex: "F8F9FA"))
                .frame(height: 100)
                .overlay(
                    Text("Adaptive Card")
                        .foregroundStyle(colorScheme == .dark ? .white : .black)
                )
        }
        .padding()
    }
}

// Force a specific color scheme on any view subtree
struct ForcedSchemeExample: View {
    var body: some View {
        HStack(spacing: 20) {
            CardView(label: "Always Light")
                .environment(\.colorScheme, .light)

            CardView(label: "Always Dark")
                .environment(\.colorScheme, .dark)
        }
        .padding()
    }
}

struct CardView: View {
    let label: String
    var body: some View {
        Text(label)
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
    }
}
```

---

## 4. Color Extension -- Hex Initializer

This extension is used throughout this guide and is essential for any custom palette work.

```swift
import SwiftUI

extension Color {
    /// Initialize a Color from a hex string.
    /// Supports formats: "FF5733", "#FF5733", "FF5733FF" (with alpha).
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

---

## 5. Five Stunning Pre-Built Color Palettes

### Palette 1 -- Ocean Blue (Fintech / Productivity)

| Role        | Light Hex   | Dark Hex    | Description                  |
|-------------|-------------|-------------|------------------------------|
| Primary     | `#0A6EBD`   | `#3DA5F4`   | Trust-inspiring blue         |
| Secondary   | `#1E88E5`   | `#64B5F6`   | Lighter accent blue          |
| Accent      | `#00BCD4`   | `#4DD0E1`   | Teal action highlight        |
| Background  | `#F4F7FA`   | `#0D1117`   | Clean paper / deep night     |
| Surface     | `#FFFFFF`   | `#161B22`   | Card surface                 |
| Text        | `#1A2233`   | `#E6EDF3`   | High-contrast readable text  |
| Error       | `#D32F2F`   | `#EF5350`   | Clear danger signal          |

```swift
struct OceanBluePalette {
    static let primary     = Color(hex: "0A6EBD")
    static let secondary   = Color(hex: "1E88E5")
    static let accent      = Color(hex: "00BCD4")
    static let background  = Color(hex: "F4F7FA")
    static let surface     = Color(hex: "FFFFFF")
    static let text        = Color(hex: "1A2233")
    static let error       = Color(hex: "D32F2F")

    static let primaryDark     = Color(hex: "3DA5F4")
    static let secondaryDark   = Color(hex: "64B5F6")
    static let accentDark      = Color(hex: "4DD0E1")
    static let backgroundDark  = Color(hex: "0D1117")
    static let surfaceDark     = Color(hex: "161B22")
    static let textDark        = Color(hex: "E6EDF3")
    static let errorDark       = Color(hex: "EF5350")
}
```

### Palette 2 -- Sunset Warm (Social / Lifestyle)

| Role        | Light Hex   | Dark Hex    | Description                  |
|-------------|-------------|-------------|------------------------------|
| Primary     | `#FF6B35`   | `#FF8A5C`   | Warm energetic orange        |
| Secondary   | `#F7C948`   | `#FFD966`   | Sunny golden yellow          |
| Accent      | `#E84393`   | `#FD79A8`   | Playful magenta              |
| Background  | `#FFF8F0`   | `#1A1215`   | Warm cream / warm dark       |
| Surface     | `#FFFFFF`   | `#2D1F23`   | Card surface                 |
| Text        | `#2D1810`   | `#F5E6D8`   | Dark warm brown / cream      |
| Error       | `#C0392B`   | `#E74C3C`   | Red alert                    |

```swift
struct SunsetWarmPalette {
    static let primary     = Color(hex: "FF6B35")
    static let secondary   = Color(hex: "F7C948")
    static let accent      = Color(hex: "E84393")
    static let background  = Color(hex: "FFF8F0")
    static let surface     = Color(hex: "FFFFFF")
    static let text        = Color(hex: "2D1810")
    static let error       = Color(hex: "C0392B")

    static let primaryDark     = Color(hex: "FF8A5C")
    static let secondaryDark   = Color(hex: "FFD966")
    static let accentDark      = Color(hex: "FD79A8")
    static let backgroundDark  = Color(hex: "1A1215")
    static let surfaceDark     = Color(hex: "2D1F23")
    static let textDark        = Color(hex: "F5E6D8")
    static let errorDark       = Color(hex: "E74C3C")
}
```

### Palette 3 -- Midnight Dark (Premium / Luxury)

| Role        | Light Hex   | Dark Hex    | Description                  |
|-------------|-------------|-------------|------------------------------|
| Primary     | `#6C63FF`   | `#8B83FF`   | Electric indigo              |
| Secondary   | `#A78BFA`   | `#C4B5FD`   | Soft lavender                |
| Accent      | `#F472B6`   | `#F9A8D4`   | Rose gold accent             |
| Background  | `#F5F3FF`   | `#0B0B1A`   | Faint violet / pure dark     |
| Surface     | `#FFFFFF`   | `#13132B`   | Card surface                 |
| Text        | `#1E1B4B`   | `#E2E0F0`   | Deep indigo / soft light     |
| Error       | `#DC2626`   | `#F87171`   | Bright red                   |

```swift
struct MidnightDarkPalette {
    static let primary     = Color(hex: "6C63FF")
    static let secondary   = Color(hex: "A78BFA")
    static let accent      = Color(hex: "F472B6")
    static let background  = Color(hex: "F5F3FF")
    static let surface     = Color(hex: "FFFFFF")
    static let text        = Color(hex: "1E1B4B")
    static let error       = Color(hex: "DC2626")

    static let primaryDark     = Color(hex: "8B83FF")
    static let secondaryDark   = Color(hex: "C4B5FD")
    static let accentDark      = Color(hex: "F9A8D4")
    static let backgroundDark  = Color(hex: "0B0B1A")
    static let surfaceDark     = Color(hex: "13132B")
    static let textDark        = Color(hex: "E2E0F0")
    static let errorDark       = Color(hex: "F87171")
}
```

### Palette 4 -- Nature Green (Health / Wellness)

| Role        | Light Hex   | Dark Hex    | Description                  |
|-------------|-------------|-------------|------------------------------|
| Primary     | `#2D9F6F`   | `#4ADE80`   | Fresh healing green          |
| Secondary   | `#22D3EE`   | `#67E8F9`   | Cool sky cyan                |
| Accent      | `#F59E0B`   | `#FBBF24`   | Warm honey gold              |
| Background  | `#F0FDF4`   | `#0A1A12`   | Faint mint / forest dark     |
| Surface     | `#FFFFFF`   | `#112118`   | Card surface                 |
| Text        | `#14352A`   | `#D1FAE5`   | Deep forest / soft mint      |
| Error       | `#DC2626`   | `#FB7185`   | Alert red                    |

```swift
struct NatureGreenPalette {
    static let primary     = Color(hex: "2D9F6F")
    static let secondary   = Color(hex: "22D3EE")
    static let accent      = Color(hex: "F59E0B")
    static let background  = Color(hex: "F0FDF4")
    static let surface     = Color(hex: "FFFFFF")
    static let text        = Color(hex: "14352A")
    static let error       = Color(hex: "DC2626")

    static let primaryDark     = Color(hex: "4ADE80")
    static let secondaryDark   = Color(hex: "67E8F9")
    static let accentDark      = Color(hex: "FBBF24")
    static let backgroundDark  = Color(hex: "0A1A12")
    static let surfaceDark     = Color(hex: "112118")
    static let textDark        = Color(hex: "D1FAE5")
    static let errorDark       = Color(hex: "FB7185")
}
```

### Palette 5 -- Violet Dream (Creative / Entertainment)

| Role        | Light Hex   | Dark Hex    | Description                  |
|-------------|-------------|-------------|------------------------------|
| Primary     | `#8B5CF6`   | `#A78BFA`   | Vibrant violet               |
| Secondary   | `#EC4899`   | `#F472B6`   | Hot pink                     |
| Accent      | `#06B6D4`   | `#22D3EE`   | Electric cyan                |
| Background  | `#FAF5FF`   | `#0F0720`   | Lavender mist / deep purple  |
| Surface     | `#FFFFFF`   | `#1A0F2E`   | Card surface                 |
| Text        | `#2E1065`   | `#EDE9FE`   | Deep purple / pale lavender  |
| Error       | `#E11D48`   | `#FB7185`   | Rose red                     |

```swift
struct VioletDreamPalette {
    static let primary     = Color(hex: "8B5CF6")
    static let secondary   = Color(hex: "EC4899")
    static let accent      = Color(hex: "06B6D4")
    static let background  = Color(hex: "FAF5FF")
    static let surface     = Color(hex: "FFFFFF")
    static let text        = Color(hex: "2E1065")
    static let error       = Color(hex: "E11D48")

    static let primaryDark     = Color(hex: "A78BFA")
    static let secondaryDark   = Color(hex: "F472B6")
    static let accentDark      = Color(hex: "22D3EE")
    static let backgroundDark  = Color(hex: "0F0720")
    static let surfaceDark     = Color(hex: "1A0F2E")
    static let textDark        = Color(hex: "EDE9FE")
    static let errorDark       = Color(hex: "FB7185")
}
```

### Using Palettes with Environment-Aware Adaptive Colors

```swift
struct AdaptiveColor {
    let light: Color
    let dark: Color

    func resolve(for scheme: ColorScheme) -> Color {
        scheme == .dark ? dark : light
    }
}

struct AdaptiveCardExample: View {
    @Environment(\.colorScheme) var scheme

    var primary: Color {
        AdaptiveColor(
            light: OceanBluePalette.primary,
            dark: OceanBluePalette.primaryDark
        ).resolve(for: scheme)
    }

    var body: some View {
        Text("Adaptive Palette Card")
            .font(.headline)
            .foregroundStyle(.white)
            .padding(24)
            .background(primary, in: RoundedRectangle(cornerRadius: 16))
    }
}
```

---

## 6. Custom Colors via Asset Catalog

Step-by-step for Xcode:

1. Open `Assets.xcassets`.
2. Click the `+` button, choose "Color Set".
3. Name it (e.g., `BrandPrimary`).
4. In the Attributes Inspector, set "Appearances" to "Any, Dark".
5. Set hex values for each appearance.
6. Use in SwiftUI:

```swift
// After defining "BrandPrimary" in the Asset Catalog:
Text("Brand Styled")
    .foregroundStyle(Color("BrandPrimary"))

// Type-safe alternative using an extension:
extension Color {
    static let brandPrimary = Color("BrandPrimary")
    static let brandSecondary = Color("BrandSecondary")
    static let brandAccent = Color("BrandAccent")
}

Text("Type Safe")
    .foregroundStyle(.brandPrimary)
```

---

## 7. Gradient Recipes

### Linear Gradient

```swift
struct LinearGradientExamples: View {
    var body: some View {
        VStack(spacing: 16) {
            // Horizontal gradient
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "6C63FF"), Color(hex: "E84393")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 100)

            // Diagonal gradient with multiple stops
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        stops: [
                            .init(color: Color(hex: "667EEA"), location: 0),
                            .init(color: Color(hex: "764BA2"), location: 0.5),
                            .init(color: Color(hex: "F093FB"), location: 1),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 100)
        }
        .padding()
    }
}
```

### Radial Gradient

```swift
struct RadialGradientExample: View {
    var body: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color(hex: "FF6B35"),
                        Color(hex: "F7C948"),
                        Color(hex: "FF6B35").opacity(0.3),
                    ],
                    center: .center,
                    startRadius: 20,
                    endRadius: 150
                )
            )
            .frame(width: 300, height: 300)
            .shadow(color: Color(hex: "FF6B35").opacity(0.4), radius: 30, y: 10)
    }
}
```

### Angular (Conic) Gradient

```swift
struct AngularGradientExample: View {
    var body: some View {
        Circle()
            .fill(
                AngularGradient(
                    colors: [
                        Color(hex: "8B5CF6"),
                        Color(hex: "EC4899"),
                        Color(hex: "06B6D4"),
                        Color(hex: "8B5CF6"),
                    ],
                    center: .center
                )
            )
            .frame(width: 200, height: 200)
    }
}
```

### Mesh Gradient (iOS 18+)

```swift
@available(iOS 18.0, *)
struct MeshGradientExample: View {
    var body: some View {
        MeshGradient(
            width: 3,
            height: 3,
            points: [
                [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
                [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
                [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
            ],
            colors: [
                Color(hex: "6C63FF"), Color(hex: "8B5CF6"), Color(hex: "EC4899"),
                Color(hex: "3DA5F4"), Color(hex: "A78BFA"), Color(hex: "F472B6"),
                Color(hex: "06B6D4"), Color(hex: "22D3EE"), Color(hex: "F9A8D4"),
            ]
        )
        .frame(height: 400)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .ignoresSafeArea()
    }
}
```

---

## 8. Ten Stunning Gradient Combinations

Each gradient is named and ready to drop into any project.

```swift
enum StunningGradients {
    /// 1. Oceanic Depths -- deep sea to sky
    static let oceanicDepths = LinearGradient(
        colors: [Color(hex: "0A2463"), Color(hex: "1E88E5"), Color(hex: "00BCD4")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    /// 2. Sunset Boulevard -- golden hour warmth
    static let sunsetBoulevard = LinearGradient(
        colors: [Color(hex: "FF6B35"), Color(hex: "F7C948"), Color(hex: "FF8A5C")],
        startPoint: .leading, endPoint: .trailing
    )

    /// 3. Northern Lights -- aurora borealis
    static let northernLights = LinearGradient(
        colors: [Color(hex: "0F2027"), Color(hex: "203A43"), Color(hex: "2C5364"), Color(hex: "4ADE80")],
        startPoint: .top, endPoint: .bottom
    )

    /// 4. Rose Gold -- luxury feminine
    static let roseGold = LinearGradient(
        colors: [Color(hex: "F472B6"), Color(hex: "FBBF24"), Color(hex: "F9A8D4")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    /// 5. Electric Violet -- creative energy
    static let electricViolet = LinearGradient(
        colors: [Color(hex: "8B5CF6"), Color(hex: "6C63FF"), Color(hex: "EC4899")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    /// 6. Midnight City -- dark premium
    static let midnightCity = LinearGradient(
        colors: [Color(hex: "0B0B1A"), Color(hex: "1A1A2E"), Color(hex: "16213E")],
        startPoint: .top, endPoint: .bottom
    )

    /// 7. Fresh Mint -- health and clarity
    static let freshMint = LinearGradient(
        colors: [Color(hex: "2D9F6F"), Color(hex: "22D3EE"), Color(hex: "67E8F9")],
        startPoint: .leading, endPoint: .trailing
    )

    /// 8. Cyber Punk -- bold neon
    static let cyberPunk = LinearGradient(
        colors: [Color(hex: "F72585"), Color(hex: "7209B7"), Color(hex: "3A0CA3"), Color(hex: "4CC9F0")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    /// 9. Warm Ember -- cozy and inviting
    static let warmEmber = LinearGradient(
        colors: [Color(hex: "D32F2F"), Color(hex: "FF6B35"), Color(hex: "F7C948")],
        startPoint: .bottomLeading, endPoint: .topTrailing
    )

    /// 10. Iridescent Pearl -- subtle luxury shimmer
    static let iridescentPearl = LinearGradient(
        colors: [
            Color(hex: "E8D5F5"), Color(hex: "C4E0F9"),
            Color(hex: "D1FAE5"), Color(hex: "FEF3C7"), Color(hex: "E8D5F5"),
        ],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
}

// Usage in a view
struct GradientShowcase: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                gradientCard("Oceanic Depths", gradient: StunningGradients.oceanicDepths)
                gradientCard("Sunset Boulevard", gradient: StunningGradients.sunsetBoulevard)
                gradientCard("Northern Lights", gradient: StunningGradients.northernLights)
                gradientCard("Rose Gold", gradient: StunningGradients.roseGold)
                gradientCard("Electric Violet", gradient: StunningGradients.electricViolet)
                gradientCard("Midnight City", gradient: StunningGradients.midnightCity)
                gradientCard("Fresh Mint", gradient: StunningGradients.freshMint)
                gradientCard("Cyber Punk", gradient: StunningGradients.cyberPunk)
                gradientCard("Warm Ember", gradient: StunningGradients.warmEmber)
                gradientCard("Iridescent Pearl", gradient: StunningGradients.iridescentPearl)
            }
            .padding()
        }
    }

    func gradientCard(_ name: String, gradient: LinearGradient) -> some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(gradient)
            .frame(height: 100)
            .overlay(
                Text(name)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                    .shadow(color: .black.opacity(0.3), radius: 4, y: 2)
            )
    }
}
```

---

## 9. Vibrancy and Blur Effects

```swift
struct VibrancyEffectDemo: View {
    var body: some View {
        ZStack {
            // Background image or gradient
            LinearGradient(
                colors: [Color(hex: "6C63FF"), Color(hex: "EC4899")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                // Vibrant label on material
                Text("Vibrant Title")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(.primary)
                    .padding(20)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))

                // Hierarchical vibrancy
                VStack(alignment: .leading, spacing: 8) {
                    Label("Primary", systemImage: "star.fill")
                        .foregroundStyle(.primary)
                    Label("Secondary", systemImage: "star.leadinghalf.filled")
                        .foregroundStyle(.secondary)
                    Label("Tertiary", systemImage: "star")
                        .foregroundStyle(.tertiary)
                }
                .font(.headline)
                .padding(20)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
            }
        }
    }
}
```

---

## 10. Color Accessibility

### Contrast Ratios

WCAG 2.1 requires at least 4.5:1 contrast for normal text and 3:1 for large text. Use these helper utilities.

```swift
extension Color {
    /// Calculate relative luminance of a color.
    /// Returns a value between 0 (black) and 1 (white).
    func relativeLuminance() -> Double {
        // Approximate; for exact values resolve the UIColor components.
        // This is a conceptual guide -- use UIColor for runtime calculation:
        var r: CGFloat = 0; var g: CGFloat = 0; var b: CGFloat = 0; var a: CGFloat = 0
        UIColor(self).getRed(&r, green: &g, blue: &b, alpha: &a)

        func linearize(_ c: CGFloat) -> Double {
            let v = Double(c)
            return v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4)
        }

        return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
    }

    /// Calculate WCAG contrast ratio between two colors.
    func contrastRatio(with other: Color) -> Double {
        let l1 = self.relativeLuminance()
        let l2 = other.relativeLuminance()
        let lighter = max(l1, l2)
        let darker = min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)
    }
}

struct ContrastChecker: View {
    let foreground = Color(hex: "1A2233")
    let background = Color(hex: "F4F7FA")

    var body: some View {
        let ratio = foreground.contrastRatio(with: background)
        VStack(spacing: 12) {
            Text("Contrast Ratio: \(ratio, specifier: "%.1f"):1")
                .font(.headline)
            Text(ratio >= 4.5 ? "WCAG AA Pass" : "WCAG AA Fail")
                .font(.subheadline)
                .foregroundStyle(ratio >= 4.5 ? .green : .red)

            Text("Sample Text on Background")
                .foregroundStyle(foreground)
                .padding()
                .background(background, in: RoundedRectangle(cornerRadius: 12))
        }
        .padding()
    }
}
```

### Color Blind Friendly Design Tips

1. Never rely on color alone to convey meaning -- combine with icons, labels, or patterns.
2. Use high-contrast pairings that remain distinguishable under protanopia, deuteranopia, and tritanopia.
3. Test with Xcode Accessibility Inspector or Simulator color filters.
4. Prefer blue/orange pairings (distinguishable under all common types) over red/green.

```swift
struct ColorBlindFriendlyStatus: View {
    var body: some View {
        HStack(spacing: 16) {
            Label("Success", systemImage: "checkmark.circle.fill")
                .foregroundStyle(Color(hex: "2D9F6F"))
            Label("Warning", systemImage: "exclamationmark.triangle.fill")
                .foregroundStyle(Color(hex: "F59E0B"))
            Label("Error", systemImage: "xmark.circle.fill")
                .foregroundStyle(Color(hex: "DC2626"))
        }
        .font(.headline)
    }
}
```

---

## Quick Reference

| Category           | Key Types                                              |
|--------------------|--------------------------------------------------------|
| Semantic Labels    | `.primary`, `.secondary`, `.tertiary`, `.quaternary`   |
| System Backgrounds | `Color(.systemBackground)`, `.secondarySystemBackground`, `.tertiarySystemBackground` |
| Grouped Backgrounds| `Color(.systemGroupedBackground)`, `.secondarySystemGroupedBackground`, `.tertiarySystemGroupedBackground` |
| Fills              | `Color(.systemFill)` through `Color(.quaternarySystemFill)` |
| Materials          | `.ultraThinMaterial` through `.ultraThickMaterial`     |
| Gradients          | `LinearGradient`, `RadialGradient`, `AngularGradient`, `MeshGradient` |
| Scheme Override    | `.environment(\.colorScheme, .dark)`                   |
| Asset Catalog      | `Color("AssetName")`                                   |
| Hex Init           | `Color(hex: "FF5733")`                                 |
