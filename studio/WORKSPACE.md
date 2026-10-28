# Studio workspace implementation

This branch extends the existing local Studio. It is not a signed public desktop
release and is not a claim that arbitrary apps or every workflow are verified.

## Launch

```sh
npm --prefix mcp-server ci
npm --prefix mcp-server run build
node studio/server.mjs
```

Open http://127.0.0.1:8844. Node 20+, Xcode and an iOS simulator are required for
native operations. Shared-agent project generation also requires XcodeGen.
Codex and Claude use their own installed CLI authentication; Studio stores no
account password. Authentication status does not prove a model request is allowed.
Use `STUDIO_HOME` and `STUDIO_PORT` before launch to change local storage/port.

## Connected workflows

- The three-panel workspace retains the existing plan, source-generation,
  simulator, backend and export engines. Width controls work with the keyboard;
  narrow windows stack panels. Appearance is saved locally.
- Search includes saved conversation text. Rename, pin, archive, restore visibility,
  switch providers and move a workspace to recoverable `trash/`. Deletion requires
  the exact name. The original imported folder is never deleted or edited.
- The durable queue stores stable task/event IDs, idempotency keys, approval,
  cancellation and terminal outcomes. Source edits require a separate approval
  card bound to the source, plan and execution configuration. Reconnect uses authenticated NDJSON replay. Queued/running work becomes
  interrupted after restart, never successful. Use Retry to create a new task; edits require fresh approval.
- Execution remains conservatively serialized across projects and simulator users.
  Limits are editable (1–60 minutes, 0–3 repair attempts). Cancellation kills owned
  command groups. Task event storage is bounded to 512 KB per task / 500 tasks;
  Settings can clear terminal task history without deleting source or build evidence. Capture retention and the default simulator are configurable.
- Builder and Designer can request protected edits. Debugger defaults to a question;
  explicitly select a change request to edit. Reviewer cannot request edits.
  Release Assistant runs the existing local readiness analyzer and does not automatically sign,
  upload or publish. The separate release controls require explicit operation-specific approval. Findings and metadata remain reviewable local output.
- Both providers can supply JSON to the **same** shared agent prompts/validators.
  A new task uses bounded recent conversation context, not a hidden resumed provider
  session. Unsupported/missing credentials never trigger fallback to another provider.
  Provider streaming excludes reasoning and unknown event types. A provider result
  alone is not a build or test success.
- Attach PNG/JPEG (8 MB max) or UTF-8 text logs (200 KB max). Files remain in controlled
  project storage. Explicitly check **Send this reference** before submitting a task
  to transmit it to the selected provider. Source, prompts, recent conversation and
  selected attachments are governed by that provider's policies. Never attach keys.
- Inspect source read-only and compare revision contents. New revisions record undo
  fingerprints; undo refuses concurrent external changes. Older revisions without
  those fingerprints do not gain retroactive verification guarantees.
- Search capability manifests and insert a capability request into the composer.
  Displayed verification status comes from manifests, not the existence of a template.

## Existing Xcode projects

**Import Xcode folder** invokes the native folder chooser and makes a bounded copy
(3,000 files / 50 MB). It refuses symlinks and requires exactly one `.xcodeproj`.
Choose a discovered shared scheme and simulator in project settings. Inventory
records deployment settings, target names, shared schemes and detected tests.
Dependency/target inventory is static, not a complete Xcode build graph. Verification rejects custom build scripts, scheme execution actions, external package/project references, absolute or parent-relative inputs, custom source roots and oversized configuration files. This is a conservative supported subset, not a general sandbox for arbitrary Xcode projects.

Imported edits replace existing application Swift files only. Package manifests,
known test files, Xcode configuration, resources and new files are not model-editable
in this mode. These restrictions are reported rather than silently dropping changes.
Existing tests run with unsigned simulator builds and automatic package resolution
disabled. Uncached dependencies, private packages and unsupported workspace layouts
can block verification. Review build scripts before approving execution.

Native tests and capture are separate outcomes. Shared-agent verify-only tasks report `tests-passed`, never overall `verified`; an unresolved saved build/visual workflow blocker remains visible even when the native tests pass. A failed capture does not erase a
passing test record or reuse an old capture as current. All bounded build inputs,
including image resources and large files, contribute to the imported fingerprint.
A launch screenshot uses a settling delay, not an assertion of visual fidelity.

Interactive preview for custom apps keeps the existing driver. Imported and shared
agent apps use a separate temporary UI-test driver against their actual built bundle.
No generated source is replaced by a demo app. Tap/swipe/text are XCTest operations
on screenshot frames, not video. Explicit device selection does not silently fall
back. Stop also cancels preparation, boot and install commands. Do not operate the
same simulator manually during verification.

## Boundaries still open

- Claude live execution failed on this machine despite an authenticated CLI. This
  is not marked as verified. The Codex transport and a persisted read-only task ran.
- A real shared Codex generation run produced, built and launched a counter app with iPhone/iPad light/dark/XXL captures. It attempted a visual repair and stopped with unresolved findings at its configured limit. This is not a passing visual-quality verdict. Native tests are separately runnable without restarting generation. XcodeGen 2.46.0 was used for this check.
- Imported editing does not add targets, files, dependencies or entitlements. Confirmed compiler/test failures can trigger bounded application-source-only repair; verify-only requests never edit. Original undo state and failure logs are preserved.
- Shared agent visual reviews retain their existing checks; no new universal
  accessibility, visual-fidelity or production-readiness guarantee is introduced.
- Workspace captures now have immutable hash-checked history with source-staleness labels and explicit deletion. The Universal screen retains its separate capture history.
- The release panel validates configuration and connects local metadata, screenshot-set preparation and readiness through the existing ship engine. Signing/archive/upload controls reuse the existing ship engine and require separate exact-plan approval. Local release preparation was exercised on the sample, including hash-checked preview retrieval. No signing or Apple upload was performed, and those live operations remain unverified.
- Provider session continuation is deliberately unsupported; bounded conversation
  replay is used. Production notarization and long-run recovery testing remain incomplete. The arm64 preview passed strict ad-hoc signature verification and its bundled Node runtime served Studio successfully; that is not a clean-machine distribution certification.

## Verification

Run `node --test studio/test/*.test.mjs`, the MCP build/tests, and
`node studio/check-workspace-ui.mjs` (requires the fidelity benchmark's Playwright
installation and local Chrome, or `CHROME_BIN`). The browser test explicitly uses
a synthetic plan for approval/cancellation; it does not fabricate provider/build
success. See `VALIDATION.md` for actual native and provider observations.

Provider protocols checked against the official
[Codex non-interactive documentation](https://developers.openai.com/codex/noninteractive)
and [Claude headless documentation](https://code.claude.com/docs/en/headless).

The Mac packager includes the built MCP runtime and installed dependencies required
by the shared bridge. It remains ad-hoc signed, not Developer ID signed/notarized.
Update by pulling the feature branch and rebuilding the MCP runtime. To uninstall,
quit Studio and remove its local app/checkout; preserve `STUDIO_HOME` if keeping
projects, or delete it manually only after exporting/backing up wanted projects.
