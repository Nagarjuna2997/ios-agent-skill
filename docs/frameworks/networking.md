# Networking

## URLSession Async/Await Patterns

```swift
// GET request
func fetchUsers() async throws -> [User] {
    let url = URL(string: "https://api.example.com/users")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
        throw APIError.badResponse
    }
    return try JSONDecoder().decode([User].self, from: data)
}

// POST request
func createUser(_ user: CreateUserRequest) async throws -> User {
    var request = URLRequest(url: URL(string: "https://api.example.com/users")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(user)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 201 else {
        throw APIError.badResponse
    }
    return try JSONDecoder().decode(User.self, from: data)
}

// Download with progress using AsyncBytes
func downloadWithProgress(from url: URL) async throws -> Data {
    let (bytes, response) = try await URLSession.shared.bytes(from: url)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
        throw APIError.badResponse
    }

    let totalBytes = Int(http.expectedContentLength)
    var data = Data(capacity: totalBytes)

    for try await byte in bytes {
        data.append(byte)
        let progress = Double(data.count) / Double(totalBytes)
        await MainActor.run { self.downloadProgress = progress }
    }
    return data
}
```

## Generic API Client

```swift
enum HTTPMethod: String {
    case get = "GET", post = "POST", put = "PUT", patch = "PATCH", delete = "DELETE"
}

enum APIError: LocalizedError {
    case badURL
    case badResponse
    case unauthorized
    case notFound
    case serverError(statusCode: Int)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .badURL: return "Invalid URL"
        case .badResponse: return "Bad server response"
        case .unauthorized: return "Authentication required"
        case .notFound: return "Resource not found"
        case .serverError(let code): return "Server error (\(code))"
        case .decodingError(let err): return "Decoding failed: \(err.localizedDescription)"
        case .networkError(let err): return "Network error: \(err.localizedDescription)"
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private var authToken: String?

    init(
        baseURL: URL = URL(string: "https://api.example.com")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func setToken(_ token: String?) {
        self.authToken = token
    }

    func request<T: Decodable>(
        _ method: HTTPMethod,
        path: String,
        body: (any Encodable)? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: true)!
        components.queryItems = queryItems

        guard let url = components.url else { throw APIError.badURL }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try encoder.encode(body)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.badResponse
        }

        switch http.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        default:
            throw APIError.serverError(statusCode: http.statusCode)
        }
    }
}

// Usage
let users: [User] = try await APIClient.shared.request(.get, path: "/users")
let newUser: User = try await APIClient.shared.request(.post, path: "/users", body: CreateUserRequest(name: "Alice"))
```

## Authentication — Bearer Token and OAuth

```swift
actor AuthManager {
    static let shared = AuthManager()

    private var accessToken: String?
    private var refreshToken: String?
    private var tokenExpiry: Date?
    private var refreshTask: Task<String, Error>?

    func validToken() async throws -> String {
        // Return cached token if still valid
        if let token = accessToken, let expiry = tokenExpiry, expiry > Date() {
            return token
        }

        // Deduplicate concurrent refresh calls
        if let refreshTask {
            return try await refreshTask.value
        }

        let task = Task<String, Error> {
            defer { refreshTask = nil }
            guard let refresh = refreshToken else { throw APIError.unauthorized }
            let response = try await performTokenRefresh(refreshToken: refresh)
            self.accessToken = response.accessToken
            self.refreshToken = response.refreshToken
            self.tokenExpiry = Date().addingTimeInterval(TimeInterval(response.expiresIn))
            return response.accessToken
        }
        self.refreshTask = task
        return try await task.value
    }

    private func performTokenRefresh(refreshToken: String) async throws -> TokenResponse {
        var request = URLRequest(url: URL(string: "https://auth.example.com/token")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body = "grant_type=refresh_token&refresh_token=\(refreshToken)&client_id=\(clientId)"
        request.httpBody = body.data(using: .utf8)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }
}

struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
}
```

## Error Handling and Retry Logic

```swift
func fetchWithRetry<T: Decodable>(
    _ type: T.Type,
    url: URL,
    maxRetries: Int = 3,
    delay: Duration = .seconds(1)
) async throws -> T {
    var lastError: Error?

    for attempt in 0..<maxRetries {
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                throw APIError.badResponse
            }
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            lastError = error

            // Don't retry client errors (4xx)
            if let apiError = error as? APIError, case .unauthorized = apiError { throw error }
            if let apiError = error as? APIError, case .notFound = apiError { throw error }

            if attempt < maxRetries - 1 {
                let backoff = Duration.seconds(pow(2.0, Double(attempt)))
                try await Task.sleep(for: backoff)
            }
        }
    }
    throw lastError ?? APIError.badResponse
}
```

## Multipart Form Data Upload

```swift
func uploadMultipart(
    imageData: Data,
    filename: String,
    fields: [String: String] = [:]
) async throws -> UploadResponse {
    let boundary = UUID().uuidString
    var request = URLRequest(url: URL(string: "https://api.example.com/upload")!)
    request.httpMethod = "POST"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()

    // Text fields
    for (key, value) in fields {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(value)\r\n".data(using: .utf8)!)
    }

    // File field
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n".data(using: .utf8)!)
    body.append("--\(boundary)--\r\n".data(using: .utf8)!)

    request.httpBody = body

    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(UploadResponse.self, from: data)
}
```

## WebSocket

```swift
actor WebSocketClient {
    private var webSocketTask: URLSessionWebSocketTask?
    private let url: URL

    init(url: URL) {
        self.url = url
    }

    func connect() {
        webSocketTask = URLSession.shared.webSocketTask(with: url)
        webSocketTask?.resume()
        listenForMessages()
    }

    func send(_ message: String) async throws {
        try await webSocketTask?.send(.string(message))
    }

    func send(_ data: Data) async throws {
        try await webSocketTask?.send(.data(data))
    }

    private func listenForMessages() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received text: \(text)")
                case .data(let data):
                    print("Received data: \(data.count) bytes")
                @unknown default:
                    break
                }
                // Continue listening
                self?.listenForMessages()
            case .failure(let error):
                print("WebSocket error: \(error)")
            }
        }
    }

    func disconnect() {
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
    }
}
```

## Network Monitoring

```swift
import Network

@Observable
class NetworkMonitor {
    static let shared = NetworkMonitor()

    var isConnected = true
    var connectionType: ConnectionType = .unknown

    enum ConnectionType {
        case wifi, cellular, ethernet, unknown
    }

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.connectionType = self?.getConnectionType(path) ?? .unknown
            }
        }
        monitor.start(queue: queue)
    }

    private func getConnectionType(_ path: NWPath) -> ConnectionType {
        if path.usesInterfaceType(.wifi) { return .wifi }
        if path.usesInterfaceType(.cellular) { return .cellular }
        if path.usesInterfaceType(.wiredEthernet) { return .ethernet }
        return .unknown
    }

    deinit {
        monitor.cancel()
    }
}

// Usage in SwiftUI
struct ContentView: View {
    let networkMonitor = NetworkMonitor.shared

    var body: some View {
        Group {
            if networkMonitor.isConnected {
                MainContentView()
            } else {
                OfflineView()
            }
        }
    }
}
```
