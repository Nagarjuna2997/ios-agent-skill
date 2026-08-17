# Swift Brain

## Context

Load this first when the user asks for Swift from scratch, Swift language memory, Apple Swift documentation coverage, standard library behavior, strict concurrency, Observation, Distributed Actors, macros, property wrappers, value/reference semantics, generics, protocols, strings, collections, errors, ARC, unsafe memory, or API-level Swift guidance.

This is the repo's Swift brain. It is not a verbatim copy of Apple documentation. Apple documentation remains canonical:

- Swift documentation: <https://developer.apple.com/documentation/swift>
- The Swift Programming Language: <https://docs.swift.org/swift-book/documentation/the-swift-programming-language/>
- Swift standard library: <https://developer.apple.com/documentation/swift/swift-standard-library>
- Strict concurrency: <https://developer.apple.com/documentation/swift/adopting-strict-concurrency-in-swift-6-apps>

Use this file to decide what Swift concept matters, which local guide to load next, and what evidence is required before claiming correctness.

## Load order

For a broad Swift task, load in this order:

1. `docs/swift/swift-brain.md`
2. `docs/swift/swift-language.md`
3. `docs/swift/swift-standard-library.md`
4. `docs/swift/swift-concurrency.md`
5. `docs/swift/memory-lifetime.md`
6. `docs/swiftui/state-and-data-flow.md` when Observation or SwiftUI state is involved
7. `docs/migration/swift-6-migration.md` when compiler diagnostics mention isolation, `Sendable`, or language mode

For a narrow task, load only the matching file after this one.

## Beginner foundation

Swift code starts with values, names, control flow, functions, and types.

Core rules:

- Prefer `let` until mutation is required.
- Model absence with optionals, not sentinel values.
- Use `guard` to exit early when a precondition is missing.
- Keep force unwraps out of production code unless the invariant is local and impossible to violate.
- Make invalid states unrepresentable with enums, typed IDs, and small value types.
- Prefer clear names over comments that restate the code.

Example:

```swift
struct UserID: Hashable, Codable {
    let rawValue: UUID
}

struct User: Identifiable, Codable {
    let id: UserID
    var displayName: String
    var email: String?
}

func greeting(for user: User) -> String {
    guard !user.displayName.isEmpty else {
        return "Welcome"
    }
    return "Welcome, \(user.displayName)"
}
```

## Type system brain

Swift's type system is the main design tool.

Use:

- `struct` for value semantics and local data.
- `enum` for finite states, domain events, errors, and impossible-state prevention.
- `class` only when identity, inheritance, Objective-C interoperability, reference lifetime, or shared mutable state is truly needed.
- `actor` for isolated mutable state that must be safe across concurrent tasks.
- `protocol` for capability boundaries and test seams.
- Generics when callers need static type preservation.
- Existentials with `any Protocol` when dynamic dispatch and type erasure are intended.
- Opaque result types with `some Protocol` when the implementation chooses one hidden concrete type.

Do not erase types just to make code shorter. Type erasure hides useful compiler information.

## Optionals and errors

Use optionals for legitimate absence. Use throwing errors for operations that can fail with a reason the caller may need.

Rules:

- `if let` unwraps for local optional use.
- `guard let` unwraps required inputs.
- `??` is good for display defaults, not for hiding data loss.
- `try?` is only acceptable when the error reason truly does not matter.
- Prefer typed domain errors that conform to `LocalizedError` at user-facing boundaries.

```swift
enum ProfileError: LocalizedError {
    case missingName
    case invalidAvatarURL

    var errorDescription: String? {
        switch self {
        case .missingName:
            return "Enter a profile name."
        case .invalidAvatarURL:
            return "Choose a valid avatar URL."
        }
    }
}
```

## Standard library brain

The standard library is not just `Array`. It includes collections, sequences, strings, numeric types, optionals, results, ranges, key paths, protocols, and concurrency types.

Collections:

- `Array` preserves order and supports random access.
- `Dictionary` maps `Hashable` keys to values; subscript lookup returns an optional.
- `Set` models uniqueness and set algebra.
- `ArraySlice` shares storage; convert to `Array` if the slice must live independently.
- Lazy sequences avoid intermediate arrays but can hide repeated work.

Strings:

- `String` is Unicode-correct and indexed by `String.Index`, not `Int`.
- `Character` is an extended grapheme cluster.
- `Substring` can retain the original string storage; convert long-lived slices to `String`.
- Prefer localized formatting for user-visible dates, numbers, lists, and measurements.

Numeric types:

- Use `Int` for general integer values.
- Use fixed-width types when serialization, binary protocols, or Metal/C interop requires it.
- Use `Decimal` or server-provided formatted strings for money-like display, not `Double`.
- Check overflow behavior when using fixed-width arithmetic.

Sequences:

- Use `map`, `compactMap`, `filter`, `reduce`, and `reduce(into:)` when they make the transformation clearer.
- Use loops when control flow, mutation, cancellation, or error handling is clearer.
- Prefer `AsyncSequence` for streams of asynchronous values.

## Concurrency brain

Swift concurrency is about isolation, cancellation, and structured lifetime.

Rules:

- UI-rendered observable models should be `@MainActor`.
- Prefer structured tasks over detached tasks.
- `Task.detached` needs a specific reason and explicit isolation decisions.
- Cross actor boundaries with values, identifiers, or `Sendable` data.
- Do not silence `Sendable` warnings with unchecked conformance unless the synchronization proof is local and documented.
- Check cancellation in long-running loops.
- Use `AsyncStream` or `AsyncThrowingStream` to bridge callback APIs into `AsyncSequence`.

```swift
@MainActor
@Observable
final class SearchModel {
    var query = ""
    var results: [ResultRow] = []

    private let service: SearchService
    private var task: Task<Void, Never>?

    init(service: SearchService) {
        self.service = service
    }

    func search() {
        task?.cancel()
        let query = query
        task = Task { [service] in
            do {
                let rows = try await service.search(query)
                try Task.checkCancellation()
                results = rows
            } catch is CancellationError {
                return
            } catch {
                results = []
            }
        }
    }
}
```

If code like this produces isolation diagnostics, load `docs/swift/swift-concurrency.md` and `docs/migration/swift-6-migration.md` before editing.

## Observation brain

Use Observation for modern SwiftUI data flow. `@Observable` tracks property access so SwiftUI can refresh the views that depend on changed state.

Rules:

- Put UI state in `@MainActor @Observable final class` unless it is purely value-local state.
- Keep heavy work out of observable models; call services or actors.
- Avoid publishing derived state that can be computed cheaply.
- Use `@ObservationIgnored` for caches, tasks, cancellables, and implementation details that should not trigger UI updates.
- Do not mix old `ObservableObject` patterns into new Observation code unless the project requires compatibility.

Load `docs/swiftui/state-and-data-flow.md` for implementation patterns.

## Distributed Actors brain

Distributed Actors are for distributed systems where actor identity, remote calls, serialization, and failure are part of the model. They are not a normal iOS app state-management tool.

Rules:

- Use regular actors for in-process isolation.
- Use Distributed Actors only when the process boundary is real.
- Every distributed call can fail and should be treated like networked work.
- Model serialization, identity, availability, timeout, and versioning explicitly.

Most iOS app work should route away from Distributed Actors unless the user specifically asks for them.

## Macros and property wrappers

Macros generate code at compile time. Property wrappers add storage and access behavior around a property.

Rules:

- Use macros when they remove repeated boilerplate and are already established in the project or framework.
- Do not hide business logic inside macros.
- Generated code still needs tests and compiler verification.
- Use property wrappers when property access itself needs behavior, such as SwiftUI state, environment, bindings, app storage, model queries, or dependency injection.
- Avoid custom property wrappers that obscure lifetime, threading, persistence, or side effects.

Examples in Apple-platform work: `@Observable`, `@Model`, `@Query`, `@State`, `@Binding`, `@Environment`, `@AppStorage`, `@SceneStorage`, `@MainActor`, `@Generable`.

## Memory and lifetime brain

Swift is memory-safe by default, but ARC lifetime, unsafe APIs, C interop, image buffers, and GPU resources still require engineering discipline.

Rules:

- Use value types by default.
- Use `weak` for delegates, parent pointers, back references, and closures that would otherwise form cycles.
- Use `unowned` only when the lifetime proof is obvious and local.
- Cancel tasks, timers, subscriptions, and observers when the owner ends.
- Keep `Data`, `Array`, and `String` storage alive for the whole unsafe access.
- Match allocation and deallocation APIs.
- Label Metal resources and release temporary GPU resources.

Load `docs/swift/memory-lifetime.md` and `docs/tooling/xcode-memory-debugging.md` for leak, jetsam, or crash work.

## Interop brain

Swift app code often crosses into Objective-C, C, C++, Core Foundation, Metal, and system frameworks.

Rules:

- Keep Objective-C exposure small and explicit with `@objc` only when needed.
- Use `NSObject` subclasses only for framework integration that requires identity or dynamic dispatch.
- Handle Core Foundation ownership names and `Unmanaged` explicitly.
- Wrap pointer-heavy APIs behind small Swift types.
- Keep actor isolation at the Swift boundary rather than leaking callback threading into UI code.
- Treat framework callbacks as potentially non-main unless Apple docs guarantee otherwise.

## API design brain

Good Swift APIs make correct usage easy.

Rules:

- Prefer initializer injection over global lookups.
- Put side effects behind protocols or services.
- Return values, not mutated out-parameters, unless performance requires in-place work.
- Use access control: `private`, `fileprivate`, `internal`, `package`, `public`, `open`.
- Keep public API small and documented.
- Avoid Boolean parameter pairs that create unclear call sites.
- Prefer domain names over generic names like `Manager`, `Helper`, and `Util`.

```swift
protocol ImageLoading: Sendable {
    func image(for url: URL) async throws -> ImageData
}
```

## Testing and verification brain

Before saying Swift code is correct, state the verification level.

Use:

- Compiler/build for syntax, type checking, availability, actor isolation, and `Sendable`.
- Unit tests for pure logic, models, parsing, formatting, reducers, and services.
- UI tests for app flows and accessibility identifiers.
- MCP analyzers for static review when Xcode is unavailable.
- Xcode Memory Graph and Instruments for memory claims.
- Thread Sanitizer and Main Thread Checker for race/main-thread claims.

Report honestly:

```text
Status: VERIFIED / INSPECTED / UNVERIFIED
Swift area: language / standard library / concurrency / Observation / memory / interop
Apple source: URL checked
Local guides loaded: docs/swift/...
Evidence: build, tests, analyzer, Instruments, or reason unavailable
```

## Coverage map

| Swift area | Local memory |
|---|---|
| Getting started, values, functions, control flow | `docs/swift/swift-brain.md`, `docs/swift/swift-language.md` |
| Structs, classes, enums, actors | `docs/swift/swift-language.md`, `docs/swift/swift-concurrency.md` |
| Optionals, errors, pattern matching | `docs/swift/swift-brain.md`, `docs/swift/swift-language.md` |
| Protocols, generics, existentials, opaque types | `docs/swift/swift-language.md` |
| Standard library collections and strings | `docs/swift/swift-standard-library.md` |
| AsyncSequence and streaming async values | `docs/swift/swift-concurrency.md`, `docs/swift/swift-standard-library.md` |
| Strict concurrency and Swift 6 migration | `docs/swift/swift-concurrency.md`, `docs/migration/swift-6-migration.md` |
| Observation | `docs/swift/swift-brain.md`, `docs/swiftui/state-and-data-flow.md` |
| Distributed Actors | `docs/swift/swift-brain.md`, Apple Swift docs |
| Macros and property wrappers | `docs/swift/swift-language.md`, framework-specific guides |
| ARC, leaks, unsafe memory | `docs/swift/memory-lifetime.md` |
| Xcode memory and crash evidence | `docs/tooling/xcode-memory-debugging.md` |

