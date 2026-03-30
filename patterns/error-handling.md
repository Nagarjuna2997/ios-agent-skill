# Error Handling Patterns

## Custom Error Types

### Layered Error Hierarchy

```swift
// Domain-level errors
enum AppError: LocalizedError {
    case network(NetworkError)
    case storage(StorageError)
    case validation(ValidationError)
    case auth(AuthError)
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .network(let e): e.errorDescription
        case .storage(let e): e.errorDescription
        case .validation(let e): e.errorDescription
        case .auth(let e): e.errorDescription
        case .unknown(let e): e.localizedDescription
        }
    }

    /// User-facing message (never includes technical details)
    var userMessage: String {
        switch self {
        case .network(let e): e.userMessage
        case .storage: "Unable to save your data. Please try again."
        case .validation(let e): e.userMessage
        case .auth(let e): e.userMessage
        case .unknown: "Something went wrong. Please try again."
        }
    }

    var isRetryable: Bool {
        switch self {
        case .network(let e): e.isRetryable
        case .storage: true
        case .validation: false
        case .auth: false
        case .unknown: false
        }
    }

    init(from error: Error) {
        if let appError = error as? AppError {
            self = appError
        } else if let networkError = error as? NetworkError {
            self = .network(networkError)
        } else if let urlError = error as? URLError {
            self = .network(NetworkError(from: urlError))
        } else {
            self = .unknown(error)
        }
    }
}
```

### Network Errors

```swift
enum NetworkError: LocalizedError {
    case noConnection
    case timeout
    case serverError(statusCode: Int, message: String?)
    case decodingFailed(Error)
    case unauthorized
    case forbidden
    case notFound
    case rateLimited(retryAfter: TimeInterval?)
    case cancelled

    var errorDescription: String? {
        switch self {
        case .noConnection: "No internet connection."
        case .timeout: "Request timed out."
        case .serverError(let code, let msg): "Server error \(code): \(msg ?? "Unknown")"
        case .decodingFailed(let e): "Data parsing error: \(e.localizedDescription)"
        case .unauthorized: "Authentication required."
        case .forbidden: "Access denied."
        case .notFound: "Resource not found."
        case .rateLimited: "Too many requests."
        case .cancelled: "Request cancelled."
        }
    }

    var userMessage: String {
        switch self {
        case .noConnection: "You appear to be offline. Check your connection and try again."
        case .timeout: "The request took too long. Please try again."
        case .serverError: "Our servers are having trouble. Please try again later."
        case .decodingFailed: "We received unexpected data. Please update the app."
        case .unauthorized: "Please sign in again."
        case .forbidden: "You don't have permission to access this."
        case .notFound: "The content you're looking for isn't available."
        case .rateLimited: "Please slow down and try again in a moment."
        case .cancelled: "Request was cancelled."
        }
    }

    var isRetryable: Bool {
        switch self {
        case .noConnection, .timeout, .serverError, .rateLimited: true
        default: false
        }
    }

    init(from urlError: URLError) {
        switch urlError.code {
        case .notConnectedToInternet, .networkConnectionLost:
            self = .noConnection
        case .timedOut:
            self = .timeout
        case .cancelled:
            self = .cancelled
        default:
            self = .serverError(statusCode: urlError.errorCode, message: urlError.localizedDescription)
        }
    }

    init(statusCode: Int, data: Data? = nil) {
        switch statusCode {
        case 401: self = .unauthorized
        case 403: self = .forbidden
        case 404: self = .notFound
        case 429:
            self = .rateLimited(retryAfter: nil)
        case 500..<600:
            let message = data.flatMap { String(data: $0, encoding: .utf8) }
            self = .serverError(statusCode: statusCode, message: message)
        default:
            self = .serverError(statusCode: statusCode, message: nil)
        }
    }
}
```

### Validation Errors

```swift
enum ValidationError: LocalizedError {
    case empty(field: String)
    case tooShort(field: String, minimum: Int)
    case tooLong(field: String, maximum: Int)
    case invalidFormat(field: String, expected: String)
    case outOfRange(field: String, min: Any, max: Any)
    case multiple([ValidationError])

    var errorDescription: String? {
        switch self {
        case .empty(let f): "\(f) is required."
        case .tooShort(let f, let min): "\(f) must be at least \(min) characters."
        case .tooLong(let f, let max): "\(f) must be no more than \(max) characters."
        case .invalidFormat(let f, let e): "\(f) must be a valid \(e)."
        case .outOfRange(let f, let min, let max): "\(f) must be between \(min) and \(max)."
        case .multiple(let errors): errors.map { $0.localizedDescription }.joined(separator: " ")
        }
    }

    var userMessage: String { errorDescription ?? "Invalid input." }
}
```

---

## Error Propagation

### Result Type for Explicit Error Handling

```swift
enum DataResult<T> {
    case success(T)
    case failure(AppError)
    case loading
    case idle

    var value: T? {
        if case .success(let v) = self { return v }
        return nil
    }

    var error: AppError? {
        if case .failure(let e) = self { return e }
        return nil
    }

    var isLoading: Bool {
        if case .loading = self { return true }
        return false
    }
}

// Usage in ViewModel
@Observable
class ProfileViewModel {
    var profileState: DataResult<UserProfile> = .idle

    func loadProfile() async {
        profileState = .loading
        do {
            let profile = try await repository.fetchProfile()
            profileState = .success(profile)
        } catch {
            profileState = .failure(AppError(from: error))
        }
    }
}
```

### Typed Throws (Swift 6)

```swift
func fetchUser(id: UUID) throws(NetworkError) -> User {
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let http = response as? HTTPURLResponse else {
        throw NetworkError.serverError(statusCode: -1, message: nil)
    }
    guard (200..<300).contains(http.statusCode) else {
        throw NetworkError(statusCode: http.statusCode, data: data)
    }
    do {
        return try JSONDecoder().decode(User.self, from: data)
    } catch {
        throw .decodingFailed(error)
    }
}
```

---

## User-Facing Error Presentation

### Error Alert View Modifier

```swift
struct ErrorAlert: ViewModifier {
    @Binding var error: AppError?
    var onRetry: (() async -> Void)?

    func body(content: Content) -> some View {
        content.alert(
            "Error",
            isPresented: Binding(
                get: { error != nil },
                set: { if !$0 { error = nil } }
            )
        ) {
            Button("OK", role: .cancel) {}
            if let error, error.isRetryable, let onRetry {
                Button("Retry") { Task { await onRetry() } }
            }
        } message: {
            if let error {
                Text(error.userMessage)
            }
        }
    }
}

extension View {
    func errorAlert(_ error: Binding<AppError?>, onRetry: (() async -> Void)? = nil) -> some View {
        modifier(ErrorAlert(error: error, onRetry: onRetry))
    }
}

// Usage
struct ContentView: View {
    @State private var viewModel = MyViewModel()

    var body: some View {
        List { /* content */ }
            .errorAlert($viewModel.error) {
                await viewModel.load()
            }
    }
}
```

### Inline Error Banner

```swift
struct ErrorBanner: View {
    let error: AppError
    let onRetry: (() -> Void)?
    let onDismiss: () -> Void

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.yellow)
            Text(error.userMessage)
                .font(.subheadline)
            Spacer()
            if error.isRetryable, let onRetry {
                Button("Retry", action: onRetry)
                    .buttonStyle(.bordered)
                    .controlSize(.small)
            }
            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}
```

---

## Retry and Recovery Patterns

### Exponential Backoff

```swift
func withRetry<T>(
    maxAttempts: Int = 3,
    initialDelay: TimeInterval = 1.0,
    multiplier: Double = 2.0,
    operation: () async throws -> T
) async throws -> T {
    var lastError: Error?
    var delay = initialDelay

    for attempt in 1...maxAttempts {
        do {
            return try await operation()
        } catch {
            lastError = error

            let appError = AppError(from: error)
            guard appError.isRetryable, attempt < maxAttempts else { break }

            // Handle rate limiting
            if case .network(.rateLimited(let retryAfter)) = appError,
               let retryAfter {
                try await Task.sleep(for: .seconds(retryAfter))
            } else {
                let jitter = Double.random(in: 0...0.5)
                try await Task.sleep(for: .seconds(delay + jitter))
                delay *= multiplier
            }
        }
    }
    throw lastError!
}

// Usage
func fetchData() async throws -> [Item] {
    try await withRetry(maxAttempts: 3) {
        try await apiClient.get("/items")
    }
}
```

### Circuit Breaker

```swift
actor CircuitBreaker {
    enum State { case closed, open, halfOpen }

    private var state: State = .closed
    private var failureCount = 0
    private var lastFailureTime: Date?
    private let failureThreshold: Int
    private let resetTimeout: TimeInterval

    init(failureThreshold: Int = 5, resetTimeout: TimeInterval = 30) {
        self.failureThreshold = failureThreshold
        self.resetTimeout = resetTimeout
    }

    func execute<T>(_ operation: () async throws -> T) async throws -> T {
        switch state {
        case .open:
            if let lastFailure = lastFailureTime,
               Date.now.timeIntervalSince(lastFailure) > resetTimeout {
                state = .halfOpen
            } else {
                throw AppError.network(.serverError(statusCode: 503, message: "Circuit breaker open"))
            }
        case .closed, .halfOpen:
            break
        }

        do {
            let result = try await operation()
            onSuccess()
            return result
        } catch {
            onFailure()
            throw error
        }
    }

    private func onSuccess() {
        failureCount = 0
        state = .closed
    }

    private func onFailure() {
        failureCount += 1
        lastFailureTime = .now
        if failureCount >= failureThreshold {
            state = .open
        }
    }
}
```

---

## Logging and Error Reporting

```swift
import OSLog

enum AppLogger {
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.app"

    static let network = Logger(subsystem: subsystem, category: "Network")
    static let storage = Logger(subsystem: subsystem, category: "Storage")
    static let auth = Logger(subsystem: subsystem, category: "Auth")
    static let general = Logger(subsystem: subsystem, category: "General")
}

// Error reporter protocol (for Sentry, Crashlytics, etc.)
protocol ErrorReporter: Sendable {
    func report(_ error: Error, context: [String: String])
    func addBreadcrumb(_ message: String, category: String)
}

struct ErrorReportingService: ErrorReporter {
    func report(_ error: Error, context: [String: String] = [:]) {
        // Log locally
        AppLogger.general.error("Error: \(error.localizedDescription, privacy: .public)")

        // Send to crash reporting service
        // CrashlyticsSDK.record(error: error, userInfo: context)

        #if DEBUG
        print("[ERROR] \(error) | Context: \(context)")
        #endif
    }

    func addBreadcrumb(_ message: String, category: String) {
        AppLogger.general.info("[\(category, privacy: .public)] \(message, privacy: .public)")
    }
}

// Extension for convenient error handling
extension Error {
    func report(context: [String: String] = [:], file: String = #file, line: Int = #line) {
        let fileContext = context.merging(["file": file, "line": "\(line)"]) { $1 }
        ErrorReportingService().report(self, context: fileContext)
    }
}
```

---

## Complete Working Example

```swift
@Observable
class OrderViewModel {
    var items: [OrderItem] = []
    var error: AppError?
    var isSubmitting = false
    var orderConfirmation: OrderConfirmation?

    private let repository: OrderRepositoryProtocol
    private let reporter: ErrorReporter

    init(repository: OrderRepositoryProtocol, reporter: ErrorReporter = ErrorReportingService()) {
        self.repository = repository
        self.reporter = reporter
    }

    func submitOrder() async {
        // Validate
        do {
            try validate()
        } catch {
            self.error = AppError(from: error)
            return
        }

        isSubmitting = true
        defer { isSubmitting = false }

        do {
            orderConfirmation = try await withRetry(maxAttempts: 2) {
                try await repository.submitOrder(items: items)
            }
            reporter.addBreadcrumb("Order submitted", category: "Order")
        } catch {
            let appError = AppError(from: error)
            self.error = appError
            appError.report(context: ["itemCount": "\(items.count)"])
            AppLogger.network.error("Order submission failed: \(error.localizedDescription)")
        }
    }

    private func validate() throws {
        var errors: [ValidationError] = []
        if items.isEmpty {
            errors.append(.empty(field: "Cart"))
        }
        for item in items where item.quantity < 1 {
            errors.append(.outOfRange(field: item.name, min: 1, max: 99))
        }
        if !errors.isEmpty {
            throw AppError.validation(.multiple(errors))
        }
    }
}

// View
struct OrderView: View {
    @State private var viewModel: OrderViewModel

    var body: some View {
        VStack {
            List(viewModel.items) { item in
                OrderItemRow(item: item)
            }

            Button("Place Order") {
                Task { await viewModel.submitOrder() }
            }
            .disabled(viewModel.isSubmitting)

            if viewModel.isSubmitting {
                ProgressView("Placing order...")
            }
        }
        .errorAlert($viewModel.error) {
            await viewModel.submitOrder()
        }
        .sheet(item: $viewModel.orderConfirmation) { confirmation in
            OrderConfirmationView(confirmation: confirmation)
        }
    }
}
```

---

## Error Handling Decision Matrix

| Error Type | Retry? | User Action | Log Level |
|-----------|--------|-------------|-----------|
| No connection | Auto-retry on reconnect | "Check connection" | info |
| Timeout | Auto-retry (3x) | "Try again" button | warning |
| 401 Unauthorized | No | Redirect to login | info |
| 403 Forbidden | No | Show message | warning |
| 404 Not Found | No | Show empty state | info |
| 429 Rate Limited | Auto-retry after delay | Wait message | warning |
| 500 Server Error | Auto-retry (3x) | "Try again later" | error |
| Decoding Error | No | "Update app" | error (report) |
| Validation Error | No | Highlight fields | debug |
