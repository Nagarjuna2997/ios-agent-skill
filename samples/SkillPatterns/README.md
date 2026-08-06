# SkillPatterns — the compile-checked reference

Every Swift snippet in `docs/` is prose. **This package is the subset that
actually builds**, so CI can prove the patterns compile rather than asserting
they do.

That distinction is the point. See `docs/orchestration/verification.md`.

```bash
cd samples/SkillPatterns
swift build
swift test
```

## What it proves

| Rule | Where |
|------|-------|
| `@MainActor @Observable final class` view models | `ArticleListModel.swift` |
| Dependencies as `any Protocol`, injected, no live defaults | `ArticleListModel.swift`, `Composition.swift` |
| Presentation never names a concrete repository or client | `ArticleListModel.swift` |
| Inbound and outbound boundary protocols | `Domain.swift` |
| Composition root as a protocol, not a singleton | `Composition.swift` |
| `CancellationError` as a deliberate no-op | `ArticleListModel.swift` |
| No `catch { }`, no `error = nil` | throughout |
| Re-solve identity after an `await` (no stale indices) | `ArticleListModel.toggleBookmark` |
| Single in-flight task, superseded not raced | `ArticleListModel.load` |
| Typed `Hashable, Codable` routes | `Router.swift` |
| Deep-link parsing as a pure, testable function | `Router.swift` |
| Actor test doubles reconfigurable after injection | `Composition.swift` |
| `@Model` kept distinct from the Sendable domain entity | `Persistence.swift` |
| Identity stored as a `String` — `#Predicate` on `UUID` matches nothing | `Persistence.swift` |
| `@ModelActor` for background work, converting to value types inside | `Persistence.swift` |
| `PersistentIdentifier` crosses the actor boundary; the model never does | `Persistence.swift` |
| One `ModelContainer`, owned by the composition root | `Persistence.swift` |
| A push source behind an `AsyncSequence` protocol | `Streaming.swift` |
| Streamed updates matched by identity, cancellation as a no-op | `ArticleListModel.consumeUpdates` |

The tests are the interesting part: several exist specifically to fail if a rule
is violated. `testToggleBookmarkRevertsOnFailure` fails if the revert uses a
stale index. `testCancellationIsNotReportedAsError` fails if `CancellationError`
is treated as user-facing. `testLinkBeforeReadyIsQueuedThenFlushed` fails if a
launch-time deep link is dropped. `testImportIsIdempotent` fails if the upsert
degrades into a blind insert, which the `@Attribute(.unique)` constraint only
punishes later, at save time. `testTheSameViewModelDrivesSwiftDataUnchanged`
fails if the boundary protocols were decorative — it runs the *same*
`ArticleListModel` over a real `ModelContainer` with nothing changed.

Timing-sensitive transitions go through `Gate` (`Streaming.swift`), which makes
the suspension deterministic. Tests that sleep and hope pass locally and flake
in CI, which is worse than no test: they teach people to re-run until green.

## Scope

Deliberately limited to **stable APIs** — iOS 17 / macOS 14, no SwiftUI view
code, no beta SDKs — so it builds on standard CI runners with `swift build`
and no simulator. SwiftData qualifies: it shipped in iOS 17, and every container
here is `isStoredInMemoryOnly`, so the suite needs no disk and leaves nothing
behind.

Consequences, stated plainly:

- **Compile-checked:** architecture, isolation, concurrency, routing, DI, error
  handling.
- **Not compile-checked:** SwiftUI view bodies, Liquid Glass, Foundation Models,
  and anything else needing a beta SDK or a UI framework. Those docs carry a
  verification note for exactly this reason.

Strict concurrency is enabled in `Package.swift`, so an isolation regression
fails the build rather than shipping.

## Adding to it

A pattern belongs here once it is (a) stable-API, (b) expressible without
SwiftUI view code, and (c) testable in a way that fails when the rule is broken.
A test that passes whether or not the pattern is followed adds nothing.
