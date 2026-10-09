# Build on GitHub Actions from Windows or Linux

`ios-agent-mcp build --remote` keeps planning and repairs in the client, then sends a generated project to a standard GitHub-hosted macOS runner. The runner performs one unsigned build, launches the simulator and captures each top-level screen in light, dark and XXL Dynamic Type. Structured compiler diagnostics return to the existing bounded repair loop. No model account or model credential is needed on the runner.

This is source in the GitHub branch, not yet an npm release. Use the built checkout until it is published. It does not automatically verify all capability modules or run benchmark comparisons; those remain separate jobs and evidence.

## Setup

Install Node 20 or later, GitHub CLI (`gh`), and a signed-in Claude Code CLI on the client. Authenticate with `gh auth login`; the GitHub identity needs repository contents and workflow write access plus Actions read access. For the OAuth token from GitHub CLI, add workflow scope with `gh auth refresh -h github.com -s workflow` if needed. Choose an **existing, initialized repository you own**, with Actions enabled. Use a dedicated private repository for private app source. A public destination makes the uploaded source public.

Pin a full commit SHA of this toolkit that contains `remote-worker.ts`, and an Xcode version installed on the chosen [runner image](https://github.com/actions/runner-images/tree/main/images/macos). The worker fails if that Xcode installation is unavailable. Runner image updates can remove versions; versioned labels alone are not immutable VM images. The artifact records the selected Xcode build and simulator runtime.

```sh
node mcp-server/dist/unified.js build "A habit tracker" --out ./HabitApp \
  --remote --remote-repo YOUR_ACCOUNT/YOUR_BUILD_REPO \
  --remote-tool-ref FULL_40_CHARACTER_TOOLKIT_COMMIT_SHA \
  --remote-xcode 26.3 --remote-runner macos-15 --minutes 60
```

The command installs `templates/ci-cd/ios-agent-remote.yml` on a separate `ios-agent-build/<hash>` branch in that repository. It never commits the user's local working tree or updates the destination's default branch. Branch creation triggers the workflow; no manual workflow-dispatch installation is needed. The template checks out the toolkit by SHA and builds it from its lockfile.

## What leaves the machine

The bounded snapshot includes app source/resources, extension source, Xcode project, Config files, project.yml, plan and app spec. It excludes `.env`, `Config/Secrets.xcconfig`, hidden source entries, local Git metadata, previous logs/screenshots, signing credentials and symlinks. It is **not a general secret scanner**: review source and configuration before using a public destination; embedded literals and plan contents are uploaded. The source is limited to 25 MiB and 1000 files. Custom files outside generated project roots are unsupported.

GitHub authorization stays on the client. Workflow checkout credentials are not persisted; the job has read-only contents permission, no deployment credentials, and uses `CODE_SIGNING_ALLOWED=NO`. Build scripts in your project execute on the runner, so use trusted source and dependencies. Projects requiring private packages or credentials need a separately reviewed workflow; this lane does not forward secrets. Dependencies may be downloaded by npm/Swift Package Manager.

## Evidence and resuming

The source hash and configuration determine a branch and local checkpoint under `.ios-agent/remote/`. The client tracks the exact source commit and Actions run. `--resume` with the same remote arguments polls that existing run rather than starting a duplicate. It downloads the named artifact, checks the request hash and SHA-256 hashes of each evidence file, and imports only confined logs/screenshots. Success requires the full top-level screen matrix plus launch metadata. Build failures return compiler diagnostics for the next repair; infrastructure failures do not become app compiler errors.

```sh
node mcp-server/dist/unified.js build --resume --out ./HabitApp \
  --remote --remote-repo YOUR_ACCOUNT/YOUR_BUILD_REPO \
  --remote-tool-ref FULL_40_CHARACTER_TOOLKIT_COMMIT_SHA --remote-xcode 26.3
```

For a terminal infrastructure or simulator failure, add `--remote-retry` to that command. This explicitly starts a new cycle/job and may consume additional billed minutes. A pending run is resumed without this flag. An unchanged repair stops instead of repeatedly paying for the same source. Do not run two clients against the same local project at once.

Each job is capped at 45 minutes; the client defaults to 60 minutes in remote mode and 8 build attempts. Stopping the client does not cancel an already submitted Actions job: use the Actions run page to cancel it. Artifacts are retained for seven days. Source branches persist until you delete them. Expired artifacts cannot be recovered by polling; use an explicit retry. `RUN_REPORT.md` links the run and lists the imported screenshots and toolchain. These are runtime captures, not automatic proof of accessibility or feature correctness. The lane builds and captures; it does not run an app's unit/UI tests or publish/sign an app.

## Cost

Standard GitHub-hosted runners are free for public repositories; larger runners are not. Private repositories consume the account's included allowance and incur usage charges beyond it. The often-quoted **10× macOS minute multiplier describes the legacy allowance model**, not a universal current price formula. GitHub's current standard macOS price is listed as **$0.062/minute** (checked October 9, 2026); billing rules and prices can change. Check the repository owner's plan, budget and [current runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing) and [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) before running. Artifact storage is accounted for separately.

## Verification record

See the [hosted smoke-test evidence](../../examples/remote-build/README.md): an unsigned Xcode 26.3 build and three simulator captures completed on GitHub Actions. The evidence identifies which transport steps were exercised live and which were tested with fixtures.
