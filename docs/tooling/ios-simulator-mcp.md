# iOS Simulator MCP

## Context

Use this when the task needs evidence from a running app: screenshots, videos, logs, deep links, accessibility trees, gestures, app install/launch, or repeated design iteration.

Do not add these tools to `ios-agent-mcp`. The existing package is intentionally a read-only static analyzer that runs without Xcode, without a simulator, without network, and without writes. Simulator control has a different runtime contract: macOS, Xcode, a booted simulator, and user-visible side effects.

## Package Boundary

| Package | Contract | Good for |
|---|---|---|
| `ios-agent-mcp` | Read project files, analyze Swift, return findings | Concurrency, architecture, SwiftUI, security, testing, performance, App Store readiness |
| `ios-simulator-mcp` | Drive Xcode and a booted simulator | Build, test, install, launch, open native Simulator and preview screenshots |

The split keeps a Swift linter lightweight while still giving agents a path to runtime validation.

## Sidebar preview and current device discovery

Published package: `@nagarjuna2002/ios-simulator-mcp@0.2.0` (the scoped name belongs to this repository; the unscoped npm name belongs to a different publisher).

Use `simulator_environment` to inspect installed Xcode, runtimes and actual device types. For iPhone Duo, see `docs/platforms/iphone-duo.md`; do not claim a profile exists before discovery confirms it.

1. Call `simulator_list` and choose a real UDID.
2. Call `simulator_show` to boot, wait and open the native Simulator window.
3. Build, install and launch the app with the existing runtime tools.
4. Call `simulator_preview_start`. Open the returned loopback URL in the client's browser/sidebar, or any browser on the same Mac.
5. Interact in the native Simulator window. The browser shows refreshed screenshots with pause and fit controls; it does not send taps or keyboard input.
6. Call `simulator_preview_stop` when done. This removes preview screenshots and closes its listener; it leaves the Simulator running.

From a terminal, for a device that is already booted:

```bash
npx -y @nagarjuna2002/ios-simulator-mcp@0.2.0 --viewer DEVICE-UDID
```

Open the printed URL. Stop with Ctrl-C. It is an opt-in local viewer, not a cloud simulator or a public sharing link. The browser viewer does not upload screenshots. When `screenshot` uses `includeImage: true`, pixels are sent to the MCP client and may be processed by its model/provider. The tokenized URL grants access to simulator screenshots while running, so treat it as private.

### Optional MCP configuration

Add this server to a local MCP-capable client (Claude Desktop/Code, Codex or Gemini CLI) on a Mac with Xcode:

```json
{
  "mcpServers": {
    "ios-simulator": {
      "command": "npx",
      "args": ["-y", "@nagarjuna2002/ios-simulator-mcp@0.2.0"]
    }
  }
}
```

Adapt the surrounding configuration format to the client. The portable knowledge plugin stays independent of Xcode; simulator control is opt-in. Hosted ChatGPT cannot reach another computer's localhost just by installing this package. Use a local client for runtime control; screenshots can be returned as MCP images by calling `screenshot` with `includeImage: true`.

## Current Package

The first executable slice now lives in `ios-simulator-mcp/`. It is deliberately
separate from `ios-agent-mcp` because it requires macOS, Xcode, and simulator
side effects.

Install from source:

```bash
cd ios-simulator-mcp
npm install
npm run build
node dist/index.js --help
```

Implemented tools:

| Tool | Purpose | Backend |
|---|---|---|
| `simulator_environment` | Inspect Xcode, runtimes and device profiles | `xcodebuild`, `xcode-select`, `simctl list` |
| `simulator_show` | Boot, wait and open native Simulator | `bootstatus`, `open` |
| `simulator_preview_start` / `simulator_preview_stop` | Start/stop private loopback screenshot viewer | local HTTP + `simctl io screenshot` |
| `simulator_list` | List available device instances | `xcrun simctl list --json` |
| `simulator_boot` | Boot a simulator by UDID | `xcrun simctl boot` |
| `simulator_shutdown` | Shut down a booted simulator | `xcrun simctl shutdown` |
| `build_project` | Build an app or test target | `xcodebuild build` |
| `run_tests` | Run tests with captured result output | `xcodebuild test` |
| `install_app` | Install an `.app` bundle | `xcrun simctl install` |
| `launch_app` | Launch by bundle identifier | `xcrun simctl launch` |
| `terminate_app` | Terminate by bundle identifier | `xcrun simctl terminate` |
| `open_deep_link` | Open a URL or universal link | `xcrun simctl openurl` |
| `screenshot` | Capture a PNG for review | `xcrun simctl io screenshot` |

## Planned Tool Surface

Next, extend the deterministic Apple-tooling tier:

| Tool | Purpose | Backend |
|---|---|---|
| `record_video` | Record and stop simulator video | `xcrun simctl io recordVideo` |
| `stream_logs` | Capture app logs with predicates | `xcrun simctl spawn log stream` |
| `reset_app_state` | Reset one app's container and permissions | app uninstall/install or container cleanup |

Add UI-driving tools only after the backend spike chooses XCUITest, WebDriverAgent, or idb:

| Tool | Purpose |
|---|---|
| `inspect_accessibility_tree` | Return visible elements, labels, roles, frames, enabled state |
| `tap` | Tap by accessibility id, text, or coordinates |
| `double_tap` | Double tap an element or point |
| `long_press` | Long press with a duration |
| `swipe` | Swipe by direction or coordinate path |
| `type_text` | Type into a focused or targeted field |
| `wait_for_element` | Poll until an element appears, disappears, or changes state |

## Safety Rules

- Never erase all simulator content without explicit user approval.
- Prefer resetting one app's state over resetting the entire simulator.
- Return exact command output, screenshot paths, video paths, and log excerpts as evidence.
- Capture simulator identity in every result: device name, UDID, runtime, app bundle id, and build configuration.
- Time-bound every long-running command and return handles for recording/log streams.
- Do not claim visual correctness from a build alone. A visual task needs a screenshot or video.
- Do not type secrets into apps unless the user explicitly provides test credentials for that run.

## Evidence Contract

Every runtime tool should return structured data suitable for workflow branching:

```json
{
  "status": "passed",
  "device": {
    "name": "iPhone 17 Pro",
    "udid": "SIMULATOR-UDID",
    "runtime": "iOS 27.0"
  },
  "app": {
    "bundle_id": "com.example.App",
    "configuration": "Debug"
  },
  "artifacts": {
    "screenshot": "artifacts/screens/home.png",
    "video": "artifacts/videos/flow.mov",
    "logs": "artifacts/logs/app.log"
  },
  "summary": "Launched app and captured home screen."
}
```

For failure results, include the failing command, exit code, stderr, and the nearest useful artifact. A failed build with no artifact is still useful evidence; a visual claim with no artifact is not.

## Anti-Patterns

```text
// WRONG: add simulator control to ios-agent-mcp
Why: makes every static-analysis install depend on Xcode and a booted simulator.

// RIGHT: create ios-simulator-mcp with a macOS/Xcode runtime contract.
```

```text
// WRONG: treat screenshot capture as enough for UI automation.
Why: screenshots prove pixels, not element identity or accessibility state.

// RIGHT: pair screenshots with accessibility-tree inspection once a UI backend is chosen.
```

```text
// WRONG: expose "reset simulator" as a casual command.
Why: erasing content is destructive and surprises users.

// RIGHT: expose reset_app_state first, and require approval for simulator erase.
```
