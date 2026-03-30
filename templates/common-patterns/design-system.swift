// design-system.swift
// A complete, drop-in SwiftUI design system with themes, typography,
// spacing, shadows, and premium view modifiers.

import SwiftUI

// MARK: - Color Hex Initializer

extension Color {
    /// Create a Color from a hex string such as "#FF5733" or "FF5733".
    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&rgb)

        let length = sanitized.count
        switch length {
        case 6:
            self.init(
                red: Double((rgb >> 16) & 0xFF) / 255.0,
                green: Double((rgb >> 8) & 0xFF) / 255.0,
                blue: Double(rgb & 0xFF) / 255.0
            )
        case 8:
            self.init(
                red: Double((rgb >> 24) & 0xFF) / 255.0,
                green: Double((rgb >> 16) & 0xFF) / 255.0,
                blue: Double((rgb >> 8) & 0xFF) / 255.0,
                opacity: Double(rgb & 0xFF) / 255.0
            )
        default:
            self.init(white: 0.5)
        }
    }
}

// MARK: - Theme Protocol

/// Protocol that every theme must conform to.
protocol AppTheme: Sendable {
    var name: String { get }
    var primary: Color { get }
    var secondary: Color { get }
    var accent: Color { get }
    var background: Color { get }
    var surface: Color { get }
    var textPrimary: Color { get }
    var textSecondary: Color { get }
    var error: Color { get }
    var success: Color { get }
    var warning: Color { get }
}

// MARK: - Pre-built Themes

struct OceanBlueTheme: AppTheme {
    let name = "Ocean Blue"
    let primary = Color(hex: "#0077B6")
    let secondary = Color(hex: "#00B4D8")
    let accent = Color(hex: "#90E0EF")
    let background = Color(hex: "#F0F8FF")
    let surface = Color(hex: "#FFFFFF")
    let textPrimary = Color(hex: "#03045E")
    let textSecondary = Color(hex: "#5A7D9A")
    let error = Color(hex: "#E63946")
    let success = Color(hex: "#06D6A0")
    let warning = Color(hex: "#FFB703")
}

struct SunsetWarmTheme: AppTheme {
    let name = "Sunset Warm"
    let primary = Color(hex: "#E76F51")
    let secondary = Color(hex: "#F4A261")
    let accent = Color(hex: "#E9C46A")
    let background = Color(hex: "#FFF8F0")
    let surface = Color(hex: "#FFFFFF")
    let textPrimary = Color(hex: "#264653")
    let textSecondary = Color(hex: "#6B8F71")
    let error = Color(hex: "#D62828")
    let success = Color(hex: "#2A9D8F")
    let warning = Color(hex: "#F77F00")
}

struct MidnightDarkTheme: AppTheme {
    let name = "Midnight Dark"
    let primary = Color(hex: "#BB86FC")
    let secondary = Color(hex: "#03DAC6")
    let accent = Color(hex: "#CF6679")
    let background = Color(hex: "#121212")
    let surface = Color(hex: "#1E1E2E")
    let textPrimary = Color(hex: "#E1E1E6")
    let textSecondary = Color(hex: "#A0A0B0")
    let error = Color(hex: "#CF6679")
    let success = Color(hex: "#03DAC6")
    let warning = Color(hex: "#FFAB40")
}

struct NatureGreenTheme: AppTheme {
    let name = "Nature Green"
    let primary = Color(hex: "#2D6A4F")
    let secondary = Color(hex: "#52B788")
    let accent = Color(hex: "#95D5B2")
    let background = Color(hex: "#F0FFF4")
    let surface = Color(hex: "#FFFFFF")
    let textPrimary = Color(hex: "#1B4332")
    let textSecondary = Color(hex: "#588B76")
    let error = Color(hex: "#E63946")
    let success = Color(hex: "#40916C")
    let warning = Color(hex: "#FB8500")
}

struct VioletDreamTheme: AppTheme {
    let name = "Violet Dream"
    let primary = Color(hex: "#7B2CBF")
    let secondary = Color(hex: "#C77DFF")
    let accent = Color(hex: "#E0AAFF")
    let background = Color(hex: "#F8F0FF")
    let surface = Color(hex: "#FFFFFF")
    let textPrimary = Color(hex: "#240046")
    let textSecondary = Color(hex: "#7B6D8E")
    let error = Color(hex: "#E63946")
    let success = Color(hex: "#06D6A0")
    let warning = Color(hex: "#FFBE0B")
}

// MARK: - Theme Manager

@Observable
final class ThemeManager {
    /// All available themes.
    static let availableThemes: [any AppTheme] = [
        OceanBlueTheme(),
        SunsetWarmTheme(),
        MidnightDarkTheme(),
        NatureGreenTheme(),
        VioletDreamTheme()
    ]

    var current: any AppTheme = OceanBlueTheme()

    func switchTheme(to theme: any AppTheme) {
        withAnimation(.easeInOut(duration: 0.35)) {
            current = theme
        }
    }

    func switchTheme(named name: String) {
        if let match = Self.availableThemes.first(where: { $0.name == name }) {
            switchTheme(to: match)
        }
    }
}

// MARK: - Environment Key

private struct ThemeManagerKey: EnvironmentKey {
    static let defaultValue = ThemeManager()
}

extension EnvironmentValues {
    var themeManager: ThemeManager {
        get { self[ThemeManagerKey.self] }
        set { self[ThemeManagerKey.self] = newValue }
    }
}

extension View {
    /// Inject a ThemeManager into the environment.
    func withThemeManager(_ manager: ThemeManager) -> some View {
        self.environment(\.themeManager, manager)
    }
}

// MARK: - Typography Scale

struct Typography {
    let size: CGFloat
    let weight: Font.Weight
    let lineSpacing: CGFloat

    var font: Font {
        .system(size: size, weight: weight, design: .default)
    }

    // Standard sizes
    static let largeTitle  = Typography(size: 34, weight: .bold, lineSpacing: 8)
    static let title1      = Typography(size: 28, weight: .bold, lineSpacing: 6)
    static let title2      = Typography(size: 22, weight: .semibold, lineSpacing: 4)
    static let title3      = Typography(size: 20, weight: .semibold, lineSpacing: 4)
    static let headline    = Typography(size: 17, weight: .semibold, lineSpacing: 2)
    static let body        = Typography(size: 17, weight: .regular, lineSpacing: 2)
    static let callout     = Typography(size: 16, weight: .regular, lineSpacing: 2)
    static let subheadline = Typography(size: 15, weight: .regular, lineSpacing: 2)
    static let footnote    = Typography(size: 13, weight: .regular, lineSpacing: 1)
    static let caption1    = Typography(size: 12, weight: .regular, lineSpacing: 1)
    static let caption2    = Typography(size: 11, weight: .regular, lineSpacing: 1)
    static let overline    = Typography(size: 10, weight: .bold, lineSpacing: 1)
}

extension View {
    /// Apply a Typography style to a view.
    func typography(_ style: Typography) -> some View {
        self
            .font(style.font)
            .lineSpacing(style.lineSpacing)
    }
}

// MARK: - Spacing System

enum Spacing {
    static let xs:  CGFloat = 4
    static let sm:  CGFloat = 8
    static let md:  CGFloat = 16
    static let lg:  CGFloat = 24
    static let xl:  CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Corner Radius System

enum CornerRadius {
    static let sm:   CGFloat = 8
    static let md:   CGFloat = 12
    static let lg:   CGFloat = 16
    static let xl:   CGFloat = 24
    static let pill: CGFloat = 9999
}

// MARK: - Shadow Styles

struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat

    static let subtle  = ShadowStyle(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    static let medium  = ShadowStyle(color: .black.opacity(0.12), radius: 8, x: 0, y: 4)
    static let strong  = ShadowStyle(color: .black.opacity(0.20), radius: 16, x: 0, y: 8)
    static let glow    = ShadowStyle(color: .blue.opacity(0.35), radius: 20, x: 0, y: 0)
}

extension View {
    func shadow(_ style: ShadowStyle) -> some View {
        self.shadow(color: style.color, radius: style.radius, x: style.x, y: style.y)
    }
}

// MARK: - View Modifiers

// --- Card Style ---

struct CardStyleModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(Spacing.md)
            .background(.background)
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous))
            .shadow(ShadowStyle.medium)
    }
}

// --- Glass Card ---

struct GlassCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(Spacing.md)
            .background(
                .ultraThinMaterial,
                in: RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(ShadowStyle.subtle)
    }
}

// --- Gradient Background ---

struct GradientBackgroundModifier: ViewModifier {
    var colors: [Color]

    func body(content: Content) -> some View {
        content
            .background(
                LinearGradient(
                    colors: colors.isEmpty
                        ? [Color(hex: "#667EEA"), Color(hex: "#764BA2")]
                        : colors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
    }
}

// --- Shimmer Effect ---

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geo in
                    LinearGradient(
                        colors: [
                            .clear,
                            .white.opacity(0.4),
                            .clear
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.6)
                    .offset(x: phase * (geo.size.width * 1.6) - geo.size.width * 0.3)
                    .blendMode(.softLight)
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
            .onAppear {
                withAnimation(
                    .linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
                ) {
                    phase = 1
                }
            }
    }
}

// --- Pressable ---

struct PressableModifier: ViewModifier {
    @State private var isPressed = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? 0.96 : 1.0)
            .opacity(isPressed ? 0.9 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isPressed)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in isPressed = true }
                    .onEnded { _ in isPressed = false }
            )
    }
}

// --- Slide In ---

struct SlideInModifier: ViewModifier {
    @State private var appeared = false
    var delay: Double

    func body(content: Content) -> some View {
        content
            .offset(y: appeared ? 0 : 40)
            .opacity(appeared ? 1 : 0)
            .onAppear {
                withAnimation(
                    .spring(response: 0.55, dampingFraction: 0.75)
                    .delay(delay)
                ) {
                    appeared = true
                }
            }
    }
}

// MARK: - Convenience View Extensions

extension View {
    /// Rounded card with shadow.
    func cardStyle() -> some View {
        modifier(CardStyleModifier())
    }

    /// Frosted glass card effect.
    func glassCard() -> some View {
        modifier(GlassCardModifier())
    }

    /// Full-screen gradient background.
    func gradientBackground(colors: [Color] = []) -> some View {
        modifier(GradientBackgroundModifier(colors: colors))
    }

    /// Animated shimmer overlay for loading states.
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }

    /// Scale-down animation when pressed.
    func pressable() -> some View {
        modifier(PressableModifier())
    }

    /// Slide in from below with optional delay.
    func slideIn(delay: Double = 0) -> some View {
        modifier(SlideInModifier(delay: delay))
    }
}

// MARK: - Preview

#Preview("Design System") {
    ScrollView {
        VStack(spacing: Spacing.lg) {
            Text("Design System Preview")
                .typography(.largeTitle)

            Text("Card Style")
                .typography(.headline)
                .frame(maxWidth: .infinity)
                .cardStyle()

            Text("Glass Card")
                .typography(.headline)
                .frame(maxWidth: .infinity)
                .glassCard()

            RoundedRectangle(cornerRadius: CornerRadius.md)
                .fill(Color(hex: "#667EEA"))
                .frame(height: 60)
                .overlay(Text("Pressable").foregroundStyle(.white))
                .pressable()

            HStack(spacing: Spacing.sm) {
                ForEach(["xs", "sm", "md", "lg", "xl"], id: \.self) { label in
                    Text(label)
                        .typography(.caption1)
                        .padding(Spacing.sm)
                        .background(Color(hex: "#E0E0E0"))
                        .clipShape(RoundedRectangle(cornerRadius: CornerRadius.sm))
                }
            }

            Text("Shimmer Loading")
                .typography(.headline)
                .frame(maxWidth: .infinity, minHeight: 80)
                .background(Color.gray.opacity(0.15))
                .shimmer()

            Text("Slide In")
                .typography(.headline)
                .frame(maxWidth: .infinity)
                .cardStyle()
                .slideIn(delay: 0.2)
        }
        .padding(Spacing.md)
    }
    .gradientBackground(colors: [Color(hex: "#F0F8FF"), Color(hex: "#E8F0FE")])
}
