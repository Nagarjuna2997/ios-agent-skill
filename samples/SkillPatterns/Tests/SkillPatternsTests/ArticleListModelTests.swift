import XCTest
@testable import SkillPatterns

/// The view model is `@MainActor`, so the test case is too — otherwise every
/// property read needs its own `await` and the tests become unreadable.
///
/// XCTest rather than Swift Testing so this compiles on the widest range of
/// toolchains; the docs show the Swift Testing form.
@MainActor
final class ArticleListModelTests: XCTestCase {

    // MARK: Loading

    func testLoadPopulatesArticles() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )

        await model.load()

        XCTAssertEqual(model.articles.count, Article.samples.count)
        XCTAssertFalse(model.isLoading)
        XCTAssertNil(model.errorMessage)
    }

    func testLoadSurfacesFailure() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(error: DomainError.offline),
            toggleBookmark: StubToggleBookmark()
        )

        await model.load()

        XCTAssertTrue(model.articles.isEmpty)
        // The rule: never swallow an error into nil.
        XCTAssertNotNil(model.errorMessage)
        XCTAssertFalse(model.isLoading)
    }

    func testCancellationIsNotReportedAsError() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(error: CancellationError()),
            toggleBookmark: StubToggleBookmark()
        )

        await model.load()

        // A dismissed screen must not raise a user-facing error.
        XCTAssertNil(model.errorMessage)
    }

    func testBookmarkedOnlyFilters() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )
        model.showBookmarkedOnly = true

        await model.load()

        XCTAssertTrue(model.articles.allSatisfy(\.isBookmarked))
    }

    // MARK: Optimistic update and revert

    func testToggleBookmarkRevertsOnFailure() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark(error: DomainError.offline)
        )
        await model.load()

        let article = model.articles[0]
        let original = article.isBookmarked

        await model.toggleBookmark(for: article)

        // Reverted by identity, not by a stale index.
        let updated = model.articles.first { $0.id == article.id }
        XCTAssertEqual(updated?.isBookmarked, original)
        XCTAssertNotNil(model.errorMessage)
    }

    func testToggleBookmarkSucceeds() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )
        await model.load()

        let article = model.articles[0]
        let original = article.isBookmarked

        await model.toggleBookmark(for: article)

        let updated = model.articles.first { $0.id == article.id }
        XCTAssertEqual(updated?.isBookmarked, !original)
        XCTAssertNil(model.errorMessage)
    }

    func testToggleBookmarkOnUnknownArticleIsNoOp() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )
        await model.load()
        let before = model.articles

        let ghost = Article(title: "Not loaded", summary: "", publishedAt: .now)
        await model.toggleBookmark(for: ghost)

        XCTAssertEqual(before, model.articles)
    }

    // MARK: Derived state

    func testDerivedState() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )
        XCTAssertTrue(model.isEmpty)

        await model.load()

        XCTAssertFalse(model.isEmpty)
        XCTAssertEqual(model.bookmarkCount, Article.samples.filter(\.isBookmarked).count)
    }

    // MARK: Re-entrancy

    func testOverlappingLoadsDoNotCorruptState() async {
        let model = ArticleListModel(
            fetchArticles: StubFetchArticles(),
            toggleBookmark: StubToggleBookmark()
        )

        // Two loads in flight; the first is superseded rather than racing.
        async let first: Void = model.load()
        async let second: Void = model.load()
        _ = await (first, second)

        XCTAssertFalse(model.isLoading)
        XCTAssertEqual(model.articles.count, Article.samples.count)
    }
}

// MARK: - Domain

final class DomainTests: XCTestCase {

    func testFetchSortsNewestFirst() async throws {
        let repository = InMemoryArticleRepository(articles: Article.samples)
        let useCase = DefaultFetchArticlesUseCase(repository: repository)

        let result = try await useCase.execute()

        let dates = result.map(\.publishedAt)
        XCTAssertEqual(dates, dates.sorted(by: >))
    }

    func testConvenienceOverloadMatchesExplicitCall() async throws {
        let repository = InMemoryArticleRepository(articles: Article.samples)
        let useCase = DefaultFetchArticlesUseCase(repository: repository)

        let implicit = try await useCase.execute()
        let explicit = try await useCase.execute(bookmarkedOnly: false)

        XCTAssertEqual(implicit, explicit)
    }

    func testToggleBookmarkRejectsUnknownArticle() async {
        let repository = InMemoryArticleRepository(articles: [])
        let useCase = DefaultToggleBookmarkUseCase(repository: repository)

        do {
            try await useCase.execute(id: UUID(), isBookmarked: true)
            XCTFail("expected DomainError.notFound")
        } catch let error as DomainError {
            guard case .notFound = error else {
                return XCTFail("expected .notFound, got \(error)")
            }
        } catch {
            XCTFail("expected DomainError, got \(error)")
        }
    }

    /// A reference-type double reconfigured AFTER injection is visible to the
    /// caller. A struct double would silently keep succeeding.
    func testActorDoubleIsReconfigurableAfterInjection() async throws {
        let repository = InMemoryArticleRepository(articles: Article.samples)
        let useCase = DefaultFetchArticlesUseCase(repository: repository)

        XCTAssertFalse(try await useCase.execute().isEmpty)

        await repository.setFailure(DomainError.offline)

        do {
            _ = try await useCase.execute()
            XCTFail("expected the injected failure to take effect")
        } catch {
            XCTAssertEqual(error as? DomainError, .offline)
        }
    }

    func testErrorsHaveUserFacingDescriptions() {
        let errors: [DomainError] = [
            .notFound(id: UUID()),
            .offline,
            .rejected(reason: "Too many requests.")
        ]
        for error in errors {
            XCTAssertFalse(
                error.errorDescription?.isEmpty ?? true,
                "every DomainError needs a user-facing message"
            )
        }
    }
}
