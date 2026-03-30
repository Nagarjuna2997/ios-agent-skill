# Repository Pattern

## Overview

The Repository pattern abstracts data access behind a protocol, letting the rest of the app work with domain objects without knowing whether data comes from a network API, local database, or cache.

```
┌─────────────┐
│  ViewModel   │  Knows only the protocol
└──────┬──────┘
       │
┌──────▼──────────────────────────┐
│  RepositoryProtocol (interface)  │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  Repository (implementation)     │
│  ┌───────────┐ ┌──────────────┐ │
│  │ Remote API │ │ Local Cache  │ │
│  └───────────┘ └──────────────┘ │
└─────────────────────────────────┘
```

---

## Repository Protocol

```swift
protocol ArticleRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [Article]
    func fetch(id: Article.ID) async throws -> Article
    func save(_ article: Article) async throws
    func delete(id: Article.ID) async throws
    func search(query: String) async throws -> [Article]
}

struct Article: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var body: String
    var author: String
    var publishedAt: Date
    var isFavorite: Bool
}
```

---

## Remote Data Source (API)

```swift
actor RemoteArticleDataSource {
    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder

    init(baseURL: URL = URL(string: "https://api.example.com/v1")!,
         session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func fetchAll() async throws -> [ArticleDTO] {
        let url = baseURL.appending(path: "articles")
        let (data, response) = try await session.data(from: url)
        try validateResponse(response)
        return try decoder.decode([ArticleDTO].self, from: data)
    }

    func fetch(id: UUID) async throws -> ArticleDTO {
        let url = baseURL.appending(path: "articles/\(id)")
        let (data, response) = try await session.data(from: url)
        try validateResponse(response)
        return try decoder.decode(ArticleDTO.self, from: data)
    }

    func save(_ dto: ArticleDTO) async throws {
        let url = baseURL.appending(path: "articles")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(dto)
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }

    func delete(id: UUID) async throws {
        let url = baseURL.appending(path: "articles/\(id)")
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse,
              (200..<300).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw RepositoryError.networkError(statusCode: code)
        }
    }
}

struct ArticleDTO: Codable {
    let id: String
    let title: String
    let body: String
    let author: String
    let published_at: Date
    let is_favorite: Bool

    func toDomain() -> Article {
        Article(
            id: UUID(uuidString: id) ?? UUID(),
            title: title, body: body, author: author,
            publishedAt: published_at, isFavorite: is_favorite
        )
    }

    static func fromDomain(_ article: Article) -> ArticleDTO {
        ArticleDTO(
            id: article.id.uuidString,
            title: article.title, body: article.body,
            author: article.author, published_at: article.publishedAt,
            is_favorite: article.isFavorite
        )
    }
}
```

---

## Local Data Source (SwiftData)

```swift
import SwiftData

@Model
class ArticleEntity {
    @Attribute(.unique) var id: UUID
    var title: String
    var body: String
    var author: String
    var publishedAt: Date
    var isFavorite: Bool
    var lastSyncedAt: Date

    init(from article: Article) {
        self.id = article.id
        self.title = article.title
        self.body = article.body
        self.author = article.author
        self.publishedAt = article.publishedAt
        self.isFavorite = article.isFavorite
        self.lastSyncedAt = .now
    }

    func toDomain() -> Article {
        Article(
            id: id, title: title, body: body,
            author: author, publishedAt: publishedAt,
            isFavorite: isFavorite
        )
    }

    func update(from article: Article) {
        title = article.title
        body = article.body
        author = article.author
        publishedAt = article.publishedAt
        isFavorite = article.isFavorite
        lastSyncedAt = .now
    }
}

@ModelActor
actor LocalArticleDataSource {
    func fetchAll() throws -> [Article] {
        let descriptor = FetchDescriptor<ArticleEntity>(
            sortBy: [SortDescriptor(\.publishedAt, order: .reverse)]
        )
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    func fetch(id: UUID) throws -> Article? {
        let predicate = #Predicate<ArticleEntity> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try modelContext.fetch(descriptor).first?.toDomain()
    }

    func save(_ articles: [Article]) throws {
        for article in articles {
            let predicate = #Predicate<ArticleEntity> { $0.id == article.id }
            let descriptor = FetchDescriptor(predicate: predicate)
            if let existing = try modelContext.fetch(descriptor).first {
                existing.update(from: article)
            } else {
                modelContext.insert(ArticleEntity(from: article))
            }
        }
        try modelContext.save()
    }

    func delete(id: UUID) throws {
        let predicate = #Predicate<ArticleEntity> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let entity = try modelContext.fetch(descriptor).first {
            modelContext.delete(entity)
            try modelContext.save()
        }
    }
}
```

---

## Caching Strategies

```swift
actor CacheService {
    struct CacheEntry<T> {
        let value: T
        let timestamp: Date
        let ttl: TimeInterval
        var isExpired: Bool { Date.now.timeIntervalSince(timestamp) > ttl }
    }

    private var storage: [String: Any] = [:]

    func get<T>(key: String) -> T? {
        guard let entry = storage[key] as? CacheEntry<T>,
              !entry.isExpired else {
            storage.removeValue(forKey: key)
            return nil
        }
        return entry.value
    }

    func set<T>(key: String, value: T, ttl: TimeInterval = 300) {
        storage[key] = CacheEntry(value: value, timestamp: .now, ttl: ttl)
    }

    func invalidate(key: String) {
        storage.removeValue(forKey: key)
    }

    func invalidateAll() {
        storage.removeAll()
    }
}
```

---

## Repository Implementation with Offline-First

```swift
struct ArticleRepository: ArticleRepositoryProtocol {
    private let remote: RemoteArticleDataSource
    private let local: LocalArticleDataSource
    private let cache: CacheService
    private let connectivity: ConnectivityMonitor

    init(remote: RemoteArticleDataSource, local: LocalArticleDataSource,
         cache: CacheService, connectivity: ConnectivityMonitor) {
        self.remote = remote
        self.local = local
        self.cache = cache
        self.connectivity = connectivity
    }

    /// Strategy: Cache -> Local -> Remote (with sync)
    func fetchAll() async throws -> [Article] {
        // 1. Return cached data immediately if available
        if let cached: [Article] = await cache.get(key: "articles") {
            // Refresh in background
            Task { try? await syncFromRemote() }
            return cached
        }

        // 2. Try local database
        let localArticles = try await local.fetchAll()
        if !localArticles.isEmpty {
            await cache.set(key: "articles", value: localArticles, ttl: 120)
            Task { try? await syncFromRemote() }
            return localArticles
        }

        // 3. Fetch from remote
        return try await syncFromRemote()
    }

    @discardableResult
    private func syncFromRemote() async throws -> [Article] {
        let dtos = try await remote.fetchAll()
        let articles = dtos.map { $0.toDomain() }
        try await local.save(articles)
        await cache.set(key: "articles", value: articles, ttl: 300)
        return articles
    }

    func fetch(id: Article.ID) async throws -> Article {
        // Try local first
        if let local = try await local.fetch(id: id) {
            return local
        }

        // Fetch from remote
        let dto = try await remote.fetch(id: id)
        let article = dto.toDomain()
        try await local.save([article])
        return article
    }

    func save(_ article: Article) async throws {
        // Save locally first (optimistic)
        try await local.save([article])
        await cache.invalidate(key: "articles")

        // Sync to remote
        if await connectivity.isConnected {
            try await remote.save(.fromDomain(article))
        } else {
            await PendingSyncQueue.shared.enqueue(.save(article))
        }
    }

    func delete(id: Article.ID) async throws {
        try await local.delete(id: id)
        await cache.invalidate(key: "articles")

        if await connectivity.isConnected {
            try await remote.delete(id: id)
        } else {
            await PendingSyncQueue.shared.enqueue(.delete(id))
        }
    }

    func search(query: String) async throws -> [Article] {
        // Search locally (works offline)
        let all = try await local.fetchAll()
        return all.filter {
            $0.title.localizedCaseInsensitiveContains(query) ||
            $0.body.localizedCaseInsensitiveContains(query)
        }
    }
}
```

---

## Pending Sync Queue (Offline Operations)

```swift
actor PendingSyncQueue {
    static let shared = PendingSyncQueue()

    enum Operation: Codable {
        case save(Article)
        case delete(UUID)
    }

    private var queue: [Operation] = []

    func enqueue(_ operation: Operation) {
        queue.append(operation)
        persist()
    }

    func processAll(remote: RemoteArticleDataSource) async {
        var failedOps: [Operation] = []

        for op in queue {
            do {
                switch op {
                case .save(let article):
                    try await remote.save(.fromDomain(article))
                case .delete(let id):
                    try await remote.delete(id: id)
                }
            } catch {
                failedOps.append(op)
            }
        }

        queue = failedOps
        persist()
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(queue) {
            UserDefaults.standard.set(data, forKey: "pendingSyncQueue")
        }
    }
}
```

---

## Mock Repository for Testing

```swift
class MockArticleRepository: ArticleRepositoryProtocol {
    var articles: [Article] = []
    var error: Error?
    var fetchAllCallCount = 0
    var saveCallCount = 0

    func fetchAll() async throws -> [Article] {
        fetchAllCallCount += 1
        if let error { throw error }
        return articles
    }

    func fetch(id: UUID) async throws -> Article {
        if let error { throw error }
        guard let article = articles.first(where: { $0.id == id }) else {
            throw RepositoryError.notFound
        }
        return article
    }

    func save(_ article: Article) async throws {
        saveCallCount += 1
        if let error { throw error }
        if let index = articles.firstIndex(where: { $0.id == article.id }) {
            articles[index] = article
        } else {
            articles.append(article)
        }
    }

    func delete(id: UUID) async throws {
        if let error { throw error }
        articles.removeAll { $0.id == id }
    }

    func search(query: String) async throws -> [Article] {
        articles.filter { $0.title.localizedCaseInsensitiveContains(query) }
    }
}

enum RepositoryError: LocalizedError {
    case notFound
    case networkError(statusCode: Int)
    case localStorageError(Error)

    var errorDescription: String? {
        switch self {
        case .notFound: "Item not found."
        case .networkError(let code): "Network error (HTTP \(code))."
        case .localStorageError(let e): "Storage error: \(e.localizedDescription)"
        }
    }
}
```

---

## Usage in ViewModel

```swift
@Observable
class ArticleListViewModel {
    var articles: [Article] = []
    var isLoading = false

    private let repository: ArticleRepositoryProtocol

    init(repository: ArticleRepositoryProtocol) {
        self.repository = repository
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        articles = (try? await repository.fetchAll()) ?? []
    }

    func toggleFavorite(_ article: Article) async {
        var updated = article
        updated.isFavorite.toggle()
        try? await repository.save(updated)
        await load()
    }
}
```

---

## Data Source Strategy Summary

| Strategy | Use When |
|----------|----------|
| Remote-first | Data must always be fresh (financial, real-time) |
| Cache-first | Speed matters, staleness tolerable (feeds, catalogs) |
| Local-first | Offline support required (notes, tasks) |
| Write-through | Writes go to both local and remote simultaneously |
| Write-behind | Writes go to local; sync to remote in background |
