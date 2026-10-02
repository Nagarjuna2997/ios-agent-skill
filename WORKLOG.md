# Autonomous work log

## Run 2 — iOS build agent (branch `agent/overnight`, 2026-10-02, 02:40–12:40 CDT)

### Environment facts

- The session runs in a Linux cloud container (Node 22.22, Python 3.12) with a clone of the repository. Headless Claude Code (`claude -p`, 2.1.287) is authenticated there, so the agent's planning and code generation ran for real.
- The owner's Mac is reached in two ways. A file bridge into a Linux VM is used for copying files and git. Computer use, enabled at about 04:05 after the owner granted permission, gives Finder and Device Hub (the Xcode 27 simulator app) with full input, and Xcode with clicks only. Terminal is also limited to clicks, so `xcodebuild`, `xcrun simctl` and XcodeGen were never run from a shell. All builds went through Xcode's Product menu.
- Mac toolchain observed: Xcode 27.0 (welcome window), the iPhone 18 Pro Simulator on iOS 27.0, and Swift 6 language mode.
- Work paused from about 04:36 to 11:46 while a permission prompt (Device Hub access) waited for the owner.
- Persistence: there is no push. The branch is written as a git bundle to `work/autonomous-run/agent-overnight.bundle` on the Mac and fetched into the local repository there.

### Clock

| Phase | Start | End | Note |
|---|---|---|---|
| 0 Orient | 02:40 | before 03:14 | end not logged |
| 1 Core loop | after Phase 0 | 03:14 (`90f5096`) | loop tested against fake tools; real examples came later in Phase 2d |
| 2 Capability system and catalog | 03:14 | 12:22 (`ee9504f`) | includes the 04:36–11:46 pause; compile check 04:10–04:30, examples 11:47–12:22 |
| 3 Planning, cost, progress UX | implemented in Phase 1 (`90f5096`) | 12:22 | budget dedupe fix `913da10`; the real runs exercised PLAN.md, progress lines and preflight |
| 4 README and handoff | 12:03 | 12:40 | README, CHANGELOG, version 3.9.0 / 2.10.0, this log |

### Results

- MCP server tests: 432 at the start of Run 1, 444 at the start of Run 2, 489 at the end, all passing. Docs Consistency (22 checks) and `scripts/hooks/verify-repo.sh` pass at every commit. The `mcp-server` CI job (10 checks) passed at `96603fb`.
- Capabilities: 161 catalog entries in 30 categories. There are 33 modules: 0 verified, 33 untested, 0 blocked, 128 planned-only. All 33 passed the combined compile check: a clean build with Xcode 27.0 for the iPhone 18 Pro Simulator in Swift 6 mode, 69 Swift files, one warning from the prebuilt Lottie binary.
- Examples (`examples/agent`): habit tracker, notes app, three-tab app and the food-delivery composite. Each was planned and written by `ios-agent-mcp build` in the cloud session, which stopped at its toolchain gate. Each was then built in Xcode with no errors on the first build and run in the simulator, with screenshots. The composite has 20 modules, the Lottie package and the WidgetKit extension target from the built-in project writer. The agent's own `xcodebuild` fix loop and `simctl` screenshot steps did not run against real tools.

### Commits (Run 2)

| Commit | Summary |
|---|---|
| `56492ec` | docs: record unreleased 3.8.2 changes and bump skill manifests (end of Run 1) |
| `90f5096` | feat(agent): agent loop, 13 MCP tools, `/ios-build` command, PLAN.md, RUN_REPORT.md, resume, refine, preflight |
| `c26fe88` | ci: markdown link check skips gitignored `mcp-server/data` |
| `61c7b0c` | feat(capabilities): capability system, catalog, 13 P0 modules |
| `ff9abe6` | feat(agent): WidgetKit extension target from `addWidget` |
| `5e4835b` | feat(capabilities): Home Screen widget and Live Activity modules |
| `d0a1a1f` | feat(capabilities): 15 P1 modules, contrast-checked brand colors |
| `8283830` | feat(capabilities): combined compile check on Xcode 27.0, `compileCheck` evidence, 3 more modules, fixes found by the build |
| `42df61c` | feat(agent): built-in Xcode project writer; XcodeGen optional |
| `4d2d723` | fix(capabilities): `ScaledSpacing` stored directly on views (runtime warnings in a generated app) |
| `3453dea` | docs(examples): three agent-generated apps built and run on Xcode 27 |
| `96603fb` | docs: README opens with the agent; CHANGELOG; versions 3.9.0 / 2.10.0 |
| `913da10` | fix(agent): budget counts a shared cost once |
| `ee9504f` | docs(examples): food-delivery composite built and run on Xcode 27 |

### Judgment calls

- **Examples are real but split across two machines.** Plan and code came from the agent in the cloud. The build and run happened in Xcode on the Mac by clicking. The examples README says this plainly, and the original RUN_REPORT.md files, which say `failed (toolchain missing)`, are kept unchanged. No fake-toolchain output is presented as a run.
- **Compile evidence is not `verified`.** A new manifest field, `compileCheck`, records the combined build. `status` stays `untested` because `verify` (one module per minimal app, through the agent's own `xcodebuild` path) never ran. A GUI build of each module's minimal app was not substituted for it.
- **Built-in project writer instead of the templates fallback.** Without a shell on the Mac, XcodeGen could not run. The brief allowed a fallback, so the spec is rendered into a folder-synchronized `.xcodeproj` (objectVersion 77) with membership exceptions for build excludes and the extension. XcodeGen stays the first choice when installed. This is what made the four examples buildable.
- **Scheme edit for the composite screenshots.** The tabs sit behind sign-in, and typed text did not reach the simulator. So `-ios-agent-screen restaurants`, the agent's own launch argument, was added to the shared scheme of the Mac copy only.
- **StoreKit for physical goods.** The composite request asked for StoreKit at checkout, and the agent obliged with a note that the module "needs adapting". The examples README records that App Review requires a payment method other than in-app purchase for physical goods.
- **CLI name.** `ios-agent-mcp build`, not a new `ios-agent` binary: `cli/` is a separate published package that `mcp-server` depends on. The brain is headless Claude Code instead of a new Agent SDK dependency.
- **Costs.** Only the Apple Developer Program amount (99 USD per year, read on Apple's page on 2026-10-02) is recorded as an amount. Every other entry has a cost model and a note, never a price.
- **Defaults.** Apple-native defaults per category. Lottie is an alternative; the animation default (`swiftui-animations`) is still catalog-only.
- **Lottie version.** `lottie-spm` is pinned `from: 4.5.0`. Xcode resolved it to 4.6.1 on the Mac.
- **Version bump.** Skill 3.8.2 to 3.9.0 and `ios-agent-mcp` 2.9.0 to 2.10.0, both in files only. Install paths keep the published 2.9.0 pin, because 2.10.0 does not exist on npm.

### Found by running (fixed)

- Swift 6: `BackgroundRefresh.run` sent a non-Sendable closure. It now uses `isolation: isolated (any Actor)? = #isolation`.
- Swift 6: the `PhotosPicker` label closure read main-actor state. The title initializer is used instead.
- Swift 6: `UIImagePickerController.isSourceTypeAvailable` was called from a nonisolated context. `CameraCapture` is now `@MainActor`.
- Runtime: a `DynamicProperty` stored in `@State` caused "Accessing Environment's value outside of being installed on a View" in two generated apps. The module guidance is fixed.
- Budget: the Apple Developer Program fee was counted twice in the composite PLAN.md.
- The SwiftData template now sets `cloudKitDatabase: .none`. Otherwise an iCloud entitlement from another module would start syncing models that do not meet CloudKit's rules. This was found by reading, while adding the sync module.
- Observed on the Mac: `device_commit_files` once delivered a stale archive under a reused file name. Later transfers used new names and were checked on the Mac side.

### Tried and not kept

- Typing into the simulator and toggling a SwiftUI `Toggle` by click both failed. The screens that need input show empty states.
- The CapCheck compile project was first built with a throwaway Python generator. It was replaced by `scripts/capability-compile-check.mjs`, which a second clean build confirmed.

### Needs the owner

1. Delete the `.git/_to_delete` folder in `/private/tmp/ios-agent-apple-resources-20260929`. It holds git lock files that the session could not remove.
2. Review `agent/overnight` in that Mac repository, which was fetched from the bundle. Then push it, or merge into `main`, yourself.
3. On the Mac, in Terminal: `cd mcp-server && npm ci && npm run build`, then `node dist/unified.js build "A habit tracker with a list, a detail screen, and settings with dark mode toggle" --out ~/habit-tracker`. This is the first run of the agent's own build-and-fix loop and `simctl` screenshots. Then `node dist/unified.js capabilities verify --all --write ../capabilities` to mark modules `verified`.
4. In Claude Code: `node mcp-server/dist/unified.js install-command --global`, add the MCP server, and try `/ios-build`. This path has not been run in a Claude Code session.
5. Credentials for full examples: a Supabase project (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) for email sign-in, and your API's `API_BASE_URL`. Sign in with Apple, iCloud containers, App Groups and push notifications on a device need an Apple Developer Program membership.
6. Publishing: `npm publish` of `ios-agent-mcp` 2.10.0, a `v3.9.0` tag and a GitHub Release, all after review. Then move the install-path pins from 2.9.0 to 2.10.0.

# Run 1 — maintenance (2026-10-02, 01:50–02:40 CDT)

Working copy: a fresh clone of `main` at `0e5cb39`. All commits are authored as the repository owner, with no AI attribution.

## Backlog (prioritized; size: XS < 1h, S 1–2h, M 2–4h)

| # | Item | Size | Status |
|---|---|---|---|
| 1 | Studio: resolve CLI tools from the login-shell PATH on macOS (commit prepared before this run) | S | done (`72f6e50`) |
| 2 | Sync stale skill version `3.5.0` in `skill.json`, `gemini-extension.json` and both Codex `plugin.json` files with `SKILL.md`/CHANGELOG `3.8.1`; add a check so they cannot drift again | S | done |
| 2b | Active client manifests pin `ios-agent-mcp@2.7.0` (Gemini extension, Codex plugin `.mcp.json`, builder skill commands) although 2.9.0 is published (`npm view`); update after verifying the published 2.9.0 artifact, and extend the check to pins | S | done |
| 3 | Issue #12 follow-up: add the issue's exact reproduction and remaining formatter true positives as regression tests (the fix itself is already on `main`) | XS | done |
| 4 | Remove the stray bare ProductHunt URL from README (owner preference: promotion through owned channels only) | XS | done |
| 5 | CONTRIBUTING "Swift 5.9+" modern-first wording contradicts the toolchain the skill targets (Swift 6.4 / Xcode 27, deployment floor iOS 17) | XS | done |
| 6 | Deprecated SwiftUI/UIKit APIs in guide prose and samples (`NavigationView`, `.foregroundColor`, `UIScreen.main`, two-parameter `onChange`, `UIApplication.shared.windows`, `.autocapitalization`, `.cornerRadius`, `PreviewProvider`); fix unlabelled uses and add a regression check | M | done |
| 7 | External markdown link check; fix confirmed dead links | S | done, no dead links found in the verifiable set |
| 8 | MCP server: 15 of 67 registered tools are never exercised by a test; add at least one test per tool | M | done |
| 9 | `install.sh`: add a hermetic test (local remote, idempotent re-run, refusal cases) | S | done |
| 11 | `docs/mcp/tools.md` is described as the full tool reference but documented 22 of 67 tools; generate a complete index from a live `tools/list` and check it in CI | S | done |
| 12 | `docs/mcp/knowledge-server.md` pinned 2.4.0, cited eleven analyzer tools and 96 update pages; checked the published 2.9.0 knowledge binary (8 tools, HTTP `/health`) and the 98-entry bundle | XS | done |
| 13 | Copilot adapter described its pinned 2.7.0 server as 35 tools; the published 2.7.0 lists 36 (it omitted `prepare_issue_report`) | XS | done |
| 10 | CHANGELOG Unreleased, version bump, final log | S | pending |

## Baseline (before any change in this run)

Measured on Linux (Ubuntu 24.04, Node 22.22, Python 3.12). No Swift toolchain, Xcode or simulator is available in this environment: Docker Hub and download.swift.org are blocked by the network policy, and Ubuntu has no `swiftlang` package. macOS-only CI jobs (CLI on macOS/Windows, simulator MCP, Swift sample packages, Reading List acceptance, backend patterns, system integration demo, Studio macOS job) could not be run here.

| Suite | Result |
|---|---|
| `mcp-server` `npm test` | 432 tests, 432 pass |
| `mcp-server` typecheck, build, version sync, manifest (67 tools), private feedback, benchmark harness, integration registry | pass |
| `cli` `npm test` (Linux) | 70 tests, 70 pass |
| `ios-simulator-mcp` `npm test` (Linux) | 16 tests, 16 pass |
| `studio` `node --test` | 47 tests, 46 pass, 1 skipped (macOS-only export test); includes 6 new tests from commit 1 |
| Docs Consistency workflow (18 steps: mirrors, frontmatter, links, backtick paths, code fences, contrast, Apple directory, local index) | all pass |
| Site discovery tests and site build | pass |
| `scripts/hooks/verify-repo.sh` | pass |
| `benchmarks/v2` harness contracts, observability parser tests | pass |
| `benchmarks/v2/harness.py validate --lane portable` | fails locally only because Swift is missing (B01/B02 `fixture_error`, T01–T05 `infrastructure_error`); CI runs it in the `swift:6.2.3` container |

## Orientation findings

- Toolchain: `SKILL.md`/`skill.json` target Swift 6.4, Xcode 27, iOS SDK 27, with deployment floor iOS 17 / Swift 5.9. The task brief mentioned Swift 6.2 / iOS 26 / Xcode 26; the repository is already ahead of that, so nothing was downgraded.
- Clients: README documents four supported families (Claude, ChatGPT/Codex, Gemini CLI, Muse Code). The per-client rule files listed in the brief (`.cursor`, `.windsurf`, `.roo`, …, `CONVENTIONS.md`, `replit.md`, `.github/copilot-instructions.md`) do not exist in the repository; they were removed when the project consolidated to these families. They were not recreated.
- Mirrors: `CLAUDE.md`, `AGENTS.md` and `GEMINI.md` are byte-identical to `SKILL.md` minus frontmatter, generated by `scripts/sync-mirrors.sh` and enforced in CI. No change needed.
- README badges are Tests, Docs and npm downloads only; there are no Swift/Xcode version badges to correct.
- Verified README numbers: 67 MCP tools (live `tools/list`), 405 Apple technologies (`docs/apple/technologies.json`), 20 benchmark microtasks (`benchmarks/cases.json`), 99 tracked catalog entries.
- Issue #12 (JSON codec false positive): already fixed on `main` with regression tests for both codecs inside and outside `body`.
- Issue #13 (efficiency metrics): already implemented in `benchmarks/observability/` with parser tests.
- Issue #14 (v2 diagnostic benchmark): 30 fixtures, harness and contracts already exist. The documented remaining gate is proof of an isolated agent filesystem boundary (container or macOS VM), which cannot be provisioned here.

## Judgment calls

- `ios-agent-mcp` pins: moved the Gemini extension, the Codex plugin `.mcp.json` and both builder skills from 2.7.0 to 2.9.0, the version `npm view` reports as latest. Verified the published 2.9.0 tarball answers `initialize`, lists 67 tools and runs `new … --brief … --xcodegen`; Gemini CLI 0.62.0 `extensions validate` passed. `gemini mcp list` reported the server as Disconnected on a cold npx cache and then Disabled, so the docs do not claim a Gemini connection to 2.9.0. The unmaintained Copilot adapter (`plugins/ios-agent-copilot`, still 2.7.0 with a 35-tool description) was left unchanged because README describes experimental adapters as not maintained and its tool description would need a separate audit. Dated blog/series evidence keeps the version it tested.

- No push credentials are available in this environment (the git proxy refuses this repository, and committing through the browser was blocked by the session's safety policy). Commits are made locally on `main` and saved after each commit as a git bundle in the owner's local `work/autonomous-run/` folder, so nothing is lost. Pushing is listed under manual actions.
- Issue comments cannot be posted for the same reason; the intended comment text is recorded below instead.

- README contained a bare ProductHunt URL with no surrounding text between the footer links and the backend section. It was removed because the owner promotes only through owned channels. The ProductHunt entry on the community-monitor page was kept: it is a listings monitor, not promotion.

- Deprecated-API audit: fixed 13 unlabelled uses in guide/checklist samples (`UIScreen.main` ×7 including three snapshot-test frames that `.image(on:)` already sizes, `.foregroundColor` ×4, `.autocapitalization` ×2) and the prose recommendation in `docs/uikit/animations.md`. Labelled counter-examples (WRONG blocks, the legacy `PreviewProvider` section, the iOS 14–16 `onChange` form) were kept. `.cornerRadius(_:)` (22 uses) was not changed: the iOS 17 SDK marks it with a future deprecation rather than a compiler warning, and replacing it without a compiler is not worth the risk. None of the edited Swift could be compile-checked here (no Swift toolchain); the edits are mechanical replacements with iOS 17-available APIs (`foregroundStyle`, `textInputAutocapitalization`, `traitCollection.displayScale`, `GeometryProxy.bounds(of:)`). The new `scripts/check-deprecated-apis.py` flags exactly these 10 fenced uses on the pre-fix tree and none after.

- External links: relative links are already enforced by CI. Locally verified every `github.com/Nagarjuna2997/ios-agent-skill/blob|tree/main/...` link against the tree, the seven third-party GitHub repositories with `git ls-remote` (plus XcodeGen's `Docs/ProjectSpec.md` on `master`), and six vendor documentation pages (OpenAI ×2, ChatGPT Learn, Gemini CLI, Claude Code, MCP registry) by fetching them. All resolved. The 569 hand-written and roughly 8,400 generated developer.apple.com links, and the remaining vendor hosts, could not be checked: both this environment and the linked Mac's sandbox are refused by the network policy. Nothing was removed on the basis of an unreachable host.

- `install.sh` was already idempotent and refused unsafe targets. Added `IOS_AGENT_SKILL_REPO_URL` (defaulting to the GitHub URL) so tests can use a local bare remote, and explicit messages when clone or update fails. Six hermetic tests cover help/usage errors, instruction-only clients, default targets, idempotent re-runs and fast-forward updates, refusal of dirty/other-branch/other-origin/non-checkout/symlink targets, missing git and an unreachable remote. A mutation check (removing the clone-failure message) fails the suite. The new CI job runs them on Ubuntu and macOS; only the Linux run happened here.

- Added a macOS CI job for `samples/ColorSystem`, whose README documents `swift test` but which no workflow ran. It could not be run here (no Swift). Its three tests were checked statically against `palette.json` (35 light keys, matching keys across four appearances, distinct dark values, opaque uppercase sRGB hex), and `ColorPreview.swift` is behind `#if canImport(UIKit)`, so a macOS host build excludes it. If this job is red on the first push, revert commit "ci: run the ColorSystem sample tests on macOS".
- `samples/ScreenshotStudio` has no Swift package, and `studio/templates/LivePreviewTests.swift` is a UI-test template that needs an app target, so neither got a CI job.

## Commits

| Commit | Description |
|---|---|
| `72f6e50` | fix(studio): resolve CLI tools from the login shell PATH on macOS |

## Tried and reverted

None yet.

## Needs manual action

- Push local `main` to GitHub (see the bundle note above).
