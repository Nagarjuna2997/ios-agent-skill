import SwiftUI

struct SettingsView: View {
    var body: some View {
        Form {
            Section {
                DarkModeToggle()
            } header: {
                Text("Appearance").accessibilityAddTraits(.isHeader)
            }
            Section {
                HapticsToggle()
            } header: {
                Text("Feedback").accessibilityAddTraits(.isHeader)
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
    .appAppearance()
}
