import Foundation

// MARK: - Data layer
//
// The only place that knows about transport. An actor, so it is Sendable
// without an escape hatch.
// See patterns/clean-architecture.md and docs/frameworks/data-concurrency.md.

public actor InMemoryArticleRepository: ArticleRepository {
    private var storage: [UUID: Article]
    private var failure: (any Error)?

    public init(articles: [Article] = [], failure: (any Error)? = nil) {
        self.storage = Dictionary(uniqueKeysWithValues: articles.map { ($0.id, $0) })
        self.failure = failure
    }

    /// Reference semantics: reconfiguring after injection IS visible to the
    /// view model. A struct double would silently keep succeeding.
    /// See docs/testing/mocking-strategy.md.
    public func setFailure(_ error: (any Error)?) {
        failure = error
    }

    public func fetchAll() async throws -> [Article] {
        if let failure { throw failure }
        return Array(storage.values)
    }

    public func fetch(id: UUID) async throws -> Article {
        if let failure { throw failure }
        guard let article = storage[id] else { throw DomainError.notFound(id: id) }
        return article
    }

    public func setBookmark(_ isBookmarked: Bool, for id: UUID) async throws {
        if let failure { throw failure }
        guard var article = storage[id] else { throw DomainError.notFound(id: id) }
        article.isBookmarked = isBookmarked
        storage[id] = article
    }
}

// MARK: - Composition root
//
// The ONE place allowed to name concrete types from every layer. Declared as a
// protocol so tests, previews, and App Clips can substitute a whole graph.

@MainActor
public protocol AppDependencies {
    func makeFetchArticlesUseCase() -> any FetchArticlesUseCase
    func makeToggleBookmarkUseCase() -> any ToggleBookmarkUseCase
}

/// Screen factories live with the graph, so no View assembles its own dependencies.
extension AppDependencies {
    public func makeArticleListModel() -> ArticleListModel {
        ArticleListModel(
            fetchArticles: makeFetchArticlesUseCase(),
            toggleBookmark: makeToggleBookmarkUseCase()
        )
    }
}

@MainActor
public final class LiveDependencies: AppDependencies {
    private let repository: any ArticleRepository

    public init(repository: any ArticleRepository) {
        self.repository = repository
    }

    public func makeFetchArticlesUseCase() -> any FetchArticlesUseCase {
        DefaultFetchArticlesUseCase(repository: repository)
    }

    public func makeToggleBookmarkUseCase() -> any ToggleBookmarkUseCase {
        DefaultToggleBookmarkUseCase(repository: repository)
    }
}

// MARK: - Test and preview doubles

public struct StubFetchArticles: FetchArticlesUseCase {
    public var articles: [Article]
    public var error: (any Error)?

    public init(articles: [Article] = Article.samples, error: (any Error)? = nil) {
        self.articles = articles
        self.error = error
    }

    public func execute(bookmarkedOnly: Bool) async throws -> [Article] {
        if let error { throw error }
        return bookmarkedOnly ? articles.filter(\.isBookmarked) : articles
    }
}

public struct StubToggleBookmark: ToggleBookmarkUseCase {
    public var error: (any Error)?

    public init(error: (any Error)? = nil) {
        self.error = error
    }

    public func execute(id: UUID, isBookmarked: Bool) async throws {
        if let error { throw error }
    }
}

extension Article {
    /// Realistic fixtures, including the edge cases that break layouts.
    public static var samples: [Article] {
        [
            Article(
                title: "Understanding Actor Isolation",
                summary: "Why @Observable alone is not enough.",
                publishedAt: Date(timeIntervalSince1970: 1_760_000_000),
                isBookmarked: true
            ),
            Article(
                title: "Inversion of Control in SwiftUI",
                summary: "Protocol boundaries that make previews free.",
                publishedAt: Date(timeIntervalSince1970: 1_750_000_000)
            ),
            Article(
                title: String(repeating: "A very long headline that wraps ", count: 4),
                summary: "Ünïcödé — 日本語 — العربية",
                publishedAt: Date(timeIntervalSince1970: 1_740_000_000)
            )
        ]
    }
}
