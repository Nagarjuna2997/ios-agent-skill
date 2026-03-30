# Repository Pattern

The Repository pattern abstracts data access behind a clean interface. The caller does not know (or care) whether data comes from a network API, a local database, or an in-memory cache. This enables offline-first behavior, testability, and easy swapping of data sources.

## Repository Protocol with Generic CRUD

```swift
import Foundation

// MARK: - Repository Protocol

protocol Repository {
    associatedtype Entity: Identifiable & Codable

    func getAll() async throws -> [Entity]
    func getById(_ id: Entity.ID) async throws -> Entity?
    func create(_ entity: Entity) async throws -> Entity
    func update(_ entity: Entity) async throws -> Entity
    func delete(_ id: Entity.ID) async throws
    func search(predicate: @Sendable (Entity) -> Bool) async throws -> [Entity]
}
```

## Domain Model

```swift
// MARK: - Domain Model

struct Article: Identifiable, Codable, Sendable {
    let id: String
    var title: String
    var body: String
    var authorId: String
    var publishedAt: Date?
    var updatedAt: Date
    var tags: [String]

    var isPublished: Bool { publishedAt != nil }
}
```

## Remote Data Source (API Client)

```swift
// MARK: - API Client

protocol APIClient: Sendable {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

struct Endpoint {
    let path: String
    let method: HTTPMethod
    let body: Data?
    let queryItems: [URLQueryItem]

    enum HTTPMethod: String {
        case GET, POST, PUT, DELETE
    }
}

final class URLSessionAPIClient: APIClient {
    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
    }

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        var urlComponents = URLComponents(
            url: baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: true
        )!
        if !endpoint.queryItems.isEmpty {
            urlComponents.queryItems = endpoint.queryItems
        }

        var request = URLRequest(url: urlComponents.url!)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = endpoint.body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw RepositoryError.invalidResponse
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            throw RepositoryError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        return try decoder.decode(T.self, from: data)
    }
}
```

## Local Data Source (SwiftData)

```swift
import SwiftData

// MARK: - SwiftData Model

@Model
final class ArticleRecord {
    @Attribute(.unique) var id: String
    var title: String
    var body: String
    var authorId: String
    var publishedAt: Date?
    var updatedAt: Date
    var tags: [String]
    var isSynced: Bool
    var locallyModifiedAt: Date?

    init(from article: Article, isSynced: Bool = true) {
        self.id = article.id
        self.title = article.title
        self.body = article.body
        self.authorId = article.authorId
        self.publishedAt = article.publishedAt
        self.updatedAt = article.updatedAt
        self.tags = article.tags
        self.isSynced = isSynced
        self.locallyModifiedAt = isSynced ? nil : Date()
    }

    func toDomain() -> Article {
        Article(
            id: id, title: title, body: body,
            authorId: authorId, publishedAt: publishedAt,
            updatedAt: updatedAt, tags: tags
        )
    }
}

// MARK: - Local Data Source

@MainActor
final class ArticleLocalDataSource {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    func fetchAll() throws -> [Article] {
        let descriptor = FetchDescriptor<ArticleRecord>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    func fetchById(_ id: String) throws -> Article? {
        let descriptor = FetchDescriptor<ArticleRecord>(
            predicate: #Predicate { $0.id == id }
        )
        return try modelContext.fetch(descriptor).first?.toDomain()
    }

    func save(_ article: Article, isSynced: Bool) throws {
        let descriptor = FetchDescriptor<ArticleRecord>(
            predicate: #Predicate { $0.id == article.id }
        )
        if let existing = try modelContext.fetch(descriptor).first {
            existing.title = article.title
            existing.body = article.body
            existing.authorId = article.authorId
            existing.publishedAt = article.publishedAt
            existing.updatedAt = article.updatedAt
            existing.tags = article.tags
            existing.isSynced = isSynced
            existing.locallyModifiedAt = isSynced ? nil : Date()
        } else {
            modelContext.insert(ArticleRecord(from: article, isSynced: isSynced))
        }
        try modelContext.save()
    }

    func delete(_ id: String) throws {
        let descriptor = FetchDescriptor<ArticleRecord>(
            predicate: #Predicate { $0.id == id }
        )
        if let record = try modelContext.fetch(descriptor).first {
            modelContext.delete(record)
            try modelContext.save()
        }
    }

    func fetchUnsynced() throws -> [Article] {
        let descriptor = FetchDescriptor<ArticleRecord>(
            predicate: #Predicate { $0.isSynced == false }
        )
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }
}
```

## In-Memory Cache

```swift
// MARK: - Cache Layer

actor MemoryCache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: CacheEntry] = [:]
    private let maxAge: TimeInterval
    private let maxCount: Int

    struct CacheEntry {
        let value: Value
        let timestamp: Date

        func isExpired(maxAge: TimeInterval) -> Bool {
            Date().timeIntervalSince(timestamp) > maxAge
        }
    }

    init(maxAge: TimeInterval = 300, maxCount: Int = 200) {
        self.maxAge = maxAge
        self.maxCount = maxCount
    }

    func get(_ key: Key) -> Value? {
        guard let entry = storage[key],
              !entry.isExpired(maxAge: maxAge) else {
            storage.removeValue(forKey: key)
            return nil
        }
        return entry.value
    }

    func set(_ key: Key, value: Value) {
        if storage.count >= maxCount {
            evictOldest()
        }
        storage[key] = CacheEntry(value: value, timestamp: Date())
    }

    func invalidate(_ key: Key) {
        storage.removeValue(forKey: key)
    }

    func invalidateAll() {
        storage.removeAll()
    }

    private func evictOldest() {
        let sorted = storage.sorted { $0.value.timestamp < $1.value.timestamp }
        let removeCount = max(storage.count / 4, 1)
        for (key, _) in sorted.prefix(removeCount) {
            storage.removeValue(forKey: key)
        }
    }
}
```

## Sync Queue for Offline-First

```swift
// MARK: - Sync Queue

actor SyncQueue {
    private var pendingOperations: [SyncOperation] = []

    enum SyncOperation: Codable {
        case create(Article)
        case update(Article)
        case delete(id: String)

        var articleId: String {
            switch self {
            case .create(let a), .update(let a): return a.id
            case .delete(let id): return id
            }
        }
    }

    func enqueue(_ operation: SyncOperation) {
        // Coalesce: if we already have an op for this id, replace it
        pendingOperations.removeAll { $0.articleId == operation.articleId }
        pendingOperations.append(operation)
    }

    func dequeueAll() -> [SyncOperation] {
        let ops = pendingOperations
        pendingOperations.removeAll()
        return ops
    }

    var hasPendingWork: Bool {
        !pendingOperations.isEmpty
    }
}
```

## Complete Repository Implementation

```swift
// MARK: - Article Repository

@MainActor
final class ArticleRepository: Repository {
    typealias Entity = Article

    private let apiClient: APIClient
    private let localDataSource: ArticleLocalDataSource
    private let cache: MemoryCache<String, Article>
    private let listCache: MemoryCache<String, [Article]>
    private let syncQueue: SyncQueue
    private let connectivity: ConnectivityMonitor

    init(
        apiClient: APIClient,
        localDataSource: ArticleLocalDataSource,
        connectivity: ConnectivityMonitor
    ) {
        self.apiClient = apiClient
        self.localDataSource = localDataSource
        self.cache = MemoryCache(maxAge: 300, maxCount: 500)
        self.listCache = MemoryCache(maxAge: 120, maxCount: 50)
        self.syncQueue = SyncQueue()
        self.connectivity = connectivity
    }

    // MARK: - Read Operations (cache -> local -> remote)

    func getAll() async throws -> [Article] {
        // 1. Check memory cache
        if let cached = await listCache.get("all") {
            return cached
        }

        // 2. Return local data immediately (fast)
        let localArticles = try localDataSource.fetchAll()

        // 3. Refresh from network in the background if online
        if connectivity.isConnected {
            do {
                let remote: [Article] = try await apiClient.request(
                    Endpoint(path: "/articles", method: .GET, body: nil, queryItems: [])
                )
                // Persist remote data locally
                for article in remote {
                    try localDataSource.save(article, isSynced: true)
                }
                await listCache.set("all", value: remote)
                return remote
            } catch {
                // Network failed; fall through to local data
            }
        }

        await listCache.set("all", value: localArticles)
        return localArticles
    }

    func getById(_ id: String) async throws -> Article? {
        // 1. Memory cache
        if let cached = await cache.get(id) {
            return cached
        }

        // 2. Local database
        if let local = try localDataSource.fetchById(id) {
            await cache.set(id, value: local)

            // 3. Refresh from remote if connected
            if connectivity.isConnected {
                if let remote: Article = try? await apiClient.request(
                    Endpoint(path: "/articles/\(id)", method: .GET, body: nil, queryItems: [])
                ) {
                    try localDataSource.save(remote, isSynced: true)
                    await cache.set(id, value: remote)
                    return remote
                }
            }
            return local
        }

        // 4. Not in local DB -- fetch from network
        guard connectivity.isConnected else {
            throw RepositoryError.offline
        }
        let remote: Article = try await apiClient.request(
            Endpoint(path: "/articles/\(id)", method: .GET, body: nil, queryItems: [])
        )
        try localDataSource.save(remote, isSynced: true)
        await cache.set(id, value: remote)
        return remote
    }

    // MARK: - Write Operations (local-first, enqueue sync)

    func create(_ entity: Article) async throws -> Article {
        // Save locally immediately
        try localDataSource.save(entity, isSynced: false)
        await cache.set(entity.id, value: entity)
        await listCache.invalidateAll()

        if connectivity.isConnected {
            do {
                let encoder = JSONEncoder()
                encoder.dateEncodingStrategy = .iso8601
                let body = try encoder.encode(entity)
                let remote: Article = try await apiClient.request(
                    Endpoint(path: "/articles", method: .POST, body: body, queryItems: [])
                )
                try localDataSource.save(remote, isSynced: true)
                await cache.set(remote.id, value: remote)
                return remote
            } catch {
                await syncQueue.enqueue(.create(entity))
                return entity
            }
        } else {
            await syncQueue.enqueue(.create(entity))
            return entity
        }
    }

    func update(_ entity: Article) async throws -> Article {
        try localDataSource.save(entity, isSynced: false)
        await cache.set(entity.id, value: entity)
        await listCache.invalidateAll()

        if connectivity.isConnected {
            do {
                let encoder = JSONEncoder()
                encoder.dateEncodingStrategy = .iso8601
                let body = try encoder.encode(entity)
                let remote: Article = try await apiClient.request(
                    Endpoint(path: "/articles/\(entity.id)", method: .PUT, body: body, queryItems: [])
                )
                try localDataSource.save(remote, isSynced: true)
                await cache.set(remote.id, value: remote)
                return remote
            } catch {
                await syncQueue.enqueue(.update(entity))
                return entity
            }
        } else {
            await syncQueue.enqueue(.update(entity))
            return entity
        }
    }

    func delete(_ id: String) async throws {
        try localDataSource.delete(id)
        await cache.invalidate(id)
        await listCache.invalidateAll()

        if connectivity.isConnected {
            do {
                let _: EmptyResponse = try await apiClient.request(
                    Endpoint(path: "/articles/\(id)", method: .DELETE, body: nil, queryItems: [])
                )
            } catch {
                await syncQueue.enqueue(.delete(id: id))
            }
        } else {
            await syncQueue.enqueue(.delete(id: id))
        }
    }

    func search(predicate: @Sendable (Article) -> Bool) async throws -> [Article] {
        let all = try await getAll()
        return all.filter(predicate)
    }

    // MARK: - Sync

    func syncPendingChanges() async throws {
        guard connectivity.isConnected else { return }

        let operations = await syncQueue.dequeueAll()
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601

        for operation in operations {
            do {
                switch operation {
                case .create(let article):
                    let body = try encoder.encode(article)
                    let _: Article = try await apiClient.request(
                        Endpoint(path: "/articles", method: .POST, body: body, queryItems: [])
                    )
                    try localDataSource.save(article, isSynced: true)

                case .update(let article):
                    let body = try encoder.encode(article)
                    let _: Article = try await apiClient.request(
                        Endpoint(path: "/articles/\(article.id)", method: .PUT, body: body, queryItems: [])
                    )
                    try localDataSource.save(article, isSynced: true)

                case .delete(let id):
                    let _: EmptyResponse = try await apiClient.request(
                        Endpoint(path: "/articles/\(id)", method: .DELETE, body: nil, queryItems: [])
                    )
                }
            } catch {
                // Re-enqueue failed operations
                await syncQueue.enqueue(operation)
            }
        }
    }
}

struct EmptyResponse: Decodable {}
```

## Error Types

```swift
// MARK: - Repository Errors

enum RepositoryError: LocalizedError {
    case notFound
    case offline
    case invalidResponse
    case httpError(statusCode: Int, data: Data)
    case syncFailed(underlyingErrors: [Error])

    var errorDescription: String? {
        switch self {
        case .notFound: "The requested item was not found."
        case .offline: "You are offline. Please check your connection."
        case .invalidResponse: "Received an unexpected response from the server."
        case .httpError(let code, _): "Server error (HTTP \(code))."
        case .syncFailed: "Some changes could not be synced."
        }
    }
}
```

## Connectivity Monitor

```swift
import Network

// MARK: - Connectivity Monitor

@Observable
final class ConnectivityMonitor: Sendable {
    private(set) var isConnected: Bool = true
    private let monitor = NWPathMonitor()

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = (path.status == .satisfied)
            }
        }
        monitor.start(queue: DispatchQueue(label: "connectivity"))
    }

    deinit {
        monitor.cancel()
    }
}
```

## Usage in a ViewModel

```swift
@MainActor
@Observable
final class ArticleListViewModel {
    private(set) var articles: [Article] = []
    private(set) var isLoading = false
    private(set) var error: RepositoryError?

    private let repository: ArticleRepository

    init(repository: ArticleRepository) {
        self.repository = repository
    }

    func loadArticles() async {
        isLoading = true
        defer { isLoading = false }

        do {
            articles = try await repository.getAll()
            error = nil
        } catch let err as RepositoryError {
            error = err
        } catch {
            self.error = .invalidResponse
        }
    }

    func deleteArticle(_ article: Article) async {
        do {
            try await repository.delete(article.id)
            articles.removeAll { $0.id == article.id }
        } catch {
            // Handle error
        }
    }
}
```

## Guidelines

- Always return local data first, then refresh from the network. The user sees content instantly.
- Write operations save locally before attempting the network call. If the network fails, enqueue for later sync.
- Use the memory cache for reads within a session to avoid repeated database queries.
- Coalesce sync operations: if an entity is updated three times offline, only the latest state needs to be pushed.
- Keep the repository protocol generic so you can write one concrete implementation per domain entity and still mock easily in tests.
