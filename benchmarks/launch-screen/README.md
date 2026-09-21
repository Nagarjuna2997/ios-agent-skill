# Launch-screen diagnostic benchmark

This is a separate suite, not a revision of the historical 20 microtasks or their
120 scored runs. Twelve multi-file Xcode fixtures include eight repair tasks and
four valid controls. No paired agent results have been collected for this suite.

| Task | Distinguishing behavior |
|---|---|
| stale-storyboard | Follow Info.plist to the intended target resource; ignore decoy files |
| target-membership | Distinguish file existence from resource membership |
| image-case | Diagnose a case-sensitive asset reference without replacing the logo |
| image-payload | Repair a Contents.json payload reference, not the launch mechanism |
| interactive-launch | Remove custom classes, outlets and runtime attributes while preserving layout |
| initial-controller | Repair the entry point without deleting the launch document |
| release-reference | Inspect both Debug and Release and repair the broken override only |
| overlap | Complete a requested migration to the dictionary mechanism |
| valid-empty | Leave an intentionally plain dictionary launch screen alone |
| valid-generated | Recognize generated SwiftUI launch configuration |
| valid-namespace | Resolve an asset namespace without renaming valid assets |
| valid-intro | Leave in-app animation alone when the system launch screen is valid |

## Independent acceptance

`oracle.mjs` evaluates fixture contracts without importing the analyzer or its
finding codes. It checks configuration resolution, preserved app content, launch
constraints, membership, intended color and original image payload. Multiple
repairs to references/membership are possible; the fixture brief requires keeping
the mechanism and appearance unless explicitly migrating. `validate.mjs` requires
each broken starter to fail, every reference repair to pass, and valid controls
to pass unchanged. Destructive logo, color and app mutations must also fail.
The oracle and reference repair are kept outside agent workspaces; they are not
sent in the task prompt. This is evaluation separation, not an OS security boundary.

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node benchmarks/launch-screen/validate.mjs
python3 benchmarks/launch-screen/test_runner.py
# Paid/client inference: run only after separately choosing the frozen protocol.
python3 benchmarks/launch-screen/run.py --model YOUR_VERIFIED_MODEL \
  --trials 3 --output /absolute/new-launch-results
```

The runner requires macOS, Xcode, Node.js, Python and an authenticated Codex CLI.
It does not install SDKs or ask for credentials. Generated fixtures are unsigned,
use synthetic assets and have no external package dependencies. Each completed
cell records actual Xcode builds (both configurations for the Release task),
independent contract results, diagnosis-category matching, source changes,
protected-app changes, valid-control churn, raw sanitized local provider events,
observed tool/build/test calls, token fields, elapsed time, final warning/error
line counts, and git diff size. Internal model iterations, warning deltas and
app XCTest results remain unknown/null: these fixtures have no XCTest target.
Contract checks are configuration tests, not simulator rendering tests.

Diagnosis category matching does **not** establish correct reasoning. Inspect the
saved `diagnosis.json` evidence and require a blinded human review before reporting
diagnosis accuracy. Extra file changes and valid-case churn are reported separately
from functional acceptance; no weighted quality score is invented. Wrapper scripts
can hide attempts; observed call counts are lower bounds. Raw events are private
local evidence and need privacy review before sharing. Path redaction is not a
complete secret scrubber. Token accounting is client-reported, not a cost claim.

## Resumability and versioning

Protocol hashes cover task specifications, generator, oracle, runner, shared fixture
builder, dependency lockfile and frozen skill references, plus requested model,
CLI/Xcode/Swift versions and skill exclusions. Both arms disable installed user
skills, plugins and automatic project docs. Completed cells are written atomically
only after artifacts are saved and hashed. Resume verifies those hashes and refuses
protocol changes. Provider failures are unscored and retried on resume. Use a new
results directory for any protocol change; never overwrite the historical suite.

Run fixture and parser validation before agent trials. Do not tune cases after
seeing which arm wins. Publish complete paired outcomes, valid controls, regressions,
provider failures and unsupported configurations; a tie is an acceptable result.
