# Experimental React boolean state

This synthetic offline fixture tests a deliberately small runtime subset: two
entry-component boolean states, static text branches, toggle/set buttons,
independent updates and reset on relaunch. Reusable `Panel` children retain the
entry scope. No React application code, dependency install, provider or network
request is used while importing the fixture.

The importer produces App IR 1.1.0 and SwiftUI `@State`/`Button`/`Text`. Existing
static inputs still produce 1.0.0 with unchanged rendering. This is not support for
general React hooks, effects, callback props, object state, async events, routing
or arbitrary applications. Unsupported syntax fails explicitly.

## Reproduce

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node --test mcp-server/test/react-state.test.js benchmarks/universal/react-state/evidence.test.mjs
node benchmarks/universal/react-state/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory
# Resume with identical source, verifier and environment:
node benchmarks/universal/react-state/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory --resume
```

The local profile pins Xcode 27.0 / 27A266a, SDK/runtime iOS 27 and iPhone 18 Pro.
The dedicated CI workflow uses the independently recorded Xcode 26.5 / iOS 26.5
profile. The runner rejects mismatched toolchains before generation, creates only
its own unsigned Simulator app, and deletes only its own simulator on exit.

Three manually authored native tests run at Large and XXXL Dynamic Type. They
check toggling twice, idempotent assignment, independence of the other state,
absence of stale text, native button/static-text semantics, Apple text-clipping,
contrast and element-detection audits, and initial state after relaunch.
Screenshots come from those running tests, not a mocked preview.

The report retains command diagnostics, source and IR hashes, build/test logs,
raw xcresults and screenshot attachments. Completed cells are checkpointed with
artifact hashes; failed/unknown/skipped tests are never recorded as a completed
passing cell. Changed input or result-bundle bytes invalidate resume. A retry
after interrupted generation/export uses a new directory and preserves the old
attempt. These integrity hashes are not cryptographic authentication.

`native-behavior-passed` establishes only the tested native behavior. This fixture
has no independent browser reference or approved visual baseline and reports
`visualFidelity: not-evaluated`. It must not be combined with HTML fidelity scores.
Hosted and local results must be reported separately. See evidence records for
actual results; the presence of this fixture or workflow is not a passing run.

## Review saved evidence

```sh
node benchmarks/universal/render-evidence.mjs /absolute/evidence-directory /absolute/new/review.html
```

Open the standalone HTML locally. Use the full local output or extracted workflow artifact: the viewer reads `report.json` and the attachment directories named there. It displays saved build/tests and initial/changed screenshots with their test identities, without a server or scripts. Missing artifacts are labelled unavailable. It does not check integrity hashes or turn native behavior into a fidelity pass.

## Simulator startup recovery

The shared native runner records every setup command. A timed-out five-minute
`simctl bootstatus` wait permits exactly one further five-minute wait on the same
owned simulator; it does not recreate the device, repeat a build, or retry failed
assertions. Both command records and the recovery reason remain in the report.
Nonzero exits, spawn failures and evidence-write failures are not retried.
Environment/setup failures are reported as `infrastructure_failure`, separately
from `verification_failure`; resume retains the failure history. The setup code
is part of the checkpoint contract, so changing it requires a fresh evidence run.
