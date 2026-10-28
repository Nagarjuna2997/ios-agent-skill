# iOS Agent Studio — local workspace

The feature-branch workspace adds durable tasks, project management, native-project
imports, source inspection and a shared Codex/Claude transport. Read
[WORKSPACE.md](WORKSPACE.md) for current launch instructions, scope and remaining gaps.
The historical preview details below describe the engines this workspace reuses.

A local browser workspace that turns a small app idea into a multi-file SwiftUI project, then builds it and runs planned UI journeys on your Mac. It also keeps the original reading-list starter available. This is a local preview, not a hosted app builder.

```sh
node studio/server.mjs
```

Open http://127.0.0.1:8844. Requires Node 20+, macOS, Xcode, an installed iOS simulator, and an authenticated Codex or Claude Code CLI for planning/edits. Checking the starter does not require an AI account. Client subscription restrictions can still block requests even when the CLI is signed in.

## Workflow

1. Name your workspace, choose a client, and describe the app. Choose **Your own app idea** for a new app or **Reading-list starter** for the existing sample. The habit-tracker idea supplies an editable example.
2. Plan app. Review the proposed screens, acceptance criteria and automated UI journeys. Custom app journeys are frozen before coding; **Build plan** accepts that contract. Criteria outside automation are explicitly listed for manual review.
3. Build plan. The client proposes Swift files; Studio validates targets, backs up the revision and generates Xcode file references. Custom projects run their frozen UI journeys; the starter runs its existing independent unit/UI suite.
4. Inspect saved test captures, the build log and result. For a verified custom app, choose **Live simulator** to tap, swipe, type and relaunch the real simulator from the browser. Stop preview before editing. Live frames are development feedback, separate from saved acceptance evidence.
5. Describe a refinement in chat. Studio edits, tests, and makes at most one automatic repair attempt. Stop cancels the process group.
6. Export ZIP saves an archive in the workspace’s `exports/` folder. Use Project files to reveal it, or open the checked-in Xcode project. No signing or App Store submission is performed.

## Evidence and boundaries

- Custom apps begin with a neutral SwiftUI entry point, not a renamed reading-list app. The planner proposes 2–8 UI journeys; Studio generates XCTest code from a bounded action vocabulary. They are frozen before implementation and cannot be changed by source-only repairs. These are model-proposed checks, not an independent evaluation or guarantee of completeness. Review them before building. The optional starter still reuses `samples/ReadingList` and its independent tests.
- Custom projects support up to 24 Swift files under `App/`, including nested models, stores and views (500 KB total). Model responses can add, edit and explicitly remove these files. Studio owns Xcode settings, schemes, test sources and the verification runner. The reading-list starter retains its two-file limit. Packages, binary assets, hosted backend provisioning, production accounts, signing and device entitlements are not supported in this preview. The optional local development backend supports real HTTP persistence.
- Saves projects under `~/Library/Application Support/iOS Agent Studio`. Set `STUDIO_HOME` or `STUDIO_PORT` when needed. State writes are atomic; a restart labels interrupted jobs and preserves source, revision backups and completed evidence. Interrupted builds restart rather than being falsely marked complete. Multi-file writes use a recovery journal; an interrupted update rolls back to its previous revision before work resumes.
- Source and screenshot hashes protect previews from stale or modified evidence. Acceptance-file hashes are checked before and after verification. Undo invalidates old evidence. Export excludes derived data, logs, simulator evidence and Finder metadata files.
- Briefs, app source and bounded failure diagnostics go to the explicitly selected, locally authenticated coding client. Provider billing and data policies apply. Provider credentials are not collected. Local backend keys stay outside app source and exports; test runners inject them at launch.
- The server binds to loopback only and checks Host, Origin and a per-launch request token. This is a single-user local tool, not a multi-user security boundary. Generated Swift executes on your simulator; review it before using sensitive data. Do not expose this server to a network.
- Codex runs in read-only mode with user configuration excluded; Claude has no tools or external MCP servers. Returned file content is validated and written by Studio. The existing simulator runner remains the authority for tests.
- The browser UI reuses the project website’s design: the same light and dark color tokens, system typography, floating frosted header, pill buttons and rounded cards. The workspace is a chat column beside the live simulator. It works at narrow and wide widths with a persistent light/dark preference, visible errors and keyboard controls.

## Checks

```sh
node --test studio/test/*.test.mjs
```

The tests use synthetic process adapters. Real client and simulator results are recorded separately in `VALIDATION.md`; unit tests are not proof of provider availability.

Codex adapter reference: [structured CLI output](https://developers.openai.com/blog/eval-skills).

## Custom acceptance contract

`acceptance.json` records the plan, its criterion indexes and UI steps. Supported actions are `tap`, `type`, `exists`, `absent`, `text` (exact label), and `relaunch`; targets are accessibility identifiers/labels for buttons, text fields, secure text fields, static text or any element. Each journey must assert an observable result. Every criterion must have a journey mapping or be marked manual. Mapping alone does not prove the steps fully exercise that criterion.

The generated app must honor `--studio-reset` by resetting only its own data. Relaunch removes that argument and checks real persistence; `--studio-testing` must not substitute fake functionality. Generated source executes locally in the simulator, so review it before sensitive use. The test contract remains fixed for the workspace. Refinements may add behavior, but that behavior is unverified unless already covered; create a new workspace to plan a different contract.

Source file additions/deletions regenerate a deterministic `.xcodeproj`; no XcodeGen installation is required. Undo restores the complete previous Swift file set and regenerates its references. Source, test-contract and screenshot hashes must still match before the preview is served.

## Local backend

Choose **Local REST backend · development** when creating a custom workspace. Studio supplies authenticated GET/PUT/DELETE records on loopback. Generated apps use URLSession, injected configuration, loading and error states. Records survive server/app restarts. Each UI journey gets isolated data; live preview uses the separate `preview` namespace, viewable under **Development backend data**.

Keys are random and scoped per project, stored with mode 0600 outside source. The backend is for one developer on one Mac, not production authentication or tenant isolation. Exported apps need a deployed HTTPS service and appropriate user authorization before release; without injected configuration they should show a configuration error. No cloud account is provisioned or billed.

## Interactive simulator

Studio compiles a trusted XCTest driver in a temporary copy of the verified project. Its authenticated local channel carries normalized taps/swipes, bounded text and PNG frames. Source edits, tests and exports are locked while preview runs. Sessions stop after 20 minutes; stopping cancels the driver and removes its build copy. Saved evidence remains unchanged. The image follows the native screenshot aspect ratio so coordinates remain aligned.

Tap a field before **Send text**; Return submits a newline. If no software keyboard is present, Studio reports that instead of ending the session. This is screenshot-based interaction (roughly one frame per second plus XCTest input latency), not low-latency video. Hardware keyboard-only focus, multi-touch, rotation, system permission dialogs and arbitrary app/system control are not supported.

## Mac preview bundle

```sh
node studio/distribution/package.mjs
```

On macOS this builds the launcher app in a temporary folder, writes the ZIP plus its SHA-256 and `INSTALL.txt` to `../studio-distribution`, then removes the temporary bundle. The ZIP contains a bundled Node runtime and its matching license. Xcode, iOS Simulator and a signed-in coding CLI are still required. The launcher starts loopback Studio, opens the browser and stops only the server it owns when quitting. It reuses an existing Studio session.

Apps opened from Finder receive a minimal `PATH`, so on macOS Studio asks your login shell (`$SHELL -ilc`, 5-second limit) for its `PATH` at startup and merges it with common tool folders. This lets the launcher find Codex, Claude Code and Xcode tools installed through nvm, Homebrew or an npm prefix. Relative entries are ignored; if the shell lookup fails, Studio keeps its existing `PATH`. zsh, bash, sh and ksh are supported; other login shells fall back to zsh, so set tool paths in `~/.zprofile` or `~/.zshrc` in that case. The health check still reports a client as unavailable when it is not installed.

The bundle is ad-hoc signed for local testing. It is **not Developer ID signed or notarized**; a downloaded public release may be blocked by Gatekeeper. Do not disable platform security. A Developer ID identity and notarization remain required for public Mac distribution. No npm publication or hosted deployment is part of this package command.

## Universal source import (experimental)

Choose **Import HTML / React**, or open `/universal`. Paste HTML with inline styles or supported React TSX, inspect the App IR and unsupported-input report, then generate a new editable Xcode project. This uses the same `app-ir` parsers and SwiftUI generator as the CLI. Imported JavaScript is never executed. Unsupported constructs block generation rather than being silently discarded. Original source, IR traceability and generated Swift are available side by side; existing conversions are retained.

**Build, launch and capture** runs the shared native build and simulator helpers on this Mac. Studio reserves native execution across its existing workflows and pins one simulator UDID for build, launch and capture. Stop cancels the command process; cancelled and interrupted builds can be restarted. Reports retain each attempt, environment, build diagnostics and source hashes. Captures are displayed only while their bytes and current source match the recorded hashes. Do not operate the selected simulator manually during capture. This is a saved screenshot, not an interactive Universal simulator session.

The new orchestration is covered by portable tests with injected native helpers; import and generation are browser-tested. A real end-to-end native Studio capture remains unverified. Build success or a screenshot does not establish interaction, accessibility or visual fidelity: these remain explicitly `not-run` / `not-evaluated`. No baseline is promoted. Broader adapters, automated visual repair and Universal interaction-test controls are still separate unfinished work. This page does not require a provider account or send source to a model.

Optional browser smoke check (install the fidelity benchmark's Playwright dependency first): `node studio/check-universal-ui.mjs`. Set `CHROME_BIN` to an installed Chromium/Chrome executable if Playwright's bundled browser is unavailable. It exercises actual import/generation and rapid conversion switching, then saves a narrow-viewport screenshot in the OS temporary directory.

**Download editable project ZIP** exports the selected generated project using the shared bounded source snapshot. It includes Swift, assets, Xcode settings and a source-hash manifest; it excludes derived data, screenshots, Git metadata, `.env`, private-key files and user Xcode data. It refuses symbolic links and concurrent conversion jobs, and checks for source changes before delivering the archive. Requires macOS `ditto`. Review source before sharing: a key hardcoded inside Swift is still source, not automatically redacted. The export manifest preserves unverified test/fidelity status.

The import selector also accepts the **Vue static template** subset: one plain
`<template>` block using the supported HTML elements and inline styles. Scripts,
interpolation, directives and component imports are explicitly unsupported.
The same IR/generator and evidence status rules apply; Vue native execution has
not been verified. See `benchmarks/universal/vue-static/README.md` for scope.

### Importing a React folder

Expand **Import a local React component folder**, select a small TSX source folder,
and choose its entry component. The browser sends only `.tsx` files to this local
server (maximum 32 files / 256 KiB source). Dependencies must be inside the entry
file's directory. Supported imports and failures match the CLI's local-module
contract; this does not install dependencies or execute the React application.
Original files remain visible beside the generated native source. Creating the
conversion is atomic, so a stopped import cannot appear as a completed workspace.
Folder selection works in Chromium browsers supporting directory file inputs;
other browsers can use the CLI. Pasted source remains available for single files.

The Svelte selector accepts only static markup and supported inline styles.
Expressions, scripts, stylesheets, directives, components and SvelteKit remain
unsupported. It uses the shared IR/generator; no Svelte code is executed and no
native test/fidelity result is inferred from generation.

### Selecting a Universal simulator

The Universal screen lists available iOS simulator devices. Choose a device before
building or leave the automatic selection. An explicit device that disappears
causes a recorded failure; it never silently falls back to another device. Refresh
preserves an unavailable selection so the user can choose a replacement. Each
native run records the requested and actual UDID. Simulator discovery uses the
same authenticated local API as project operations.

Capture waits two cancellable seconds after launch to reduce blank launch-transition
images. This timing is not a readiness or fidelity proof: inspect the actual
capture. Cancellation during that wait prevents capture and releases the native
reservation. Screenshots still do not establish interactions or accessibility.

Local native evidence is archived at
`benchmarks/universal/evidence/studio-native-local-20261028/`: real authenticated
HTTP import of a reusable React field, selected-device build/launch, populated
screenshot and editable Xcode ZIP. The earlier blank capture is preserved too.
This verifies that local API path, not arbitrary React support or a fidelity pass.

Each new successful native capture is retained under its run ID. **Capture history**
can display earlier screenshots even after a failed rebuild or source edit; it
labels these as archived rather than current. Captures remain hash-checked and
cannot change the run's test/fidelity result. Older workspaces retain their current
image but cannot recover historical images that were already overwritten.
The archived capture also retains the generated `RootView.swift` bytes from the
same hashed project snapshot. Selecting history exposes that root view separately
from current source. Both files are checked for tampering; earlier history without
source snapshots is labelled unavailable. This is a source/evidence comparison,
not automatic repair or a snapshot of dependencies outside the generated project.

### Source revisions

**Revise this source** loads a single-file import into the editor as a new revision.
Inspecting it creates a separate conversion with the prior conversion ID and IR
hash recorded. Generation, builds, captures, approvals and test results are not
inherited. The original is untouched. Cancel revision mode to start an independent
import. Multi-file revisions use the authenticated
`POST /api/universal/:id/revision` endpoint with a complete `{name, entry, files}`
payload; the single-file editor intentionally cannot flatten a component folder.
This is revision lineage, not automatic migration of manual Swift edits. Use
`app-ir reconcile` for a separate conservative three-way source review.

After generating a revision, **Compare with parent edits** shows three sources:
the parent's original generated root view, its current developer-edited root view,
and the revision's original generated root view. Conflict-free candidates are
shown for review; neither project is modified. The saved generation hashes and
parent IR hash must still match. Older conversions without the original snapshot
cannot supply a trustworthy base and are refused. This compares `RootView.swift`
only and does not merge other project files or later edits to the child revision.

**Compare latest captures with parent** computes a raw native-to-native pixel diff
using the latest archived successful capture on each conversion. It verifies image
hashes and refuses mismatched dimensions rather than resizing. The report identifies
both run/source hashes and retains `requires-review`, even for identical pixels.
Studio capture conditions do not pin orientation or UI state, and older/current-setting
captures also lack appearance/text-size profiles, so this exploratory diff cannot satisfy the visual-fidelity gate or approve
a repair. It does not compare against an HTML/browser reference.

Optional capture settings select Light/Dark with Large/XXXL Dynamic Type. Studio
boots the selected simulator, reads its original settings, applies and reads back
the requested settings, then restores and verifies the originals after capture or
failure. Unknown original settings block the operation; restoration failures are
reported as failures, not passing captures. Cancellation uses an independent,
bounded cleanup runner. Run evidence records requested/original settings and
restoration. This does not pin orientation, locale or application state, and does
not establish accessibility or fidelity. Choosing current settings preserves the
older behavior and records no profile.
