import SwiftUI

/// Settings: a grouped Form for appearance and feedback preferences.
struct SettingsView: View {
    var body: some View {
        Form {
            Section {
                HStack(spacing: AppTheme.Space.medium) {
                    AppIconTile(symbol: "leaf.fill", accessibilityLabel: "Habit Tracker")
                    VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                        Text("Make it yours")
                            .font(.headline)
                        Text("Tune how the app looks and feels.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .accessibilityElement(children: .combine)
            }
            Section {
                DarkModeToggle()
            } header: {
                Text("Appearance").accessibilityAddTraits(.isHeader)
            } footer: {
                Text("Dark mode overrides the system appearance.")
            }
            Section {
                HapticsToggle()
            } header: {
                Text("Feedback").accessibilityAddTraits(.isHeader)
            } footer: {
                Text("Feel a gentle tap when you mark a habit done.")
            }
        }
        .fontDesign(AppTheme.fontDesign)
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
