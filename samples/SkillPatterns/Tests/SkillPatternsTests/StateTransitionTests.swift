import XCTest
@testable import SkillPatterns

/// State transitions of the `@Observable` view model, plus `AsyncSequence`
/// consumption.
///
/// The transitions that matter are the ones that only exist *during* an
/// `await` — `isLoading` while in flight, a second load superseding a first.
/// Those go through `Gate`, which makes the suspension deterministic. Sleeping
/// and hoping produces a test that passes locally and flakes in CI, which is
/// worse than no test: it teaches people to re-run until green.
@MainActor
final class StateTransitionTests: XCTestCase {

    private func makeModel(
        fetch: any FetchArticlesUseCase,
        toggle: any ToggleBookmarkUseCase = StubToggleBookmark()
    ) -> ArticleListModel {
        ArticleListModel(fetchArticles: fetch, toggleBookmark: toggle)
    }

    // MARK: isLoading

    func testIsLoadingIsTrueOnlyWhileInFlight() async {
        let gate = Gate()
        let model = makeModel(fetch: GatedFetchArticles(gate: gate))

        XCTAssertFalse(model.isLoading)

        let loading = Task { await model.load() }
        await gate.waitUntilEntered()
        XCTAssertTrue(model.isLoading, "isLoading must be set before the await, not after it")

        await gate.release()
        await loading.value
        XCTAssertFalse(model.isLoading)
    }

    func testIsLoadingResetsWhenTheFetchThrows() async {
        let gate = Gate()
        let model = makeModel(fetch: GatedFetchArticles(gate: gate, error: DomainError.offline))

        let loading = Task { await model.load() }
        await gate.waitUntilEntered()
        await gate.release()
        await loading.value

        // The `defer` is what guarantees this. Without it a failed load leaves
        // a spinner on screen forever.
        XCTAssertFalse(model.isLoading)
        XCTAssertNotNil(model.errorMessage)
    }

    // MARK: Error lifecycle
    //
    // These use InMemoryArticleRepository rather than a stub struct, because
    // the behavior under test is what happens to ONE model across a failure and
    // a recovery. A struct double injected at init cannot change its mind, so a
    // test built from two separate models would assert nothing.

    func testASuccessfulReloadClearsAPreviousError() async {
        let repository = InMemoryArticleRepository(articles: Article.samples)
        let model = makeModel(fetch: DefaultFetchArticlesUseCase(repository: repository))

        await repository.setFailure(DomainError.offline)
        await model.load()
        XCTAssertNotNil(model.errorMessage)

        await repository.setFailure(nil)
        await model.load()

        XCTAssertNil(model.errorMessage)
        XCTAssertEqual(model.articles.count, Article.samples.count)
    }

    func testAFailedReloadKeepsTheArticlesAlreadyOnScreen() async {
        let repository = InMemoryArticleRepository(articles: Article.samples)
        let model = makeModel(fetch: DefaultFetchArticlesUseCase(repository: repository))

        await model.load()
        let loaded = model.articles
        XCTAssertFalse(loaded.isEmpty)

        await repository.setFailure(DomainError.offline)
        await model.load()

        // Blanking the list on a transient failure turns a network blip into an
        // empty state, which reads to the user as data loss.
        XCTAssertEqual(model.articles, loaded)
        XCTAssertNotNil(model.errorMessage)
    }

    func testDismissErrorClearsOnlyTheError() async {
        let model = makeModel(fetch: StubFetchArticles(error: DomainError.offline))
        await model.load()
        XCTAssertNotNil(model.errorMessage)

        model.dismissError()

        XCTAssertNil(model.errorMessage)
        XCTAssertFalse(model.isLoading)
    }

    // MARK: Re-entrancy and cancellation

    func testASecondLoadSupersedesTheFirstWithoutSurfacingAnError() async {
        let gate = Gate()
        let model = makeModel(fetch: GatedFetchArticles(gate: gate, articles: []))

        let first = Task { await model.load() }
        await gate.waitUntilEntered()

        // The second load cancels the first. The first then throws
        // CancellationError at its `Task.checkCancellation()`, which the model
        // treats as a deliberate no-op — a superseded load is not a user-facing
        // failure, and showing one every time a list refreshes is the bug.
        let second = Task { await model.load() }
        await gate.release()
        await first.value
        await second.value

        XCTAssertFalse(model.isLoading)
        XCTAssertNil(model.errorMessage)
    }

    // MARK: Derived state

    func testBookmarkCountTracksTheArticles() async {
        let model = makeModel(fetch: StubFetchArticles())
        XCTAssertEqual(model.bookmarkCount, 0)

        await model.load()

        XCTAssertEqual(model.bookmarkCount, Article.samples.filter(\.isBookmarked).count)
    }

    func testIsEmptyIsFalseWhileLoading() async {
        let gate = Gate()
        let model = makeModel(fetch: GatedFetchArticles(gate: gate, articles: []))

        let loading = Task { await model.load() }
        await gate.waitUntilEntered()

        // An empty list mid-load is not an empty state. Rendering "No articles"
        // underneath a spinner is the classic version of this bug.
        XCTAssertFalse(model.isEmpty)

        await gate.release()
        await loading.value
        XCTAssertTrue(model.isEmpty)
    }

    // MARK: AsyncSequence consumption

    func testStreamedUpdatesAreAppliedByIdentity() async {
        let model = makeModel(fetch: StubFetchArticles())
        await model.load()
        guard let original = model.articles.first else {
            return XCTFail("fixture is empty")
        }

        var updated = original
        updated.title = "Live-updated headline"
        await model.consumeUpdates(from: StubArticleUpdates([updated]))

        let match = model.articles.first { $0.id == original.id }
        XCTAssertEqual(match?.title, "Live-updated headline")
        XCTAssertEqual(model.articles.count, Article.samples.count, "no rows added or removed")
    }

    func testUpdatesForUnknownArticlesAreDropped() async {
        let model = makeModel(fetch: StubFetchArticles())
        await model.load()
        let before = model.articles

        let stranger = Article(
            title: "Never fetched",
            summary: "Belongs to another list.",
            publishedAt: Date(timeIntervalSince1970: 1)
        )
        await model.consumeUpdates(from: StubArticleUpdates([stranger]))

        XCTAssertEqual(model.articles, before, "an unknown id must not append a row")
    }

    func testRepeatedUpdatesForOneArticleApplyInOrder() async {
        let model = makeModel(fetch: StubFetchArticles())
        await model.load()
        guard let original = model.articles.first else {
            return XCTFail("fixture is empty")
        }

        var first = original
        first.title = "First"
        var second = original
        second.title = "Second"
        await model.consumeUpdates(from: StubArticleUpdates([first, second]))

        XCTAssertEqual(model.articles.first { $0.id == original.id }?.title, "Second")
    }

    func testConsumingAnEndlessStreamExitsOnCancellation() async {
        let model = makeModel(fetch: StubFetchArticles())
        await model.load()
        guard let original = model.articles.first else {
            return XCTFail("fixture is empty")
        }

        var updated = original
        updated.title = "Streamed"

        // EndlessArticleUpdates never calls finish(), so only cancellation can
        // end this loop. Cancellation propagates here because `for await` is
        // structured — unlike an unstructured `Task { }`, which would not
        // inherit it. If the consumer ignored cancellation this test would hang
        // rather than fail, which is itself the signal.
        let consuming = Task { await model.consumeUpdates(from: EndlessArticleUpdates([updated])) }
        await Task.yield()
        consuming.cancel()
        await consuming.value

        XCTAssertNil(model.errorMessage, "cancelling a stream is not a failure")
    }

    func testEachCallGetsAFreshSequence() async {
        let model = makeModel(fetch: StubFetchArticles())
        await model.load()
        guard let original = model.articles.first else {
            return XCTFail("fixture is empty")
        }

        var updated = original
        updated.title = "Applied twice"
        let source = StubArticleUpdates([updated])

        await model.consumeUpdates(from: source)
        XCTAssertEqual(model.articles.first { $0.id == original.id }?.title, "Applied twice")

        // Reset, so the second pass has something to prove. Without this the
        // assertion below would hold whether or not the sequence was fresh —
        // the value is already correct from the first pass.
        await model.consumeUpdates(from: StubArticleUpdates([original]))
        XCTAssertEqual(model.articles.first { $0.id == original.id }?.title, original.title)

        // A source handing out one shared sequence would have delivered its
        // only element to the first consumer, and this pass would apply nothing.
        await model.consumeUpdates(from: source)

        XCTAssertEqual(model.articles.first { $0.id == original.id }?.title, "Applied twice")
    }
}
