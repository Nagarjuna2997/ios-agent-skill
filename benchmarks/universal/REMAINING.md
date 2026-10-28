# Universal Engine completion boundaries

Status audited on October 28, 2026. A PR being incorporated into main does not
complete its unresolved acceptance checks. Historical evidence is not rewritten.

| Area | Current boundary | Evidence or completion requirement |
| --- | --- | --- |
| Heading fidelity | A benchmark-only UIKit candidate has local and hosted build/typography evidence. The separately authorized local baseline covers only its exact recorded environment. | [Local authorization](evidence/local-known-good-20261028/README.md). Hosted reference approval and production integration are separate; do not infer either from a merge. |
| Text inputs | Typing, reset, relaunch and independent state passed in the archived fixture, but placeholder clipping failed at both recorded sizes. | [6 passing / 2 failing executions](evidence/react-input-both-sizes-local-20261028/README.md). Correct the cause without removing the placeholder or excluding the audit. |
| Studio quality | Real generation, native execution and export exist. A sample's largest-size audit and bounded visual review retain unresolved findings. | [Studio boundaries](../../studio/WORKSPACE.md) and [actual results](../../studio/VALIDATION.md). A passing build is not a passing visual review. |
| Framework coverage | HTML and bounded React/Vue/Svelte subsets share App IR; unsupported inputs must fail explicitly. | Existing adapter tests define supported syntax. Arbitrary Next.js, Angular, Flutter, React Native and UIKit-source conversion are not complete. |
| Efficiency evaluation | Tool profiles, local memory and loop intervention are implemented. Trusted-receipt comparison exists; an isolated provider execution runner does not. | [Evaluation contract](../efficiency/README.md). Need actual sandboxed cold/warm paired runs before any savings claim. |
| Distribution | Editable source export and local preview packaging exist. | Notarized distribution, successful restricted-provider execution and live signing/upload remain separately unverified. No account authentication, paid operation or app submission is implied by this work. |

## Confirmed defects corrected during this audit

- Simulator setup: exactly one additional wait after a recorded bootstatus timeout,
  on the same owned device. Other failures are not automatically retried. Setup
  failure history is preserved across resume; verification thresholds are unchanged.
- Icon-free generation: XcodeGen implicitly selected a nonexistent AppIcon set.
  Both project writers now explicitly clear the selection when no icon is configured.
  Configured icons are unchanged; an icon-free simulator app is not store-ready.
- Resource diagnostics: asset-catalog/Interface Builder errors without line numbers
  now reach the repair report with their real path/message, rather than a generic exit.

These fixes do not resolve the outstanding rows above or establish universal
conversion accuracy. Report local execution, hosted execution, visual acceptance
and release readiness separately; no aggregate completion percentage is defined.
