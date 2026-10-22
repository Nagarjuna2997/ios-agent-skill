# Experimental React memory-route navigation

This is a bounded, syntax-only import of `MemoryRouter`, `Routes`, `Route` and
`Link` from `react-router-dom`. It does not install or run React or the router.
The three-screen synthetic TrailRoutes fixture becomes native SwiftUI through
the shared App IR. It exercises entry-owned boolean state, reusable components,
route pushes, native Back, repeated visits and reset on relaunch.

Supported input is deliberately explicit: one named import of all four router
components without aliases; the entry returns a MemoryRouter with one literal
absolute `initialEntries` path; one Routes child contains up to 30 flat,
self-closing Route elements with literal paths and JSX elements. Link labels are
plain text, with a literal absolute destination and optional supported literal
style. Paths have ASCII alphanumeric/hyphen/underscore segments, no trailing
slash except `/`, and must match exactly. Case-ambiguous routes are rejected.

App IR 1.2.0 records the initial screen, route table and per-link destination.
Source byte ranges retain component definitions, calls and route declarations.
The generator uses NavigationStack and NavigationLink, adds a native Back control
and preserves entry-owned state while changing screens. Existing 1.0.0/1.1.0
single-screen inputs keep their existing output. Navigation is an explicit native
adaptation, not browser-history or visual equivalence.

Unsupported: BrowserRouter/HashRouter, nested routes, params, wildcards, query or
fragment navigation, relative paths, same-route replacement links, redirects, replace, loaders/actions,
useNavigate, location state, link callbacks, dynamic link labels, callback props,
component-local hooks, disclosure lifecycle in routes, deep links, browser URL or
forward-history synchronization, and web scroll restoration. Unsupported syntax
is rejected; unsupported HTML/CSS still blocks generation. No general React or
Next.js compatibility is claimed.

## Verification

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node --test mcp-server/test/react-navigation.test.js benchmarks/universal/react-state/evidence.test.mjs
node benchmarks/universal/react-navigation/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory
node benchmarks/universal/react-navigation/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory --resume
```

The local profile pins Xcode 27.0 / 27A266a, SDK/runtime iOS 27 and iPhone 18 Pro.
The separate hosted workflow pins Xcode 26.5 / iOS 26.5 / iPhone 17 Pro. Neither
uses a model, credentials, personal app code, signing or live network calls while
running the fixture. Package installation is a CI setup step, not imported app
execution. Three independently authored XCUITests run at Large and XXXL: two
pushes and two Back operations with state retained, native semantics and Apple
clipping/contrast/element-detection audits on each screen, and stack/state reset
on relaunch. The fixture requires exactly three passes per cell and zero failures
or skips; a reduced passing subset cannot count as success.

The state and navigation fixtures share the existing native build/test/checkpoint
runner. Input, generator, shared runner, test helpers, toolchain and result-bundle
bytes participate in integrity checking. Completed stages resume without rerunning;
changed evidence blocks reuse. Failed/incomplete stages retain evidence and are
retried in separate directories. A completed resume may create/delete its own
simulator but must not rebuild or retest completed cells. Only that dedicated
simulator is cleaned up. Historical reports remain unchanged and may need their
original source revision for reproduction.

Reports, build/test logs, raw xcresults and actual XCTest screenshots are retained.
`native-behavior-passed` covers only tested native behavior. There is no approved
browser reference; `visualFidelity: not-evaluated` must stay separate from HTML
fidelity metrics, reference approval and baseline promotion. A workflow definition
or passing portable tests do not establish native execution. Actual local/hosted
results are recorded separately in the evidence directory after execution.

Syntax references: [MemoryRouter](https://reactrouter.com/6.30.6/router-components/memory-router),
[Link](https://reactrouter.com/6.30.6/components/link), and
[Apple NavigationStack](https://developer.apple.com/documentation/swiftui/navigationstack).
The adapter recognizes only the explicit subset above, not the full APIs.
