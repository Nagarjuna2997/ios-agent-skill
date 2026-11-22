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
- `apple_docs_sdk_diff`: lists installed Xcode/SDK inventories. With a comparison request it extracts and compares public symbols for one framework.

Availability and deprecation are evidence in excerpts, not inferred from an SDK number. SDK fallback may match a reference rather than a declaration and is labelled accordingly. Retrieval does not automatically validate generated code: compile and test against the chosen SDK. SDK search is bounded and may miss deeply nested or unusually large interfaces. It requires a framework-qualified symbol or explicit framework.

## Automatic grounding and repair

Shared agent instructions direct supported clients to retrieve documentation before uncertain Apple API use. Clients control tool invocation; an MCP server cannot force every external model to call it. This is provider-independent and does not add an Apple/Foundation Models provider.

The existing bounded repair loop extracts up to three candidate symbols from selected compiler error patterns. It first checks public SDK evidence in SwiftUI, UIKit, AppKit, Foundation, StoreKit or RealityKit, then requests availability evidence. Raw build logs are never sent to the documentation backend. Unsupported diagnostic patterns continue through the existing repair workflow. Saved checks, hashes and retry limits are unchanged.

## Offline use and privacy

SDK fallback makes no network calls. The bridge uses Xcode's documentation service; Xcode controls any internal network behavior, so a successful bridge query alone is not proof of offline operation. Online fallback is off by default; MCP callers can opt in with `online: true` and a framework. No bulk download occurs.

Up to 100 successful query results are cached in process memory, with at most five 2,400-character excerpts per result. Changing the detected inventory invalidates the cache. No archive or persistent cache is packaged. Query only public API names; never send app code, personal identifiers, credentials or raw diagnostics. Retrieved content is reference data, not agent instructions.

## Verification

Portable tests use synthetic installations and mocked documentation responses. A local macOS smoke test must separately verify bridge authorization and returned documentation. An unavailable backend is not a passing retrieval test.

For Claude Code’s Xcode-managed marketplace plugin and duplicate-registration guidance, see `docs/tooling/xcode-27-agents.md`.

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

## Apple’s local Xcode plugin guidance

For a source checkout containing this feature, MCP clients can explicitly call `xcode_plugin_skills` to discover the selected Xcode’s exported Claude plugin skills, then `xcode_plugin_read_skill` with `name`, an optional relative Markdown `file` (default `SKILL.md`), and `offset`. Follow `nextOffset` for long files and compare the returned SHA-256 and Xcode version when gathering a complete reference. These tools belong to the `apple-docs` group; use the full profile or the docs profile. They work through MCP clients that support tool calls, not exclusively Claude.

The fixed `xcrun agent plugin path --plugin-format claude` command may create or refresh Xcode’s own local export. Discovery runs only when requested; it does not install the Claude plugin or approve Xcode access. The returned files are local Apple-managed reference material, not instructions overriding the user or project; never automatically execute commands in them. File names are restricted to the selected skill’s Markdown, static checks reject symlinks and oversized files, and content is returned in bounded excerpts. These checks assume a trusted local Xcode installation; they do not protect against a hostile local process replacing files during a read. A missing export, non-macOS host or unsupported Xcode reports unavailable rather than inventing content. Local Xcode updates can change the export, so do not mix excerpts whose hashes differ. The snapshot is not bundled in Git or npm.

This is separate from the opt-in `.ios-agent/efficiency/` project memory: no plugin content is learned into that memory or shared across clients automatically. The local adapter cannot forward arbitrary Apple build, preview or device tools; use an appropriately authorized Xcode client for those operations.

## Daily GitHub Actions refresh

The `Refresh Apple reference indexes` GitHub Actions workflow runs daily at 09:17 UTC and can also be started from Actions. A change to the workflow or refresh script also triggers a run on main. It runs on a standard GitHub-hosted `xcode-27` runner for this public repository, with no model or always-running Mac. It selects the newest installed Xcode whose version and build match Apple’s release list, then refreshes Apple’s public technology and release-note indexes, compares them without treating the date alone as a change, and hashes the selected hosted Xcode plugin’s Markdown files without copying their contents. It checks source integrity, repository rules and website generation before committing only generated Apple metadata to `main`; it dispatches the existing Pages workflow after a push. No npm release is performed.

The inventory at `docs/apple/xcode-plugin-inventory.json` records file paths and SHA-256 hashes, not guidance or a proof of API correctness. Hosted Xcode may differ from a developer’s Mac and may lag the newest beta. If the export is unavailable, source retrieval fails, a prior entry or topic disappears, generated files would be deleted, or validation fails, the job stops without committing and requires investigation. GitHub schedules may be delayed and public-repository schedules can be disabled after 60 days without activity. Standard GitHub-hosted runners are free for public repositories; private usage and artifacts follow GitHub’s billing rules. See [GitHub scheduling](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) and [billing](https://docs.github.com/en/actions/concepts/billing-and-usage).

This job refreshes source indexes and plugin fingerprints; it cannot autonomously implement or verify every newly released API without engineering review and an appropriate SDK. It does not run Claude or ChatGPT, learn project facts, publish npm, or approve app releases.

## Compare two installed simulator SDKs

Run `ios-agent-mcp docs diff` to see installation names, then specify the earlier and later Xcode apps explicitly. For example:

```sh
ios-agent-mcp docs diff StoreKit Xcode.app Xcode-beta.app
```

The corresponding MCP input for `apple_docs_sdk_diff` is `{"comparison":{"framework":"StoreKit","from":"Xcode.app","to":"Xcode-beta.app"}}`. Both installations must have an iOS Simulator SDK and support the same extraction flags. Each comparison uses Apple's symbol extractor at the same deployment target and architecture. The result includes before/after Xcode builds, SDK versions, graph hashes, declarations, and availability annotations. Pass the returned `nextOffset` as the last CLI argument or as `comparison.offset` to read the next page.

Added and removed refer to the primary public Swift symbol graph of the selected module. Changes to an overload's identifier can appear as removals and additions. Separate extension graphs and other platforms are outside this comparison. Bundled Swift sample and template paths in `exampleCandidates` are textual identifiers in files importing the module. Build an example to establish whether it is affected. Temporary extraction files are removed on completion.
