import Foundation
import Observation

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
