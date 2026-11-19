import SwiftUI
import UIKit

/// An SF Symbol that falls back to `fallback` when `name` does not exist on this OS.
struct SymbolImage: View {
    let name: String
    let fallback: String

    init(_ name: String, fallback: String) {
        self.name = name
        self.fallback = fallback
    }

    var body: some View {
        Image(systemName: UIImage(systemName: name) == nil ? fallback : name)
    }
}

private struct SymbolBounce<Trigger: Equatable>: ViewModifier {
    let trigger: Trigger
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        // Under Reduce Motion the value never changes, so the effect never plays.
        content.symbolEffect(.bounce, options: .nonRepeating, value: reduceMotion ? nil : trigger)
    }
}

extension View {
    /// Bounces a symbol when `trigger` changes, unless Reduce Motion is on.
    func symbolBounce<Trigger: Equatable>(trigger: Trigger) -> some View {
        modifier(SymbolBounce(trigger: trigger))
    }
}

#Preview {
    SymbolImage("fork.knife.circle.fill", fallback: "fork.knife")
        .font(.largeTitle)
}
