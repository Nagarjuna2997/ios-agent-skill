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

The tests are the interesting part: several exist specifically to fail if a rule
is violated. `testToggleBookmarkRevertsOnFailure` fails if the revert uses a
stale index. `testCancellationIsNotReportedAsError` fails if `CancellationError`
is treated as user-facing. `testLinkBeforeReadyIsQueuedThenFlushed` fails if a
launch-time deep link is dropped.

## Scope

Deliberately limited to **stable APIs** — iOS 17 / macOS 14, no SwiftUI view
code, no beta SDKs — so it builds on standard CI runners with `swift build`
and no simulator.

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
