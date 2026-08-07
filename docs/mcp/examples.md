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

- **Swift files:** 12
- **Lines:** 1,998
- **Deployment target:** iOS 17
- **Swift tools version:** 5.9
- **Test files:** found

## Shape

- **UI framework:** unknown
- **Architecture:** Clean Architecture
  - evidence: 1 use-case protocol(s) or a UseCases/ directory; 1 repository protocol(s)
- **Dependency injection:** protocol existentials injected through init
- **Third-party dependencies:** none detected

- **Frameworks:** Accelerate, Foundation, Observation, SwiftData, XCTest

## Findings by category

| Category | 🔴 Blocker | 🟠 Serious | 🟡 Minor | Tool |
|---|---:|---:|---:|---|
| Concurrency | 0 | 0 | 0 | `review_swift_concurrency` |
| Architecture | 0 | 0 | 0 | `review_swift_architecture` |
| SwiftUI | 0 | 0 | 0 | `review_swiftui` |
| Availability | 0 | 0 | 0 | `check_availability_guards` |
| Memory | 0 | 0 | 0 | `review_swift_memory` |
| Security | 0 | 0 | 0 | `review_swift_security` |
| Performance | 0 | 0 | 0 | `review_swift_performance` |
| Testing | 0 | 0 | 0 | `review_swift_testing` |
| App Store | 0 | 0 | 0 | `audit_app_store_readiness` |

**No findings in any category.**
```

That is genuinely the current output of running the server against this repo's
own `samples/SkillPatterns`, pasted rather than composed — the package builds
and its 49 tests pass on macOS CI on every push.

`UI framework: unknown` is correct, not a gap: the sample deliberately contains
no SwiftUI view code so it can build on a plain runner with no simulator.

**Why start here:** the table tells you which of the ten tools is worth running.
Running all of them on a large project buries the signal.

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

## 6. The four checks people run after something goes wrong

These were added in 2.1.0, and each answers a question the first six could not.

### Memory — "the screen is gone but it is still updating"

> **You:** deinit never runs on my ClockModel.

```
Claude → review_swift_memory

🟠 Sources/ClockModel.swift:12 — Repeating Timer captures self strongly.
   Why: the run loop retains the timer, the timer retains the block, and the
        block retains self. The cycle is self -> Timer -> closure -> self, and
        ARC cannot break it.
   Fix: capture `[weak self]`, and invalidate() when the owner goes away.
```

Deliberately narrow: a closure capturing `self` is **not** a leak, and flagging
every one would bury the handful that are. The rules fire only on APIs that
*store* the closure — repeating `Timer`, block `NotificationCenter` observers,
Combine `sink`, stored closure properties, non-`weak` delegates.

### Security — before handling credentials

> **You:** security pass before we ship the login screen.

```
Claude → review_swift_security

🔴 Sources/Session.swift:31 — Credential written to UserDefaults.
   Why: UserDefaults is an unencrypted plist in the app container. It is
        readable on a jailbroken device AND included in unencrypted backups,
        so the token leaves the device entirely.
   Fix: Keychain with kSecAttrAccessibleWhenUnlockedThisDeviceOnly.
```

`hardcoded-secret` skips the placeholders people legitimately commit —
`YOUR_API_KEY`, `<your-key>`, `changeme`. A rule that cries wolf on those is a
rule everyone learns to ignore.

### Testing — when the suite is green and you do not believe it

The inverse of every other tool: it runs **only** on test files.

```
Claude → review_swift_testing

🟠 Tests/FeedTests.swift:22 — Test contains no assertion.
   Why: it passes as long as nothing throws, so it reports success whether the
        behavior is right or wrong.
   Fix: assert the outcome, or delete it. A test that cannot fail is not a test.

🔴 Tests/FeedTests.swift:41 — `await` inside an XCTAssert autoclosure.
   Why: XCTAssert takes an autoclosure, which cannot contain an await. This
        does not compile.
   Fix: `let value = try await subject.run()`, then assert on `value`.
```

### Performance — when scrolling stutters

```
Claude → review_swift_performance

🟠 Sources/FeedView.swift:24 — Formatter allocated inside `body`.
   Why: body re-runs on every state change, and constructing a DateFormatter is
        one of the most expensive routine operations on the platform. In a list
        this is the hitch.
   Fix: hoist to a `static let`, or use `.formatted()`.
```

Rules that only matter on the render path are scoped to `var body: some View`
and stay quiet elsewhere — the same `DateFormatter()` is 🟠 inside `body` and
🟡 outside it.

---

## 7. Branching on a result without parsing prose

Every review tool returns `structuredContent` next to the markdown, so a
workflow can act on the numbers:

```jsonc
{
  "summary": "Security Review: 1 blocker, 2 serious across 34 files.",
  "score": 91,
  "counts": { "blocker": 1, "serious": 2, "minor": 0, "total": 3 },
  "files_checked": 34,
  "issues": [ /* file, line, severity, rule, consequence, fix */ ],
  "suggestions": ["hardcoded-secret: Move it server-side…"]
}
```

`suggestions` groups by rule rather than repeating every issue's fix — forty
literal-spacing findings produce one instruction, not forty.

**On `score`:** it is a published formula, not a judgement —
`100 × (1 − penalty/capacity)` where `penalty = 10·blockers + 3·serious +
1·minor` and `capacity = files × 10`. Because it is a *density*, it is
comparable across runs on one project and **not** between projects: a UI-heavy
app and a networking library have different rule surfaces. Use `counts` for
anything that matters.

---

## 8. Reading the project without asking

Point the server at a project once, in the client config:

```jsonc
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp", "--project", "/Users/you/Projects/MyApp"]
    }
  }
}
```

Then `ios://project/info` is readable without the model deciding to call
anything:

```json
{
  "project_root": "/Users/you/Projects/MyApp",
  "available": true,
  "swift_files": 84,
  "deployment_target": "17.0",
  "ui_framework": "SwiftUI",
  "architecture": "MVVM",
  "architecture_evidence": ["12 ViewModel/Model type(s)", "Views/ and ViewModels/ directories"],
  "uses_dependency_injection": true,
  "has_tests": true
}
```

The **evidence** ships with the verdict. "MVVM" alone is a guess presented as a
fact; the list underneath is a claim you can check. When the signals are weak it
says `not determined` rather than picking the most popular answer.

Every payload also reports `project_root`, because the root is implicit — it
comes from `--project`, `IOS_AGENT_PROJECT`, or the directory the client
happened to spawn the server in, and a reader who cannot see which one won has
no way to tell an empty project from a wrong path.

**There is no `ios://project/build-status`.** It would have to run `xcodebuild`,
which needs macOS and Xcode and breaks the `filesystem: read, network: none`
contract that lets this install anywhere in ~26 KB.

---

## 9. Checking the skill itself

`lint_skill` is the one tool that does not read Swift. Use it when a subagent
never gets invoked, or before publishing a skill:

```
Claude → lint_skill

🔴 .claude/agents/swift-reviewer.md:4 — described as read-only but granted Write.
   Why: the main agent delegates on the strength of that promise. A reviewer
        that can edit will fix what it was meant to report, and the separation
        of duties the review depends on is gone with nothing in the output to
        show it.
   Fix: remove Write from `tools`, or stop describing the agent as read-only.
```

Run against this repository it found a real defect on its first run: one of the
ten subagents described what it *is* without saying when to *use* it, making it
measurably less likely to be selected than its nine peers.

---

## 10. In CI

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
`Package.swift`. `review_swift_testing` is the exception that proves it — it is
the only tool that runs *exclusively* on test files.

**`score` is a density, not a grade.** Comparable across runs on one project,
meaningless between projects. The formula is published in `tools.md` so the
number is reproducible rather than a vibe.
