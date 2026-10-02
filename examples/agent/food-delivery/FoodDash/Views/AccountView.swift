import SwiftUI

struct AccountView: View {
    let auth: AuthCoordinator

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    Label(auth.displayName ?? "FoodDash member", systemImage: "person.crop.circle")
                    if let email = auth.emailAddress {
                        Label(email, systemImage: "envelope")
                    }
                    LabeledContent("Signed in with", value: auth.providerName)
                }
                Section("Appearance") {
                    AppearancePicker()
                }
                Section("Preferences") {
                    HapticsToggle()
                }
                Section {
                    Button("Sign Out", role: .destructive) {
                        Task { await auth.signOut() }
                    }
                }
            }
            .navigationTitle("Account")
        }
    }
}

#Preview {
    AccountView(auth: .preview())
}
