# App-building loop (preview)

One client first: the local Claude Code CLI plans and edits; `ios-agent-mcp loop` runs your acceptance commands and records progress. This is a CLI workflow alongside the unified MCP server, not an additional MCP tool or a guarantee of autonomous app creation.

## Try the complete reading-list demo

Requires Node.js 20+, Python 3, macOS, Xcode with an installed iOS simulator runtime. The Xcode project is checked in; XcodeGen is only needed when changing `project.yml`.

From a checkout:

```bash
cd mcp-server
npm ci
npm run build
cd ../samples/ReadingList
node ../../mcp-server/dist/unified.js loop init --project . --brief BRIEF.md --checks checks.json --plan plan.json --attempts 2
node ../../mcp-server/dist/unified.js loop resume --project . --verify-only
node ../../mcp-server/dist/unified.js loop status --project .
```

The supplied plan makes this verification-only example work without an AI login. Five XCTest tests exercise persistence, search, progress, failed storage, and the UI journey. Six screenshot artifacts cover empty, add, library, detail, no results, and error states. See [the demo](../../samples/ReadingList/README.md).

## Plan and implement your own app

Start with a project, an app brief, and trusted executable acceptance checks. Use the demo JSON files as a schema example. Each criterion maps to existing check IDs; screen names map to screenshot-producing checks. Check commands run directly with argument arrays, without a shell, in the project directory. You must author meaningful tests for your intended behavior; a successful process alone cannot establish that an arbitrary brief is satisfied.

```bash
node /path/to/ios-agent-skill/mcp-server/dist/unified.js loop init --project /path/to/app --brief BRIEF.md --checks checks.json --attempts 3
node /path/to/ios-agent-skill/mcp-server/dist/unified.js loop resume --project /path/to/app
```

Without `--plan`, init asks the installed, authenticated `claude` CLI for a structured plan. Review `.ios-agent/loop/state.json` before resuming. Resume runs checks first, sends failing log tails and the plan to Claude, then reruns checks after edits. Repairs are limited to 1–10 attempts, 12 Claude turns per attempt, and a ten-minute timeout per Claude invocation. Each check has its own timeout (maximum 30 minutes). This bounds attempts and time, not monetary cost. Claude subscription/API usage is governed by your own local CLI configuration.

The repair adapter exposes Read, Glob, Grep, Edit and Write; it disables external MCP connections and does not grant shell commands. Your configured acceptance commands run with your local user permissions. Inspect them before running; this workflow is not a security sandbox. List tests, scripts and project settings in `protectedFiles` so the loop detects changed acceptance files instead of accepting weakened tests. Dependencies must already be installed.

## Evidence and resume

- Artifacts must use canonical relative paths under `.ios-agent/evidence/`. Symlink evidence paths are rejected. Checks must create fresh, nonempty artifacts; demo verification additionally validates PNG signatures.
- State, logs and evidence are stored in `.ios-agent/`. Add that directory to your project's `.gitignore`; logs may contain source code, local paths or command output. The loop does not publish them or copy credentials. Claude receives the brief, configuration and failing log excerpts through your local authenticated CLI.
- Successful checks are reused only when source fingerprints and saved evidence/log hashes match. Source changes invalidate cached results. Generated directories such as `.build`, `build`, `DerivedData`, `node_modules`, `.git`, `.ios-agent` and Xcode user/workspace metadata are excluded; do not keep implementation source there.
- Interruptions preserve progress and terminate active process groups on macOS/Linux. Resume rechecks interrupted work. Windows process cleanup is limited to the direct child; iOS simulator verification requires macOS.
- Frozen verification files cannot change mid-run. To intentionally revise the acceptance contract, archive `.ios-agent/loop` and initialize a new run. Do not edit saved results to claim completion.
- Completion means every configured check passed with retained artifacts. Screenshots need human visual inspection; they are not automatic proof of visual quality, full accessibility or App Store readiness.

## Validation status

Engine tests cover cached evidence, source changes, frozen checks, retry exhaustion, interruption and a deterministic repair adapter. The demo has real simulator tests. A real Claude repair session remains **unverified** in the development environment because its OAuth session expired. The fixture-based repair test is not a substitute for that integration check. No API keys or credentials are included in the repository.
