import Foundation

/// Combines Sign in with Apple and email sign-in into one signed-in state.
@MainActor
@Observable
final class AuthCoordinator {
    let apple: AppleSignInModel
    let email: EmailAuthModel

    init(apple: AppleSignInModel, email: EmailAuthModel) {
        self.apple = apple
        self.email = email
    }

    var isRestoring: Bool {
        if case .unknown = apple.state { return true }
        return false
    }

    var isSignedIn: Bool {
        if case .signedIn = apple.state { return true }
        if case .signedIn = email.state { return true }
        return false
    }

    var displayName: String? {
        if case .signedIn(let account) = apple.state { return account.displayName }
        return nil
    }

    var emailAddress: String? {
        if case .signedIn(let account) = apple.state { return account.email }
        if case .signedIn(let session) = email.state { return session.email }
        return nil
    }

    var providerName: String {
        if case .signedIn = apple.state { return "Apple" }
        return "Email"
    }

    func restore() async {
        email.restore()
        await apple.restore()
    }

    func signOut() async {
        apple.signOut()
        await email.signOut()
    }

    static func preview() -> AuthCoordinator {
        AuthCoordinator(
            apple: AppleSignInModel(store: InMemorySecureStore()),
            email: EmailAuthModel(service: nil, store: InMemorySecureStore())
        )
    }
}
