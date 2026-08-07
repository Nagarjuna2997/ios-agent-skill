# MCP Tool Reference

**Load this when:** choosing which `ios-agent-mcp` tool to call, or interpreting
a finding it returned.

Every tool takes one argument — an **absolute** path to the project root:

```json
{ "path": "/Users/you/Projects/MyApp" }
```

Ten of the eleven analyze Swift source. `lint_skill` is the exception: it reads a
skill repository's own metadata, so its path is the folder containing
`SKILL.md`.

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
| Memory grows, or `deinit` never runs | `review_swift_memory` |
| Handle credentials, or run a security pass | `review_swift_security` |
| Tests are flaky, or a green suite looks too easy | `review_swift_testing` |
| Scrolling stutters or launch is slow | `review_swift_performance` |
| Author or review an Agent Skill, or work out why a subagent never gets invoked | `lint_skill` |

Start with `analyze_swift_project` — it reports counts per category and names
the tool to run for each, so you do not run all ten blindly. `lint_skill` sits
outside that flow; it inspects skill metadata, not Swift.

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

It also reports the project's **shape**: UI framework, inferred architecture,
third-party dependencies, and whether dependency injection is in use.

The architecture read always ships its **evidence**. "MVVM" alone is a guess
presented as a fact; "MVVM — 12 ViewModel types, Views/ and ViewModels/
directories" is a claim you can check. When the signals are weak it says
`not determined` rather than picking the most popular answer.

Dependency injection is detected from `any Protocol` parameters in initializers,
not from a directory named `DI/` — a project that only ever constructs concrete
types has no seam, whatever it calls itself.

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

## `review_swift_memory`

| Rule | Severity |
|------|----------|
| `timer-retain-cycle`, `notification-observer-retain`, `sink-retain-cycle` | 🟠 |
| `strong-delegate`, `stored-closure-captures-self`, `long-lived-task-captures-self` | 🟠 |
| `unowned-self` | 🟠 |

Deliberately narrow. A closure capturing `self` is **not** a leak — most closures
are consumed immediately. A leak needs the closure to be *stored* by something
the object itself owns, so these rules fire on the specific storing APIs rather
than on `self.` inside any closure, which would bury the real findings.

`unowned-self` is a crash rather than a leak: unlike `weak` it does not nil out,
so an escaping closure running after deallocation traps instead of no-oping.

## `review_swift_security`

| Rule | Severity |
|------|----------|
| `hardcoded-secret`, `secret-in-userdefaults`, `ats-disabled` | 🔴 |
| `tls-validation-bypassed`, `keychain-always-accessible` | 🔴 |
| `cleartext-http`, `weak-hash`, `non-cryptographic-randomness`, `secret-logged` | 🟠 |
| `javascript-string-interpolation` | 🟠 |
| `keychain-migrates-to-new-device` | 🟡 |

`hardcoded-secret` skips the placeholders people legitimately commit
(`YOUR_API_KEY`, `<your-key>`, `changeme`) and values under 8 characters —
flagging those trains readers to ignore the rule, which is worse than not having
it. `cleartext-http` allows `localhost` and loopback.

## `review_swift_testing`

The inverse of every other analyzer: it runs **only** on test files.

| Rule | Severity |
|------|----------|
| `await-inside-xctassert` | 🔴 |
| `test-sleeps`, `test-without-assertion`, `network-in-test`, `no-tests` | 🟠 |
| `force-try-in-test`, `shared-mutable-test-state`, `long-test-timeout` | 🟡 |
| `assert-true-on-equality`, `sparse-tests` | 🟡 |

A flaky or vacuous test is worse than a missing one: it costs the same to run
and reports success either way. `test-without-assertion` catches the case that
passes as long as nothing throws; `await-inside-xctassert` catches code that
does not compile at all, because `XCTAssert` takes an autoclosure.

## `review_swift_performance`

| Rule | Severity |
|------|----------|
| `blocking-io-in-body` | 🔴 |
| `formatter-allocated-in-body`, `collection-work-in-body`, `foreach-over-indices` | 🟠 |
| `eager-stack-in-scrollview`, `image-decode-in-body` | 🟠 |
| `asyncimage-without-frame`, `geometryreader-wraps-body`, `formatter-allocated-repeatedly` | 🟡 |

The unifying rule: `body` runs many times per second, on the main actor, for
reasons you do not control. Anything expensive inside it is multiplied by a
number nobody measured. Rules that only matter on that path are scoped to the
`var body: some View` block and are silent elsewhere — the same `DateFormatter()`
is 🟠 inside `body` and 🟡 outside it.

---

## `lint_skill`

The one tool that does not read Swift. It checks whether an Agent Skill
repository is **well-formed and internally consistent** — the class of defect
that produces no error anywhere, just an instruction nobody follows.

| Rule | Severity |
|------|----------|
| `skill-file-missing`, `skill-missing-frontmatter`, `skill-frontmatter-missing-key` | 🔴 |
| `agent-missing-frontmatter` | 🔴 |
| `agent-read-only-holds-write-tool` | 🔴 |
| `skill-version-not-semver`, `skill-name-not-kebab-case`, `skill-description-too-long` | 🟠 |
| `skill-unknown-tool`, `agent-unknown-tool` | 🟠 |
| `agent-name-filename-mismatch`, `agent-missing-name`, `agent-missing-description`, `agent-missing-tools`, `agent-name-not-kebab-case` | 🟠 |
| `mirror-out-of-sync`, `broken-doc-reference` | 🟠 |
| `skill-description-too-short`, `agent-description-lacks-trigger` | 🟡 |

Three of these are worth calling out, because each fails **silently**:

- **`agent-read-only-holds-write-tool`** — a subagent whose description promises
  it is read-only while its frontmatter grants `Edit` or `Write`. The main agent
  delegates on the strength of that promise. A reviewer that can edit will fix
  what it was meant to report, and the separation of duties the review depends
  on is gone with nothing in the output to show it.
- **`agent-name-filename-mismatch`** — rename the file, forget the frontmatter,
  and every delegation prompt references an identifier the loader never
  registered.
- **`*-unknown-tool`** — a misspelled tool name is not granted *and not
  reported*. The agent's prompt assumes a capability it does not have, and only
  finds out at the moment it tries to use it.

**Mirror checking is self-calibrating.** Files like `CLAUDE.md` and `AGENTS.md`
are compared against `SKILL.md`'s body only when at least one of them already
matches byte-for-byte. That proves the repository generates its mirrors; without
it, a project with a hand-written `CLAUDE.md` would be told all 24 mirrors had
drifted. When no mirror matches, the check is skipped and the report says so.

The report opens with what it inspected — SKILL.md found or not, agents counted,
mirrors compared, references resolved — because a clean report that never states
its scope is indistinguishable from a check that never ran.

Background: `../orchestration/subagents.md`, `../orchestration/verification.md`.

---

## Structured output

Every review tool returns **both** halves of a result:

- `content` — markdown, for a human reading the transcript.
- `structuredContent` — typed data, declared via `outputSchema`, for a workflow
  that must branch on the result without regexing prose.

```jsonc
{
  "summary": "Security Review: 1 blocker, 2 serious across 34 files.",
  "score": 91,
  "counts": { "blocker": 1, "serious": 2, "minor": 0, "total": 3 },
  "files_checked": 34,
  "issues": [ { "file": "…", "line": 12, "severity": "blocker", "rule": "…", "fix": "…" } ],
  "suggestions": [ "hardcoded-secret: Move it server-side…" ]
}
```

**About `score`.** It is a defect *density*, computed as
`100 × (1 − penalty / capacity)` where `penalty = 10·blockers + 3·serious +
1·minor` and `capacity = files × 10`, clamped to 0–100. The formula is fixed and
published so the number is reproducible rather than a vibe.

It is **not comparable between projects** — a UI-heavy app and a networking
library have different rule surfaces. Use it as a direction of travel for one
codebase, and use `counts` for anything that matters.

`suggestions` deduplicates by rule rather than restating every issue's `fix`:
forty literal-spacing findings produce one instruction, not forty.

---

## Limits

**Static analysis.** It reads source; it does not build, run, or type-check.
A clean report is not a passing build — run `swift build` and `swift test`.

**`lint_skill` checks form, not content.** It can prove a subagent is declared
correctly and that its tool grant matches its stated contract. It cannot judge
whether the instructions in it are any good.

**Heuristics on paths.** Layer rules infer the presentation and domain layers
from directory names (`Views/`, `Presentation/`, `Domain/`). An unconventional
layout produces fewer architecture findings, not wrong ones.

**Exemptions are deliberate.** Test, mock, stub, fake, and preview files skip
the app-code-only rules; `Package.swift` is skipped entirely. Doubling the noise
would halve the chance anyone reads the output.

**Caps.** 2000 files and 512 KB per file, so a huge monorepo returns something
rather than hanging.
