# Generated app quality

The shared `/ios-build` engine provides design directions, synthetic sample data, design-system components, screenshot critique and source-bound refinement evidence. These are working-tree features under review; an npm release is separate.

## Tests are independent evidence

New Claude-generated projects receive separate Swift Testing and XCUITest targets in both project writers. Generation requests behavioral tests for each view model and screen smoke checks using `screen-<id>` accessibility identifiers. Tests use synthetic data and injected services. They must not contact real providers.

The loop runs unsigned simulator tests and reads the xcresult summary. Zero tests, skipped tests, a missing result bundle, a failing command or changed source cannot count as passing. Failed runs preserve logs and result bundles. Up to three test attempts can repair application source; that repair path cannot delete tests. Compiler-diagnosed test files can be repaired while preserving the test/assertion count; behavioral failures are repaired in app source. Review generated assertions for semantic weakening. This does not establish exhaustive coverage: review generated assertions and edge cases.

## Design and devices

Review PLAN.md's alternatives, then use `build --resume --design <id>`. `--design first` explicitly chooses the first alternative. The default design-system and sample-data flags are shared by the CLI and Studio. Visual findings are model observations, not HIG certification.

Both project formats enable iPhone and iPad, portrait and landscape. Generation requests NavigationSplitView for list/detail and adaptive grids. Captures include iPad when a matching simulator is installed; absence is reported. Portrait/dark/XXL captures do not prove rotation or interaction behavior. Generated UI tests should exercise rotation.

`--refine` attaches light, dark and XXL pixels only when their source hash matches the project. Otherwise it explicitly reports source-only refinement. Screenshots are sent to the configured model, so use synthetic sample data.

## Provider modules

| Module | Adapter | Configuration still required |
|---|---|---|
| firebase-auth | Email registration/sign-in, sign-out and account deletion | Firebase app options, provider enablement and reauthentication |
| firebase-firestore | Codable document reads/writes/deletes | Configured Firebase instance, authentication and emulator-tested restrictive rules |
| google-sign-in | Sign-in, restoration, redirect handling, disconnect | OAuth client ID, reversed-ID URL scheme and backend token validation |
| stripe-payments | PaymentSheet presentation and outcomes | Authenticated server-created intent, publishable key and webhook fulfillment |
| rive-animation | Bundled Rive playback with static fallback | User-supplied licensed .riv file |
| webview-animation | Local CSS animation in WKWebView | Native accessible equivalent; no JavaScript or remote loading |

Versions are pinned in module manifests. Firebase 12.13.0 and Google Sign-In 10.0.0 share compatible App Check requirements; Firebase 13.0.1 conflicts with that Google Sign-In release, so it is not the default pin. Compilation does not verify an account, payment, production rules, OAuth configuration or App Store eligibility. Never embed admin keys, Stripe secret keys or real user data in templates.

Primary references: [Firebase setup](https://firebase.google.com/docs/ios/setup), [Google Sign-In](https://developers.google.com/identity/sign-in/ios/sign-in), [Stripe PaymentSheet](https://github.com/stripe/stripe-ios/tree/master/StripePaymentSheet), [Rive runtime](https://github.com/rive-app/rive-ios).

## Studio and CI

Choose “Shared /ios-build agent” and Claude Code in Studio. Plan, Build and Refine use the same engine, state, caps and RUN_REPORT.md as the CLI. Existing Codex/custom and reading-list projects retain their previous engines. The shared CLI brain currently supports Claude Code; Studio does not silently substitute providers.

The capability-verification workflow runs combined compilation and isolated module verification on macOS. Artifacts include commit and toolchain identity and per-module records. Status changes in its checkout are uploaded, never automatically committed as evidence for a different revision. Review passing evidence before updating published tables; runtime behavior remains separately unverified.

## Verification recorded on October 9, 2026

- All six new provider/animation modules passed isolated unsigned builds with Xcode 27.0 (27A266a); each module contains its verification record. Source templates were compared against the isolated compile inputs before recording status.
- The MCP suite passed 546 tests and Studio passed 49 tests. A separate regression covers resuming after the test budget is exhausted.
- A small local target-wiring probe passed one Swift Testing test and the generated portrait/landscape XCUITest (two tests, zero failures/skips). This proves execution and result parsing, not generated business-logic coverage.
- A live Claude-generated app passed plan validation after retry, then exposed early test-file emission; test targets are now enabled before generation. The retry hit a provider HTTP 429 session limit. End-to-end generation, visual critique and final app tests are therefore not claimed as passed.
- The combined 48-module project also compiled successfully on Xcode 27.0 after resolving the Firebase/Google dependency conflict and isolating duplicate fixture helper names.
- CI verification artifacts and provider runtime/account behavior are separate evidence; neither is inferred from these compile results.

## Scheduled full-loop regression lane

`.github/workflows/ios-build-e2e.yml` runs the real `ios-agent-mcp build`
entry point weekly or by manual dispatch on **main only**. Three fixed synthetic
requests cover a counter, a searchable reading list, and a habit dashboard.
It plans first, checks a local-only capability allowlist, chooses the first design
direction, and resumes through generation, actual Xcode builds, simulator captures,
visual review and tests. Build repairs happen when compilation fails; a prompt
that builds immediately does not prove the repair path. Existing deterministic
loop tests cover forced failure/repair transitions.

This lane is implemented, **not yet a recorded successful live run**. It is not a
benchmark, does not compare arms, and changes no historical scores or verification
manifests. Model visual judgments can fluctuate; inspect failures before attributing
them to a code regression. Passing also does not prove every requested app behavior.

### Enable deliberately

Paid model requests are disabled unless repository variable
`IOS_BUILD_E2E_ENABLED` is `true`. Set secret `IOS_BUILD_E2E_ANTHROPIC_API_KEY`
and variables `IOS_BUILD_E2E_MODEL` (a dated model ID, not `sonnet` or `latest`),
`IOS_BUILD_E2E_XCODE`, `IOS_BUILD_E2E_SDK`, and `IOS_BUILD_E2E_RUNTIME` (the exact
`com.apple.CoreSimulator.SimRuntime.iOS-…` identifier). Choose versions installed
on the `macos-26` runner; the driver checks the actual versions and available
iPhone before any model call. The Claude CLI version and protocol are checked
into `scripts/ios-build-e2e/cases.json`. Missing credentials or mismatched pins fail;
an unenabled workflow is **skipped, never evidence of a pass**.

The API key is exposed only in the trusted-main execution/export steps. Checkout
credentials are not persisted. There are no PR or fork triggers, no npm publication,
and no signing/upload/distribution action. All app data and prompts are synthetic.
Each case has four build attempts per cycle, an outer 40-minute deadline (preserved
on local resume), and a 55-minute job limit. Three cases run serially to limit load.
Configure a provider spending limit separately; a time cap is not a dollar cap.

### Results and recovery

Every cell writes its own atomic identity, checkpoint and result. `pass`,
`provider_failure`, `infrastructure_failure`, `timeout`, and `regression` are distinct;
all non-pass outcomes fail the job. A zero CLI exit alone cannot pass: the verifier
requires successful build/launch, source-bound passing tests with no skips, real
light/dark/XXL screenshot artifacts for each top-level screen, a matching visual
review, and the plan/report. It does not weaken visual checks to manufacture green.

Artifacts retain synthetic source, state, logs, xcresult bundles and screenshots
for 14 days, including failed runs. The exporter excludes HOME and DerivedData,
refuses symlinks, and refuses files containing the configured provider credential.
Artifacts on a public repository are public. Do not use this lane for personal apps.
If a job is force-killed before export, GitHub may have no artifact; completed cells
in other jobs remain intact.

A GitHub rerun is a **new observation**, not a silent continuation. To investigate
or locally resume an interrupted cell, download its artifact, check out the recorded
commit, install the recorded pins, and pass the unpacked cell directory:

```sh
node scripts/ios-build-e2e/run.mjs counter /absolute/path/to/unpacked-cell
```

Completed results are retained instead of retried. A completed pass is revalidated;
a changed identity is rejected without overwriting it. Use a fresh directory for an
intentional new trial. No automated artifact restore across Actions runs is claimed.
Portable acceptance-contract tests run with the ordinary Tests workflow, without
Xcode, credentials, or provider calls:

```sh
node --test scripts/ios-build-e2e/contracts.test.mjs
```
