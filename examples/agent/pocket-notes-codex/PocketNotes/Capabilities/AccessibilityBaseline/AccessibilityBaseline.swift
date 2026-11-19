import SwiftUI

extension View {
    /// Expands the hit area to at least 44 by 44 points without changing the layout of the visible content.
    func minimumTapTarget(_ size: CGFloat = 44) -> some View {
        frame(minWidth: size, minHeight: size)
            .contentShape(.rect)
    }

    /// Animates changes to `value` unless Reduce Motion is on.
    func motionAwareAnimation<Value: Equatable>(_ animation: Animation?, value: Value) -> some View {
        modifier(MotionAwareAnimation(animation: animation, value: value))
    }
}

private struct MotionAwareAnimation<Value: Equatable>: ViewModifier {
    let animation: Animation?
    let value: Value
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.animation(reduceMotion ? nil : animation, value: value)
    }
}

/// Spacing that grows with Dynamic Type. Store it directly on a view, `private let spacing = ScaledSpacing()`,
/// and read `spacing.standard` in `body`. Never wrap it in `@State`: SwiftUI then does not install the
/// `@ScaledMetric` values, they stop scaling, and the runtime reports reads outside a view.
struct ScaledSpacing: DynamicProperty {
    @ScaledMetric(relativeTo: .body) var compact: CGFloat = 8
    @ScaledMetric(relativeTo: .body) var standard: CGFloat = 16
    @ScaledMetric(relativeTo: .body) var roomy: CGFloat = 24
}

#Preview {
    VStack {
        Button {
        } label: {
            Image(systemName: "plus")
        }
        .accessibilityLabel("Add")
        .minimumTapTarget()
    }
}
