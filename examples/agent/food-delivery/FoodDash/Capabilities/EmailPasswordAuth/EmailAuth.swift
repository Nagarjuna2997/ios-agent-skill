import Foundation
import SwiftUI

struct AuthSession: Codable, Equatable, Sendable {
    let accessToken: String
    let refreshToken: String
    let userID: String
    let email: String?
}

enum EmailAuthError: LocalizedError, Equatable {
    case notConfigured
    case invalidInput(String)
    case server(String)
    case network(String)

    var errorDescription: String? {
        switch self {
        case .notConfigured: "Sign-in is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env and rebuild."
        case .invalidInput(let message): message
        case .server(let message): message
        case .network(let message): "Network error: \(message)"
        }
    }
}

protocol EmailAuthService: Sendable {
    /// Returns nil when the project requires email confirmation before the first sign-in.
    func signUp(email: String, password: String) async throws -> AuthSession?
    func signIn(email: String, password: String) async throws -> AuthSession
    func signOut(accessToken: String) async throws
}

/// Supabase Auth over HTTPS. Keys come from Info.plist, filled from .env through Config/Secrets.xcconfig.
struct SupabaseEmailAuth: EmailAuthService {
    let baseURL: URL
    let anonKey: String
    let session: URLSession

    /// nil until real keys replace the REPLACE_ME placeholders.
    static func fromBundle(_ bundle: Bundle = .main, session: URLSession = .shared) -> SupabaseEmailAuth? {
        guard let url = bundle.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              let key = bundle.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
              !url.isEmpty, !key.isEmpty, url != "REPLACE_ME", key != "REPLACE_ME",
              let base = URL(string: url), base.scheme == "https" else {
            return nil
        }
        return SupabaseEmailAuth(baseURL: base, anonKey: key, session: session)
    }

    func signUp(email: String, password: String) async throws -> AuthSession? {
        let data = try await post("auth/v1/signup", body: ["email": email, "password": password])
        return try? Self.decodeSession(data)
    }

    func signIn(email: String, password: String) async throws -> AuthSession {
        let data = try await post("auth/v1/token", query: [URLQueryItem(name: "grant_type", value: "password")], body: ["email": email, "password": password])
        return try Self.decodeSession(data)
    }

    func signOut(accessToken: String) async throws {
        _ = try await post("auth/v1/logout", body: [:], bearer: accessToken)
    }

    private func post(_ path: String, query: [URLQueryItem] = [], body: [String: String], bearer: String? = nil) async throws -> Data {
        var components = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)
        if !query.isEmpty { components?.queryItems = query }
        guard let url = components?.url else { throw EmailAuthError.notConfigured }
        var request = URLRequest(url: url, timeoutInterval: 20)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(bearer ?? anonKey)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONEncoder().encode(body)
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw EmailAuthError.network(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else { throw EmailAuthError.network("No HTTP response") }
        guard (200..<300).contains(http.statusCode) else { throw EmailAuthError.server(Self.message(from: data, status: http.statusCode)) }
        return data
    }

    private struct TokenResponse: Decodable {
        struct User: Decodable {
            let id: String
            let email: String?
        }
        let access_token: String
        let refresh_token: String
        let user: User
    }

    private static func decodeSession(_ data: Data) throws -> AuthSession {
        let token = try JSONDecoder().decode(TokenResponse.self, from: data)
        return AuthSession(accessToken: token.access_token, refreshToken: token.refresh_token, userID: token.user.id, email: token.user.email)
    }

    private static func message(from data: Data, status: Int) -> String {
        if let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            for key in ["error_description", "msg", "message", "error"] {
                if let text = object[key] as? String, !text.isEmpty { return text }
            }
        }
        return "The server returned status \(status)."
    }
}

@MainActor
@Observable
final class EmailAuthModel {
    enum State: Equatable {
        case signedOut
        case working
        case signedIn(AuthSession)
        case awaitingConfirmation(String)
        case failed(String)
    }

    var email = ""
    var password = ""
    private(set) var state: State = .signedOut
    private let service: (any EmailAuthService)?
    private let store: any SecureStore
    private static let sessionKey = "emailAuthSession"

    init(service: (any EmailAuthService)?, store: any SecureStore) {
        self.service = service
        self.store = store
    }

    var isConfigured: Bool { service != nil }

    func restore() {
        if let data = try? store.data(for: Self.sessionKey),
           let session = try? JSONDecoder().decode(AuthSession.self, from: data) {
            state = .signedIn(session)
        }
    }

    func signIn() async {
        await perform { service in
            let session = try await service.signIn(email: self.trimmedEmail, password: self.password)
            try self.save(session)
            self.state = .signedIn(session)
        }
    }

    func signUp() async {
        await perform { service in
            if let session = try await service.signUp(email: self.trimmedEmail, password: self.password) {
                try self.save(session)
                self.state = .signedIn(session)
            } else {
                self.state = .awaitingConfirmation("Check \(self.trimmedEmail) for a confirmation link, then sign in.")
            }
        }
    }

    func signOut() async {
        if case .signedIn(let session) = state, let service {
            try? await service.signOut(accessToken: session.accessToken)
        }
        try? store.remove(Self.sessionKey)
        password = ""
        state = .signedOut
    }

    private var trimmedEmail: String { email.trimmingCharacters(in: .whitespacesAndNewlines) }

    private func validate() throws {
        guard trimmedEmail.contains("@"), trimmedEmail.contains(".") else { throw EmailAuthError.invalidInput("Enter a valid email address.") }
        guard password.count >= 6 else { throw EmailAuthError.invalidInput("Use a password of at least 6 characters.") }
    }

    private func save(_ session: AuthSession) throws {
        try store.set(try JSONEncoder().encode(session), for: Self.sessionKey)
    }

    private func perform(_ work: (any EmailAuthService) async throws -> Void) async {
        guard let service else {
            state = .failed(EmailAuthError.notConfigured.localizedDescription)
            return
        }
        do {
            try validate()
            state = .working
            try await work(service)
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}

struct EmailAuthForm: View {
    @Bindable var model: EmailAuthModel

    var body: some View {
        Form {
            if !model.isConfigured {
                Section {
                    Label("Add SUPABASE_URL and SUPABASE_ANON_KEY to .env and rebuild to enable sign-in.", systemImage: "key")
                        .font(.footnote)
                }
            }
            Section {
                TextField("Email", text: $model.email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                SecureField("Password", text: $model.password)
                    .textContentType(.password)
            }
            Section {
                Button("Sign In") { Task { await model.signIn() } }
                Button("Create Account") { Task { await model.signUp() } }
            }
            .disabled(model.state == .working)
            switch model.state {
            case .working:
                ProgressView()
            case .failed(let message):
                Text(message).foregroundStyle(.red)
            case .awaitingConfirmation(let message):
                Text(message)
            case .signedOut, .signedIn:
                EmptyView()
            }
        }
    }
}

#Preview {
    EmailAuthForm(model: EmailAuthModel(service: nil, store: InMemorySecureStore()))
}
