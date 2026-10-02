import AuthenticationServices
import SwiftUI

/// A signed-in Apple account. Apple provides name and email only on the first sign-in.
struct AppleAccount: Codable, Equatable, Sendable {
    let userID: String
    var displayName: String?
    var email: String?
}

@MainActor
@Observable
final class AppleSignInModel {
    enum State: Equatable {
        case unknown
        case signedOut
        case signedIn(AppleAccount)
        case failed(String)
    }

    private(set) var state: State = .unknown
    private let store: any SecureStore
    private static let accountKey = "appleAccount"

    init(store: any SecureStore) {
        self.store = store
    }

    /// Restores the saved account and signs out if Apple reports it revoked.
    func restore() async {
        guard let saved = try? store.data(for: Self.accountKey),
              let account = try? JSONDecoder().decode(AppleAccount.self, from: saved) else {
            state = .signedOut
            return
        }
        let provider = ASAuthorizationAppleIDProvider()
        do {
            let credentialState = try await provider.credentialState(forUserID: account.userID)
            if credentialState == .authorized {
                state = .signedIn(account)
            } else {
                signOut()
            }
        } catch {
            // Offline or not provisioned: keep the local session instead of signing out.
            state = .signedIn(account)
        }
    }

    func handle(_ result: Result<ASAuthorization, any Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                state = .failed("Sign in with Apple returned an unexpected credential.")
                return
            }
            let name = credential.fullName?.formatted() ?? ""
            let account = AppleAccount(userID: credential.user, displayName: name.isEmpty ? nil : name, email: credential.email)
            do {
                try store.set(try JSONEncoder().encode(account), for: Self.accountKey)
                state = .signedIn(account)
            } catch {
                state = .failed("Signed in, but the session could not be saved: \(error.localizedDescription)")
            }
        case .failure(let error):
            if let authorizationError = error as? ASAuthorizationError, authorizationError.code == .canceled {
                state = .signedOut
            } else {
                state = .failed(error.localizedDescription)
            }
        }
    }

    func signOut() {
        try? store.remove(Self.accountKey)
        state = .signedOut
    }
}

struct AppleSignInView: View {
    let model: AppleSignInModel
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        VStack(spacing: 12) {
            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.fullName, .email]
            } onCompletion: { result in
                model.handle(result)
            }
            .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
            .frame(height: 50)
            if case .failed(let message) = model.state {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
    }
}

#Preview {
    AppleSignInView(model: AppleSignInModel(store: InMemorySecureStore()))
}
