# Swift Memory And Lifetime

## Context

Load this when reviewing or writing Swift code that involves ARC, retain cycles, `deinit`, closure captures, delegates, timers, async tasks, Combine subscriptions, notification observers, SwiftUI model lifetime, unsafe pointers, large images, caches, Metal resources, or crashes such as `EXC_BAD_ACCESS`.

This is a coding-agent playbook. It does not replace Xcode Memory Graph, Instruments, or Apple documentation; it tells the agent what to inspect before making a memory claim.

## ARC ownership rules

Swift class instances are reference types managed by Automatic Reference Counting. A leak usually means the ownership graph still has a strong path to the object. A crash usually means the code used memory after its lifetime ended, crossed an unsafe boundary incorrectly, or assumed a lifetime that was not guaranteed.

Default rules:

- Use strong ownership for the object that actually owns another object's lifetime.
- Use `weak` for delegates, parent references, back-pointers, view controller callbacks, and closures that would otherwise be retained by the owner they capture.
- Use `unowned` only when the captured object must outlive the closure or child object by construction. If that proof is not local and obvious, use `weak`.
- Do not add `[weak self]` to every closure by habit. Add it when the closure escapes and is retained by an object that can participate in a cycle.
- `deinit` logging is debug evidence, not a production feature. Wrap it in `#if DEBUG` when it is useful.

## Common retain-cycle shapes

Delegate cycles:

```swift
protocol PlayerCoordinatorDelegate: AnyObject {
    func playerDidFinish()
}

final class PlayerCoordinator {
    weak var delegate: PlayerCoordinatorDelegate?
}
```

Closure cycles:

```swift
final class Loader {
    private var onComplete: (() -> Void)?

    func start() {
        onComplete = { [weak self] in
            self?.finish()
        }
    }

    private func finish() {}
}
```

Timer cycles:

```swift
final class Poller {
    private var timer: Timer?

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in
            self?.tick()
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    deinit {
        timer?.invalidate()
    }

    private func tick() {}
}
```

Combine cycles:

```swift
final class SearchModel {
    private var cancellables = Set<AnyCancellable>()

    func bind(_ publisher: AnyPublisher<String, Never>) {
        publisher
            .sink { [weak self] query in
                self?.runSearch(query)
            }
            .store(in: &cancellables)
    }

    private func runSearch(_ query: String) {}
}
```

## Swift concurrency lifetime

Structured tasks inherit cancellation from their parent. Unstructured tasks do not. A `Task {}` stored or launched from a long-lived object can keep work alive longer than the view, model, or controller that created it.

Rules:

- Prefer `.task(id:)` in SwiftUI for view-scoped async work.
- Store task handles when a class starts long-running work, then cancel them in `deinit` or `stop()`.
- Use `[weak self]` inside unstructured tasks when the task should not keep the owner alive.
- Check cancellation inside long loops with `Task.checkCancellation()` or `Task.isCancelled`.
- Do not move non-`Sendable` references across actors to "fix" a warning. Isolate the owner or pass values.

```swift
@MainActor
final class FeedModel: ObservableObject {
    private var refreshTask: Task<Void, Never>?

    func refresh() {
        refreshTask?.cancel()
        refreshTask = Task { [weak self] in
            guard let self else { return }
            await self.load()
        }
    }

    deinit {
        refreshTask?.cancel()
    }

    private func load() async {}
}
```

## SwiftUI lifetime

SwiftUI recreates view values often. The lifetime usually belongs to the model, task, scene, or environment object, not the `View` struct.

Rules:

- Use `@StateObject` or `@State` for a model the view creates and owns.
- Use `@ObservedObject`, `@Bindable`, or plain parameters for a model owned elsewhere.
- Use `.task(id:)` for work tied to the visible view and a changing input.
- Avoid starting permanent work from `body`.
- Avoid storing view structs in classes.
- Make caches explicit and bounded. Image, video, AR, and Metal resources can dominate memory even when Swift object counts look small.

## Unsafe and C memory

Unsafe pointer, Core Foundation, Accelerate, image-processing, audio, and Metal code needs explicit ownership checks.

Rules:

- Match allocation and deallocation APIs.
- Do not return pointers to stack storage or temporary buffers.
- Keep `Data`, `Array`, and `String` storage alive for the entire unsafe access.
- Treat `Unmanaged` as a boundary that must document whether ownership is retained, released, or transferred.
- Free vImage, malloc, and manually allocated buffers on every path.
- Label Metal resources so Xcode's Metal Memory viewer can identify buffers, textures, heaps, and render targets.

## Verification workflow

Use at least one evidence source before claiming a leak or memory fix is proven:

- `review_swift_memory` from `ios-agent-mcp` for static ownership red flags.
- Xcode Debug Memory Graph for retained objects and reference paths.
- Xcode scheme Diagnostics with Malloc Stack when allocation stack traces are needed.
- Instruments Allocations with Generations around the suspected feature.
- Crash logs for `EXC_BAD_ACCESS`, `SIGSEGV`, `SIGBUS`, `SIGABRT`, and last exception backtraces.
- Jetsam reports, Xcode Organizer, or MetricKit for memory pressure and production regressions.
- Metal Memory viewer for GPU resource allocations.

## Anti-patterns

Wrong:

```swift
final class Child {
    unowned let parent: Parent
}
```

when the parent lifetime is not guaranteed.

Right:

```swift
final class Child {
    weak var parent: Parent?
}
```

Wrong:

```swift
Task {
    await self.loadForever()
}
```

inside a class when the task outlives the owner.

Right:

```swift
task = Task { [weak self] in
    await self?.loadUntilCancelled()
}
```
