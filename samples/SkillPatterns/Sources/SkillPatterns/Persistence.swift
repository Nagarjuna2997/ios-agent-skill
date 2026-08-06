import Foundation
import SwiftData

// MARK: - Persistence model
//
// StoredArticle is NOT the domain entity. `Article` is a Sendable struct that
// crosses actor boundaries freely; `StoredArticle` is a reference type bound to
// the ModelContext that created it and must never leave the actor that owns it.
//
// Collapsing the two — putting @Model on the type the view renders — is the
// single most common SwiftData mistake. It compiles, and then the app crashes
// or corrupts data the first time a background import touches a model the UI
// is reading. See docs/frameworks/data-concurrency.md.

@Model
public final class StoredArticle {
    /// The domain identity, stored as a **string, not a `UUID`**.
    ///
    /// SwiftData's `#Predicate` does not reliably translate `UUID` equality.
    /// The fetch compiles, runs, and returns *nothing* — so every lookup by
    /// identity silently fails while `fetchAll()` keeps working perfectly. The
    /// symptom is an upsert that always inserts and a `fetch(id:)` that always
    /// throws `notFound`, against rows you can see in the store.
    ///
    /// This cost six CI failures on the first run of this file. String equality
    /// translates correctly, which is why the identity is stored as one.
    ///
    /// Distinct from `persistentModelID`, which is SwiftData's own and is not
    /// stable across stores.
    @Attribute(.unique) public var remoteID: String
    public var title: String
    public var summary: String
    public var publishedAt: Date
    public var isBookmarked: Bool

    public init(
        remoteID: String,
        title: String,
        summary: String,
        publishedAt: Date,
        isBookmarked: Bool
    ) {
        self.remoteID = remoteID
        self.title = title
        self.summary = summary
        self.publishedAt = publishedAt
        self.isBookmarked = isBookmarked
    }
}

extension StoredArticle {
    /// A static factory rather than a convenience initializer: `@Model`
    /// synthesizes initializer machinery, and adding designated initializers
    /// alongside it is a needless fight with the macro.
    static func make(from article: Article) -> StoredArticle {
        StoredArticle(
            remoteID: article.id.uuidString,
            title: article.title,
            summary: article.summary,
            publishedAt: article.publishedAt,
            isBookmarked: article.isBookmarked
        )
    }

    /// The boundary crossing. Everything leaving the store goes through here.
    ///
    /// Throws rather than inventing an identifier. A row whose `remoteID` will
    /// not parse is corrupt, and `UUID(uuidString:) ?? UUID()` would hand the
    /// caller a plausible-looking article that matches nothing — a silent data
    /// bug in place of a loud one.
    func article() throws -> Article {
        guard let id = UUID(uuidString: remoteID) else {
            throw DomainError.rejected(reason: "A stored article has an unreadable identifier.")
        }
        return Article(
            id: id,
            title: title,
            summary: summary,
            publishedAt: publishedAt,
            isBookmarked: isBookmarked
        )
    }

    func apply(_ article: Article) {
        title = article.title
        summary = article.summary
        publishedAt = article.publishedAt
        isBookmarked = article.isBookmarked
    }
}

// MARK: - The store
//
// @ModelActor synthesizes `modelContainer`, `modelExecutor`, a `modelContext`
// bound to this actor, and `init(modelContainer:)`. Do not write an initializer
// — the macro owns it.
//
// It conforms to ArticleRepository, which is the whole point: the outbound
// boundary protocol was defined in the domain with no knowledge of SwiftData,
// and ArticleListModel drives this store without a single line changing. If
// swapping the persistence layer required touching the view model, the boundary
// was decorative. See patterns/clean-architecture.md.

@ModelActor
public actor ArticleStore: ArticleRepository {

    // MARK: ArticleRepository

    public func fetchAll() async throws -> [Article] {
        let descriptor = FetchDescriptor<StoredArticle>(
            sortBy: [SortDescriptor<StoredArticle>(\.publishedAt, order: .reverse)]
        )
        // The map is load-bearing: it converts to value types *inside* the
        // actor. Returning [StoredArticle] would hand the caller reference
        // types tied to this actor's context.
        return try modelContext.fetch(descriptor).map { try $0.article() }
    }

    public func fetch(id: UUID) async throws -> Article {
        guard let stored = try first(matching: id) else {
            throw DomainError.notFound(id: id)
        }
        return try stored.article()
    }

    public func setBookmark(_ isBookmarked: Bool, for id: UUID) async throws {
        guard let stored = try first(matching: id) else {
            throw DomainError.notFound(id: id)
        }
        stored.isBookmarked = isBookmarked
        try modelContext.save()
    }

    // MARK: Background import
    //
    // The reason a @ModelActor exists at all. This runs off the main actor, so
    // importing ten thousand rows does not block a single frame.

    /// Upserts on `remoteID`. Idempotent: importing the same payload twice
    /// leaves one row, not two.
    ///
    /// Without the upsert, `@Attribute(.unique)` turns the second import into a
    /// constraint violation at save time — long after the insert that caused it.
    @discardableResult
    public func importArticles(_ articles: [Article]) throws -> Int {
        var inserted = 0
        for article in articles {
            if let existing = try first(matching: article.id) {
                existing.apply(article)
            } else {
                modelContext.insert(StoredArticle.make(from: article))
                inserted += 1
            }
        }
        try modelContext.save()
        return inserted
    }

    public func count() throws -> Int {
        try modelContext.fetchCount(FetchDescriptor<StoredArticle>())
    }

    public func deleteAll() throws {
        for stored in try modelContext.fetch(FetchDescriptor<StoredArticle>()) {
            modelContext.delete(stored)
        }
        try modelContext.save()
    }

    // MARK: Crossing the boundary by identifier
    //
    // When a caller genuinely needs to refer to a specific row later, the thing
    // that crosses is the PersistentIdentifier — Sendable, and meaningless
    // outside the store that issued it. The model object itself never crosses.

    public func identifier(for id: UUID) throws -> PersistentIdentifier? {
        try first(matching: id)?.persistentModelID
    }

    /// Resolves an identifier this store issued. Passing one from a different
    /// container is a programming error, not a recoverable condition.
    public func article(withIdentifier identifier: PersistentIdentifier) throws -> Article {
        guard let stored = modelContext.model(for: identifier) as? StoredArticle else {
            throw DomainError.rejected(reason: "That article is no longer in the local store.")
        }
        return try stored.article()
    }

    // MARK: Private

    private func first(matching id: UUID) throws -> StoredArticle? {
        // Captured as a plain local String. Comparing `$0.remoteID == id` with
        // a UUID here is the bug documented on `remoteID` — it matches nothing.
        let key = id.uuidString
        var descriptor = FetchDescriptor<StoredArticle>(
            predicate: #Predicate<StoredArticle> { $0.remoteID == key }
        )
        descriptor.fetchLimit = 1
        return try modelContext.fetch(descriptor).first
    }
}

// MARK: - Persistent composition root
//
// The container is created in exactly one place and injected. Nothing else in
// the app constructs a ModelContainer — a second container over the same store
// is a second source of truth, and the symptoms (writes that vanish, stale
// reads) look nothing like the cause.
//
// This is a sibling of LiveDependencies rather than a change to AppDependencies:
// a graph with no persistence should not be forced to carry a container it never
// uses. Both satisfy the same protocol, so ArticleListModel cannot tell them
// apart — which is the property worth proving.

@MainActor
public final class PersistentDependencies: AppDependencies {
    public let modelContainer: ModelContainer
    public let articleStore: ArticleStore

    public init(modelContainer: ModelContainer) {
        self.modelContainer = modelContainer
        self.articleStore = ArticleStore(modelContainer: modelContainer)
    }

    /// For tests and previews. `isStoredInMemoryOnly` means a `#Preview` costs
    /// nothing and leaves nothing behind — the rule that every screen must
    /// render with no network and no disk.
    public static func inMemory() throws -> PersistentDependencies {
        let container = try ModelContainer(
            for: StoredArticle.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        return PersistentDependencies(modelContainer: container)
    }

    public func makeFetchArticlesUseCase() -> any FetchArticlesUseCase {
        DefaultFetchArticlesUseCase(repository: articleStore)
    }

    public func makeToggleBookmarkUseCase() -> any ToggleBookmarkUseCase {
        DefaultToggleBookmarkUseCase(repository: articleStore)
    }
}
