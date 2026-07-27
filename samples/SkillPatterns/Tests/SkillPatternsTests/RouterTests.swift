import XCTest
@testable import SkillPatterns

/// Deep-link parsing is a pure function, so these tests need no simulator,
/// no app launch, and no router.
final class DeepLinkParserTests: XCTestCase {

    private func url(_ string: String) -> URL {
        guard let url = URL(string: string) else {
            fatalError("test fixture is not a valid URL: \(string)")
        }
        return url
    }

    func testArticleLinkBuildsFullBackStack() throws {
        let id = UUID()
        let link = try XCTUnwrap(DeepLinkParser.parse(url("skillpatterns://article/\(id)")))

        // Not just the leaf — landing on a detail with an empty stack strands the user.
        XCTAssertEqual(link.routes, [.bookmarks, .articleDetail(id: id)])
    }

    func testUniversalLinkParsesSameAsCustomScheme() {
        let id = UUID()
        let custom = DeepLinkParser.parse(url("skillpatterns://article/\(id)"))
        let web = DeepLinkParser.parse(url("https://example.com/article/\(id)"))

        XCTAssertEqual(custom, web)
    }

    func testSimpleRoutes() throws {
        let bookmarks = try XCTUnwrap(DeepLinkParser.parse(url("skillpatterns://bookmarks")))
        XCTAssertEqual(bookmarks.routes, [.bookmarks])

        let settings = try XCTUnwrap(DeepLinkParser.parse(url("skillpatterns://settings")))
        XCTAssertEqual(settings.routes, [.settings])
    }

    /// Malformed input must be ignored, never fatal and never navigate blind.
    func testMalformedLinksAreIgnored() {
        let cases = [
            "skillpatterns://article/not-a-uuid",
            "skillpatterns://nonsense",
            "https://evil.example.com/article/123",
            "skillpatterns://",
            "mailto:someone@example.com"
        ]
        for string in cases {
            XCTAssertNil(
                DeepLinkParser.parse(url(string)),
                "expected nil for \(string)"
            )
        }
    }
}

@MainActor
final class RouterTests: XCTestCase {

    func testPushAndPop() {
        let router = Router()
        let id = UUID()

        router.push(.articleDetail(id: id))
        XCTAssertEqual(router.routes, [.articleDetail(id: id)])

        router.pop()
        XCTAssertTrue(router.routes.isEmpty)

        router.pop()   // popping an empty stack is a no-op, not a crash
        XCTAssertTrue(router.routes.isEmpty)
    }

    func testDeepLinkReplacesRatherThanAppends() {
        let router = Router()
        router.isReady = true
        router.push(.settings)

        router.handle(URL(string: "skillpatterns://bookmarks")!)

        // Replaced — a link never piles screens on wherever the user was.
        XCTAssertEqual(router.routes, [.bookmarks])
    }

    func testDeepLinkDismissesOpenSheet() {
        let router = Router()
        router.isReady = true
        router.sheet = .filter

        router.handle(URL(string: "skillpatterns://bookmarks")!)

        XCTAssertNil(router.sheet)
    }

    /// A link arriving during launch must be queued, not dropped.
    func testLinkBeforeReadyIsQueuedThenFlushed() {
        let router = Router()
        XCTAssertFalse(router.isReady)

        router.handle(URL(string: "skillpatterns://settings")!)
        XCTAssertTrue(router.routes.isEmpty, "should not navigate before ready")

        router.isReady = true
        XCTAssertEqual(router.routes, [.settings], "queued link should flush on ready")
    }

    func testUnknownLinkIsIgnored() {
        let router = Router()
        router.isReady = true
        router.push(.settings)

        let handled = router.handle(URL(string: "skillpatterns://unknown")!)

        XCTAssertFalse(handled)
        XCTAssertEqual(router.routes, [.settings], "state must be untouched")
    }

    /// Codable conformance is what makes NavigationPath restoration possible.
    func testRoutesRoundTripThroughCodable() throws {
        let routes: [Route] = [.bookmarks, .articleDetail(id: UUID()), .settings]

        let data = try JSONEncoder().encode(routes)
        let decoded = try JSONDecoder().decode([Route].self, from: data)

        XCTAssertEqual(routes, decoded)
    }
}
