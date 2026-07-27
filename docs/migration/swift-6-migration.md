# Migrating to Swift 6 and 6.4

**Load this when:** enabling Swift 6 language mode, working through strict
concurrency errors, or upgrading a codebase already on Swift 6 to 6.4.

This guide is organized around **the errors you will actually see** and what
each one means. Concepts are in `../swift/swift-concurrency.md`; this is the
migration path.

---

## Part 1 — Swift 5.9 → Swift 6

### Do it incrementally, per target

Flipping the whole project to Swift 6 mode produces hundreds of errors at once
and no way to prioritize them. Ratchet instead:

```
1. Swift 5 mode + strict concurrency: minimal      ← start
2. Swift 5 mode + strict concurrency: targeted
3. Swift 5 mode + strict concurrency: complete     ← warnings only, fix them all
4. Swift 6 language mode                            ← the same issues become errors
```

```swift
// Package.swift — per target, so you can migrate one at a time.
.target(
    name: "Core",
    swiftSettings: [.enableUpcomingFeature("StrictConcurrency")]
)

// Fully migrated targets move to Swift 6 mode:
.target(name: "Core", swiftSettings: [.swiftLanguageMode(.v6)])
```

In Xcode the same knobs are `SWIFT_STRICT_CONCURRENCY` (`minimal` /
`targeted` / `complete`) and `SWIFT_VERSION`. Set them per target, not per
project.

**Migrate leaf targets first.** A model or networking target with few
dependencies is a contained problem. The app target depends on everything and
will surface every unfixed issue at once.

### Error: "Main actor-isolated property cannot be referenced from a nonisolated context"

The most common one. Something touching UI state is not isolated.

```swift
// ERROR
@Observable
final class FeedViewModel {
    var posts: [Post] = []
    func load() async {
        posts = await api.fetch()      // ← nonisolated write to UI state
    }
}

// FIX — isolate the type. Not the individual members.
@MainActor
@Observable
final class FeedViewModel {
    private(set) var posts: [Post] = []
    func load() async {
        posts = await api.fetch()      // resumes on the main actor
    }
}
```

Per-member `@MainActor` leaves gaps. Annotate the type.

### Error: "Type 'X' does not conform to the 'Sendable' protocol"

A value crossed an isolation boundary and the compiler cannot prove it is safe.

```swift
// ERROR — passed from a @MainActor context into an actor.
final class UserSession {
    var token: String?
}

// FIX 1 — a value type is Sendable for free.
struct UserSession: Sendable {
    var token: String?
}

// FIX 2 — immutable final class is implicitly Sendable.
final class UserSession: Sendable {
    let token: String?
}

// FIX 3 — mutable shared state belongs in an actor.
actor UserSession {
    private(set) var token: String?
    func update(_ token: String) { self.token = token }
}

// LAST RESORT — only with a real mechanism and a comment.
final class LegacyCache: @unchecked Sendable {
    private let lock = NSLock()      // ← the mechanism. Say what it protects.
    private var storage: [String: Data] = [:]
}
```

`@unchecked Sendable` with no lock and no comment is a lie to the compiler that
will eventually be a crash.

### Error: "Capture of 'self' with non-Sendable type in a `@Sendable` closure"

```swift
// ERROR
Task.detached {
    self.items = await load()
}

// FIX — Task {} inherits the enclosing actor. Task.detached does not.
Task {
    items = await load()
}
```

`Task.detached` inside an isolated type is almost always wrong. See
`../swift/swift-concurrency.md` §"Isolation in SwiftUI Code".

### Error: "Static property 'shared' is not concurrency-safe"

```swift
// ERROR
final class Analytics {
    static let shared = Analytics()   // mutable global state
    var userID: String?
}

// FIX 1 — isolate the singleton.
@MainActor
final class Analytics {
    static let shared = Analytics()
    var userID: String?
}

// FIX 2 — an actor, if it is touched from many contexts.
actor Analytics {
    static let shared = Analytics()
    private(set) var userID: String?
}

// FIX 3 — better: stop using a singleton. Inject it.
// See ../../patterns/clean-architecture.md
```

### Error: "Passing argument of non-Sendable type across actor boundary"

Common with Core Data and SwiftData. **Managed objects are not Sendable and
never will be.**

```swift
// ERROR
let trip = try context.fetch(descriptor).first!
await importer.process(trip)

// FIX — pass the identifier; re-fetch on the far side.
await importer.process(trip.persistentModelID)
```

Full treatment: `../frameworks/data-concurrency.md`.

### Delegate callbacks

Framework delegates arrive on unspecified threads and are not isolated.

```swift
// ERROR — the callback is nonisolated, the property is main-actor.
func locationManager(_ m: CLLocationManager, didUpdateLocations l: [CLLocation]) {
    location = l.last
}

// FIX — mark it nonisolated and hop explicitly.
nonisolated func locationManager(_ m: CLLocationManager, didUpdateLocations l: [CLLocation]) {
    let last = l.last
    Task { @MainActor in self.location = last }
}

// FIX — when the callback is documented as main-thread, assert instead of hopping.
nonisolated func controllerDidChangeContent(_ c: NSFetchedResultsController<…>) {
    MainActor.assumeIsolated { self.rows = c.fetchedObjects ?? [] }
}
```

`assumeIsolated` traps if the assumption is wrong, which is what you want — a
debug crash beats a production race. Never use it to silence a warning you have
not verified.

### Migration order

Fighting these in the wrong order creates rework:

```
1. Make models Sendable (value types, or immutable final classes)
2. Annotate view models @MainActor
3. Convert shared mutable state to actors
4. Fix delegate and completion-handler boundaries
5. Remove Task.detached
6. Eliminate @unchecked Sendable
7. Flip the target to Swift 6 mode
```

Step 1 first: Sendable models remove a large fraction of the downstream errors
for free.

### What not to do

```swift
// Silencing rather than fixing:
@unchecked Sendable                      // with no synchronization
nonisolated(unsafe) var cache: [String: Data] = [:]
@preconcurrency import SomeModule        // as a permanent answer

// Each hides a real race. @preconcurrency is a temporary bridge for a
// dependency you do not control — track it and remove it.
```

---

## Part 2 — Swift 6 → Swift 6.4

Small and mostly ergonomic. Nothing here is a breaking change; the new
diagnostics may surface latent bugs.

### `weak let` removes an `@unchecked Sendable`

```swift
// BEFORE — a weak var forced the escape hatch.
final class Coordinator: @unchecked Sendable {
    weak var delegate: (any FlowDelegate)?
}

// AFTER — immutable weak reference; genuinely Sendable.
final class Coordinator: Sendable {
    weak let delegate: (any FlowDelegate)?
    init(delegate: any FlowDelegate) { self.delegate = delegate }
}
```

Worth grepping for: `grep -rn "@unchecked Sendable" --include='*.swift' .` and
checking which are only there because of a `weak var`.

### `~Sendable` states a constraint explicitly

```swift
// Enforced by the compiler instead of asserted in a comment.
struct RenderContext: ~Sendable {
    let cgContext: CGContext
}
```

### New warning: unhandled task errors

```swift
// NOW WARNS — the error is silently discarded.
Task { try await sync.run() }

// FIX — handle it…
Task {
    do { try await sync.run() }
    catch { Logger.sync.error("sync failed: \(error)") }
}

// …or keep the task and check later.
let task = Task { try await sync.run() }
do { try await task.value } catch { … }
```

**Do not silence this with `try?`.** It is finding real bugs — work that fails
with no log and no user-visible effect. This is the same rule as *every `catch`
produces a user-visible outcome or a documented no-op*.

### `async` in `defer`

```swift
func process() async throws {
    let handle = try await pool.acquire()
    defer { await pool.release(handle) }     // previously illegal
    try await work(using: handle)
}
```

Removes the duplicated cleanup on every exit path.

### `@diagnose` for per-declaration control

```swift
// Promote to error in migrated code.
@diagnose(error, "StrictConcurrency")
final class PaymentProcessor { … }

// Suppress narrowly, with a reason and a ticket.
// TODO(#412): remove once LegacyBridge is actor-isolated.
@diagnose(ignore, "StrictConcurrency")
func legacyBridge() { … }
```

Use it to ratchet strictness **upward**, file by file. Using it to blanket-silence
concurrency diagnostics across a module leaves the codebase unsafe while
appearing to build cleanly.

---

## Verification

A migration is done when this is true, and you have the output to prove it:

```bash
swift build -Xswiftc -strict-concurrency=complete 2>&1 | tail -40
swift test 2>&1 | tail -40

# These should return nothing.
grep -rn "@unchecked Sendable" --include='*.swift' Sources/
grep -rn "Task.detached" --include='*.swift' Sources/
grep -rn "DispatchQueue.main.async" --include='*.swift' Sources/
grep -rn "@diagnose(ignore" --include='*.swift' Sources/
```

Show the empty greps. An unshown check is indistinguishable from one you never
ran — see `../orchestration/verification.md`.

---

## Checklist

- [ ] Migrated per target, leaf targets first.
- [ ] Models are `Sendable` value types or immutable final classes.
- [ ] Every `@Observable` the UI renders is `@MainActor final class`.
- [ ] Shared mutable state lives in actors.
- [ ] No `Task.detached` used to escape isolation.
- [ ] Delegate callbacks hop explicitly or use a verified `assumeIsolated`.
- [ ] No `@unchecked Sendable` without a real mechanism and a comment.
- [ ] No `@preconcurrency import` without a tracking issue.
- [ ] Unhandled task errors handled, not silenced with `try?`.
- [ ] Target builds clean under `complete` before flipping to Swift 6 mode.
- [ ] Tests pass, and the output is pasted.
