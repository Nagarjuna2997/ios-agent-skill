import UIKit
import GoogleSignIn

@MainActor
final class GoogleSession {
    enum ConfigurationError: Error { case missingClientID }
    static func configured() throws -> GoogleSession {
        guard let id = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_CLIENT_ID") as? String,
              id.hasSuffix(".apps.googleusercontent.com") else { throw ConfigurationError.missingClientID }
        return GoogleSession(clientID: id)
    }
    private let client: GIDSignIn
    init(clientID: String) {
        client = GIDSignIn.sharedInstance
        client.configuration = GIDConfiguration(clientID: clientID)
    }
    func signIn(presenting controller: UIViewController) async throws -> String? {
        let result = try await client.signIn(withPresenting: controller)
        return result.user.userID
    }
    func restore() async throws { _ = try await client.restorePreviousSignIn() }
    func handle(_ url: URL) -> Bool { client.handle(url) }
    func signOut() { client.signOut() }
    func disconnect() async throws { try await client.disconnect() }
}
