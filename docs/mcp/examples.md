# MCP Usage Examples

**Load this when:** you want to see what a session with `ios-agent-mcp` actually
looks like, or how to combine it with the skill's subagents.

Every transcript below is the server's real output format.

---

## 1. Onboarding onto an unfamiliar codebase

> **You:** I just inherited this Swift project. What am I looking at?

Claude calls `analyze_swift_project`:

```
# Swift Project Analysis

## Structure

- **Swift files:** 6
- **Lines:** 848
- **Deployment target:** iOS 17
- **Swift tools version:** 5.9
- **Test files:** found
- **Frameworks:** Foundation, Observation, XCTest

## Findings by category

| Category | 🔴 Blocker | 🟠 Serious | 🟡 Minor | Tool |
|---|---:|---:|---:|---|
| Concurrency | 0 | 0 | 0 | `review_swift_concurrency` |
| Architecture | 0 | 0 | 0 | `review_swift_architecture` |
| SwiftUI | 0 | 0 | 0 | `review_swiftui` |
| Availability | 0 | 0 | 0 | `check_availability_guards` |
| App Store | 0 | 0 | 0 | `audit_app_store_readiness` |

**No findings in any category.**
```

That is the real result of running the server against this repo's own
`samples/SkillPatterns` — the package CI compiles on every push.

**Why start here:** the table tells you which of the five tools is worth running.
Running all six on a large project buries the signal.

---

## 2. Diagnosing a data race

> **You:** Users report the feed occasionally shows stale posts. Anything obviously wrong?

`review_swift_concurrency`:

```
### 🔴 Sources/Views/FeedView.swift:3 — @Observable type is not @MainActor-isolated.

```swift
@Observable
```

**Why it matters:** @Observable grants no isolation. SwiftUI reads this state
during layout while any task may write it — a data race under Swift 5 mode, a
compile error under Swift 6.

**Fix:** Annotate the type: `@MainActor @Observable final class …`. Annotate the
type, not individual members — per-member isolation leaves gaps.

_Rule `observable-without-mainactor` · see `docs/swift/swift-concurrency.md`_

### 🟠 Sources/Views/FeedView.swift:7 — Task.detached drops actor isolation, priority, and task-locals.
```

Two findings that together explain the symptom: unisolated state plus a detached
task writing to it.

---

## 3. The finding people don't expect

> **You:** We shipped Liquid Glass last release but users on iOS 26 say they don't see it.

`check_availability_guards`:

```
### 🟠 Sources/Views/Card.swift:14 — glassEffect was introduced in iOS 26 but is guarded at iOS 27.

**Why it matters:** Every device on iOS 26–26 falls back unnecessarily, losing
the feature for a large installed base. This is invisible when testing on a
current device.

**Fix:** Guard on iOS 26, the version where the symbol was introduced — not the
newest SDK.
```

The code compiled, shipped, and worked on the developer's phone. Nothing but a
rule catches this.

---

## 4. Pre-submission audit

> **You:** We submit tomorrow. Anything that will get rejected?

`audit_app_store_readiness`:

```
### 🔴 Sources/LocationService.swift:1 — Uses location but Info.plist has no NSLocationWhenInUseUsageDescription.

**Why it matters:** iOS terminates the app the moment the permission is
requested, and App Review rejects the submission.

### 🔴 PrivacyInfo.xcprivacy:1 — No PrivacyInfo.xcprivacy found in the project.

### 🟠 Sources/Views/Toolbar.swift:22 — Icon-only button has no accessibility label.
```

Two of these are hard rejections; the third is an accessibility failure a
reviewer may also catch.

---

## 5. Combined with the skill's subagents

The MCP server finds *what* is wrong. The subagents in `.claude/agents/` decide
*what to do*. A useful pairing:

```
1. analyze_swift_project        → where the problems are
2. ios-plan                     → a fix plan, respecting existing seams
3. main agent                   → execute
4. review_swift_concurrency     → confirm the category is now clean
5. swift-reviewer               → build + tests, with real output
```

Step 4 and step 5 are doing different jobs, and both matter:

- The **MCP tool** proves the *pattern* is gone. It is deterministic and cannot
  be argued with.
- The **reviewer subagent** proves the *code still works*, by running the build
  and pasting the output.

A clean static report on code that no longer compiles is worthless. Neither
check substitutes for the other. See `../orchestration/verification.md`.

---

## 6. In CI

The server is for interactive use, but the same rules run headless via
`templates/hooks/forbid-antipatterns.sh` — the analyzers were derived from it.
Use the hook in CI and pre-commit, and the MCP server when you want an agent to
explain and fix what it found.

---

## What to expect

**A clean report is not a passing build.** Every tool says so in its own footer.
Static analysis cannot type-check, run, or prove behavior.

**Fewer findings on unconventional layouts.** Architecture rules infer layers
from directory names. A project that does not use `Views/` or `Domain/` gets
fewer architecture findings — not wrong ones.

**Test and mock files are exempt** from app-code-only rules, deliberately. So is
`Package.swift`.
