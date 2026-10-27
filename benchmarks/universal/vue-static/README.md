# Vue static-template conversion

This fixture exercises one Vue SFC containing a static template, inline style
properties supported by the HTML adapter, text and a native disclosure.

```sh
node mcp-server/dist/unified.js app-ir inspect-vue benchmarks/universal/vue-static/App.vue QuietWalk > /tmp/quiet-walk-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/quiet-walk-ir.json /tmp/quiet-walk-native
```

Use a new output directory. Input code is parsed, never evaluated. Native output
uses the existing App IR and SwiftUI generator; no Vue runtime is bundled.
The source digest and UTF-8 evidence ranges refer to the original SFC.

Supported: exactly one explicit attribute-free template block, ordinary lowercase
HTML elements and the existing inline-style subset. Scripts (including setup),
stylesheets, preprocessors, external templates, interpolation, directives,
components, slots, events and network assets are not mapped. They produce an
explicit error or an IR limitation that prevents generation. This is not general
Vue application conversion.

Portable tests cover parity with equivalent HTML, provenance, unsupported input,
CLI conversion and Studio generation. Native build, disclosure interaction,
accessibility, Dynamic Type and fidelity remain unverified for this fixture.
Existing HTML or React benchmark results do not establish Vue native success.
