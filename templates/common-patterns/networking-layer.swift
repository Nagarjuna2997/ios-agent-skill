import Foundation

// MARK: - API Client

/// A generic, reusable API client using async/await and URLSession.
actor APIClient {
    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(
        baseURL: URL,
        session: URLSession = .shared,
        decoder: JSONDecoder = .init(),
        encoder: JSONEncoder = .init()
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = decoder
        self.encoder = encoder

        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder.dateEncodingStrategy = .iso8601
    }

    // MARK: - Public API

    func get<T: Decodable>(
        _ path: String,
        queryItems: [URLQueryItem]? = nil,
        headers: [String: String]? = nil
    ) async throws -> T {
        let request = try makeRequest(
            path: path,
            method: "GET",
            queryItems: queryItems,
            headers: headers
        )
        return try await perform(request)
    }

    func post<T: Decodable, B: Encodable>(
        _ path: String,
        body: B,
        headers: [String: String]? = nil
    ) async throws -> T {
        var request = try makeRequest(
            path: path,
            method: "POST",
            headers: headers
        )
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await perform(request)
    }

    func put<T: Decodable, B: Encodable>(
        _ path: String,
        body: B,
        headers: [String: String]? = nil
    ) async throws -> T {
        var request = try makeRequest(
            path: path,
            method: "PUT",
            headers: headers
        )
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await perform(request)
    }

    func delete(
        _ path: String,
        headers: [String: String]? = nil
    ) async throws {
        let request = try makeRequest(
            path: path,
            method: "DELETE",
            headers: headers
        )
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }

    // MARK: - Private Helpers

    private func makeRequest(
        path: String,
        method: String,
        queryItems: [URLQueryItem]? = nil,
        headers: [String: String]? = nil
    ) throws -> URLRequest {
        var components = URLComponents(
            url: baseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: true
        )
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw APIError.invalidURL(path)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }

        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        return try decoder.decode(T.self, from: data)
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 429:
            throw APIError.rateLimited
        case 500...599:
            throw APIError.serverError(httpResponse.statusCode)
        default:
            throw APIError.unexpectedStatusCode(httpResponse.statusCode)
        }
    }
}

// MARK: - API Error

enum APIError: LocalizedError {
    case invalidURL(String)
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case rateLimited
    case serverError(Int)
    case unexpectedStatusCode(Int)
    case decodingFailed(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL(let path):
            return "Invalid URL for path: \(path)"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Authentication required. Please sign in."
        case .forbidden:
            return "You don't have permission to access this resource."
        case .notFound:
            return "The requested resource was not found."
        case .rateLimited:
            return "Too many requests. Please try again later."
        case .serverError(let code):
            return "Server error (\(code)). Please try again later."
        case .unexpectedStatusCode(let code):
            return "Unexpected response (\(code))"
        case .decodingFailed(let error):
            return "Failed to process response: \(error.localizedDescription)"
        }
    }
}

// MARK: - Authenticated API Client

/// Extends APIClient with token-based authentication.
actor AuthenticatedAPIClient {
    private let client: APIClient
    private var accessToken: String?
    private var refreshToken: String?
    private let tokenRefresher: (@Sendable () async throws -> TokenPair)?

    struct TokenPair: Sendable {
        let accessToken: String
        let refreshToken: String
    }

    init(
        baseURL: URL,
        tokenRefresher: (@Sendable () async throws -> TokenPair)? = nil
    ) {
        self.client = APIClient(baseURL: baseURL)
        self.tokenRefresher = tokenRefresher
    }

    func setTokens(access: String, refresh: String) {
        self.accessToken = access
        self.refreshToken = refresh
    }

    func authenticatedGet<T: Decodable>(_ path: String) async throws -> T {
        let headers = try authHeaders()
        return try await client.get(path, headers: headers)
    }

    func authenticatedPost<T: Decodable, B: Encodable>(
        _ path: String,
        body: B
    ) async throws -> T {
        let headers = try authHeaders()
        return try await client.post(path, body: body, headers: headers)
    }

    private func authHeaders() throws -> [String: String] {
        guard let token = accessToken else {
            throw APIError.unauthorized
        }
        return ["Authorization": "Bearer \(token)"]
    }
}

// MARK: - Usage Example

/*
 let client = APIClient(baseURL: URL(string: "https://api.example.com/v1")!)

 // GET request
 let users: [User] = try await client.get("/users", queryItems: [
     URLQueryItem(name: "page", value: "1"),
     URLQueryItem(name: "limit", value: "20")
 ])

 // POST request
 let newUser: User = try await client.post("/users", body: CreateUserRequest(
     name: "John Doe",
     email: "john@example.com"
 ))

 // DELETE request
 try await client.delete("/users/123")
 */
