# MCP Tool Reference

**Load this when:** choosing which `ios-agent-mcp` tool to call, or interpreting
a finding it returned.

Every tool takes one argument — an **absolute** path to the project root:

```json
{ "path": "/Users/you/Projects/MyApp" }
```

---

## Choosing a tool

| You want to… | Tool |
|--------------|------|
| Understand an unfamiliar codebase | `analyze_swift_project` |
| Diagnose a data race or migrate to Swift 6 | `review_swift_concurrency` |
| Find out why a screen can't be previewed | `review_swift_architecture` |
| Review SwiftUI views and state | `review_swiftui` |
| Check before shipping, or after an SDK bump | `check_availability_guards` |
| Prepare an App Store submission | `audit_app_store_readiness` |

Start with `analyze_swift_project` — it reports counts per category and names
the tool to run for each, so you do not run all six blindly.

---

## Severity

| | Meaning | Act |
|---|---|---|
| 🔴 **blocker** | Crash, data race, or App Review rejection | Before shipping |
| 🟠 **serious** | Real defect — untestable code, accessibility failure, deprecated API | This sprint |
| 🟡 **minor** | Maintainability and consistency | When touching the file |

Findings are sorted most severe first.

---

## `analyze_swift_project`

Structure — Swift file count, line count, deployment target, Swift tools
version, frameworks in use, whether tests exist — plus a finding count for every
category with the tool that explains it.

## `review_swift_concurrency`

| Rule | Severity |
|------|----------|
| `observable-without-mainactor` | 🔴 |
| `type-named-task` | 🔴 |
| `task-detached` | 🟠 |
| `dispatchqueue-main-async` | 🟠 |
| `unchecked-sendable` | 🟠 |
| `task-in-onappear` | 🟠 |
| `empty-catch` | 🟠 |
| `redundant-mainactor-run` | 🟡 |
| `nonisolated-unsafe` | 🟡 |
| `observable-not-final` | 🟡 |

Background: `../swift/swift-concurrency.md`, `../../patterns/mvvm.md`.

## `review_swift_architecture`

| Rule | Severity |
|------|----------|
| `live-default-dependency` | 🔴 |
| `domain-imports-ui` | 🔴 |
| `presentation-names-data-type` | 🟠 |
| `singleton-in-viewmodel` | 🟠 |
| `nested-navigation-stack` | 🟠 |
| `deprecated-navigationview` | 🟠 |

Background: `../../patterns/clean-architecture.md`.

## `review_swiftui`

| Rule | Severity |
|------|----------|
| `environmentobject` | 🟠 |
| `force-try` | 🟠 |
| `fixed-font-size` | 🟠 |
| `any-view`, `fixed-height`, `literal-spacing`, `deprecated-corner-radius`, `material-possibly-on-solid`, `view-state-on-model`, `legacy-observableobject` | 🟡 |

Only runs on files that `import SwiftUI`.

Background: `../swiftui/state-and-data-flow.md`, `../design/design-tokens.md`.

## `check_availability_guards`

| Rule | Severity |
|------|----------|
| `missing-availability-guard` | 🔴 |
| `missing-runtime-model-check` | 🔴 |
| `over-restrictive-guard` | 🟠 |

`over-restrictive-guard` is the one worth understanding. Guarding an **iOS 26**
API at `#available(iOS 27, *)` compiles, ships, and silently sends every iOS 26
device down your fallback path. It is invisible when testing on a current
device, which is why a rule catches it.

`missing-runtime-model-check` covers the other half: an `@available` guard proves
the *symbol* exists; it does not prove Foundation Models is usable on this
device, in this region, with Apple Intelligence enabled.

Background: `../compatibility-matrix.md`, `../frameworks/foundation-models.md`.

## `audit_app_store_readiness`

| Rule | Severity |
|------|----------|
| `missing-purpose-string` | 🔴 |
| `missing-privacy-manifest` | 🔴 |
| `unlabeled-icon-button` | 🟠 |
| `hardcoded-string`, `print-logging` | 🟡 |

`missing-privacy-manifest` only fires on **apps** (an Info.plist or `.xcodeproj`
is present). A library is never submitted to App Review.

Background: `../../checklists/app-store-submission.md`, `../frameworks/accessibility.md`.

---

## Limits

**Static analysis.** It reads source; it does not build, run, or type-check.
A clean report is not a passing build — run `swift build` and `swift test`.

**Heuristics on paths.** Layer rules infer the presentation and domain layers
from directory names (`Views/`, `Presentation/`, `Domain/`). An unconventional
layout produces fewer architecture findings, not wrong ones.

**Exemptions are deliberate.** Test, mock, stub, fake, and preview files skip
the app-code-only rules; `Package.swift` is skipped entirely. Doubling the noise
would halve the chance anyone reads the output.

**Caps.** 2000 files and 512 KB per file, so a huge monorepo returns something
rather than hanging.
