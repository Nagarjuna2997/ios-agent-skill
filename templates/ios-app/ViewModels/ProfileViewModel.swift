import Foundation
import Observation

// @MainActor on the TYPE. `@Observable` grants no isolation of its own, so
// without this the stored properties are non-isolated and any task may mutate
// them while SwiftUI reads — a data race Swift 6 rejects and Swift 5 ships.
@MainActor
@Observable
final class ProfileViewModel {
    private(set) var userName: String = "John Doe"
    private(set) var userEmail: String = "john@example.com"
    private(set) var isSignedIn: Bool = true

    func signOut() {
        // Implement sign out logic
        isSignedIn = false
    }

    @MainActor
    func loadProfile() async {
        // Replace with actual profile loading
        do {
            try await Task.sleep(for: .milliseconds(300))
            userName = "John Doe"
            userEmail = "john@example.com"
        } catch {
            // Handle error
        }
    }
}
