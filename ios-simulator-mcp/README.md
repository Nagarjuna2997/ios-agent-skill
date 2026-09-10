# iOS Simulator runtime and sidebar preview

Published as `@nagarjuna2002/ios-simulator-mcp@0.2.0`. Requires a Mac with full Xcode and an installed iOS Simulator runtime. The unscoped npm package is a different project.

Run as a local MCP server:

```bash
npx -y @nagarjuna2002/ios-simulator-mcp@0.2.0
```

Call `simulator_environment` to discover actual device support, `simulator_list` to select a UDID, and `simulator_show` to boot/wait/open it. Build, install and launch the app, then call `simulator_preview_start` and open the returned URL in your browser/sidebar. Use `simulator_preview_stop` to close it.

For a booted device, start the viewer directly:

```bash
npx -y @nagarjuna2002/ios-simulator-mcp@0.2.0 --viewer DEVICE-UDID
```

The viewer refreshes screenshots. Touch and keyboard interaction happen in the native Simulator window. It binds only to loopback, uses a private URL token, and has no HTTP app-control endpoints. It is not a cloud-hosted simulator. Stop with Ctrl-C; closing a viewer does not shut down its device.

The 14 MCP tools cover environment/device discovery, native window display, preview start/stop, boot/shutdown, project build/tests, app install/launch/termination, deep links and screenshots. `screenshot` can optionally return a PNG image with `includeImage: true`; by default it reports the saved file. No tool erases a device. No runtime or Xcode download happens automatically.

Duo profiles are discovered from installed Xcode, not hardcoded. Apple described Duo Device Hub support as upcoming on September 9, 2026; inspect your local environment before claiming support.

Full workflow and client configuration: [simulator guide](../docs/tooling/ios-simulator-mcp.md). Current Duo guidance: [iPhone Duo](../docs/platforms/iphone-duo.md).

From source, run `npm ci`, `npm run build`, `npm test`, then `node dist/index.js`. Unit tests exercise fake command runners and a real loopback viewer; actual Xcode/device evidence must be reported separately.
