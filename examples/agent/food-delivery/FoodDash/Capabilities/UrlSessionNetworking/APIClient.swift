import Foundation

struct APIRequest<Response: Decodable & Sendable>: Sendable {
    var method = "GET"
    var path: String
    var query: [URLQueryItem] = []
    var body: Data?
    var headers: [String: String] = [:]

    static func get(_ path: String, query: [String: String] = [:]) -> APIRequest {
        APIRequest(path: path, query: query.sorted { $0.key < $1.key }.map { URLQueryItem(name: $0.key, value: $0.value) })
    }

    static func post(_ path: String, body: some Encodable, method: String = "POST") throws -> APIRequest {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
        return APIRequest(method: method, path: path, body: try encoder.encode(body), headers: ["Content-Type": "application/json"])
    }
}

/// For endpoints that return no body.
struct EmptyResponse: Decodable, Sendable {}

enum APIError: LocalizedError, Equatable {
    case notConfigured
    case invalidURL(String)
    case transport(String)
    case http(status: Int, message: String)
    case decoding(String)

    var errorDescription: String? {
        switch self {
        case .notConfigured: "The server address is not configured yet."
        case .invalidURL(let path): "Invalid request path: \(path)"
        case .transport(let message): "Could not reach the server: \(message)"
        case .http(let status, let message): message.isEmpty ? "The server returned an error (\(status))." : message
        case .decoding(let message): "The server response was not understood: \(message)"
        }
    }
}

protocol APIClient: Sendable {
    func send<Response>(_ request: APIRequest<Response>) async throws -> Response
}

struct URLSessionAPIClient: APIClient {
    let baseURL: URL
    var session: URLSession = .shared
    /// Added to every request, for example an API key or bearer token.
    var headers: [String: String] = [:]

    func send<Response>(_ request: APIRequest<Response>) async throws -> Response {
        guard var components = URLComponents(url: baseURL.appending(path: request.path), resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL(request.path)
        }
        if !request.query.isEmpty { components.queryItems = request.query }
        guard let url = components.url else { throw APIError.invalidURL(request.path) }
        var urlRequest = URLRequest(url: url, timeoutInterval: 30)
        urlRequest.httpMethod = request.method
        urlRequest.httpBody = request.body
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        for (key, value) in headers.merging(request.headers, uniquingKeysWith: { _, new in new }) {
            urlRequest.setValue(value, forHTTPHeaderField: key)
        }
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch let error as URLError where error.code == .cancelled {
            throw CancellationError()
        } catch is CancellationError {
            throw CancellationError()
        } catch {
            throw APIError.transport(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else { throw APIError.transport("No HTTP response") }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.http(status: http.statusCode, message: Self.message(from: data))
        }
        if Response.self == EmptyResponse.self, let empty = EmptyResponse() as? Response { return empty }
        return try Self.decode(Response.self, from: data)
    }

    static func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        do {
            return try decoder.decode(type, from: data)
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }

    private static func message(from data: Data) -> String {
        struct ErrorBody: Decodable { let message: String?; let error: String? }
        let body = try? JSONDecoder().decode(ErrorBody.self, from: data)
        return body?.message ?? body?.error ?? ""
    }
}

/// Returns canned JSON per path. For previews and tests; never touches the network.
struct StubAPIClient: APIClient {
    var responses: [String: String]

    func send<Response>(_ request: APIRequest<Response>) async throws -> Response {
        guard let json = responses[request.path] else { throw APIError.http(status: 404, message: "No stub for \(request.path)") }
        if Response.self == EmptyResponse.self, let empty = EmptyResponse() as? Response { return empty }
        return try URLSessionAPIClient.decode(Response.self, from: Data(json.utf8))
    }
}
