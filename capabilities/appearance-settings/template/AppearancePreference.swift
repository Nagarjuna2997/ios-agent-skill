import SwiftUI

/// The user's appearance choice, stored in UserDefaults through @AppStorage.
enum AppearancePreference: String, CaseIterable, Identifiable, Sendable {
    case system
    case light
    case dark

    static let storageKey = "appearancePreference"

    var id: String { rawValue }

    var title: LocalizedStringKey {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    /// `nil` follows the system setting.
    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

/// Applies the stored appearance. Attach once, at the root of the app.
struct AppearanceModifier: ViewModifier {
    @AppStorage(AppearancePreference.storageKey) private var preference: AppearancePreference = .system

    func body(content: Content) -> some View {
        content.preferredColorScheme(preference.colorScheme)
    }
}

extension View {
    func appAppearance() -> some View {
        modifier(AppearanceModifier())
    }
}

/// System, Light or Dark.
struct AppearancePicker: View {
    @AppStorage(AppearancePreference.storageKey) private var preference: AppearancePreference = .system

    var body: some View {
        Picker("Appearance", selection: $preference) {
            ForEach(AppearancePreference.allCases) { option in
                Text(option.title).tag(option)
            }
        }
    }
}

/// A single switch: on selects Dark, off selects Light.
struct DarkModeToggle: View {
    @AppStorage(AppearancePreference.storageKey) private var preference: AppearancePreference = .system
    @Environment(\.colorScheme) private var currentScheme

    var body: some View {
        Toggle("Dark Mode", isOn: Binding(
            get: { preference == .dark || (preference == .system && currentScheme == .dark) },
            set: { preference = $0 ? .dark : .light }
        ))
    }
}

#Preview {
    Form {
        AppearancePicker()
        DarkModeToggle()
    }
    .appAppearance()
}
