# iOS Agent Studio — local preview

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
- Core browser UI works at narrow and wide widths, with a persistent light/dark preference, visible errors and keyboard controls.

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

The bundle is ad-hoc signed for local testing. It is **not Developer ID signed or notarized**; a downloaded public release may be blocked by Gatekeeper. Do not disable platform security. A Developer ID identity and notarization remain required for public Mac distribution. No npm publication or hosted deployment is part of this package command.
