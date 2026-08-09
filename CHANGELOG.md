# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added -- unreleased
- **`cli/` -- `ios-agent`, a scaffolding CLI, and `docs/tooling/project-scaffolding.md`, the design behind it.** A generated project shows the user three entries; everything the tool owns lives in a hidden `.ios-agent/`.

  **The rule that decides where anything goes is authorship, not importance.** If a human writes it, it is visible; if the tool writes it, it is hidden. Importance is the tempting axis and has no edge -- everything feels important to whoever added it, so a layout sorted that way grows a root directory per release. Authorship has a sharp edge, and two things fall out of it that are worth more than the tidiness: `clean` needs no confirmation prompt because nothing in there was authored, and "delete `.ios-agent/` and re-run" becomes structurally safe advice rather than a risk.

  The leverage is not the directory name, it is that **one declaration produces four behaviours**. A row in `INTERNAL_ENTRIES` automatically yields its line in the generated `.ios-agent/.gitignore`, its inclusion in or exclusion from `clean`, its path in `where --json`, and a `doctor` check that it has not leaked to the project root. The alternative -- a constant here, a gitignore line there, a clean list elsewhere -- is three places that must be edited together and eventually are not, and the failure is quiet: a new cache directory that `clean` skips and git happily commits. The test asserting the two sets are complements does not care what the entries are; it fails the day someone adds a row that is both tracked and deletable.

  `.ios-agent/` doubles as a **root marker**, the way `.git/` does, which is how the CLI and the MCP server agree on a project without either configuring the other. Both now report *how* the root was resolved, not just what it is -- an implicit root is unfalsifiable, and without it "0 Swift files" is identical whether the project is empty or the tool is pointed somewhere else.

  **`ios-agent-mcp` stays read-only.** It reads the marker and never creates it, so the `filesystem: read, network: none` contract is unchanged. Scaffolding writes, so it is a separate package rather than a quiet turn from analyzer into something that mutates your project.

  Cross-platform throughout: user-level caches use each platform's own location (not `~/.ios-agent`, which is on no platform's list), Windows reserved device names are rejected everywhere so a Mac-created project still checks out on Windows, and tracked config stores POSIX paths because that file crosses machines by design. CI runs the CLI on ubuntu, macOS, and Windows, and asserts end to end that the project root contains exactly `App`, `LICENSE`, `README.md`.

  **42 CLI tests**, plus **7 in `ios-agent-mcp`** (123 -> 130) covering marker discovery -- including the case that a *file* named `.ios-agent` is not a marker. `doctor`'s checks are mutation-tested: each one is shown to fail when the layout is actually broken.

  Notably **not** included: an `.xcodeproj` generator. That is a build-system artifact whose format Xcode owns, and a generated one drifts from what Xcode would have made.

  Repo surfaces caught up with what ships: the README gained a CLI row, an install line, and a *What's New in 2.1* section (2.1.0 had shipped with no entry), and `docs/mcp/installation.md` documents the four-step root resolution including the `.ios-agent/` marker. One stale claim removed rather than updated -- `examples.md` pinned a Swift test count this environment cannot verify, and writing a number I have not seen reported is worse than writing none.

  Second pass, applying the same one-declaration move to the command surface: `COMMANDS` drives dispatch, `help`, and the bash and zsh completion scripts, so help cannot describe a flag the parser rejects. `--json` on `where`, `info`, `clean`, and `doctor`; exit codes split so a script can tell "the project is unhealthy" (2) from "you called it wrong" (1) without parsing stderr; and `doctor --fix`, which repairs only defects with a **derivable** correct value -- a stale generated gitignore, a config behind the current layout version. It deliberately will **not** create a missing `App/`: there is no safe automatic answer, and a `--fix` that guesses turns the safe command into a source of surprise changes. A test asserts exactly that. 42 -> 53 CLI tests.

- **`docs/frameworks/accelerate.md`** -- Accelerate, and the first framework doc whose central point is an isolation rule rather than an API surface.

  Accelerate functions are synchronous C: they inherit whatever isolation calls them and never yield. A `@MainActor @Observable` view model calling `vDSP` blocks the main thread for the entire computation, and **nothing in that code looks wrong** -- there is no warning, no runtime check, and the vDSP call itself is correct. It is the concrete case of the pitfall `SKILL.md` already states abstractly, so that rule now names the synchronous C frameworks it applies to.

  Routing first, because reaching for the wrong sub-library is the common failure and it goes both ways: hand-writing a loop over 100,000 samples wastes the vector unit, and calling `vDSP.add` on a three-element vector costs more in call overhead than the loop it replaced -- that is what `simd` is for. Then depth on the two that matter, vDSP and vImage.

  The FFT section documents the two things that produce a spectrum that looks right and is wrong: **bin 0 is not purely DC** (the real-to-complex transform packs the Nyquist term into its imaginary part), and the output carries a **factor of two** that never moves a peak and invalidates every absolute magnitude. Plus the rule that catches both -- test transforms against a *known answer*, not a snapshot. A signal with eight periods across the frame must peak in bin eight; that fails when the transform is wrong rather than when the numbers change.

  vImage is covered as an ownership problem, because that is what it is: `vImageBuffer_Init` hands you `malloc`ed memory nothing will free, and per video frame the result is a jetsam kill that reads as the OS killing the app for no reason.

  8 anti-patterns, a 19-item checklist, and honest scoping -- BLAS/LAPACK gets the one fact that actually bites (they are column-major, so a row-major Swift array solves the transposed system and returns a plausible wrong answer), and BNNS routes to Core ML, since hand-building a network on a CPU-only library gives up the Neural Engine entirely.

- **`samples/SkillPatterns/Sources/SkillPatterns/SignalProcessing.swift`** -- the Accelerate patterns, compile-checked. `AccelerateSpectrumAnalyzer` is an `actor` for a stated reason: `vDSP.FFT` is expensive to construct and is not `Sendable`, so it cannot be stored in a `Sendable` value type -- the same shape as owning an `NWConnection` or a `ModelContext`. The protocol requirement is `async` because that is the only part of the signature preventing a caller from doing the work on the main actor by accident, and a synchronous stub witnesses it, so a preview needs no audio and no Accelerate at all.

  Behind `#if canImport(Accelerate)` so the package still builds on Linux. **13 new tests**, four of them known-answer transforms.

- **`docs/design/liquid-glass-adoption.md`** -- the migration half of Liquid Glass. `design-tokens.md` covered applying the material to a view you own; nothing covered what an SDK rebuild does to an app you already shipped, which is the part that actually costs time.

  A coverage check found the gap was near-total: `UIDesignRequiresCompatibility`, `backgroundExtensionEffect`, `tabBarMinimizeBehavior`, `Tab(role: .search)`, `ToolbarSpacer`, `ConcentricRectangle`, `safeAreaBar`, the scroll edge effect, and Icon Composer appeared in **zero** files.

  The organising rule: **the system now owns the background of controls and navigation.** Custom backgrounds on bars, split views, sheets, and popovers no longer just look dated -- they sit on top of Liquid Glass and defeat the scroll edge effect, so content scrolling underneath loses the contrast the system would have supplied.

  Two changes ship silently and are worth the doc on their own. Rebuilding adopts the new design with **no code change**, so an unaudited app ships a changed interface; `UIDesignRequiresCompatibility` is the escape hatch, documented as a stopgap with a removal date rather than a decision. And **section headers are no longer force-capitalised** -- a header written `"recently played"` used to render `RECENTLY PLAYED` and now renders exactly as typed. Nothing warns; it just ships.

  8 anti-patterns, an 18-item checklist, and a per-setting test matrix (Reduce Transparency, Reduce Motion, Increase Contrast, dark mode, accessibility text sizes). The last anti-pattern is the one this skill flags most often: a blanket `#available(iOS 26, *)` around every new API. Liquid Glass arrived in iOS 26 but these APIs did not all land together, so each symbol's floor gets checked in Xcode rather than assumed -- `check_availability_guards` catches the over-restrictive direction.

  Cross-linked from `design-tokens.md` §4 and `ios-deployment-migration.md`, so whichever door you come in by leads to the other half.

## [2.1.0] -- 2026-08-06

**Eleven MCP tools, three resources, and a version identity that cannot drift.**
Tests 41 -> 123. The first release where every claim below was checked by CI
rather than asserted -- including the Swift, which had never been compiled
before this cycle.

### Added -- 2.1.0
- **`lint_skill`** -- a seventh MCP tool, and the first that does not read Swift. It validates a skill repository's own metadata: `SKILL.md` frontmatter (required keys, kebab-case name, semver version, and the description length limits either side of which the skill stops triggering reliably), subagent definitions in `.claude/agents/`, generated mirror drift, and backtick-quoted doc paths that do not resolve. Shipped as part of `ios-agent-mcp` **2.1.0**.

  Three of its rules exist because the failure is otherwise **silent**: `agent-read-only-holds-write-tool` catches a subagent whose description promises read-only while its frontmatter grants `Edit` or `Write` -- the main agent delegates on that promise, and a reviewer that can edit will fix what it was supposed to report; `agent-name-filename-mismatch` catches a rename that leaves every delegation prompt pointing at an identifier the loader never registered; and `agent-unknown-tool` catches a misspelled tool name, which is not granted *and not reported*.

  Mirror checking is self-calibrating -- mirrors are compared only when at least one already matches `SKILL.md` byte-for-byte, so a project with a hand-written `CLAUDE.md` is not told all 24 mirrors have drifted. Every report opens with what it inspected, because a clean report that never states its scope is indistinguishable from a check that never ran.

  **31 new tests** (41 -> 72), including a mutation check: neutering the read-only boundary rule fails two of them. Dogfooding it against this repository immediately found one real defect -- see below.

- `docs/frameworks/authentication-services.md` -- Sign in with Apple, passkeys, and `ASWebAuthenticationSession`. Closes a gap where `SKILL.md`'s framework selection table named AuthenticationServices for auth but no documentation existed behind it. Covers the three failure modes that only surface in production: name and email are returned on the first authorization *only*, the user can revoke access from Settings so `getCredentialState` must be checked on launch, and the identity token -- not the user identifier -- is the only value a server may trust. Also the delegate-to-`async` bridge with its resume-exactly-once requirement, nonce generation for replay protection, passkey registration and assertion, OAuth via `ASWebAuthenticationSession` with PKCE, Keychain storage, and 13 anti-patterns.
- **`scripts/eval-agents.sh`** -- verifies that every subagent's declared tool grant matches the instructions relying on it. `--table` prints the grant matrix; `--self-test` builds agents each broken in exactly one way and asserts every rule fires. Wired into CI and the Stop hook.

  The obvious design -- prompt each agent to edit something and check it refuses -- does not test the boundary. Tool restriction is enforced by the harness from the `tools:` line before the model is ever consulted, so a prompt check *passes* for an agent whose frontmatter wrongly grants `Write` (the model simply chose not to use it) and fails intermittently for one that is correctly restricted. What decides the boundary is the declaration, so the declaration is what gets checked.

  Building it surfaced the same false-positive trap three times, each caught by running against the real definitions: read-only status must be read from the description, not the body, because bodies carry scoped prohibitions that mean something else (`ios-docs`: "never edit a *generated* file"; `swift-refactorer`: "do not change *access levels*"); a shell command counts only inside a fence or after a `$` prompt, since `ios-plan` discusses "Swift Testing" the framework and runs nothing; and a `$ ` prefix is decisive on its own, because `foundation-models` mandates a literal `$ <build/test command>` in its output template. All four phrasings are now regression cases in `--self-test`. A planned over-grant rule for `Edit`/`Write` was **dropped rather than shipped wrong** -- "extract subviews, introduce protocol seams" all mean editing, and no regex generalizes over that.

- **SwiftData and `AsyncSequence` in `samples/SkillPatterns/`** -- `Persistence.swift` adds `@Model`, a `@ModelActor` store, and `ModelContainer` injection through a composition root; `Streaming.swift` adds a push source behind an `AsyncSequence` protocol plus a `Gate` actor for deterministic suspension in tests. **24 tests -> 49.**

  The store conforms to the `ArticleRepository` protocol that already existed in the domain layer, which is the point of adding it here: `testTheSameViewModelDrivesSwiftDataUnchanged` runs the *same* `ArticleListModel` over a real `ModelContainer` with nothing changed. If that had required touching the view model, the boundary protocols were decorative.

  Rules the new code exists to pin down: `@Model` is a persistence type and never the entity the UI renders -- conflating them compiles and then corrupts data the first time a background import touches a model the UI is reading; everything leaving the actor is converted to value types *inside* it; a `PersistentIdentifier` may cross the boundary but the model object may not; and one container is created in one place, because a second container over the same store is a second source of truth whose symptoms (writes that vanish, stale reads) look nothing like the cause.

  Timing-sensitive transitions (`isLoading` while in flight, a second load superseding a first) go through `Gate` rather than sleeping. A test that sleeps and hopes passes locally and flakes in CI, which is worse than no test -- it teaches people to re-run until green.

- **Three framework docs from the parked backlog**, each led by the failure that only shows up in production:

  - `docs/frameworks/local-authentication.md` -- `LAContext`, the biometry policies, lockout and fallback. Leads with the fact that decides whether any of it is worth writing: **`evaluatePolicy` returning true is a UI event, not a security boundary.** It reports that the system showed a prompt and the user satisfied it; it protects nothing, and the branch is patchable. The real boundary is a Keychain `SecAccessControl` naming biometry, where the Secure Enclave never releases the bytes. Also: one `LAContext` per authentication (a reused context caches its success, so the second screen unlocks with no prompt at all), `canEvaluatePolicy` before `biometryType` (read the other way it reports `.none` on a device with working Face ID), `.biometryCurrentSet` over `.biometryAny`, and the missing `NSFaceIDUsageDescription` that crashes on first prompt rather than at launch. 12 anti-patterns, 14-item checklist.

  - `docs/frameworks/swift-charts.md` -- marks, scales, axes, selection, and `AXChartDescriptor` for Audio Graphs. Two rules carry most of the value: a truncated y-axis on a bar chart renders a 3% difference as a 300% one, and there is **no virtualisation** -- 50,000 marks drops frames while showing no more information than 400 does at that pixel width, so the answer is peak-preserving downsampling off the main actor, never stride-sampling (which deletes the spike the user opened the chart to see). Also `.value` labels are user-facing and read aloud, meaning must be carried by more than hue, and iOS 17+ API (`SectorMark`, selection, scrolling) guarded at **17**. 13 anti-patterns, 14-item checklist.

  - `docs/frameworks/network-framework.md` -- `NWConnection`, `NWListener`, framing, TLS pinning, `NWPathMonitor`. Opens by sending most readers away: `URLSession` already sits on this framework and reimplementing HTTP over `NWConnection` arrives somewhere worse. For the cases that remain: **TCP is a byte stream, not a message stream**, so code treating one receive as one message works on localhost and fails on a real network; `NWConnection` is not `Sendable` and its handlers land on your queue, so it belongs inside an actor rather than behind a `DispatchQueue.main.async`; and `.waiting` is not `.failed` -- tearing down on the former discards the recovery the framework is already doing. Also unbounded length prefixes, continuations resumed twice across `.waiting -> .ready -> .failed`, unretained accepted connections, and pinning a certificate rather than a public key (routine renewal bricks every installed copy). 12 anti-patterns, 14-item checklist.

- **MCP resources** -- `ios://project/info`, `ios://project/dependencies`, and `ios://project/issues`. Tools are verbs the model chooses to call; resources are nouns a client can read without being asked, so a project's shape can be attached to context up front rather than after the model thinks to run an analysis.

  Resources are addressed by a fixed URI with no arguments, so `ios://project/...` only means something if the server knows which project it is. The root comes from `--project PATH`, then `IOS_AGENT_PROJECT`, then the working directory the client spawned the server in -- which matches how MCP servers are actually deployed, since `.cursor/mcp.json` lives in the repository and `claude mcp add` is run from it. **Every payload reports the root it used**, because a reader who cannot see which source won has no way to tell an empty project from a wrong path.

  **There is deliberately no `ios://project/build-status`**, which was on the request list. It would have to run `xcodebuild` -- that needs macOS and Xcode, and it breaks the `filesystem: read, network: none` contract that lets this package install anywhere in ~26 KB. Build and simulator state belong in the separate package that already requires a full toolchain.

  7 new tests (116 -> 123), including a second server instance launched with `--project` -- the root is a launch-time decision, so the shared test client cannot exercise it.

- **Four new review tools and structured output** -- 7 tools -> 11, 72 tests -> 116.

  - `review_swift_memory` -- retain cycles and lifetime. Deliberately narrow: a closure capturing `self` is *not* a leak, since most closures are consumed immediately. A leak needs the closure to be **stored** by something the object owns, so the rules fire on the storing APIs (repeating `Timer`, block-based `NotificationCenter` observers, Combine `sink`, stored closure properties, non-`weak` delegates) rather than on `self.` anywhere, which would bury the real findings. `unowned-self` is included as a *crash*, not a leak -- unlike `weak` it does not nil out, so an escaping closure running after deallocation traps.
  - `review_swift_security` -- hardcoded secrets, credentials in `UserDefaults`, disabled ATS, cleartext HTTP, TLS trust accepted without evaluation, MD5/SHA-1, over-permissive Keychain accessibility, non-cryptographic randomness for nonces, secrets in logs, and interpolation into evaluated JavaScript. `hardcoded-secret` skips the placeholders people legitimately commit (`YOUR_API_KEY`, `<your-key>`, `changeme`) -- flagging those trains readers to ignore the rule, which is worse than not having it.
  - `review_swift_testing` -- the inverse of every other analyzer: it runs **only** on test files. A flaky or vacuous test is worse than a missing one, because it costs the same to run and reports success either way. Catches tests that wait by sleeping, tests with no assertion at all, live `URLSession` in tests, order-dependent static state, and `await` inside an `XCTAssert` autoclosure (which does not compile).
  - `review_swift_performance` -- work on the render path. Rules that only matter inside `var body: some View` are scoped to that block and silent elsewhere, so the same `DateFormatter()` is serious in `body` and minor outside it.

  **Structured output** via the MCP `outputSchema` / `structuredContent` contract rather than JSON stuffed into a text block: every review tool now returns markdown *and* typed data with `summary`, `score`, `counts`, `files_checked`, `issues`, and `suggestions`. `suggestions` deduplicates by rule -- forty literal-spacing findings produce one instruction, not forty. `score` is a published formula (`100 x (1 - penalty/capacity)`, `penalty = 10*blockers + 3*serious + 1*minor`) so it is reproducible rather than a vibe, and it is documented as **not comparable between projects**.

  `analyze_swift_project` gained project shape: UI framework, inferred architecture, dependencies, and DI detection. The architecture read always ships its **evidence**, and says `not determined` rather than guessing when signals are weak. DI is detected from `any Protocol` initializer parameters, not from a directory name.

### Fixed -- 2.1.0
- **A test fixture with unstable identity.** Six `PersistenceTests` failed in CI reporting `notFound` against rows that were demonstrably in the store. `Article.samples` was a computed `static var`, so it rebuilt the array on every access -- and `Article.init` defaults `id` to `UUID()`. Reading it twice produced two disjoint sets of identifiers, so a test that imported `Article.samples` and then looked up `Article.samples.first` was searching for a row that had never been written. It is now a `static let` with fixed identifiers derived from `UUID(uuid:)`, which is total and needs no force-unwrap.

  Worth recording honestly: **the first fix went after the wrong cause.** From the truncated CI log the failures looked like SwiftData failing to translate a `UUID` in `#Predicate`, and the identity was changed to a `String` on that theory. It did not help, because the predicate was never the problem. That change has been reverted rather than kept as a harmless-looking extra -- it carried a doc comment asserting a SwiftData limitation there is no evidence for, and folklore in a teaching repository is worse than no comment at all.

  The log was truncated because the workflow pipes `swift test` through `tail -60`; with 49 tests the failing assertions scrolled off and the job reported "6 failures" while showing only passing tests. A `if: failure()` step now prints the failing assertions and test names, and it identified the real cause on its first run.
- **`stripComment` truncated every line at the first `//`, including inside string literals.** `let base = "http://api.example.com"` became `let base = "http:`, so **every analyzer** was blind to the rest of any line containing a URL -- and the new `cleartext-http` rule could therefore never fire. Now string-literal aware, with escape handling. Found because a new test failed for a reason that made no sense.
- `await-inside-xctassert` fired on `XCTAssertTrue(x, "must be set before the await, not after it")` -- the word was in the assertion **message**, not the expression. Found by dogfooding the new analyzers against this repository's own SwiftData tests, where it reported a blocker in correct code. Fixed with a `withoutStringLiterals` helper; both directions are regression-tested.
- `.claude/agents/swift-reviewer.md` and `performance-reviewer.md` were enforced read-only by their tool grants but never said so in their descriptions. Since the main agent decides delegation from the description alone, the guarantee that made them safe to delegate verification to was invisible at the point of the decision. Both now state it.
- `.claude/agents/swiftui-modernization.md` was the only one of the ten subagents whose description stated what the agent *is* without stating when to *use* it. Delegation is decided by matching a task against that text, so the agent was measurably less likely to be selected than its nine peers. Found by running the new `lint_skill` against this repository.

### Fixed -- 2.0.1

- `ios-agent-mcp` reported version `1.0.0` from `--version` and, more consequentially, from the MCP `initialize` handshake -- so every connected client saw a version that did not match the package it had just installed. The version was a hardcoded constant in `mcp-server/src/index.ts` and nothing read `package.json` at runtime, so publishing under a new version could not correct it on its own. The constant, `mcp-server/package.json`, `skill.json`, and the `SKILL.md` frontmatter are now aligned on a single version.

  **Superseded by the generator described above.** Aligning the four files by hand fixed the symptom; it did not stop the next hand-edit from re-introducing it, which is what `mcp-server/scripts/sync-version.mjs` does by generating three of the four from `package.json`.

### Added -- 2.0.0 MCP server

Turns the repository from something you read into something you install. The skill teaches an agent how to *write* iOS code; the MCP server lets it *check* code that already exists.

- **`mcp-server/`** -- `ios-agent-mcp`, a TypeScript MCP server (stdio transport) exposing six iOS-specific tools:
  - `analyze_swift_project` -- structure (file/line counts, deployment target, Swift tools version, frameworks, test presence) plus a finding count per category with the tool that explains each.
  - `review_swift_concurrency` -- `@Observable` without `@MainActor`, `Task.detached`, `DispatchQueue.main.async`, `await MainActor.run` inside an isolated type, `@unchecked Sendable`, `nonisolated(unsafe)`, unstructured `Task` in `onAppear`, empty `catch`, non-final observable classes, and types named `Task` that shadow `_Concurrency.Task`.
  - `review_swift_architecture` -- initializers defaulting to live implementations, presentation code naming `URLSession`/`APIClient`/`ModelContext`, singletons resolved inside view models, the domain layer importing SwiftUI, nested `NavigationStack`s, and `NavigationView`.
  - `review_swiftui` -- fixed font sizes and heights, `AnyView`, deprecated `.cornerRadius`, literal spacing instead of tokens, materials over solid backgrounds, transient view state on models, `ObservableObject`, `@EnvironmentObject`, and `try!`.
  - `check_availability_guards` -- missing guards **and over-restrictive ones**: an iOS 26 API guarded at `#available(iOS 27, *)` compiles, ships, and silently drops every iOS 26 device to the fallback. Also flags Foundation Models used without a runtime `SystemLanguageModel.availability` check.
  - `audit_app_store_readiness` -- permission-gated frameworks with no Info.plist purpose string, a missing `PrivacyInfo.xcprivacy` (apps only -- libraries are never submitted), unlocalized user-facing strings, unlabeled icon-only buttons, and `print()` used for diagnostics.
- Every finding carries a file, a line, the severity, the consequence, the specific fix, and a link into this repo's docs. Analyzers are pure `(path, content) -> Finding[]` functions, so they are unit-testable without the MCP transport.
- **38 tests** -- unit coverage for every analyzer plus `test/server.smoke.test.js`, which launches the real server and speaks the real MCP protocol over stdio. Unit tests cannot tell you whether the server actually starts; that one can.
- **`docs/mcp/`** -- `installation.md` (Claude Code, Claude Desktop, Cursor, from source, troubleshooting, privacy), `tools.md` (every rule with its severity, and the limits of static analysis), `examples.md` (worked sessions, including how the tools pair with the subagents).
- **`mcp-server/mcp.json`** -- manifest declaring runtime, transport, filesystem-read-only permissions, and the tool list.
- CI gained an **`mcp-server`** job: install, typecheck, build, test, validate the manifest, and verify the manifest's tool list matches the tools actually registered in `src/index.ts` -- a tool advertised but not registered would be a broken promise to any client.

### Fixed -- 2.0.0
- Dogfooding the server against this repo's own `samples/SkillPatterns` surfaced two false positives in the analyzers, both fixed with regression tests: `empty-catch` matched `catch { }` inside a doc comment because that one check used a raw regex instead of the comment-stripping line walker every other rule uses; and `missing-privacy-manifest` fired on an SPM library, which has no Info.plist and is never submitted to App Review.
- `Package.swift` is no longer analyzed as application source -- it is build configuration, and including it inflated file counts and produced findings against code that is not part of the app.
- A `line` field in the availability analyzer held the matched source *string* rather than the line *number*; it type-checked only because of an unsafe `as unknown as` cast. Fixed, cast removed, regression test added.

### Added -- 1.4.0 adoption and maintenance

Shifts focus from adding documentation to making the repository verifiable and easy to adopt. The headline change is that the skill's core patterns are now **compile-checked in CI** rather than asserted in prose -- the standing caveat from every previous release.

- **`samples/SkillPatterns/`** -- an SPM package implementing the skill's core patterns as real, buildable Swift: `@MainActor @Observable` view models, inbound/outbound boundary protocols, a protocol composition root, typed `Hashable`/`Codable` routes, pure deep-link parsing, and actor test doubles. Strict concurrency is enabled, so an isolation regression fails the build. Several tests exist specifically to fail when a rule is broken -- a stale-index revert after an `await`, a `CancellationError` surfaced as a user-facing error, a launch-time deep link dropped instead of queued. Scoped deliberately to stable APIs (iOS 17 / macOS 14, no SwiftUI view code) so it builds on standard runners with `swift build`.
- **`docs/compatibility-matrix.md`** -- the canonical version reference. Separates the three things that get conflated (toolchain version, SDK version, deployment target), lists per-feature availability floors for iOS 17/18/26/27 and Swift 5.9-6.4, framework minimums, and the rule that a compile-time `@available` guard does not replace a runtime availability check.
- **`docs/migration/swift-6-migration.md`** -- Swift 5.9 -> 6 -> 6.4, organized around the compiler errors you actually hit (main-actor isolation, `Sendable` conformance, `@Sendable` capture, non-concurrency-safe statics, non-Sendable across actor boundaries, delegate callbacks) with the fix for each, a recommended migration order, and what not to do.
- **`docs/migration/ios-deployment-migration.md`** -- separates rebuilding against a newer SDK from raising a deployment target, since they are independent decisions. Covers the iOS 26 Liquid Glass adoption and the iOS 27 **app resizability** opt-in that happens without a code change.
- **`docs/migration/xcode-migration.md`** -- Xcode 15 -> 16 -> 27, explicitly built modules, the stricter Previews engine, and an ordered procedure for diagnosing a post-upgrade failure.

### Changed -- 1.4.0
- CI (`docs-consistency.yml`) extended repo-wide: relative markdown links, backtick path references, code-fence languages and closure, and frontmatter consistency -- previously only `SKILL.md` and `README.md` were checked. All four checks are fence-aware and skip placeholder paths, so Swift like `[UInt8](data)` and template ellipses do not produce false positives.
- CI gained a **`sample-package`** job on `macos-latest` that runs `swift build` and `swift test` against `samples/SkillPatterns`.
- `SKILL.md`: routing-table entries for the compatibility matrix and the three migration guides; the toolchain section now points at the matrix as canonical rather than restating floors; new **Versions & Migration** and **Samples & Templates** index sections. Version 1.4.0.
- README: **What's New in 1.4**, a Versions & Migration documentation index, a Compile-Checked Sample section, and a link from Supported Platforms to the canonical matrix.

### Added -- 1.3.0 Apple Intelligence and the iOS 27 toolchain

Content verified against Apple's current developer documentation (Xcode 27 beta, Swift 6.4, WWDC26 sessions) rather than written from model memory -- the API surface below post-dates the authoring model's training data.

- **`docs/frameworks/foundation-models.md`** -- the framework reference: `LanguageModelSession` lifecycle, `@Generable`/`@Guide` structured output, `PartiallyGenerated` streaming, the `Tool` protocol, built-in Vision-backed system tools, model selection (`SystemLanguageModel` vs. `PrivateCloudComputeLanguageModel`), the open `LanguageModel`/`LanguageModelExecutor` provider protocols, Dynamic Profiles with baton-pass and phone-a-friend orchestration, multimodal `Attachment` prompts, context/token/usage APIs, concurrency rules, error handling, the two-layer availability model, and testing that asserts shape rather than exact output.
- **`docs/frameworks/apple-intelligence.md`** -- which framework to reach for (App Intents vs. Foundation Models is the most common mistake), the privacy model for on-device / Private Cloud Compute / third-party models and what may honestly be claimed in UI, App Intents, Image Playground, Visual Intelligence, and designing features that degrade when no model is available.
- **`docs/tooling/xcode-27-agents.md`** -- Xcode coding agents, routing between an in-Xcode agent and Claude Code, agent-assisted localization (and what still needs a human: plurals, RTL, truncation), agent-assisted testing, the Swift Concurrency instrument for actor contention, and keeping non-Claude agents bound by this skill's rules via hooks.
- **`docs/tooling/device-hub.md`** -- Device Hub, the device/configuration test matrix, **iOS 27 app resizability** (rebuilding against the SDK auto-opts you in), accessibility passes, and reproducing device-specific bugs on their exact configuration.
- **Four new subagents** -- `foundation-models` (availability gating and graceful degradation), `swiftui-modernization` (behavior-preserving legacy migration with an ordered migration table), `accessibility-reviewer` (read-only VoiceOver/Dynamic Type/contrast audit with greps), `performance-reviewer` (measures before recommending; never optimizes on suspicion). Ten subagents total.

### Changed -- 1.3.0
- `SKILL.md` frontmatter: added `swift-version: 6.4`, `xcode-version: 27`, `ios-sdk-version: 27`, and a `supports` list (Foundation Models, Apple Intelligence, Private Cloud Compute, Xcode Coding Agents, Device Hub, Liquid Glass, SwiftData, Swift 6 strict concurrency). Deployment floor stays `minimum-ios: 17.0` / `minimum-swift: 5.9` -- the toolchain version and the deployment floor are different things and are now named separately. Version 1.3.0.
- `SKILL.md`: new **Target Platforms and Toolchain** section with a per-feature version-floor table, and the rule that availability guards use the version where a symbol was *introduced*, not the newest SDK.
- `SKILL.md`: new **Xcode 27 agent integration** subsection under How You Operate -- routing between Xcode agents and Claude Code, and the three rules that hold regardless of which agent wrote the code. This propagates to `AGENTS.md` and the other 23 mirrors, which is the only way to add a section to `AGENTS.md` (it is generated).
- `docs/swift/swift-concurrency.md`: Swift 6.4 ergonomics (`weak let`, `~Sendable`, unhandled-task-error warnings, async in `defer`, `@diagnose` for ratcheting strictness), a 16-point **Actor Isolation Review Checklist**, and a Foundation Models thread-safety section (single-flight sessions, off-main-actor tools, cancellation in streaming loops).
- `docs/swiftui/state-and-data-flow.md`: states explicitly that Observation is the default for new code and why `ObservableObject` is legacy.
- `docs/design/design-tokens.md`: Liquid Glass noted as refined in iOS 27, with the availability guard deliberately **kept at iOS 26** -- bumping it to 27 would drop every iOS 26 device to the fallback for no reason.
- `docs/orchestration/router.md`: routes for Foundation Models, accessibility, performance, and modernization work.
- `.claude/agents/ios-plan.md`: a Version compatibility section -- Swift 6.4 / Xcode 27 / iOS 27 SDK baseline, per-symbol availability floors, and the rule that raising a deployment target is a product decision.
- `.claude/agents/swift-reviewer.md`: review checks for Swift 6.4 isolation (discarded task errors, `@unchecked Sendable` that `weak let`/`~Sendable` would solve, unexplained `@diagnose(ignore,)`), availability correctness, and Foundation Models / Apple Intelligence usage including privacy-claim accuracy.
- README: a **Supported Platforms** section and a What's New in 1.3 section; tooling and AI documentation index entries; the subagent table extended to ten.

### Added -- 1.2.0 agent-operations layer

The repository taught the main agent what to write but never how to operate. This release adds the orchestration layer: how to split work, verify it, and scale it out. Because `AGENTS.md` and the other 23 rule files are generated from `SKILL.md`, the operating model lands in all of them.

- **`docs/orchestration/`** -- six documents forming the agent-ops layer:
  - `router.md` -- the entry point. One table deciding inline vs. delegate vs. loop vs. `/batch` vs. dynamic workflow, plus standard sequences (feature, bug, drive-a-red-suite-green, codebase-wide change) and what the main agent stays accountable for after delegating.
  - `subagents.md` -- why delegate (context preservation, independent verification, parallelism), frontmatter reference, why the `description` is the routing interface, tool restriction as a correctness feature, writing delegation prompts for a cold agent, and the distinction between subagents (hub-and-spoke, report only to the main agent) and agent teams (peer-to-peer, experimental, disabled by default).
  - `looping.md` -- turn-based, goal-based, time-based, and proactive patterns; the GOAL / CHECK / MAX / ON-STALL contract every loop declares up front; stall detection (identical failure, oscillation, growing blast radius); and the rule against reaching a stop condition by weakening the check.
  - `verification.md` -- the evidence contract. Every claim labelled VERIFIED, INSPECTED, or UNVERIFIED; what counts as evidence and what does not; iOS-specific verification commands; separation of duties so the author never grades the work; and the three enforcement layers ordered cheapest-first.
  - `dynamic-workflows.md` -- the scale ladder, when `/batch` fits (5-30 isolated PRs, worktree per unit) and when it does not (shared files, ordering constraints, exploratory work), script-driven orchestration, failure policies, and cold-start cost control.
  - `hooks.md` -- hook vs. CI vs. reviewer subagent, lifecycle events, the exit-code contract, and design rules including graceful degradation.
- **`.claude/agents/`** -- six subagent definitions with restricted tool sets and explicit return formats: `ios-explore` (read-only, parallel-safe search), `ios-plan` (read-only planner), `swift-reviewer` (read + Bash, deliberately no write tools), `swift-debugger` (reproduce -> isolate -> fix -> prove, with a Swift failure-pattern table), `swift-refactorer` (behavior-preserving, requires a green baseline), and `ios-docs` (enforces the doc structure and mirror sync). Names are prefixed `ios-`/`swift-` so they cannot shadow Claude Code's built-in subagents.
- **Hooks in this repository** -- `.claude/settings.json` now wires three hooks implemented in `scripts/hooks/`: `guard-generated-files.sh` (PreToolUse -- denies edits to the 24 generated mirrors and points at `SKILL.md`), `sync-mirrors-on-edit.sh` (PostToolUse -- regenerates mirrors whenever `SKILL.md` changes), and `verify-repo.sh` (Stop -- runs the CI checks before a turn can end).
- **`templates/hooks/`** -- drop-in hooks for real iOS projects: `swift-format.sh` (SwiftFormat + SwiftLint autocorrect), `forbid-antipatterns.sh` (blocks the `SKILL.md` anti-patterns at write time with line numbers and the fix; exempts test/mock/preview files from app-code-only rules), `build-check.sh` (Stop-time build and test verification that reports UNVERIFIED rather than implying a build it could not run), plus `settings.json.example` and installation notes.
- **`SKILL.md` -- "How You Operate" section** -- the verification evidence rule, when to delegate and when not to, the subagent roster, the loop contract, the scale-up table, and the instruction to let hooks decide what hooks can decide. This propagates to `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, and the other 21 mirrors.
- CI (`docs-consistency.yml`) and the Stop hook now also validate subagent frontmatter (`name`, `description`, kebab-case naming).

### Changed
- `SKILL.md` version bumped to 1.2.0; `skill.json` follows.
- `SKILL.md` document-routing table extended with the six orchestration triggers.
- README gained a "What's New in 1.2" section and an Agent Operations documentation index covering the orchestration docs, the six subagents, and the three hook templates.

### Added -- 1.1.0 skill revision
- `docs/design/design-tokens.md` -- three-tier token architecture (primitive -> semantic -> component), swappable themes via `@Environment`, dark-mode elevation rules, a Dynamic Type compliance checklist, materials vs. Liquid Glass (`glassEffect`, `GlassEffectContainer`) with an availability fallback, and a WCAG contrast helper you can assert in tests.
- `docs/swiftui/deep-linking-and-routing.md` -- typed `Route` enums, a `@MainActor` `Router`, deep-link parsing split into a pure testable parser plus an applier, universal links via `onContinueUserActivity`, queuing links that arrive before the app is ready, `NavigationPath` state restoration through `@SceneStorage`, and per-tab stacks.
- `docs/frameworks/data-concurrency.md` -- the "pass the identifier, not the object" rule for SwiftData and Core Data, `@ModelActor` background importers with batched saves, `performBackgroundTask`, batch delete/update with change merging, and in-memory stores for tests.
- `docs/testing/mocking-strategy.md` -- the three-tier strategy: Tier 1 test doubles (stub/fake/spy/mock, and why a reconfigured double must be a reference type), Tier 2 rich `#if DEBUG` mocks with one preview per screen state, Tier 3 `AppConfiguration` launch flags and a QA debug menu, each with a release branch that ignores it.
- `scripts/sync-mirrors.sh` -- regenerates all 24 agent rule files from `SKILL.md`, with a `--check` mode.
- `.github/workflows/docs-consistency.yml` -- CI enforcing mirror sync, `SKILL.md` frontmatter validity, existence of every referenced documentation path, and absence of placeholder stubs in Swift templates.

### Changed
- `SKILL.md` frontmatter expanded to the full Agent Skills schema (`name`, `description`, `version`, `license`, `allowed-tools`, `metadata`), with a trigger-rich description so agents load it on the right tasks.
- `SKILL.md` gained a **When to Load This Skill** section (including when *not* to load it and a trigger-to-document routing table) and a **How These Docs Are Structured** section defining the Context -> Pattern -> Anti-Patterns convention plus six non-negotiable code rules.
- `patterns/clean-architecture.md` now declares explicit inbound (use-case) and outbound (repository) boundary protocols. The presentation layer depends on `any …UseCaseProtocol` existentials only, previews run with no network, the `DependencyContainer.shared` singleton is replaced by an `AppDependencies` protocol injected through `@Environment`, and an IoC review checklist with verification greps was added.
- `patterns/mvvm.md` rewritten around `@MainActor @Observable final class` view models: isolation rationale, re-entrancy and stale-index guidance, `Task` vs `Task.detached`, child-view observation traps, and reference-type test doubles.
- `docs/swiftui/state-and-data-flow.md` gained sections on `@Observable` isolation, five child-view observation traps, async boundaries in views, a property-wrapper decision checklist, and an anti-pattern summary.
- `docs/swift/swift-concurrency.md` gained an "Isolation in SwiftUI Code" section covering escaping the main actor, four isolation-leak shapes, `MainActor.assumeIsolated`, `nonisolated(unsafe)`, re-entrancy, and Sendable across the SwiftUI boundary.
- `CONTRIBUTING.md` mirror-sync instructions now point at the script instead of a hand-rolled `cp` loop that would have copied the YAML frontmatter into all 24 mirrors.

### Fixed
- `patterns/clean-architecture.md`: `catch { self.error = nil }` silently discarded every non-`DomainError` failure.
- `patterns/mvvm.md`: the sample model was named `Task`, shadowing `_Concurrency.Task` so that `Task { … }` in the same file did not compile; renamed to `TodoItem`.
- `patterns/mvvm.md`: the `toggleCompletion` revert test mutated a struct double *after* injecting it, so the view model never saw `shouldFail` and the test asserted nothing.
- `patterns/mvvm.md`: optimistic updates wrote back through an array index captured before an `await`.
- Removed `.github/workflows/ruby.yml`, a leftover GitHub starter workflow that ran `bundle exec rake` against a repository with no Ruby in it.

### Added
- `LICENSE` (MIT) -- previously referenced in README but absent from the repo.
- `docs/frameworks/arkit.md` -- complete ARKit guide covering world/face/body/image/object/geo tracking, plane and mesh detection, RealityKit integration, world map persistence, and lifecycle handling.
- `docs/frameworks/realitykit.md` -- complete RealityKit guide covering ECS, `RealityView`, `ARView`, PBR materials, animation, physics, gestures, audio, and platform differences across iOS/macOS/visionOS.
- `CONTRIBUTING.md` -- contributor workflow, house style, and instructions for keeping the 25+ rule files in sync.
- `CODE_OF_CONDUCT.md` -- Contributor Covenant 2.1.
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`.
- `.github/PULL_REQUEST_TEMPLATE.md`.
- `templates/ios-app/Tests/AppTests.swift` -- Swift Testing example (modern, iOS 18+).
- `templates/ios-app/Tests/AppXCTests.swift` -- XCTest example (works back to iOS 13).
- README references for the new framework docs and tests template.

## [1.0.0] -- 2026-04

### Added
- Xcode project-first workflow in README and `SKILL.md` -- generators produce `.swift` files, not `.xcodeproj`.
- Color contrast and readability rules promoted to non-negotiable status in the agent brain.
- AI setup guide (`docs/ai-setup-guide.md`) covering 28 AI tools across macOS and Windows.
- Universal AI-agent compatibility -- `.cursorrules`, `.clinerules`, `.continuerules`, `.kilocoderules`, `.roorules`, `.rules`, `.windsurfrules`, plus rule files under `.aiassistant/`, `.amazonq/`, `.augment/`, `.continue/`, `.cursor/`, `.junie/`, `.kilocode/`, `.roo/`, `.tabnine/`, `.trae/`, `.windsurf/`, and `.github/copilot-instructions.md`.
- Codex compatibility: `SKILL.md`, `skill.json`, `install.sh`.
- iOS 18 animations, UIKit animation system, third-party Lottie/Rive integration guides.
- 26 new framework docs: AI/ML (`coreml`, `vision`, `natural-language`, `speech`, `on-device-ai`), hardware (`core-bluetooth`, `core-motion`, `core-nfc`, `healthkit`, `homekit`), services (`contacts`, `eventkit`, `passkit`, `weatherkit`), security (`cryptokit`, `device-integrity`), and the TCA architecture pattern.
- Ultimate font catalog (`docs/design/fonts-catalog.md`) -- every iOS font, 100+ Google Fonts, 15 pairings, variable fonts, international families.
- Interaction standards, button styles, `ViewState` pattern, and full coverage across the four checklists (App Store submission, performance, security, testing).
- Complete UI design system -- color palettes, typography, stunning UI patterns.
- Initial commit: agent brain, MVVM/Clean Architecture/Coordinator/Repository/Error Handling patterns, iOS-app and multiplatform-app templates, GitHub Actions + Fastfile CI/CD templates.

[Unreleased]: https://github.com/Nagarjuna2997/ios-agent-skill/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Nagarjuna2997/ios-agent-skill/releases/tag/v1.0.0
