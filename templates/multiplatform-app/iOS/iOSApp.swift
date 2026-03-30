// iOS-specific extensions and configurations

import SwiftUI

// MARK: - iOS-Specific View Modifiers

extension View {
    /// Apply iOS-specific toolbar styling
    func iOSToolbarStyle() -> some View {
        #if os(iOS)
        self.toolbarBackground(.visible, for: .navigationBar)
        #else
        self
        #endif
    }
}

// MARK: - Haptic Feedback Helper (iOS only)

#if os(iOS)
import UIKit

enum HapticFeedback {
    case light, medium, heavy, success, warning, error

    func trigger() {
        switch self {
        case .light:
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case .medium:
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case .heavy:
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        case .success:
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        case .warning:
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        case .error:
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }
    }
}
#endif
