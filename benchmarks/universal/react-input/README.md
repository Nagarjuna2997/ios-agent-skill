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

Portable checks establish syntax, type-safe IR, source provenance and generated
code. The generated RootView also passed `swiftc -typecheck` against the installed
iOS Simulator SDK with an iOS 17 deployment target on 2026-10-28. This is not
a simulator interaction or fidelity result. The generated unsigned Xcode project
also built successfully for the generic iOS Simulator destination on Xcode 27.0
(27A266a). Native acceptance remains pending: type into both fields, verify independent
text updates, hide/show destination without state loss, relaunch reset, inspect
VoiceOver labels, keyboard behavior, Dynamic Type and clipping. This fixture has
no passing native or fidelity score yet.
