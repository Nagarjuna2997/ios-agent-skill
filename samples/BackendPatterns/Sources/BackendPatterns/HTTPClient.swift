import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct HTTPReply: Sendable {
    public let data: Data
    public let status: Int
    public init(data: Data, status: Int) { self.data = data; self.status = status }
}
public protocol HTTPTransport: Sendable {
    func send(_ request: URLRequest) async throws -> HTTPReply
}
public struct SessionTransport: HTTPTransport {
    private let session: URLSession
    public init(session: URLSession) { self.session = session }
    public func send(_ request: URLRequest) async throws -> HTTPReply {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.nonHTTP }
        return HTTPReply(data: data, status: http.statusCode)
    }
}
public enum APIError: Error, Equatable {
    case nonHTTP, status(Int), payloadTooLarge, invalidRetryLimit, invalidURL
}

/// A deliberately narrow JSON GET client. Writes, refresh and Retry-After belong to
/// a separately specified contract; this sample never retries a mutation.
public struct JSONClient: Sendable {
    private let transport: any HTTPTransport
    private let pause: @Sendable (Duration) async throws -> Void
    private let attempts: Int
    public init(transport: any HTTPTransport, attempts: Int = 3,
                pause: @escaping @Sendable (Duration) async throws -> Void) throws {
        guard (1...5).contains(attempts) else { throw APIError.invalidRetryLimit }
        self.transport = transport; self.attempts = attempts; self.pause = pause
    }
    public func get<Value: Decodable & Sendable>(_ type: Value.Type, url: URL) async throws -> Value {
        guard url.scheme == "https", url.host != nil, url.user == nil, url.password == nil else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        for attempt in 0..<attempts {
            try Task.checkCancellation()
            let reply = try await transport.send(request)
            try Task.checkCancellation()
            if [502, 503, 504].contains(reply.status), attempt + 1 < attempts {
                try await pause(.milliseconds(250 * (1 << attempt)))
                continue
            }
            guard (200...299).contains(reply.status) else { throw APIError.status(reply.status) }
            // Bounds decoding work, not URLSession's transfer allocation. Use downloads
            // or streaming with an enforced byte budget for untrusted large responses.
            guard reply.data.count <= 1_048_576 else { throw APIError.payloadTooLarge }
            return try JSONDecoder().decode(Value.self, from: reply.data)
        }
        preconditionFailure("The bounded loop returns or throws on its final iteration")
    }
}
