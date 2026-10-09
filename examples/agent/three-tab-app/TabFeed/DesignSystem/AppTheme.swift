import SwiftUI

/// Shared, semantic layout and type tokens for generated app screens.
enum AppTheme {
    static let densityScale: CGFloat = 1.16
    static let shapeScale: CGFloat = 1.0
    static let fontDesign: Font.Design = .default
    static let motionDuration: Double = 0.18

    enum Space {
        static let xSmall: CGFloat = 4 * AppTheme.densityScale
        static let small: CGFloat = 8 * AppTheme.densityScale
        static let medium: CGFloat = 12 * AppTheme.densityScale
        static let large: CGFloat = 16 * AppTheme.densityScale
        static let xLarge: CGFloat = 24 * AppTheme.densityScale
        static let section: CGFloat = 32 * AppTheme.densityScale
    }

    enum Radius {
        static let control: CGFloat = 12 * AppTheme.shapeScale
        static let card: CGFloat = 20 * AppTheme.shapeScale
        static let panel: CGFloat = 28 * AppTheme.shapeScale
    }

    enum TypeStyle {
        static let display: Font.TextStyle = .largeTitle
        static let title: Font.TextStyle = .title2
        static let section: Font.TextStyle = .headline
        static let body: Font.TextStyle = .body
        static let supporting: Font.TextStyle = .subheadline
        static let caption: Font.TextStyle = .caption
    }

    static let screenInset: CGFloat = 20
    static let cardPadding: CGFloat = 16
    static let controlMinimumHeight: CGFloat = 48
    static let shadowColor = Color.black.opacity(0.06)
}
