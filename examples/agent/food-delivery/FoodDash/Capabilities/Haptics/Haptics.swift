import SwiftUI

enum HapticsPreference {
    static let storageKey = "haptics.enabled"
}

enum AppFeedback {
    case success, error, warning, selection, impact

    var sensoryFeedback: SensoryFeedback {
        switch self {
        case .success: .success
        case .error: .error
        case .warning: .warning
        case .selection: .selection
        case .impact: .impact(weight: .medium)
        }
    }
}

private struct AppFeedbackModifier<Trigger: Equatable>: ViewModifier {
    let feedback: AppFeedback
    let trigger: Trigger
    @AppStorage(HapticsPreference.storageKey) private var enabled = true

    func body(content: Content) -> some View {
        content.sensoryFeedback(trigger: trigger) { _, _ in
            enabled ? feedback.sensoryFeedback : nil
        }
    }
}

extension View {
    /// Plays haptic feedback when `trigger` changes, unless the user turned haptics off.
    func appFeedback<Trigger: Equatable>(_ feedback: AppFeedback, trigger: Trigger) -> some View {
        modifier(AppFeedbackModifier(feedback: feedback, trigger: trigger))
    }
}

/// A settings row for turning haptics on or off.
struct HapticsToggle: View {
    @AppStorage(HapticsPreference.storageKey) private var enabled = true

    var body: some View {
        Toggle("Haptics", systemImage: "hand.tap", isOn: $enabled)
    }
}

#Preview {
    Form {
        HapticsToggle()
    }
}
