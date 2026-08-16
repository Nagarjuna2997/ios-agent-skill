# ios-simulator-mcp

`ios-simulator-mcp` is the runtime companion to `ios-agent-mcp`.

- `ios-agent-mcp` is static, read-only, cross-platform Swift analysis.
- `ios-simulator-mcp` is macOS/Xcode runtime control for a booted iOS Simulator.

This package is the first safe slice of v4.0: **Build -> Run -> See -> Judge -> Fix**.

## Tools

| Tool | Backend |
|---|---|
| `simulator_list` | `xcrun simctl list devices available --json` |
| `simulator_boot` | `xcrun simctl boot` |
| `simulator_shutdown` | `xcrun simctl shutdown` |
| `build_project` | `xcodebuild build` |
| `run_tests` | `xcodebuild test` |
| `install_app` | `xcrun simctl install` |
| `launch_app` | `xcrun simctl launch` |
| `terminate_app` | `xcrun simctl terminate` |
| `open_deep_link` | `xcrun simctl openurl` |
| `screenshot` | `xcrun simctl io screenshot` |

No tool erases a simulator or resets app state in this first release. Destructive reset flows need an explicit guard in a later version.

## Install From Source

```bash
cd ios-simulator-mcp
npm install
npm run build
```

Then configure an MCP client to launch:

```bash
node /path/to/ios-simulator-mcp/dist/index.js
```

## Requirements

- macOS
- Xcode command-line tools
- an available iOS Simulator runtime

The unit tests do not require Xcode. They validate command construction with a fake runner.
