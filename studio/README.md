# iOS Agent Studio — local preview

A local browser workspace for planning, changing and verifying a SwiftUI reading-list app. This is the first working vertical slice, not a general-purpose hosted app builder.

```sh
node studio/server.mjs
```

Open http://127.0.0.1:8844. Requires Node 20+, macOS, Xcode, an installed iOS simulator, and an authenticated Codex or Claude Code CLI for planning/edits. Checking the starter does not require an AI account. Client subscription restrictions can still block requests even when the CLI is signed in.

## Workflow

1. Name your workspace, choose a client, and describe the app. “Try the reading-list idea” supplies an editable brief.
2. Plan app. Review the proposed screens and acceptance criteria.
3. Build plan. The client proposes Swift source; Studio validates the file targets, backs up the previous revision, then runs the existing ReadingList acceptance script.
4. Inspect the six real simulator screenshots, build log and test result. Screenshots are captures, not interactive simulator streams.
5. Describe a refinement in chat. Studio edits, tests, and makes at most one automatic repair attempt. Stop cancels the process group.
6. Export ZIP saves an archive in the workspace’s `exports/` folder. Use Project files to reveal it, or open the checked-in Xcode project. No signing or App Store submission is performed.

## Evidence and boundaries

- Reuses `samples/ReadingList` and its independent tests. Passing means the reading-list acceptance suite passed, **not** that every generated plan criterion or arbitrary app idea was verified.
- First version changes only `App/ReadingListApp.swift` and `App/ReadingStore.swift`. Tests, schemes and project files cannot be changed by model responses. Additional source files, packages, backends and other starter families are not supported yet.
- Saves projects under `~/Library/Application Support/iOS Agent Studio`. Set `STUDIO_HOME` or `STUDIO_PORT` when needed. State writes are atomic; a restart labels interrupted jobs and preserves source, revision backups and completed evidence. Interrupted builds restart rather than being falsely marked complete.
- Source and screenshot hashes protect previews from stale or modified evidence. Acceptance-file hashes are checked before and after verification. Undo invalidates old evidence. Export excludes derived data, logs and simulator evidence.
- Briefs, app source and bounded failure diagnostics go to the explicitly selected, locally authenticated coding client. Provider billing and data policies apply. No credentials are collected, stored in projects, or embedded in exports.
- The server binds to loopback only and checks Host, Origin and a per-launch request token. This is a single-user local tool, not a multi-user security boundary. Generated Swift executes on your simulator; review it before using sensitive data. Do not expose this server to a network.
- Codex runs in read-only mode with user configuration excluded; Claude has no tools or external MCP servers. Returned file content is validated and written by Studio. The existing simulator runner remains the authority for tests.
- Core browser UI works at narrow and wide widths, with a persistent light/dark preference, visible errors and keyboard controls.

## Checks

```sh
node --test studio/test/*.test.mjs
```

The tests use synthetic process adapters. Real client and simulator results are recorded separately in `VALIDATION.md`; unit tests are not proof of provider availability.

Codex adapter reference: [structured CLI output](https://developers.openai.com/blog/eval-skills).
