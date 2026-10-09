import Foundation
import FirebaseCore
import FirebaseAuth

@MainActor
final class FirebaseEmailSession {
    enum ConfigurationError: Error { case missingOptions }
    private let auth: Auth
    init(options: FirebaseOptions) {
        if FirebaseApp.app() == nil { FirebaseApp.configure(options: options) }
        auth = Auth.auth()
    }
    static func configured() throws -> FirebaseEmailSession {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let options = FirebaseOptions(contentsOfFile: path) else { throw ConfigurationError.missingOptions }
        return FirebaseEmailSession(options: options)
    }
    var userID: String? { auth.currentUser?.uid }
    func signIn(email: String, password: String) async throws { _ = try await auth.signIn(withEmail: email, password: password) }
    func register(email: String, password: String) async throws { _ = try await auth.createUser(withEmail: email, password: password) }
    func signOut() throws { try auth.signOut() }
    func deleteAccount() async throws { try await auth.currentUser?.delete() }
}
