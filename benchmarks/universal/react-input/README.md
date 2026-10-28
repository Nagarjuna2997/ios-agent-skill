# Controlled React text fields

The fixture imports into App IR 1.4.0 and generates native SwiftUI TextFields.
It has independent name/destination string state, reactive text and a conditional
section whose state remains entry-owned when hidden. Existing boolean behavior
is retained. No imported JavaScript executes.

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-input/App.tsx WalkForm > /tmp/walk-form-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/walk-form-ir.json /tmp/new-walk-form
```

Supported input grammar: self-closing `input`, literal `type="text"`, a nonempty
literal `aria-label`, optional literal `placeholder`, `value={stringState}`, and
`onChange={event => setState(event.target.value)}` (or `currentTarget.value`).
String state is a bounded single-line literal declared by the entry component.
A dedicated text element may display that state; its display collapses ordinary
HTML whitespace without altering the editable value. Native labels do not depend
on placeholder text. Existing IR 1.0–1.3 rendering remains unchanged.

Unsupported: uncontrolled/default values, password/number/file fields, validation,
maxLength, arbitrary styles/attributes, handler transformations/side effects,
async handlers, form submission, component-local state, persistence or server APIs.
String values cannot be used as boolean conditions or passed to boolean actions.
A button may assign a bounded single-line string literal to its own string state
(e.g. clearing or resetting a field). Computed values, updater functions, optional
calls and cross-type assignments are rejected; emitted Swift strings are escaped.

Portable checks establish syntax, type-safe IR, source provenance and generated
code. On 2026-10-28 the generated project built unsigned with Xcode 27.0
(27A266a) for iOS Simulator. Both recorded native runs passed typing/independent
updates, hide/show retention and relaunch-reset tests. The padded field repair
also passed the 44-point accessibility-frame assertions.

**Native acceptance is incomplete:** the accessibility test still fails Apple's
placeholder-clipping and button-contrast audit at Large. Each run has 2 passed /
1 failed test; XXXL is not run after that failure. Keyboard, VoiceOver and broader
layout behavior are not established by these limited assertions. No passing
native/fidelity score is claimed. Evidence: [initial failure](../evidence/react-input-first-failure-local-20261028/README.md)
and [touch-size repair](../evidence/react-input-touch-size-local-20261028/README.md).

## Native evidence runner

```sh
node benchmarks/universal/react-input/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/input-evidence
node benchmarks/universal/react-input/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/input-evidence --resume
```

The shared runner pins the toolchain, hashes source and artifacts, checkpoints
completed cells and preserves failed attempts. Four UI tests run at Large and
XXXL Dynamic Type: independent typing/echo plus hide/show retention, native field
labels and Apple's accessibility audit, reset on relaunch, and explicit clear/reset button assignments. The reset variant
uses fixture ID `react-controlled-text-reset` with four required tests; archived
`react-controlled-text` evidence retains its original three-test contract. The existing React
state workflow has a separate input matrix cell; it does not combine scores or
establish HTML fidelity. The workflow remains PR/manual-triggered.

## Latest four-test result

The 2026-10-28 hit-region run built successfully and passed 3/4 Large tests:
typing/retention, clear/reset actions and relaunch reset. The accessibility test
still fails on placeholder clipping; it no longer reports button contrast or
44-point field geometry failures. XXXL did not run after the Large failure.
See [the exact report, logs and screenshots](../evidence/react-input-hit-region-local-20261028/README.md).
The rejected native-label experiment and the earlier missing-hit-region run are
also archived separately. This remains incomplete native acceptance, not a
fidelity pass. The borrowed-component fixture has separate portable/compiler
evidence and must not inherit these native results.
