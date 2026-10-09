import SwiftUI

/// Shared, semantic layout and type tokens for generated app screens.
enum AppTheme {
    enum Space {
        static let xSmall: CGFloat = 4
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xLarge: CGFloat = 24
        static let section: CGFloat = 32
    }

    enum Radius {
        static let control: CGFloat = 12
        static let card: CGFloat = 20
        static let panel: CGFloat = 28
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
