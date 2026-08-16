# Roadmap

What is planned, what it costs, and what is deliberately not decided yet.

**Priority is set by demand, not by this document.** If nobody asks for a
feature, it does not get built. Nothing below has an issue filed yet — that is
deliberate, and step 4 explains when they get opened.

---

## Shipped

### v2.1.0 — the analysis server, finished

- [x] **Ten Swift analysis tools** — concurrency, architecture, SwiftUI,
      availability, memory, security, testing, performance, App Store, overview
- [x] **`lint_skill`** — the eleventh, and the only one that reads skill
      metadata rather than Swift
- [x] **Three resources** — `ios://project/info`, `.../dependencies`,
      `.../issues`
- [x] **Structured output** on every review tool via `outputSchema` /
      `structuredContent`, alongside the markdown
- [x] **Project shape** in `analyze_swift_project` — UI framework, inferred
      architecture *with its evidence*, dependencies, DI detection
- [x] **123 tests**, including real MCP protocol round-trips
- [x] Version generated from `package.json`; CI fails on drift
- [x] Compile-checked sample package — 49 Swift tests green on macOS CI

### v2.0.0 / v2.0.1 — first public release

- [x] Six analysis tools, 41 tests
- [x] Published to npm as `ios-agent-mcp`
- [ ] GitHub Release tagged
- [ ] Verified in a real Claude Code / Claude Desktop / Cursor install

**Design constraint that defines this line of releases:** no Xcode, no
simulator, no network, no writes. `npx -y ios-agent-mcp` works on macOS, Linux,
and Windows, in about 26 KB. Everything below breaks that constraint, which is
why it ships separately.

---

## The split: analysis vs. automation

Everything after the v2.x analysis line drives a **booted iOS Simulator**. That is a different
product with different requirements:

| | `ios-agent-mcp` (v2.0.0) | `ios-simulator-mcp` (v4.0 seed) |
|---|---|---|
| Runtime | Node, any OS | **macOS + Xcode + booted simulator** |
| Permissions | `filesystem: read`, `network: none` | Controls your simulator |
| Install cost | ~26 KB | Xcode (~15 GB) |
| Use for | Reviewing Swift you have | Driving a running app |

**These ship as separate packages.** Bundling them would mean anyone who wants
a Swift linter needs a full Xcode install. Same repository, same rule
philosophy, different runtime contract.

See `docs/tooling/ios-simulator-mcp.md` for the runtime package contract and
`docs/tooling/visual-iteration-loop.md` for the design-build-see-improve loop
that becomes possible once runtime artifacts exist.

---

## v2.x next — design and AI static review contracts

Before adding more MCP tools, define the output shape and the static/runtime
boundary. The planned tools are documented in
`docs/mcp/vnext-analysis-tools.md`:

- `review_ui_ux`
- `review_motion`
- `review_accessibility`
- `review_haptics`
- `review_realitykit`
- `review_metal`
- `review_foundation_models`
- `review_core_ai`
- `review_app_intents`
- `review_ai_security`
- `review_ai_evaluations`

These stay read-only and network-free. They inspect code for concrete evidence:
Dynamic Type gaps, missing Reduce Motion paths, unsafe GPU patterns, missing
AI availability gates, weak App Intents declarations, prompt/tool-call safety
risks, and absent evaluation datasets.

---

## v3.0 — design, motion, and native 3D specialists

Release name: **Apple Platform Intelligence**.

This tier teaches the skill to produce polished app surfaces before the runtime
MCP exists:

- [x] `ui-ux-designer`
- [x] `motion-designer`
- [x] `3d-experience-designer`
- [x] `patterns/ui/`
- [x] `patterns/motion/`
- [x] `patterns/3d/`
- [x] Native splash guidance in `patterns/motion/splash-screens.md`

The rule is native iOS first: SwiftUI, UIKit, RealityKit, SceneKit migration
guidance, ARKit, and Metal. No anime.js, Three.js, React, WebGL, or Babylon.js
dependencies belong in the core iOS skill.

### Catalog milestone

- [x] `frameworks.json` is the source of truth for Apple technology coverage.
- [x] `docs/apple-framework-index.md` is generated from the catalog.
- [x] README framework coverage counts are generated and checked by the repo hook.
- [x] VisionKit is covered as a meaningful UI/camera/vision gap.
- [x] Native-vs-web animation routing is documented for Anime.js, GSAP, Framer Motion, Three.js, PixiJS, p5.js, Matter.js, WebGL, WebGPU, CSS animation, and WKWebView decisions.

---

## v4.0 — runtime visual automation

Release theme: **Build -> Run -> See -> Fix**.

This is where `ios-simulator-mcp` becomes executable rather than just specified.
The first package slice is implemented in `ios-simulator-mcp/`:

- [x] build with `xcodebuild build`
- [x] test with `xcodebuild test`
- [x] list, boot, and shut down simulators
- [x] install, launch, and terminate an app bundle
- [x] open deep links
- [x] capture screenshots
- [ ] tap, swipe, long-press, type
- [ ] record video
- [ ] read logs
- [ ] inspect accessibility
- [ ] compare visual states
- [ ] loop with UI/UX, motion, accessibility, RealityKit, Metal, and performance reviewers

---

## v2.1 — the `simctl` tier

Every tool here is a thin wrapper over one `xcrun simctl` subcommand. Fast to
build, easy to test, no architectural risk.

| Feature | Mechanism | Notes |
|---|---|---|
| Screen recording (start/stop) | `simctl io recordVideo` | Long-running process; needs handle management |
| Open URL / deep link | `simctl openurl` | Also covers universal links |
| Install app | `simctl install` | `.app` bundles; `.ipa` needs extraction first |
| Uninstall app | `simctl uninstall` | |
| Reset app data | `simctl uninstall` + `install`, or container delete | "Erase all content" is `simctl erase` — destructive, needs a guard |
| Clipboard get/set | `simctl pbcopy` / `pbpaste` | |
| Dark mode toggle | `simctl ui appearance` | Also `content_size`, `increase_contrast` — worth exposing together |
| Location simulation | `simctl location set` | Supports a route, not just a point |
| Status bar override | `simctl status_bar` | Battery level/state, cellular bars, Wi-Fi, time. **Not** real network conditions — that is Network Link Conditioner |
| Screenshot | `simctl io screenshot` | Prerequisite for OCR later |
| Push notification | `simctl push` | Not on the original list; trivial once the pattern exists |
| Privacy grant/revoke | `simctl privacy` | Test permission flows without reinstalling |

### Corrections to the original plan

- **Hardware buttons (Home, Lock, Volume) are not in this tier.** `xcrun simctl`
  has no such subcommand. Pressing buttons requires `idb ui button` or a UI
  driver, so it moves to v3.0.
- **"Network simulation" is two different things.** Status-bar *appearance*
  (`status_bar`) is trivial. Actual bandwidth/latency shaping is Network Link
  Conditioner, a separate macOS profile — out of scope for a simctl wrapper.
- **Face ID / Touch ID** is not a documented `simctl` command. It works via
  `simctl spawn … notifyutil` against a private notification, which is brittle
  across Xcode versions. Feasible, but flag it as unsupported.

---

## v3.0 — UI automation

**Blocked on one decision**, deliberately not made yet:

### Spike: choose a UI automation backend

| Option | Pros | Cons |
|---|---|---|
| **XCUITest** | Apple's own; most stable across OS versions | Needs a test runner target; awkward to drive from outside a test bundle |
| **WebDriverAgent** | Mature, Appium ecosystem, well documented | Heavy; a separate server process; Appium-shaped API |
| **idb** | Purpose-built CLI, clean commands (`ui describe-all`, `ui tap`) | macOS-only, needs a companion daemon, Meta's release cadence is uneven |

This choice determines the shape of every tool below. **Prototype all three
against a real simulator before committing.** Getting it wrong means rewriting
the whole tier.

### Then, once the backend exists

- UI hierarchy inspector (`ui_tree`)
- Tap by text / accessibility identifier
- Wait for element (with timeout and poll interval)
- Type text
- Swipe gestures (up/down/left/right, and arbitrary coordinates)
- Hardware buttons (moved here from v2.1)
- OCR / read screen text — screenshot plus Vision on macOS, or a JS OCR library

---

## Later — only if demand appears

Each of these sits on top of the full UI driver, so none is reachable before
v3.0 lands.

- Natural language commands ("open Settings and enable Dark Mode")
- Auto-generated test flows
- Screenshot comparison / visual regression
- Crash log analyzer
- Performance metrics (CPU, memory, FPS)
- Accessibility checker at runtime — note the static version already exists as
  the `accessibility-reviewer` subagent and rules in `review_swiftui`

---

## How this gets prioritized

In order. Each step depends on the one before it.

1. ~~**Release the analysis server**~~ — done: `ios-agent-mcp` is on npm and
   2.1.0 finishes the tool set. Still outstanding: push the git tag, cut the
   GitHub Release, and verify the install in Claude Desktop plus one other MCP
   client.
2. **Gather feedback for one to two weeks** — fix bugs, improve docs, and watch
   what people actually ask for.
3. **Enable Discussions**, then use them for ideas and voting. Issues stay for
   actionable work; a feature request becomes an issue once it has demand behind
   it and someone can start on it.
4. **Open a focused backlog** — five to eight epics, not a long list of
   speculative tickets:

   - Simulator automation (`simctl` tier)
   - UI automation driver research *(spike — blocks the rest of v3.0)*
   - Screen recording
   - App management (install, uninstall, reset)
   - Deep links
   - Device state simulation (appearance, location, status bar, privacy)
   - OCR and UI inspection
   - AI automation

   Split an epic into individual issues **when work on it starts**, not before.

The failure mode this avoids: building ten automation tools on the wrong
backend, then discovering the first real user needed something else entirely.
A backlog written before anyone has installed the thing is a list of
assumptions.

### Where the issues live

Everything stays in **this repository** until the architecture settles.

`ios-simulator-mcp` now exists as a separate npm package in this repository,
because the runtime contract differs. Whether it also needs a separate
*repository* is not, and that only becomes clear once the UI driver spike lands.
Transferring issues later is possible; splitting prematurely is churn for no
gain.

## Contributing

The `simctl` tier is genuinely approachable — each tool is one subprocess call,
one Zod schema, and one test. Issues are labelled `good first issue` where that
applies. See [CONTRIBUTING.md](CONTRIBUTING.md).

What a new tool needs, same as the existing six:

- A `description` that says **when** to use it, not just what it does
- Structured output with a location and a concrete next step
- A test that **fails without the feature** — a test that passes either way is not a test
- Honest failure: no simulator booted must produce a clear error, never a silent no-op
