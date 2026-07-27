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
// @MainActor — isolates state and code to the main actor
@MainActor
@Observable
final class ViewModel {
    private(set) var items: [Item] = []
    private(set) var isLoading = false

    private let service: any ItemService
    init(service: any ItemService) { self.service = service }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            // service.fetch() is NOT MainActor — automatically hops off
            let fetched = try await service.fetch()
            // Back on the main actor — safe to write observed state
            items = fetched
        } catch is CancellationError {
            return
        } catch {
            // handle
        }
    }
}

// Marking individual methods
final class DataService {
    @MainActor
    func updateUI(with data: [Item]) {
        // Guaranteed to run on the main actor
    }

    func fetchInBackground() async throws -> [Item] {
        // Runs on the cooperative thread pool
        try await URLSession.shared.data(from: url).0.decoded()
    }
}

// Custom global actor
@globalActor
actor DatabaseActor {
    static let shared = DatabaseActor()
}

@DatabaseActor
final class DatabaseService {
    // All methods isolated to DatabaseActor
    func save(_ record: Record) throws { /* ... */ }
    func fetch(query: String) throws -> [Record] { /* ... */ }
}
```

---

## Isolation in SwiftUI Code

This section covers the concurrency edge cases that actually break SwiftUI apps.
Read it alongside `docs/swiftui/state-and-data-flow.md`.

### `@Observable` grants no isolation

`@Observable` is a macro that generates observation plumbing. It says nothing
about which actor owns the state. An unannotated `@Observable` class is
`nonisolated`, so any task may mutate it while SwiftUI reads it.

```swift
@Observable final class Model { var items: [Item] = [] }     // nonisolated — racy
@MainActor @Observable final class Model { … }               // correct
```

Under Swift 6 language mode the first form produces isolation errors as soon as
you touch it from an async context. Under Swift 5 mode with strict concurrency
checking set to `minimal`, it compiles silently and races at runtime.

### `@MainActor` is not "run on the main thread"

Marking a type `@MainActor` isolates *its own statements* to the main actor. Any
`async` call it makes still runs wherever that callee is isolated:

```swift
@MainActor
final class Loader {
    func run() async throws {
        // Main actor is FREE during this await — URLSession runs elsewhere.
        let (data, _) = try await URLSession.shared.data(from: url)
        // Main actor reacquired here.
        decoded = try JSONDecoder().decode([Item].self, from: data)
        //  ^ this DOES occupy the main actor. Large decodes belong off it.
    }
}
```

The mistake is assuming the annotation makes things slow (it does not — awaits
release the actor) or that it makes CPU work safe (it does not — your own
synchronous statements block the UI). Move heavy synchronous work to an `actor`
or a `nonisolated` async function.

### Escaping the main actor deliberately

| Technique | Effect | Use when |
|-----------|--------|----------|
| `nonisolated func` (sync) | Runs in the caller's context; may not touch isolated state | Pure helpers |
| `nonisolated func … async` | Runs on the cooperative pool | CPU work inside a `@MainActor` type |
| `actor` | Own serial executor | Shared mutable state |
| `@concurrent func … async` (Swift 6.2+) | Always offloads to the pool | Explicitly parallel work |
| `Task.detached` | No actor, no priority, no task-locals | Almost never in app code |

```swift
@MainActor
@Observable
final class ReportModel {
    private(set) var summary: Summary?

    // Off the main actor, but still structured and cancellable.
    nonisolated private static func compute(_ rows: [Row]) async -> Summary {
        Summary(rows: rows)
    }

    func build(_ rows: [Row]) async {
        summary = await Self.compute(rows)   // assignment back on the main actor
    }
}
```

### Isolation leaks: the four common shapes

```swift
// LEAK 1 — Task.detached drops the actor, so `self.items = …` is a cross-actor
// write. Swift 6 rejects it; Swift 5 races.
Task.detached { self.items = await load() }
Task { self.items = await load() }              // inherits @MainActor — correct

// LEAK 2 — a delegate callback arrives on an arbitrary thread.
func locationManager(_ m: CLLocationManager, didUpdateLocations l: [CLLocation]) {
    self.location = l.last                       // NOT main-actor isolated
}
// Correct: hop explicitly at the boundary you do not control.
nonisolated func locationManager(_ m: CLLocationManager, didUpdateLocations l: [CLLocation]) {
    let last = l.last
    Task { @MainActor in self.location = last }
}

// LEAK 3 — a completion handler captured inside an isolated type.
service.fetch { result in
    self.items = result                          // callback thread is unknown
}
// Correct: wrap the callback API in a continuation and await it, or hop.

// LEAK 4 — a `nonisolated` computed property that reads isolated state.
nonisolated var displayName: String { user.name }   // compile error in Swift 6
// Correct: leave it isolated, or make the backing storage `let`.
```

### `MainActor.assumeIsolated` for known-main-thread callbacks

Some framework callbacks are documented to arrive on the main thread but are not
annotated. `assumeIsolated` asserts that at runtime instead of introducing an
extra hop (which would delay the update by a turn of the run loop):

```swift
nonisolated func controllerDidChangeContent(_ controller: NSFetchedResultsController<…>) {
    MainActor.assumeIsolated {
        self.rows = controller.fetchedObjects ?? []
    }
}
```

It traps if the assumption is wrong, which is what you want — a crash in debug
beats a silent race in production. Never use it to silence a warning you have not
verified.

### `nonisolated(unsafe)` is a last resort

```swift
// Only for storage you are protecting by other means (a lock, documented
// single-threaded init, a C API contract). Always comment WHY.
nonisolated(unsafe) private var cCallbackContext: UnsafeMutableRawPointer?
```

If you are reaching for this on a view model property, the answer is `@MainActor`
instead.

### Re-entrancy: the guarantee actors do *not* give

Actor isolation is mutual exclusion **between** suspension points. Two calls to
the same async method interleave freely across `await`s.

```swift
// BROKEN — a slow first load can land after a fast second one.
func load() async {
    items = try await service.fetch()
}

// FIXED — one in-flight task; later callers await the same result.
private var inFlight: Task<[Item], Error>?

func load() async throws -> [Item] {
    if let inFlight { return try await inFlight.value }
    let task = Task { try await service.fetch() }
    inFlight = task
    defer { inFlight = nil }
    return try await task.value
}
```

Corollary: **anything captured before an `await` may be stale after it.** Indices,
counts, and `first(where:)` results must be re-resolved on the far side.

```swift
// BROKEN — index computed before the suspension.
let index = items.firstIndex(of: item)!
try await service.save(item)
items[index].isSynced = true          // array may have changed — wrong row or crash

// FIXED
try await service.save(item)
guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }
items[index].isSynced = true
```

### `.task` inherits isolation; `Task.detached` does not

```swift
struct ContentView: View {
    @State private var model = Model()      // @MainActor

    var body: some View {
        List(model.items) { … }
            // `.task` runs on the main actor (View bodies are @MainActor) and
            // is cancelled automatically when the view disappears.
            .task { await model.load() }
    }
}
```

Every method reachable from `.task` must therefore treat `CancellationError` as a
normal outcome, not a failure to display.

### Sendable across the SwiftUI boundary

Types stored on a `@MainActor` model but produced elsewhere must be `Sendable`:

```swift
struct Item: Identifiable, Sendable { … }               // value type — free
protocol ItemService: Sendable {                        // dependency crosses actors
    func fetch() async throws -> [Item]
}
final class LiveItemService: ItemService {              // must justify Sendable
    private let session: URLSession                     // Sendable
    init(session: URLSession = .shared) { self.session = session }
    func fetch() async throws -> [Item] { … }
}
```

A `final class` with only `let` properties of `Sendable` type is implicitly
`Sendable`. If yours is not, make it an `actor` rather than reaching for
`@unchecked Sendable`.

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

// 2. Mark view models @MainActor for UI safety — @Observable alone is NOT isolation
@MainActor
@Observable
final class ItemListViewModel {
    private(set) var items: [Item] = []
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

1. **Actor reentrancy**: After an `await` inside an actor, state may have changed. Always re-validate assumptions after suspension points — especially array indices.
2. **Sendable violations**: Passing non-Sendable types across actor boundaries causes compiler warnings (errors in Swift 6).
3. **Priority inversion**: A low-priority task holding actor isolation can block high-priority tasks waiting for the same actor.
4. **Over-parallelization**: Creating thousands of tasks in a TaskGroup can exhaust the cooperative thread pool. Batch work appropriately.
5. **Assuming `@Observable` implies `@MainActor`**: it does not. An unannotated observable model is nonisolated and races with SwiftUI's reads.
6. **Assuming `@MainActor` means "on the main thread throughout"**: awaits release the actor, and your own synchronous statements still block the UI.
7. **Unstructured tasks outliving their view**: `Task { }` in `onAppear` is never cancelled. Use `.task` / `.task(id:)`.
8. **Silently swallowing `CancellationError`** as a user-facing failure — or worse, catching it and showing an alert every time a screen is dismissed.

---

## Summary

| Concept | Use When |
|---|---|
| `async/await` | Any asynchronous operation |
| `Task {}` | Bridging from sync to async, unstructured work |
| `async let` | Fixed number of parallel operations |
| `TaskGroup` | Dynamic number of parallel operations |
| `actor` | Protecting mutable state from data races |
| `@MainActor` | UI updates and view model logic — required on every `@Observable` the UI renders |
| `nonisolated func … async` | CPU work inside a `@MainActor` type |
| `MainActor.assumeIsolated` | Framework callbacks documented as main-thread but unannotated |
| `nonisolated(unsafe)` | Last resort for storage protected by other means — always comment why |
| `Sendable` | Types that cross concurrency boundaries |
| `AsyncStream` | Bridging callback/delegate patterns |
| `Continuation` | Wrapping single completion handlers |
| `.task` / `.task(id:)` | View-scoped async work that must cancel on disappear |
