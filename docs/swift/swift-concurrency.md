# Swift Concurrency Reference

Complete reference for Swift's structured concurrency system including async/await, actors, tasks, and migration patterns.

---

## async/await Basics

The `async` keyword marks a function that can suspend, and `await` marks each suspension point.

```swift
// Declaring async functions
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw APIError.invalidResponse
    }

    return try JSONDecoder().decode(User.self, from: data)
}

// Calling async functions
func loadProfile() async {
    do {
        let user = try await fetchUser(id: "123")
        let posts = try await fetchPosts(for: user)
        await MainActor.run {
            self.user = user
            self.posts = posts
        }
    } catch {
        print("Failed: \(error)")
    }
}
```

### Async Properties and Subscripts

```swift
struct RemoteImage {
    let url: URL

    // Async computed property — read-only
    var data: Data {
        get async throws {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        }
    }
}

// Async sequence iteration
let image = RemoteImage(url: someURL)
let bytes = try await image.data
```

### Async Closures

```swift
// Async closure as parameter
func withRetry<T>(
    maxAttempts: Int = 3,
    operation: () async throws -> T
) async throws -> T {
    var lastError: Error?
    for attempt in 1...maxAttempts {
        do {
            return try await operation()
        } catch {
            lastError = error
            if attempt < maxAttempts {
                try await Task.sleep(for: .seconds(Double(attempt)))
            }
        }
    }
    throw lastError!
}

// Usage
let user = try await withRetry {
    try await fetchUser(id: "123")
}
```

---

## Task and TaskGroup

### Unstructured Tasks

Unstructured tasks run independently. Use `Task` to bridge from synchronous to asynchronous code.

```swift
// Task — inherits actor context and priority
func onAppear() {
    Task {
        // Inherits MainActor context if called from @MainActor
        let data = try await fetchData()
        self.items = data  // Safe to update UI
    }
}

// Task.detached — does NOT inherit actor context
Task.detached(priority: .background) {
    let report = await generateReport()
    // NOT on MainActor — must explicitly hop
    await MainActor.run {
        self.report = report
    }
}

// Storing task references for cancellation
class ViewModel {
    private var loadTask: Task<Void, Never>?

    func load() {
        loadTask?.cancel()  // Cancel previous load
        loadTask = Task {
            guard !Task.isCancelled else { return }
            let items = try? await fetchItems()
            guard !Task.isCancelled else { return }
            self.items = items ?? []
        }
    }

    func cancelLoad() {
        loadTask?.cancel()
    }
}
```

### Structured Concurrency with TaskGroup

TaskGroup creates a scope where child tasks must complete before the group returns.

```swift
func fetchAllUserData(userIDs: [String]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in userIDs {
            group.addTask {
                try await fetchUser(id: id)
            }
        }

        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}

// TaskGroup with different result types using an enum
enum FetchResult {
    case user(User)
    case posts([Post])
    case settings(Settings)
}

func loadDashboard() async throws -> Dashboard {
    try await withThrowingTaskGroup(of: FetchResult.self) { group in
        group.addTask { .user(try await fetchUser()) }
        group.addTask { .posts(try await fetchPosts()) }
        group.addTask { .settings(try await fetchSettings()) }

        var user: User?
        var posts: [Post] = []
        var settings: Settings?

        for try await result in group {
            switch result {
            case .user(let u): user = u
            case .posts(let p): posts = p
            case .settings(let s): settings = s
            }
        }

        return Dashboard(user: user!, posts: posts, settings: settings!)
    }
}
```

### Discarding TaskGroup (Swift 5.9+)

When you don't need to collect results from child tasks:

```swift
// DiscardingTaskGroup — results are discarded, errors propagate automatically
try await withThrowingDiscardingTaskGroup { group in
    for connection in connections {
        group.addTask {
            try await handleConnection(connection)
        }
    }
    // If any child throws, the group cancels all other children and rethrows
}
```

---

## async let for Parallel Execution

`async let` starts concurrent work immediately. The result is awaited later.

```swift
func loadScreen() async throws -> ScreenData {
    // All three start concurrently
    async let user = fetchUser()
    async let recommendations = fetchRecommendations()
    async let notifications = fetchNotifications()

    // Await all results — suspends until all complete
    let data = try await ScreenData(
        user: user,
        recommendations: recommendations,
        notifications: notifications
    )
    return data
}

// async let with partial results — if one fails, others are cancelled
func loadWithFallback() async {
    async let primary = fetchPrimaryContent()
    async let secondary = fetchSecondaryContent()

    // Can handle errors independently
    let mainContent = try? await primary
    let sideContent = try? await secondary

    await updateUI(main: mainContent, side: sideContent)
}
```

### async let vs TaskGroup

| Feature | `async let` | `TaskGroup` |
|---|---|---|
| Number of tasks | Fixed at compile time | Dynamic at runtime |
| Return types | Each can have different types | All must share one type |
| Syntax | Lightweight, local variables | Closure-based API |
| Use when | Known, small set of parallel ops | Variable number of tasks |

---

## Actors

### Actor Isolation

Actors serialize access to their mutable state, preventing data races.

```swift
actor ImageCache {
    private var cache: [URL: Data] = [:]
    private var inFlightRequests: [URL: Task<Data, Error>] = [:]

    func image(for url: URL) async throws -> Data {
        // Check cache — no await needed, we are inside the actor
        if let cached = cache[url] {
            return cached
        }

        // Deduplicate in-flight requests
        if let existing = inFlightRequests[url] {
            return try await existing.value
        }

        let task = Task {
            let (data, _) = try await URLSession.shared.data(from: url)
            cache[url] = data
            inFlightRequests[url] = nil
            return data
        }

        inFlightRequests[url] = task
        return try await task.value
    }

    func clearCache() {
        cache.removeAll()
    }

    // nonisolated — safe because it only accesses immutable state or no state
    nonisolated func cacheKey(for url: URL) -> String {
        url.absoluteString
    }
}
```

### nonisolated Keyword

```swift
actor UserSession {
    let userId: String        // let properties are implicitly nonisolated
    var token: String?

    init(userId: String) {
        self.userId = userId
    }

    // Explicitly nonisolated — can be called synchronously
    nonisolated func makeAuthHeader() -> String? {
        // Cannot access `token` here — it is isolated
        // CAN access `userId` — it is a let constant
        return "Bearer user=\(userId)"
    }
}

// Nonisolated conformance
actor SettingsStore: CustomStringConvertible {
    var theme: Theme = .system

    // Protocol requirement fulfilled with nonisolated
    nonisolated var description: String {
        "SettingsStore"
    }
}
```

### GlobalActor and @MainActor

```swift
// @MainActor — ensures code runs on the main thread
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var isLoading = false

    func load() async {
        isLoading = true
        do {
            // URLSession.data is NOT MainActor — automatically hops off
            let items = try await fetchItems()
            // Back on MainActor — safe to update @Published
            self.items = items
        } catch {
            print(error)
        }
        isLoading = false
    }
}

// Marking individual methods
class DataService {
    @MainActor
    func updateUI(with data: [Item]) {
        // Guaranteed to run on main thread
    }

    func fetchInBackground() async throws -> [Item] {
        // Runs on cooperative thread pool
        try await URLSession.shared.data(from: url).0.decoded()
    }
}

// Custom global actor
@globalActor
actor DatabaseActor {
    static let shared = DatabaseActor()
}

@DatabaseActor
class DatabaseService {
    // All methods isolated to DatabaseActor
    func save(_ record: Record) throws { /* ... */ }
    func fetch(query: String) throws -> [Record] { /* ... */ }
}
```

---

## Sendable Protocol

`Sendable` marks types that are safe to transfer across concurrency domains.

```swift
// Value types with Sendable fields are implicitly Sendable
struct UserDTO: Sendable {
    let id: String
    let name: String
    let email: String
}

// Classes must be final and have only immutable stored properties
final class Configuration: Sendable {
    let apiKey: String
    let baseURL: URL

    init(apiKey: String, baseURL: URL) {
        self.apiKey = apiKey
        self.baseURL = baseURL
    }
}

// @unchecked Sendable — when you manage thread safety manually
final class AtomicCounter: @unchecked Sendable {
    private let lock = NSLock()
    private var _value = 0

    var value: Int {
        lock.withLock { _value }
    }

    func increment() {
        lock.withLock { _value += 1 }
    }
}

// @Sendable closures
func performAsync(_ work: @Sendable @escaping () async -> Void) {
    Task {
        await work()
    }
}

// Common Sendable conformances
// - All value types with Sendable properties
// - Actors (always Sendable)
// - Enums with Sendable associated values
// - Tuples of Sendable types
```

---

## AsyncSequence and AsyncStream

### AsyncSequence

```swift
// Conforming to AsyncSequence
struct Counter: AsyncSequence {
    typealias Element = Int
    let limit: Int

    struct AsyncIterator: AsyncIteratorProtocol {
        var current = 0
        let limit: Int

        mutating func next() async -> Int? {
            guard current < limit else { return nil }
            current += 1
            try? await Task.sleep(for: .seconds(1))
            return current
        }
    }

    func makeAsyncIterator() -> AsyncIterator {
        AsyncIterator(limit: limit)
    }
}

// Using async sequences
for await count in Counter(limit: 5) {
    print(count) // 1, 2, 3, 4, 5 — one per second
}

// Built-in async sequences
let bytes = url.resourceBytes            // AsyncSequence of bytes
let lines = url.lines                     // AsyncSequence of String
let notifications = NotificationCenter.default
    .notifications(named: .userDidLogin)  // AsyncSequence of Notification
```

### AsyncStream

AsyncStream bridges callback-based APIs to async sequences.

```swift
// AsyncStream from callbacks
func locationUpdates() -> AsyncStream<CLLocation> {
    AsyncStream { continuation in
        let delegate = LocationDelegate { location in
            continuation.yield(location)
        }

        continuation.onTermination = { _ in
            delegate.stopUpdating()
        }

        delegate.startUpdating()
    }
}

// Usage
for await location in locationUpdates() {
    print("Lat: \(location.coordinate.latitude)")
}

// AsyncThrowingStream for error cases
func stockPrices(symbol: String) -> AsyncThrowingStream<Double, Error> {
    AsyncThrowingStream { continuation in
        let socket = WebSocket(url: priceURL(for: symbol))

        socket.onMessage = { message in
            if let price = Double(message) {
                continuation.yield(price)
            }
        }

        socket.onError = { error in
            continuation.finish(throwing: error)
        }

        socket.onClose = {
            continuation.finish()
        }

        socket.connect()

        continuation.onTermination = { _ in
            socket.disconnect()
        }
    }
}

// Transforming async sequences
let highPrices = stockPrices(symbol: "AAPL")
    .filter { $0 > 150.0 }
    .map { "AAPL: $\($0)" }
    .prefix(10) // Take first 10

for try await message in highPrices {
    print(message)
}
```

---

## Continuations

Continuations bridge completion-handler and delegate-based APIs to async/await.

```swift
// withCheckedContinuation — for non-throwing callbacks
func currentLocation() async -> CLLocation {
    await withCheckedContinuation { continuation in
        locationManager.requestLocation { location in
            continuation.resume(returning: location)
            // WARNING: Must resume exactly once. Checked variant crashes on misuse.
        }
    }
}

// withCheckedThrowingContinuation — for callbacks with errors
func loadImage(named name: String) async throws -> UIImage {
    try await withCheckedThrowingContinuation { continuation in
        ImageLoader.shared.load(name: name) { result in
            switch result {
            case .success(let image):
                continuation.resume(returning: image)
            case .failure(let error):
                continuation.resume(throwing: error)
            }
        }
    }
}

// withUnsafeContinuation — no runtime checks, use only for performance-critical code
func fastLookup(key: String) async -> Data? {
    await withUnsafeContinuation { continuation in
        cache.asyncGet(key: key) { data in
            continuation.resume(returning: data)
        }
    }
}

// Continuation with cancellation handling
func downloadFile(url: URL) async throws -> Data {
    try await withTaskCancellationHandler {
        try await withCheckedThrowingContinuation { continuation in
            let task = URLSession.shared.dataTask(with: url) { data, _, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let data {
                    continuation.resume(returning: data)
                }
            }
            task.resume()
        }
    } onCancel: {
        // Called if the task is cancelled
        // Note: this runs concurrently with the continuation
    }
}
```

---

## Task Cancellation

Swift uses cooperative cancellation. Tasks must check for cancellation and stop voluntarily.

```swift
func processLargeDataset(_ items: [Item]) async throws -> [Result] {
    var results: [Result] = []

    for item in items {
        // Check cancellation — throws CancellationError if cancelled
        try Task.checkCancellation()

        // Or check the flag manually
        if Task.isCancelled {
            // Clean up and return partial results
            return results
        }

        let result = await process(item)
        results.append(result)
    }

    return results
}

// withTaskCancellationHandler — respond to cancellation immediately
func streamData(url: URL) async throws -> Data {
    let session = URLSession.shared
    var urlTask: URLSessionDataTask?

    return try await withTaskCancellationHandler {
        try await withCheckedThrowingContinuation { continuation in
            urlTask = session.dataTask(with: url) { data, _, error in
                if let error { continuation.resume(throwing: error) }
                else if let data { continuation.resume(returning: data) }
            }
            urlTask?.resume()
        }
    } onCancel: {
        urlTask?.cancel()
    }
}

// Cancellation in TaskGroup — cancelling one child cancels all
try await withThrowingTaskGroup(of: Data.self) { group in
    group.addTask { try await download(url1) }
    group.addTask { try await download(url2) }

    // cancelAll() cancels remaining children
    group.cancelAll()
}
```

---

## Task-Local Values

Task-local values propagate context down the task hierarchy without parameter passing.

```swift
enum RequestContext {
    @TaskLocal static var requestID: String = "none"
    @TaskLocal static var userID: String?
    @TaskLocal static var logger: Logger = Logger(label: "default")
}

func handleRequest(id: String) async {
    await RequestContext.$requestID.withValue(id) {
        await RequestContext.$userID.withValue("user-123") {
            // All code in this scope (and child tasks) sees these values
            await processRequest()
        }
    }
}

func processRequest() async {
    // Access task-local values anywhere in the call chain
    let requestID = RequestContext.requestID
    let logger = RequestContext.logger
    logger.info("Processing request \(requestID)")

    // Child tasks inherit task-local values
    async let result = computeResult() // Sees same requestID
    await handleResult(result)
}
```

---

## Migration from GCD to async/await

### Before: Grand Central Dispatch

```swift
// Old pattern — callback hell, no structured error propagation
func loadUserProfile(completion: @escaping (Result<Profile, Error>) -> Void) {
    DispatchQueue.global().async {
        fetchUser { userResult in
            switch userResult {
            case .success(let user):
                fetchAvatar(for: user) { avatarResult in
                    switch avatarResult {
                    case .success(let avatar):
                        let profile = Profile(user: user, avatar: avatar)
                        DispatchQueue.main.async {
                            completion(.success(profile))
                        }
                    case .failure(let error):
                        DispatchQueue.main.async {
                            completion(.failure(error))
                        }
                    }
                }
            case .failure(let error):
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }
}
```

### After: async/await

```swift
// Clean, linear, and structured
func loadUserProfile() async throws -> Profile {
    let user = try await fetchUser()
    let avatar = try await fetchAvatar(for: user)
    return Profile(user: user, avatar: avatar)
}

// With parallel execution
func loadUserProfile() async throws -> Profile {
    let user = try await fetchUser()
    async let avatar = fetchAvatar(for: user)
    async let settings = fetchSettings(for: user)
    return try await Profile(user: user, avatar: avatar, settings: settings)
}
```

### Bridging Existing Callback APIs

```swift
// Wrap completion handlers with continuations
extension CLGeocoder {
    func reverseGeocode(location: CLLocation) async throws -> [CLPlacemark] {
        try await withCheckedThrowingContinuation { continuation in
            reverseGeocodeLocation(location) { placemarks, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: placemarks ?? [])
                }
            }
        }
    }
}

// Wrap delegate patterns with AsyncStream
extension CLLocationManager {
    var locationStream: AsyncStream<CLLocation> {
        AsyncStream { continuation in
            let delegate = AsyncLocationDelegate(continuation: continuation)
            self.delegate = delegate
            self.startUpdatingLocation()

            continuation.onTermination = { [weak self] _ in
                self?.stopUpdatingLocation()
            }
        }
    }
}
```

---

## Concurrency Best Practices

### Do

```swift
// 1. Use structured concurrency whenever possible
func loadData() async throws -> [Item] {
    try await withThrowingTaskGroup(of: Item.self) { group in
        // Children are automatically cancelled if the group scope exits
    }
}

// 2. Mark view models @MainActor for UI safety
@MainActor
class ItemListViewModel: ObservableObject {
    @Published var items: [Item] = []
}

// 3. Use async let for a fixed number of parallel tasks
async let a = fetchA()
async let b = fetchB()
let result = try await (a, b)

// 4. Use Task {} at the boundary between sync and async
Button("Load") {
    Task { await viewModel.load() }
}
```

### Do Not

```swift
// 1. DON'T use Task.detached unless you specifically need to escape actor context
// Bad — loses MainActor context unnecessarily
Task.detached { await self.updateUI() }
// Good
Task { await self.updateUI() }

// 2. DON'T block threads with semaphores or busy waits in async code
// Bad — can deadlock
let semaphore = DispatchSemaphore(value: 0)
Task { semaphore.signal() }
semaphore.wait() // DEADLOCK — blocks the cooperative thread

// 3. DON'T resume a continuation more than once
// Bad — crashes at runtime with checked, undefined with unsafe
continuation.resume(returning: value)
continuation.resume(returning: otherValue) // CRASH

// 4. DON'T ignore cancellation in long-running work
// Bad — wastes resources
for item in hugeArray {
    process(item) // Never checks Task.isCancelled
}
// Good
for item in hugeArray {
    try Task.checkCancellation()
    process(item)
}
```

### Common Pitfalls

1. **Actor reentrancy**: After an `await` inside an actor, state may have changed. Always re-validate assumptions after suspension points.
2. **Sendable violations**: Passing non-Sendable types across actor boundaries causes compiler warnings (errors in Swift 6).
3. **Priority inversion**: A low-priority task holding actor isolation can block high-priority tasks waiting for the same actor.
4. **Over-parallelization**: Creating thousands of tasks in a TaskGroup can exhaust the cooperative thread pool. Batch work appropriately.

---

## Summary

| Concept | Use When |
|---|---|
| `async/await` | Any asynchronous operation |
| `Task {}` | Bridging from sync to async, unstructured work |
| `async let` | Fixed number of parallel operations |
| `TaskGroup` | Dynamic number of parallel operations |
| `actor` | Protecting mutable state from data races |
| `@MainActor` | UI updates and view model logic |
| `Sendable` | Types that cross concurrency boundaries |
| `AsyncStream` | Bridging callback/delegate patterns |
| `Continuation` | Wrapping single completion handlers |
