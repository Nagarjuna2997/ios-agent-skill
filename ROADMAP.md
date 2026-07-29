# Roadmap

What is planned, what it costs, and what is deliberately not decided yet.

**Priority is set by demand, not by this document.** Issues are open for
everything below — 👍 the ones you want. If nobody asks for a feature, it does
not get built.

---

## v2.0.0 — shipping now

The static analysis server. Reads Swift, reports defects, runs anywhere.

- [x] Six analysis tools (concurrency, architecture, SwiftUI, availability, App Store, overview)
- [x] 41 tests including real MCP protocol round-trips
- [x] Compile-checked sample package in CI
- [ ] Published to npm
- [ ] GitHub Release tagged
- [ ] Verified in a real Claude Code / Claude Desktop / Cursor install

**Design constraint that defines this release:** no Xcode, no simulator, no
network, no writes. `npx -y ios-agent-mcp` works on macOS, Linux, and Windows.
Everything below breaks that constraint, which is why it ships separately.

---

## The split: analysis vs. automation

Everything after v2.0.0 drives a **booted iOS Simulator**. That is a different
product with different requirements:

| | `ios-agent-mcp` (v2.0.0) | `ios-simulator-mcp` (planned) |
|---|---|---|
| Runtime | Node, any OS | **macOS + Xcode + booted simulator** |
| Permissions | `filesystem: read`, `network: none` | Controls your simulator |
| Install cost | ~26 KB | Xcode (~15 GB) |
| Use for | Reviewing Swift you have | Driving a running app |

**These ship as separate packages.** Bundling them would mean anyone who wants
a Swift linter needs a full Xcode install. Same repository, same rule
philosophy, different runtime contract.

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

1. **v2.0.0 ships and gets used.** Downloads, issues, and install problems come first.
2. **Demand decides v2.1's order.** Every feature above has an issue. The ones with 👍 get built.
3. **v3.0 starts with the spike**, not with features.

The failure mode this avoids: building ten automation tools on the wrong
backend, then discovering the first real user needed something else entirely.

## Contributing

The `simctl` tier is genuinely approachable — each tool is one subprocess call,
one Zod schema, and one test. Issues are labelled `good first issue` where that
applies. See [CONTRIBUTING.md](CONTRIBUTING.md).

What a new tool needs, same as the existing six:

- A `description` that says **when** to use it, not just what it does
- Structured output with a location and a concrete next step
- A test that **fails without the feature** — a test that passes either way is not a test
- Honest failure: no simulator booted must produce a clear error, never a silent no-op
