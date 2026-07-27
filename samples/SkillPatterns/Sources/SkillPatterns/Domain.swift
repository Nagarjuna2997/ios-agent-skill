import Foundation

// MARK: - Entities
//
// Value types, Sendable, no framework imports. The domain layer knows nothing
// about SwiftUI, UIKit, or the data layer.
// See patterns/clean-architecture.md.

public struct Article: Identifiable, Hashable, Sendable {
    public let id: UUID
    public var title: String
    public var summary: String
    public var publishedAt: Date
    public var isBookmarked: Bool

    public init(
        id: UUID = UUID(),
        title: String,
        summary: String,
        publishedAt: Date,
        isBookmarked: Bool = false
    ) {
        self.id = id
        self.title = title
        self.summary = summary
        self.publishedAt = publishedAt
        self.isBookmarked = isBookmarked
    }
}

// MARK: - Errors

public enum DomainError: LocalizedError, Equatable {
    case notFound(id: UUID)
    case offline
    case rejected(reason: String)

    public var errorDescription: String? {
        switch self {
        case .notFound:
            "That article is no longer available."
        case .offline:
            "You're offline. Check your connection and try again."
        case .rejected(let reason):
            reason
        }
    }
}

// MARK: - Outbound boundary (driven port)
//
// Declared in the domain, implemented in the data layer.

public protocol ArticleRepository: Sendable {
    func fetchAll() async throws -> [Article]
    func fetch(id: UUID) async throws -> Article
    func setBookmark(_ isBookmarked: Bool, for id: UUID) async throws
}

// MARK: - Inbound boundary (driving port)
//
// The ONLY thing the presentation layer is allowed to name. Note there is no
// default argument in the protocol requirement — protocols cannot declare them.

public protocol FetchArticlesUseCase: Sendable {
    func execute(bookmarkedOnly: Bool) async throws -> [Article]
}

public protocol ToggleBookmarkUseCase: Sendable {
    func execute(id: UUID, isBookmarked: Bool) async throws
}

/// Ergonomic overload lives in an extension so every conformer inherits it.
extension FetchArticlesUseCase {
    public func execute() async throws -> [Article] {
        try await execute(bookmarkedOnly: false)
    }
}

// MARK: - Use case implementations

public struct DefaultFetchArticlesUseCase: FetchArticlesUseCase {
    private let repository: any ArticleRepository

    public init(repository: any ArticleRepository) {
        self.repository = repository
    }

    public func execute(bookmarkedOnly: Bool) async throws -> [Article] {
        let all = try await repository.fetchAll()
        let filtered = bookmarkedOnly ? all.filter(\.isBookmarked) : all
        return filtered.sorted { $0.publishedAt > $1.publishedAt }
    }
}

public struct DefaultToggleBookmarkUseCase: ToggleBookmarkUseCase {
    private let repository: any ArticleRepository

    public init(repository: any ArticleRepository) {
        self.repository = repository
    }

    public func execute(id: UUID, isBookmarked: Bool) async throws {
        // A business rule lives here, not in the view model.
        guard (try? await repository.fetch(id: id)) != nil else {
            throw DomainError.notFound(id: id)
        }
        try await repository.setBookmark(isBookmarked, for: id)
    }
}
