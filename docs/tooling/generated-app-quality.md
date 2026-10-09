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
