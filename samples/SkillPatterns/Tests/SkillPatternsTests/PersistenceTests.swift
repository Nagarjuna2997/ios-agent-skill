import SwiftData
import XCTest
@testable import SkillPatterns

/// Every test here runs against an in-memory `ModelContainer`, so the suite
/// needs no disk, no fixtures, and no cleanup between runs.
final class PersistenceTests: XCTestCase {

    private func makeStore() throws -> ArticleStore {
        let container = try ModelContainer(
            for: StoredArticle.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        return ArticleStore(modelContainer: container)
    }

    // MARK: Round trip

    func testImportThenFetchReturnsValueTypes() async throws {
        let store = try makeStore()

        let inserted = try await store.importArticles(Article.samples)
        XCTAssertEqual(inserted, Article.samples.count)

        let fetched = try await store.fetchAll()
        XCTAssertEqual(fetched.count, Article.samples.count)
        // The returned elements are `Article` — Sendable structs, not
        // context-bound `StoredArticle` references.
        XCTAssertEqual(Set(fetched.map(\.id)), Set(Article.samples.map(\.id)))
    }

    func testFetchAllIsSortedNewestFirst() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)

        let fetched = try await store.fetchAll()
        let dates = fetched.map(\.publishedAt)

        XCTAssertEqual(dates, dates.sorted(by: >))
    }

    // MARK: The unique constraint

    func testImportIsIdempotent() async throws {
        let store = try makeStore()

        try await store.importArticles(Article.samples)
        let secondPass = try await store.importArticles(Article.samples)

        // Nothing new inserted, and no constraint violation at save time.
        XCTAssertEqual(secondPass, 0)
        let count = try await store.count()
        XCTAssertEqual(count, Article.samples.count)
    }

    func testReimportUpdatesInPlace() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)

        guard var edited = Article.samples.first else {
            return XCTFail("fixture is empty")
        }
        edited.title = "Rewritten headline"
        try await store.importArticles([edited])

        let refetched = try await store.fetch(id: edited.id)
        XCTAssertEqual(refetched.title, "Rewritten headline")
        let count = try await store.count()
        XCTAssertEqual(count, Article.samples.count)
    }

    // MARK: Writes

    func testSetBookmarkPersists() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)
        guard let target = Article.samples.first(where: { !$0.isBookmarked }) else {
            return XCTFail("fixture has no unbookmarked article")
        }

        try await store.setBookmark(true, for: target.id)

        let refetched = try await store.fetch(id: target.id)
        XCTAssertTrue(refetched.isBookmarked)
    }

    func testFetchingAMissingArticleThrowsNotFound() async throws {
        let store = try makeStore()
        let absent = UUID()

        do {
            _ = try await store.fetch(id: absent)
            XCTFail("expected a notFound error")
        } catch let error as DomainError {
            XCTAssertEqual(error, DomainError.notFound(id: absent))
        }
    }

    func testDeleteAllEmptiesTheStore() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)

        try await store.deleteAll()

        let count = try await store.count()
        XCTAssertEqual(count, 0)
    }

    // MARK: Crossing the boundary by identifier

    func testPersistentIdentifierRoundTrips() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)
        guard let original = Article.samples.first else {
            return XCTFail("fixture is empty")
        }

        // The identifier is Sendable and may cross the actor boundary. The
        // StoredArticle it refers to may not.
        guard let identifier = try await store.identifier(for: original.id) else {
            return XCTFail("expected an identifier for a stored article")
        }

        let resolved = try await store.article(withIdentifier: identifier)
        XCTAssertEqual(resolved.id, original.id)
        XCTAssertEqual(resolved.title, original.title)
    }

    func testIdentifierForAnUnknownArticleIsNil() async throws {
        let store = try makeStore()
        try await store.importArticles(Article.samples)

        let identifier = try await store.identifier(for: UUID())

        XCTAssertNil(identifier)
    }

    // MARK: The boundary protocol actually holds
    //
    // The point of the whole exercise: ArticleListModel was written against
    // `any FetchArticlesUseCase` with no knowledge that SwiftData exists. If it
    // needs a single change to run on a real store, the abstraction was
    // decorative.

    @MainActor
    func testTheSameViewModelDrivesSwiftDataUnchanged() async throws {
        let dependencies = try PersistentDependencies.inMemory()
        try await dependencies.articleStore.importArticles(Article.samples)

        let model = dependencies.makeArticleListModel()
        await model.load()

        XCTAssertEqual(model.articles.count, Article.samples.count)
        XCTAssertNil(model.errorMessage)
    }

    @MainActor
    func testBookmarkToggleThroughTheViewModelReachesTheStore() async throws {
        let dependencies = try PersistentDependencies.inMemory()
        try await dependencies.articleStore.importArticles(Article.samples)

        let model = dependencies.makeArticleListModel()
        await model.load()
        guard let target = model.articles.first(where: { !$0.isBookmarked }) else {
            return XCTFail("fixture has no unbookmarked article")
        }

        await model.toggleBookmark(for: target)

        XCTAssertNil(model.errorMessage)
        let persisted = try await dependencies.articleStore.fetch(id: target.id)
        XCTAssertTrue(persisted.isBookmarked)
    }

    @MainActor
    func testTwoContainersAreTwoSeparateStores() async throws {
        // Guards the rule the composition root exists to enforce: a second
        // container over the same models is a second source of truth, and its
        // symptom is writes that appear to vanish.
        let first = try PersistentDependencies.inMemory()
        let second = try PersistentDependencies.inMemory()

        try await first.articleStore.importArticles(Article.samples)

        let secondCount = try await second.articleStore.count()
        XCTAssertEqual(secondCount, 0)
    }
}
