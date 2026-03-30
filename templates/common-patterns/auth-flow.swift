import AuthenticationServices
import Foundation
import Observation
import SwiftUI

// MARK: - Auth State

enum AuthState: Equatable {
    case unknown
    case authenticated(User)
    case unauthenticated
}

struct User: Equatable, Codable, Sendable {
    let id: String
    let email: String
    let displayName: String
    let avatarURL: URL?
}

// MARK: - Auth Manager

@Observable
@MainActor
final class AuthManager {
    private(set) var state: AuthState = .unknown
    private let keychain: KeychainService
    private let apiClient: APIClient

    var isAuthenticated: Bool {
        if case .authenticated = state { return true }
        return false
    }

    var currentUser: User? {
        if case .authenticated(let user) = state { return user }
        return nil
    }

    init(keychain: KeychainService = .shared, apiClient: APIClient) {
        self.keychain = keychain
        self.apiClient = apiClient
    }

    // MARK: - Session Restoration

    func restoreSession() async {
        guard let token = keychain.retrieve(key: "accessToken") else {
            state = .unauthenticated
            return
        }

        do {
            // Validate token with server
            let user: User = try await apiClient.get(
                "/auth/me",
                headers: ["Authorization": "Bearer \(token)"]
            )
            state = .authenticated(user)
        } catch {
            // Token invalid — clear and require re-auth
            keychain.delete(key: "accessToken")
            keychain.delete(key: "refreshToken")
            state = .unauthenticated
        }
    }

    // MARK: - Email/Password Auth

    func signIn(email: String, password: String) async throws {
        struct SignInRequest: Encodable {
            let email: String
            let password: String
        }

        struct SignInResponse: Decodable {
            let user: User
            let accessToken: String
            let refreshToken: String
        }

        let response: SignInResponse = try await apiClient.post(
            "/auth/sign-in",
            body: SignInRequest(email: email, password: password)
        )

        keychain.save(key: "accessToken", value: response.accessToken)
        keychain.save(key: "refreshToken", value: response.refreshToken)
        state = .authenticated(response.user)
    }

    func signUp(email: String, password: String, displayName: String) async throws {
        struct SignUpRequest: Encodable {
            let email: String
            let password: String
            let displayName: String
        }

        struct SignUpResponse: Decodable {
            let user: User
            let accessToken: String
            let refreshToken: String
        }

        let response: SignUpResponse = try await apiClient.post(
            "/auth/sign-up",
            body: SignUpRequest(email: email, password: password, displayName: displayName)
        )

        keychain.save(key: "accessToken", value: response.accessToken)
        keychain.save(key: "refreshToken", value: response.refreshToken)
        state = .authenticated(response.user)
    }

    // MARK: - Sign Out

    func signOut() {
        keychain.delete(key: "accessToken")
        keychain.delete(key: "refreshToken")
        state = .unauthenticated
    }
}

// MARK: - Keychain Service

final class KeychainService: Sendable {
    static let shared = KeychainService()
    private init() {}

    func save(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func retrieve(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Sign In with Apple

struct SignInWithAppleButton: View {
    let onSignIn: (ASAuthorization) -> Void

    var body: some View {
        SignInWithAppleButton(.signIn) { request in
            request.requestedScopes = [.fullName, .email]
        } onCompletion: { result in
            switch result {
            case .success(let authorization):
                onSignIn(authorization)
            case .failure(let error):
                print("Sign in with Apple failed: \(error.localizedDescription)")
            }
        }
        .signInWithAppleButtonStyle(.black)
        .frame(height: 50)
    }
}

// MARK: - Auth-Gated Root View

struct AuthGatedView: View {
    @State private var authManager: AuthManager

    init(apiClient: APIClient) {
        _authManager = State(initialValue: AuthManager(apiClient: apiClient))
    }

    var body: some View {
        Group {
            switch authManager.state {
            case .unknown:
                ProgressView("Loading...")
            case .authenticated:
                MainAppView()
                    .environment(authManager)
            case .unauthenticated:
                LoginView()
                    .environment(authManager)
            }
        }
        .task {
            await authManager.restoreSession()
        }
    }
}

// MARK: - Placeholder Views

struct MainAppView: View {
    @Environment(AuthManager.self) private var authManager

    var body: some View {
        NavigationStack {
            VStack {
                if let user = authManager.currentUser {
                    Text("Welcome, \(user.displayName)!")
                }
            }
            .toolbar {
                Button("Sign Out") {
                    authManager.signOut()
                }
            }
        }
    }
}

struct LoginView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var error: Error?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                }

                Section {
                    Button {
                        Task { await signIn() }
                    } label: {
                        if isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Sign In")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(email.isEmpty || password.isEmpty || isLoading)
                }
            }
            .navigationTitle("Sign In")
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                if let error {
                    Text(error.localizedDescription)
                }
            }
        }
    }

    private func signIn() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await authManager.signIn(email: email, password: password)
        } catch {
            self.error = error
        }
    }
}
