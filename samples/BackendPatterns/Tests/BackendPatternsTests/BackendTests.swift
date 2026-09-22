import XCTest
import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
@testable import BackendPatterns

private actor ScriptedTransport: HTTPTransport {
    var replies: [HTTPReply]
    var requests: [URLRequest] = []
    init(_ statuses: [Int], body: String = "{\"value\":7}") {
        replies = statuses.map { HTTPReply(data: Data(body.utf8), status: $0) }
    }
    func send(_ request: URLRequest) async throws -> HTTPReply {
        requests.append(request)
        return replies.removeFirst()
    }
    func count() -> Int { requests.count }
}
private struct Item: Decodable, Sendable { let value: Int }
final class BackendTests: XCTestCase {
    private var url: URL { get throws { try XCTUnwrap(URL(string: "https://example.invalid/items")) } }
    func testValidJSON() async throws {
        let client = try JSONClient(transport: ScriptedTransport([200]), pause: { _ in })
        let item = try await client.get(Item.self, url: url)
        XCTAssertEqual(item.value, 7)
    }
    func testStatusBeforeDecode() async throws {
        let client = try JSONClient(transport: ScriptedTransport([401], body: "not json"), pause: { _ in })
        do { _ = try await client.get(Item.self, url: url); XCTFail("accepted 401") }
        catch { XCTAssertEqual(error as? APIError, .status(401)) }
    }
    func testBoundedRetryRecovers() async throws {
        let transport = ScriptedTransport([503, 200])
        let client = try JSONClient(transport: transport, pause: { _ in })
        _ = try await client.get(Item.self, url: url)
        let count = await transport.count(); XCTAssertEqual(count, 2)
    }
    func testRetryExhaustion() async throws {
        let transport = ScriptedTransport([503, 503, 503])
        let client = try JSONClient(transport: transport, pause: { _ in })
        do { _ = try await client.get(Item.self, url: url); XCTFail("accepted unavailable") }
        catch { XCTAssertEqual(error as? APIError, .status(503)) }
        let count = await transport.count(); XCTAssertEqual(count, 3)
    }
    func testCancellationDuringDelayDoesNotRetry() async throws {
        let transport = ScriptedTransport([503, 200])
        let client = try JSONClient(transport: transport, pause: { _ in throw CancellationError() })
        do { _ = try await client.get(Item.self, url: url); XCTFail("ignored cancellation") }
        catch { XCTAssertTrue(error is CancellationError) }
        let count = await transport.count(); XCTAssertEqual(count, 1)
    }
    func testMalformedBodyIsNotRetried() async throws {
        let transport = ScriptedTransport([200], body: "broken")
        let client = try JSONClient(transport: transport, pause: { _ in })
        do { _ = try await client.get(Item.self, url: url); XCTFail("accepted malformed data") }
        catch { XCTAssertTrue(error is DecodingError) }
        let count = await transport.count(); XCTAssertEqual(count, 1)
    }
    func testRejectsUnboundedRetryConfiguration() {
        XCTAssertThrowsError(try JSONClient(transport: ScriptedTransport([]), attempts: 0, pause: { _ in }))
        XCTAssertThrowsError(try JSONClient(transport: ScriptedTransport([]), attempts: 99, pause: { _ in }))
    }
    func testRejectsInsecureURLBeforeTransport() async throws {
        let transport = ScriptedTransport([])
        let client = try JSONClient(transport: transport, pause: { _ in })
        do { _ = try await client.get(Item.self, url: XCTUnwrap(URL(string: "http://example.invalid"))); XCTFail("accepted HTTP") }
        catch { XCTAssertEqual(error as? APIError, .invalidURL) }
        let count = await transport.count(); XCTAssertEqual(count, 0)
    }
    func testExactCallbackRoute() throws {
        let route = CallbackRoute(scheme: "sample", host: "auth", path: "/callback")
        XCTAssertTrue(route.accepts(try XCTUnwrap(URL(string: "sample://auth/callback?code=synthetic"))))
        for bad in ["sample://auth.evil/callback", "sample://evil/auth/callback", "sample://user@auth/callback", "sample://auth:99/callback", "other://auth/callback", "sample://auth/callback/extra", "sample://auth/%63allback"] {
            XCTAssertFalse(route.accepts(try XCTUnwrap(URL(string: bad))), bad)
        }
    }
}
