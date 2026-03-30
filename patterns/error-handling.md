# Error Handling Patterns

Robust error handling means defining clear error types, propagating them through layers, presenting user-friendly messages, and providing recovery paths. This guide covers all of these with working SwiftUI examples.

## Custom Error Types

```swift
import Foundation

// MARK: - App Error Hierarchy

/// Top-level error that the UI layer works with.
enum AppError: LocalizedError, Equatable {
    case network(NetworkError)
    case validation(ValidationError)
    case storage(StorageError)
    case auth(AuthError)
    case unexpected(message: String)

    var errorDescription: String? {
        switch self {
        case .network(let e):    return e.errorDescription
        case .validation(let e): return e.errorDescription
        case .storage(let e):    return e.errorDescription
        case .auth(let e):       return e.errorDescription
        case .unexpected(let m): return m
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .network(let e):    return e.recoverySuggestion
        case .validation(let e): return e.recoverySuggestion
        case .storage(let e):    return e.recoverySuggestion
        case .auth(let e):       return e.recoverySuggestion
        case .unexpected:        return "Please restart the app and try again."
        }
    }

    var isRetryable: Bool {
        switch self {
        case .network(let e): return e.isRetryable
        case .auth(.sessionExpired): return true
        default: return false
        }
    }
}

// MARK: - Network Errors

enum NetworkError: LocalizedError, Equatable {
    case noConnection
    case timeout
    case serverError(statusCode: Int)
    case decodingFailed(context: String)
    case rateLimited(retryAfter: TimeInterval)
    case cancelled

    var errorDescription: String? {
        switch self {
        case .noConnection:
            return "No internet connection."
        case .timeout:
            return "The request timed out."
        case .serverError(let code):
            return "Server error (\(code)). Please try again later."
        case .decodingFailed(let ctx):
            return "Failed to process server response: \(ctx)"
        case .rateLimited:
            return "Too many requests. Please wait a moment."
        case .cancelled:
            return "Request was cancelled."
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .noConnection:  return "Check your Wi-Fi or cellular connection."
        case .timeout:       return "Try again when your connection improves."
        case .serverError:   return "Our servers are experiencing issues. Try again shortly."
        case .decodingFailed:return "Update the app to the latest version."
        case .rateLimited:   return "Wait a few seconds and try again."
        case .cancelled:     return nil
        }
    }

    var isRetryable: Bool {
        switch self {
        case .noConnection, .timeout, .serverError, .rateLimited: return true
        case .decodingFailed, .cancelled: return false
        }
    }
}

// MARK: - Validation Errors

enum ValidationError: LocalizedError, Equatable {
    case emptyField(fieldName: String)
    case invalidEmail
    case passwordTooShort(minimum: Int)
    case passwordMissingRequirements
    case valueTooLong(fieldName: String, maxLength: Int)
    case invalidFormat(fieldName: String, expectedFormat: String)
    case custom(message: String)

    var errorDescription: String? {
        switch self {
        case .emptyField(let name):
            return "\(name) cannot be empty."
        case .invalidEmail:
            return "Please enter a valid email address."
        case .passwordTooShort(let min):
            return "Password must be at least \(min) characters."
        case .passwordMissingRequirements:
            return "Password must include uppercase, lowercase, and a number."
        case .valueTooLong(let name, let max):
            return "\(name) must be \(max) characters or fewer."
        case .invalidFormat(let name, let fmt):
            return "\(name) must match the format: \(fmt)"
        case .custom(let msg):
            return msg
        }
    }

    var recoverySuggestion: String? {
        "Please correct the highlighted field and try again."
    }
}

// MARK: - Storage Errors

enum StorageError: LocalizedError, Equatable {
    case saveFailed(reason: String)
    case loadFailed(reason: String)
    case migrationFailed
    case diskFull

    var errorDescription: String? {
        switch self {
        case .saveFailed(let r):  return "Could not save data: \(r)"
        case .loadFailed(let r):  return "Could not load data: \(r)"
        case .migrationFailed:    return "Database migration failed."
        case .diskFull:           return "Your device storage is full."
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .diskFull: return "Free up space and try again."
        default: return "Restart the app. If the problem persists, reinstall."
        }
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError, Equatable {
    case invalidCredentials
    case sessionExpired
    case accountLocked
    case unauthorized
    case biometricFailed(reason: String)

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:     return "Invalid email or password."
        case .sessionExpired:         return "Your session has expired."
        case .accountLocked:          return "Account locked due to too many attempts."
        case .unauthorized:           return "You do not have permission for this action."
        case .biometricFailed(let r): return "Authentication failed: \(r)"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .invalidCredentials: return "Double-check your email and password."
        case .sessionExpired:     return "Please sign in again."
        case .accountLocked:      return "Try again in 30 minutes or reset your password."
        case .unauthorized:       return "Contact support if you believe this is an error."
        case .biometricFailed:    return "Try again or use your passcode."
        }
    }
}
```

## Error Propagation Chain

Map low-level errors into `AppError` at each layer boundary.

```swift
// MARK: - Error Mapping

extension NetworkError {
    /// Map a URLSession error into a NetworkError.
    init(from urlError: URLError) {
        switch urlError.code {
        case .notConnectedToInternet, .networkConnectionLost:
            self = .noConnection
        case .timedOut:
            self = .timeout
        case .cancelled:
            self = .cancelled
        default:
            self = .serverError(statusCode: 0)
        }
    }
}

/// Wraps a throwing async closure and maps any error to AppError.
func mapToAppError<T>(_ work: () async throws -> T) async throws -> T {
    do {
        return try await work()
    } catch let error as AppError {
        throw error
    } catch let error as NetworkError {
        throw AppError.network(error)
    } catch let error as ValidationError {
        throw AppError.validation(error)
    } catch let error as URLError {
        throw AppError.network(NetworkError(from: error))
    } catch let error as DecodingError {
        throw AppError.network(.decodingFailed(context: error.localizedDescription))
    } catch {
        throw AppError.unexpected(message: error.localizedDescription)
    }
}
```

## Network Retry with Exponential Backoff

```swift
// MARK: - Retry Logic

struct RetryConfiguration {
    var maxAttempts: Int = 3
    var initialDelay: TimeInterval = 1.0
    var maxDelay: TimeInterval = 30.0
    var multiplier: Double = 2.0

    static let `default` = RetryConfiguration()
    static let aggressive = RetryConfiguration(maxAttempts: 5, initialDelay: 0.5)
}

func withRetry<T>(
    config: RetryConfiguration = .default,
    operation: () async throws -> T
) async throws -> T {
    var lastError: Error?
    var delay = config.initialDelay

    for attempt in 1...config.maxAttempts {
        do {
            return try await operation()
        } catch {
            lastError = error

            // Check if error is retryable
            let appError: AppError
            if let ae = error as? AppError {
                appError = ae
            } else if let ne = error as? NetworkError {
                appError = .network(ne)
            } else {
                throw error  // Non-retryable
            }

            guard appError.isRetryable, attempt < config.maxAttempts else {
                throw error
            }

            // Handle rate limiting with server-specified delay
            if case .network(.rateLimited(let retryAfter)) = appError {
                try await Task.sleep(for: .seconds(retryAfter))
            } else {
                try await Task.sleep(for: .seconds(delay))
                delay = min(delay * config.multiplier, config.maxDelay)
            }
        }
    }

    throw lastError!
}
```

## Error Logging and Reporting

```swift
// MARK: - Error Reporter

protocol ErrorReporter: Sendable {
    func log(_ error: AppError, context: ErrorContext)
}

struct ErrorContext: Sendable {
    let file: String
    let function: String
    let line: Int
    let userInfo: [String: String]

    init(
        file: String = #file,
        function: String = #function,
        line: Int = #line,
        userInfo: [String: String] = [:]
    ) {
        self.file = file
        self.function = function
        self.line = line
        self.userInfo = userInfo
    }
}

final class AppErrorReporter: ErrorReporter {
    static let shared = AppErrorReporter()

    func log(_ error: AppError, context: ErrorContext) {
        let filename = (context.file as NSString).lastPathComponent
        let entry = """
        [ERROR] \(filename):\(context.line) \(context.function)
          Type: \(errorCategory(error))
          Message: \(error.localizedDescription)
          UserInfo: \(context.userInfo)
        """

        #if DEBUG
        print(entry)
        #endif

        // In production: send to your crash reporting service
        // CrashlyticsService.shared.recordError(error, userInfo: context.userInfo)
    }

    private func errorCategory(_ error: AppError) -> String {
        switch error {
        case .network:    return "Network"
        case .validation: return "Validation"
        case .storage:    return "Storage"
        case .auth:       return "Auth"
        case .unexpected: return "Unexpected"
        }
    }
}
```

## User-Facing Error Alerts in SwiftUI

```swift
import SwiftUI

// MARK: - Error Alert State

@Observable
final class ErrorAlertState {
    var currentError: AppError?
    var isPresented: Bool = false
    var retryAction: (() async -> Void)?

    func show(_ error: AppError, retry: (() async -> Void)? = nil) {
        self.currentError = error
        self.retryAction = retry
        self.isPresented = true
    }

    func dismiss() {
        isPresented = false
        currentError = nil
        retryAction = nil
    }
}

// MARK: - Error Alert Modifier

struct ErrorAlertModifier: ViewModifier {
    @Bindable var state: ErrorAlertState

    func body(content: Content) -> some View {
        content
            .alert(
                "Something Went Wrong",
                isPresented: $state.isPresented,
                presenting: state.currentError
            ) { error in
                if error.isRetryable, state.retryAction != nil {
                    Button("Retry") {
                        Task { await state.retryAction?() }
                    }
                }
                Button("Dismiss", role: .cancel) {
                    state.dismiss()
                }
            } message: { error in
                VStack {
                    Text(error.localizedDescription)
                    if let suggestion = error.recoverySuggestion {
                        Text(suggestion)
                    }
                }
            }
    }
}

extension View {
    func errorAlert(state: ErrorAlertState) -> some View {
        modifier(ErrorAlertModifier(state: state))
    }
}
```

## Inline Validation Errors in Forms

```swift
// MARK: - Validated Field

struct ValidatedField: View {
    let label: String
    @Binding var text: String
    let error: ValidationError?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            TextField(label, text: $text)
                .textFieldStyle(.roundedBorder)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(error != nil ? Color.red : Color.clear, lineWidth: 1)
                )

            if let error {
                Text(error.localizedDescription)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .animation(.easeInOut(duration: 0.2), value: error)
    }
}
```

## Complete Working Example

```swift
// MARK: - Full Example: Login Flow

@MainActor
@Observable
final class LoginViewModel {
    var email = ""
    var password = ""
    var emailError: ValidationError?
    var passwordError: ValidationError?
    var isLoading = false
    let errorAlert = ErrorAlertState()

    private let authService: AuthServiceProtocol
    private let errorReporter: ErrorReporter

    init(
        authService: AuthServiceProtocol,
        errorReporter: ErrorReporter = AppErrorReporter.shared
    ) {
        self.authService = authService
        self.errorReporter = errorReporter
    }

    // MARK: - Validation

    func validateEmail() -> Bool {
        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            emailError = .emptyField(fieldName: "Email")
            return false
        }
        let emailRegex = /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        guard email.wholeMatch(of: emailRegex) != nil else {
            emailError = .invalidEmail
            return false
        }
        emailError = nil
        return true
    }

    func validatePassword() -> Bool {
        if password.isEmpty {
            passwordError = .emptyField(fieldName: "Password")
            return false
        }
        if password.count < 8 {
            passwordError = .passwordTooShort(minimum: 8)
            return false
        }
        passwordError = nil
        return true
    }

    func validateAll() -> Bool {
        // Run all validations (do not short-circuit)
        let results = [validateEmail(), validatePassword()]
        return results.allSatisfy { $0 }
    }

    // MARK: - Login

    func login() async {
        guard validateAll() else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            try await withRetry(config: .default) {
                try await self.authService.login(
                    email: self.email,
                    password: self.password
                )
            }
        } catch let error as AuthError {
            let appError = AppError.auth(error)
            errorReporter.log(appError, context: ErrorContext())
            errorAlert.show(appError, retry: error == .sessionExpired ? { [weak self] in
                await self?.login()
            } : nil)
        } catch let error as NetworkError {
            let appError = AppError.network(error)
            errorReporter.log(appError, context: ErrorContext())
            errorAlert.show(appError, retry: { [weak self] in
                await self?.login()
            })
        } catch {
            let appError = AppError.unexpected(message: error.localizedDescription)
            errorReporter.log(appError, context: ErrorContext())
            errorAlert.show(appError)
        }
    }
}

// MARK: - Login View

struct LoginView: View {
    @State private var viewModel: LoginViewModel

    init(authService: AuthServiceProtocol) {
        _viewModel = State(initialValue: LoginViewModel(authService: authService))
    }

    var body: some View {
        Form {
            Section {
                ValidatedField(
                    label: "Email",
                    text: $viewModel.email,
                    error: viewModel.emailError
                )
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .onChange(of: viewModel.email) { _, _ in
                    _ = viewModel.validateEmail()
                }

                ValidatedField(
                    label: "Password",
                    text: $viewModel.password,
                    error: viewModel.passwordError
                )
                .textContentType(.password)
                .onChange(of: viewModel.password) { _, _ in
                    _ = viewModel.validatePassword()
                }
            }

            Section {
                Button {
                    Task { await viewModel.login() }
                } label: {
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Sign In")
                            .frame(maxWidth: .infinity)
                    }
                }
                .disabled(viewModel.isLoading)
            }
        }
        .navigationTitle("Sign In")
        .errorAlert(state: viewModel.errorAlert)
    }
}
```

## Guidelines

- Define domain-specific error enums that conform to `LocalizedError` with `errorDescription` and `recoverySuggestion`.
- Map errors at layer boundaries (network layer to repository to ViewModel) so the UI only handles `AppError`.
- Separate retryable from non-retryable errors. Only show a Retry button when it makes sense.
- Validate form fields individually and show inline errors immediately. Do not rely solely on alert dialogs for validation.
- Log every error with file, function, line, and relevant user info for debugging in production.
- Use exponential backoff for network retries and respect server `Retry-After` headers.
