# Autonomous work log

## Run 2 — iOS build agent (branch `agent/overnight`, started 02:40 CDT, 2026-10-02)

### Environment facts (decide everything below)

- This session runs in a Linux cloud container (x86_64, Ubuntu 24.04, Node 22.22, Python 3.12) with a clone of the repository. The owner's Mac is reachable only through a file bridge into a Linux VM (no Xcode, no Swift). Driving macOS Terminal through computer use was refused: the Claude app has no macOS Screen Recording permission, and the owner could not grant it.
- Therefore `xcodebuild`, `xcrun simctl`, XcodeGen and the iOS Simulator cannot be run in this session. Swift is not installable either (Docker Hub, download.swift.org and apt have no route or package).
- Headless Claude Code (`claude -p`, 2.1.287) is authenticated here, so the language-model half of the agent (planning, code generation, error repair prompts) can be exercised for real.
- Consequence for the brief: the Phase 1 definition of done (three apps built, launched and screenshotted) and every capability `verify` cannot pass tonight. Everything is built so that it runs on a Mac with Xcode, unit-tested here against fake `xcodebuild`/`xcrun`/`xcodegen` executables, and every capability is `status: untested`. No example screenshots or RUN_REPORT files from a fake toolchain are presented as real runs.
- Persistence: there is no push. After each checkpoint the branch is written as a git bundle into the owner's `work/autonomous-run/` folder and fetched into the Mac's local repository as branch `agent/overnight` (main and its worktree are not touched).

### Clock

| Phase | Start | End |
|---|---|---|
| 0 Orient | 02:40 | not logged (before Phase 1) |
| 1 Core loop | after Phase 0 | 03:14 (`90f5096`) |
| 2 Capability system and catalog | 03:14 | |

### Backlog

| # | Phase | Item | Size | Status |
|---|---|---|---|---|
| A1 | 1 | Agent toolchain layer: command runner with per-call log, toolchain detection, preflight with install commands | S | done (`90f5096`) |
| A2 | 1 | Project layer: app spec, XcodeGen `project.yml` renderer, create/write-files/add-package with out-dir containment, xcconfig + gitignored `.env` secrets | M | done (`90f5096`) |
| A3 | 1 | Build layer: `xcodebuild` invocation and structured error/warning parser; run/screenshot/logs via `simctl` with dynamic simulator choice | M | done (`90f5096`) |
| A4 | 1 | MCP tools `ios_create_project`, `ios_write_files`, `ios_add_package`, `ios_build`, `ios_run`, `ios_screenshot`, `ios_logs` (+ `ios_preflight`), schemas, unit tests, fake-toolchain integration tests | M | done (`90f5096`) |
| A5 | 1 | Loop orchestrator: plan → create → capabilities → generate → build/fix (max 8) → run → screenshots → RUN_REPORT.md; wall-clock cap, attempt cap, state.json, progress lines | M | done (`90f5096`) |
| A6 | 1 | Entry points: `/ios-build` slash command; `ios-agent-mcp build` CLI with a headless-Claude brain | S | done (`90f5096`); CLI uses `claude -p`, untested against Xcode |
| B1 | 2 | Capability contract (manifest schema, recipe, template, apply.ts, verify.ts), loader/validator, resolver with dependencies and defaults | M | done |
| B2 | 2 | `capabilities/catalog.json` landscape and generated `CATALOG.md` | M | done |
| B3 | 2 | P0 capability modules, then P1/P2 as time allows (all `untested`) | L | P0 done (13 modules, all untested) |
| C1 | 3 | PLAN.md with capability choices, credentials and budget; progress lines; resume; refine; preflight | M | pending |
| D1 | 4 | README first screen, generated capability table, CHANGELOG, minor version bump, final log | M | pending |

### Judgment calls (Run 2)

- **No example apps committed.** The three Phase 1 examples and the food-delivery composite need Xcode to build, launch and screenshot. A run against the fake toolchain would produce a RUN_REPORT and PNGs that look real but prove nothing, so none are committed. The examples are listed under "needs the owner" with exact commands.
- **CLI name.** The terminal entry point is `ios-agent-mcp build`, not a new `ios-agent` binary: `cli/` is a separate published package that `mcp-server` depends on, and adding the agent there would invert that dependency. The brain is headless Claude Code (`claude -p`, tools disabled) instead of a new Agent SDK dependency, because it is already installed and authenticated wherever `/ios-build` would run.
- **Capability build check is per module, on a Mac.** `ios-agent-mcp capabilities verify` builds a module into a minimal app with its `VerifyUsage.swift`; only a passing run writes `verification.json` and flips the status to `verified`. The loader refuses `status: verified` without that file, so a hand edit cannot claim it.
- **Costs.** Catalog entries carry a cost model and a note, never a price. A module manifest carries an amount only when it was read on the vendor page this session (Apple Developer Program, 99 USD/year, checked 2026-10-02). The Supabase pricing page was not fetched, so `email-password-auth` has no amount.
- **Defaults.** Each category's default is Apple-native where Apple has a framework (Sign in with Apple, SwiftData, StoreKit 2, MapKit, Swift Charts, RealityKit, UserNotifications, Keychain). Third-party modules (Supabase email auth, Lottie) are alternatives. Lottie is not the animation default; the default (`swiftui-animations`) is still catalog-only, so requesting the category `animation` reports it as not built.
- **iOS floor.** The generated app's deployment target is iOS 17.0, raised to the highest `minOS` of the applied modules. `realitykit-3d` needs iOS 18 (`RealityView` camera API) and says so in its usage text.
- **Lottie package version** `from: 4.5.0` of `lottie-spm` is taken from memory of the package's releases, not checked online this session; the first Mac verify run resolves it.
- **Link check scope.** The markdown link check now skips `mcp-server/data/` (gitignored build output holding a copy of `capabilities/`, whose relative links only resolve in the source tree). It was failing locally after `npm run build`; CI never builds before that step.
- **Swift not type-checked.** No Swift compiler can be installed here, so the module Swift is reviewed against the local guides (for example RealityKit section 16, StoreKit, Swift Charts) but never compiled. Every module stays `untested`.

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
