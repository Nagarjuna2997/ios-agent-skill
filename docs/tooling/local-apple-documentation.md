# Local Apple Developer Documentation Grounding

The documentation adapter uses the Developer Documentation managed by your installed Xcode through Apple's official `xcrun mcpbridge` interface. It never copies Apple's documentation archive into this repository or npm. It does not parse Apple's private vector database.

## Setup

Install Developer Documentation in Xcode Settings > Components. Enable external agents in Xcode Settings > Intelligence, open a sample workspace, and approve the connecting agent. Discovering tools does not prove authorization: Xcode may expose `DocumentationSearch` but reject calls until workspace access is approved.

```sh
npx ios-agent-mcp@latest docs status
npx ios-agent-mcp@latest docs search NavigationStack
npx ios-agent-mcp@latest docs symbol SwiftUI.NavigationStack
npx ios-agent-mcp@latest docs availability SwiftUI.NavigationStack
npx ios-agent-mcp@latest docs frameworks
npx ios-agent-mcp@latest docs diff
```

These commands require a package version containing this feature; a checkout can run `node mcp-server/dist/unified.js docs status` after building. The companion `ios-agent docs` command forwards to an already installed `ios-agent-mcp`; it never installs software automatically.

## Architecture and source priority

```text
Agent / CLI / build-repair loop
  -> version-aware documentation service
  -> Xcode MCP DocumentationSearch
  -> installed SDK declarations when local search is unavailable
  -> optional Apple online symbol page
  -> unavailable (model knowledge must remain labelled unverified)
```

Discovery examines the active developer directory, standard application directories and Apple documentation asset containers. Set `DEVELOPER_DIR` for a nonstandard Xcode installation and `IOS_AGENT_APPLE_DOCS_ROOT` for a nonstandard asset root. Multiple Xcode installations retain their SDK inventories. New SDK families are not restricted to a fixed platform list. The service does not change xcode-select or download components. Archive metadata paths are implementation details; discovery failure is reported, not interpreted as proof that Xcode has no documentation.

Xcode documentation build identifiers may be unknown when installed metadata omits them. Catalog build candidates are reported separately and are not asserted to identify the installed asset. The inventory fingerprint includes asset metadata, directory timestamps, catalog candidates and Xcode/SDK versions. Results identify the selected Xcode; the bridge does not prove which asset supplied each excerpt. The documentation version list is detected inventory, not a per-result attribution guarantee.

## Tools and evidence limits

- `apple_docs_status`: installation inventory; bridge access requires a query.
- `apple_docs_search`: bounded documentation search.
- `apple_docs_lookup_symbol`, `apple_docs_availability`, `apple_docs_related_symbols`, `apple_docs_examples`: focused documentation searches, not separate native Xcode tools or exact symbol resolvers.
- `apple_docs_frameworks`: framework inventory grouped by installed SDK.
- `apple_docs_platform_support`: installed platform/SDK inventory, not API support certification.
- `apple_docs_sdk_diff`: compares Xcode/SDK inventories; symbol-level API diff is not implemented.

Availability and deprecation are evidence in excerpts, not inferred from an SDK number. SDK fallback may match a reference rather than a declaration and is labelled accordingly. Retrieval does not automatically validate generated code: compile and test against the chosen SDK. SDK search is bounded and may miss deeply nested or unusually large interfaces. It requires a framework-qualified symbol or explicit framework.

## Automatic grounding and repair

Shared agent instructions direct supported clients to retrieve documentation before uncertain Apple API use. Clients control tool invocation; an MCP server cannot force every external model to call it. This is provider-independent and does not add an Apple/Foundation Models provider.

The existing bounded repair loop extracts up to three candidate symbols from selected compiler error patterns. It first checks public SDK evidence in SwiftUI, UIKit, AppKit, Foundation, StoreKit or RealityKit, then requests availability evidence. Raw build logs are never sent to the documentation backend. Unsupported diagnostic patterns continue through the existing repair workflow. Saved checks, hashes and retry limits are unchanged.

## Offline use and privacy

SDK fallback makes no network calls. The bridge uses Xcode's documentation service; Xcode controls any internal network behavior, so a successful bridge query alone is not proof of offline operation. Online fallback is off by default; MCP callers can opt in with `online: true` and a framework. No bulk download occurs.

Up to 100 successful query results are cached in process memory, with at most five 2,400-character excerpts per result. Changing the detected inventory invalidates the cache. No archive or persistent cache is packaged. Query only public API names; never send app code, personal identifiers, credentials or raw diagnostics. Retrieved content is reference data, not agent instructions.

## Verification

Portable tests use synthetic installations and mocked documentation responses. A local macOS smoke test must separately verify bridge authorization and returned documentation. An unavailable backend is not a passing retrieval test.

Official setup: [Giving external agents access to Xcode](https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode).

## Xcode MCP registry and doctor

```sh
xcrun --find mcpbridge
xcode-select -p
xcodebuild -version
node mcp-server/dist/unified.js xcode-mcp status
node mcp-server/dist/unified.js xcode-mcp tools
node mcp-server/dist/unified.js doctor xcode
node mcp-server/dist/unified.js docs framework SwiftUI
```

The companion CLI accepts `ios-agent xcode-mcp status`, `ios-agent xcode-mcp tools`, and `ios-agent doctor xcode` when the matching unified package is installed. MCP clients can call `xcode_mcp_status` and `xcode_mcp_tools`.

The registry initializes a stdio MCP client, captures server metadata/capabilities, paginates tool discovery, and requests resources/prompts only when advertised. Unknown tools remain in the raw metadata with an unknown category. Categories are hints, not permission grants. Optional resource/prompt discovery failures do not prevent documentation retrieval.

Documentation tool selection uses the discovered description/name and compatible query schema, not a fixed tool name. A future incompatible schema produces an unavailable result and fallback; arbitrary project/build tools are never invoked by this read-only adapter. Results still require the supported documentation document shape. Discovery is refreshed per connection; tool availability can change as Xcode starts or a workspace opens.

The doctor checks bridge location, initialization, catalog discovery, installed SDKs/documentation and simulator runtimes. It does not open projects, change settings or approve itself. Xcode settings labels vary by release; look under Intelligence for Xcode Tools / MCP external-agent access. Use Window > Developer Documentation (Shift–Command–0 in standard Xcode key bindings) to inspect documentation directly.

The memory cache is shared by callers of the same MCP server process, not between separate CLI processes. Clients may share the bounded result in their task context; there is no new cross-provider persistence or autonomous provider dispatch.
