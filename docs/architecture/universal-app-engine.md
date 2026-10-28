# Universal App Engine: architecture and implementation record

Status: experimental foundation on `feat/universal-app-ir`. Not in npm 2.10.2.
Audit date: October 15, 2026 (America/Chicago). Base: `494e232`.

## Existing architecture and reuse

| Area | Existing implementation | Decision |
| --- | --- | --- |
| CLI/MCP | `mcp-server/src/unified.ts`, `index.ts`, `agent/tools.ts`; unified server proxies review, knowledge and simulator tools | Add an experimental `app-ir` namespace and one read-only import tool. Preserve existing commands. |
| Planning/design | `agent/plan.ts`: validated screens, models, design directions, palette, typography, sample data; design-system capability | Keep existing Plan unchanged. Do not squeeze source trees into a free-text prompt or silently assign creative defaults to faithful imports. |
| Project generation | `agent/spec.ts`, `project.ts`, `xcodeproj.ts`: AppSpec, constrained writes, optional XcodeGen and built-in Xcode project writer | Reuse new-project initialization and project regeneration. Never import or execute foreign build scripts. |
| Generation/repair | `agent/loop.ts` and `brain.ts`: bounded build/test/visual loop; Claude Code brain implements a Brain interface | Do not replace the loop. IR rendering is deterministic for the first subset. Future model-based renderers must consume IR and retain provenance. |
| Build/simulator | `agent/build.ts`, `simulator.ts`, `testing.ts`: unsigned simulator builds, diagnostics, launches, captures, xcresult parsing | Reused by the real conversion benchmark. A generated project is explicitly unverified until these checks run. |
| Visual evidence | `agent/visual-review.ts`: hashed captures, bounded model review with HIG checklist | Reuse for future critique. New `app-ir/compare.ts` adds deterministic reference/native pixel evidence without claiming perceptual equivalence. |
| Native integrations | `capabilities/` catalog, resolver, SDK, verification | Reuse relevant capabilities; do not translate server-only code into the iOS client. No new capabilities in this milestone. |
| Apple knowledge | `apple-docs/`, local reference index and SDK-backed availability/readiness checks | Reuse before introducing newer APIs; first renderer uses established SwiftUI primitives at iOS 17 deployment target. |
| Providers | `ai/` provider interfaces; build CLI currently constructs ClaudeCodeBrain | General MCP support is not evidence that all providers drive the build loop. Provider-neutral renderer is implemented; alternate generation brains remain future work. |
| Studio | `studio/agent-bridge.mjs` delegates Claude plans/builds to the core loop; other paths retain older engine | Keep dashboard optional. Add IR/comparison views only after conversion contracts stabilize. |
| Shipping | `release/ship.ts` with preparation, evidence and separate sensitive-operation approvals | No release or signing changes. |
| Tests/benchmarks | MCP Node tests, generated app tests, existing v2 fixtures and historical results | Add a separate unscored conversion benchmark. Historical scores and evidence are untouched. |

Source inspection establishes reuse opportunities, not a blanket claim that every integration is runtime-verified. This milestone actually compiles and tests one synthetic app on the installed Mac.

## Gap analysis

Before this work there was no framework-independent source hierarchy with source ranges, no bounded HTML adapter, no deterministic IR-to-native renderer and no original/native pixel comparison. Existing visual review critiques generated screenshots; it does not reconstruct an imported source design.

Still missing: CSS cascade/computed layouts, external asset mapping/licensing, routes and data contracts, framework AST adapters, screenshot semantic extraction, authorized Figma ingestion, source/native conflict resolution, automated reference-driven repair and full provider-neutral orchestration. These are separate milestones, not implied by recognizing a package name.

## Proposed integration

```text
Explicit local input (later: authorized URL/repository/design snapshots)
  -> adapter: extracted facts + inferences + unknown requirements
  -> versioned validated App IR + content hashes
  -> review unsupported features and unresolved requirements
  -> native renderer + source map
  -> existing AppSpec / project writer
  -> existing unsigned build / xcresult tests / simulator captures
  -> image comparison + functional checks + human/model critique
  -> bounded scoped repair, revalidation and evidence checkpoint (future)
```

The original source remains read-only. Output must be a new directory. Import never executes JavaScript, installs source dependencies, fetches URLs, or starts a provider. `generate` invokes only the toolkit's project writer (or installed XcodeGen); no imported scripts enter that path. MCP inspection returns source text to the connected client, so users should select non-sensitive source files.

## Version 1 IR contract

`mcp-server/src/app-ir/schema.ts` is the executable schema. Unknown properties and schema versions fail validation. `sources` carry relative paths, SHA-256 hashes, byte counts and adapter versions. Node evidence references UTF-8 byte ranges in those sources; inferred evidence needs an explanation. Sources, screens and nodes have unique IDs; missing nodes, cycles, duplicate parents, orphan nodes and excessive depth are rejected.

Implemented node kinds: column, text, disclosure, explicit state-transition buttons and route links. Implemented style fields: six-digit colors, padding, gap, scaled system font size, bold, corner radius and centered text. Requirements explicitly classify navigation/assets/motion/state/data/API/auth/native/accessibility/responsiveness/appearance as extracted, inferred or unknown. The current HTML adapter leaves hidden behavior unknown. This is a small typed IR, not a complete representation of every framework.

Node IDs currently depend on traversal order. Source maps include generated Swift symbols and hashes; these enable inspection, **not safe incremental synchronization yet**. Stable semantic identity and a three-way merge are prerequisites for sync. New node kinds require renderer support, fixtures, schema evolution and a compatibility decision. Do not append arbitrary unvalidated payloads to bypass the schema.

## First adapter and renderer

`html-inline@1` reads one explicit UTF-8 HTML file (maximum 256 KiB), parsed with parse5. It extracts body structure, headings, paragraphs, columns, inline styles and native disclosure interaction. CSS support is intentionally restricted; style sheets, scripts, links, images, forms, unsupported attributes and unsupported CSS generate limitations. Generation fails when limitations remain. Flex must explicitly declare column direction.

The renderer emits SwiftUI Text, VStack, ScrollView and DisclosureGroup with local state and ScaledMetric. It never embeds a WebView. It preserves supported explicit colors rather than inventing a palette. Font rasterization, line breaking, safe areas and the platform disclosure indicator differ from the browser. Missing dark appearance, assets, backend and navigation are reported as unresolved requirements, not invented functionality. Even zero unsupported declarations does not mean pixel-perfect reconstruction.

`generate` writes `.ios-agent/app-ir.json` and `.ios-agent/source-map.json`. Existing output folders are refused. Failure can leave a newly reserved partial output directory for inspection; no existing user folder is cleaned up automatically. Schema validation is structural: a hand-edited IR's source hash is not independently authenticated against the original file.

## Ordered roadmap and acceptance gates

| Milestone | Dependencies | Completion gate | Current status |
| --- | --- | --- | --- |
| 1. Audit/reuse plan | Existing main | Concrete reuse map, gaps, risks and compatibility contract | Complete |
| 2. IR foundation | 1 | Versioned schema, provenance, graph validation, adversarial fixtures | Implemented for a bounded subset |
| 3. HTML vertical prototype | 2 + local Xcode | Real native build, launch, disclosure interaction test, captures and comparison | Experimental; evidence in benchmark README |
| 4. Reliable reference verification | 3 | Pinned capture conditions, aligned regions, state variants, accessibility checks, atomic resumable checkpoints and independently reviewed fixes | Partial: passive typography, bounded repair and hashed checkpoints implemented; archived local UIKit candidate authorized as a local-only baseline; production/hosted fidelity remains unproven |
| 5. CSS/assets/routes | 4 | Golden layouts, no silently dropped declarations, local asset hashes and licensing review, functional navigation tests | Planned |
| 6. React/Next adapters | 5 for full completion | AST/static evidence only; backend stays server-side; fixture builds/tests/captures; dynamic ambiguity reported | Partial: bounded local React modules, literal props/expressions, children, boolean state/actions, conditional views, controlled text inputs and flat MemoryRouter routes; Next.js, effects and general state/events remain unsupported |
| 7. Screenshot/Figma ingestion | 4 | Authorized image/design snapshots, visible facts separated from hidden requirements, traceable reconstruction | Planned |
| 8. Flutter/React Native/other adapters | 6 | Per-adapter independent fixtures and native replacement mapping | Partial: static Vue/Svelte imports with rejection tests; native verification pending. Flutter, React Native and Angular remain planned |
| 9. Source synchronization | Stable node identity | Three-way source/IR/native diff, no overwrites on conflicts, regression tests | Partial: conservative file-level three-way reconciliation with review bundles; semantic merges and stable-identity source/IR synchronization remain planned |
| 10. Studio/roles/provider expansion | Proven contracts | Real events and evidence, provider capability negotiation, cancellation, shared checkpoints | Partial: offline evidence viewer plus local Studio import/generation, folder import, build/launch/capture controls and project ZIP export; selected-device local HTTP build/launch/capture/export verified for one reusable React fixture; browser-native interaction, fidelity and autonomous repair integration remain open |
| 11. Release preparation | Independent review and E2E gates | Compatibility documentation, truthful support matrix, explicit release authorization | Not requested for this branch |

The next milestone is verification and CSS/layout correctness, not adding framework names. No universal-support, production-readiness or fidelity claim is justified by this prototype.

## Contributor workflow

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node --test mcp-server/test/app-ir.test.js
node mcp-server/dist/unified.js app-ir inspect benchmarks/universal/html-disclosure/index.html FieldNotes > /tmp/field-notes.json
node mcp-server/dist/unified.js app-ir validate /tmp/field-notes.json
node mcp-server/dist/unified.js app-ir generate /tmp/field-notes.json /tmp/new-field-notes
# Real unsigned native verification; choose an available simulator UDID:
node benchmarks/universal/run-html.mjs /tmp/new-verification SIMULATOR_UDID REFERENCE_PNG
npm test --prefix mcp-server
```

The MCP `ios_import_html` tool performs the same read-only inspection. No `/ios-create` alias replaces `/ios-build`. No account, model subscription or network is needed for the adapter/renderer/benchmark; development dependency installation and optional XcodeGen are separate tool setup.

Every new adapter must include unsupported-feature and malicious-input fixtures. Every renderer change requires compilation and meaningful behavior tests on macOS before being described as verified. Record skipped/unavailable checks separately. Keep before/after captures, source hashes and unresolved differences. Do not retune historical benchmark evidence or manufacture a visual pass.


## M2.1 — deterministic typography verification (experimental)

The shared `app-ir/typography.ts` contract compares visible region IDs and word-index line boundaries. The HTML adapter annotates original source byte ranges, then measures DOM word ranges without inserting layout-changing spans. The native benchmark uses opt-in SwiftUI `Text.LayoutKey` observations / `TextAttribute` word identities (iOS 18+) and XCTest accessibility values. Container IDs are deliberately omitted because they propagate to descendants in SwiftUI; leaf IDs retain App IR traceability. Ordinary generated apps do not contain the probe.

Disclosure markers are not words: only the summary label enters the transcript. Closed disclosure body text is excluded. Exact visible text, unique IDs and complete ordered word coverage are mandatory. Split words, unsupported scripts/whitespace, missing regions and changed instrumentation remain unavailable. Current coverage is plain-text LTR English plus middot at the default text size; XXXL receives interaction and clipping checks, not a source typography equivalence claim. OCR is retained solely as supporting evidence.

The measurement probe must render pixel-identically to the ordinary app. A different image makes all probe conclusions provisional, including apparent text/truncation failures. No pixel tolerance has been relaxed. The original drawing-based probe caused one-level channel differences. A controlled experiment isolated the custom drawing path. Its passive replacement produced identical pixels and nine complete regions locally and on hosted Xcode 26.5. Hosted default-size measurements expose the remaining heading-wrap mismatch; independent reference approval and a passing complete gate remain required. Neither experiment constitutes an accepted repair.

Known-good promotion additionally requires an independently reviewed reference. A human reviews the original source, reference image, native image, region mapping and capture conditions, then supplies a JSON file through `FIDELITY_REFERENCE_APPROVAL`:

```json
{"version":1,"referenceHash":"<sha256 of reference.png>","pinsHash":"<sha256 of JSON.stringify(evidence.pins)>","reviewer":"<reviewer's name>","reviewedAt":"<ISO 8601 UTC timestamp>","decision":"approved"}
```

This is trusted local input, not authentication or a cryptographic signature. The agent must not manufacture approval. The approval content is bound into the resume contract; adding or changing it requires a new run directory. Approval alone never overrides failed, unavailable or regressed quality checks. No reviewed reference or known-good baseline is claimed in this milestone.

Reproduce with the existing fidelity runner and `local.json` or `ci.json`; run the DOM test with `node --test benchmarks/universal/fidelity/dom-typography.test.mjs`. The hosted workflow installs its pinned Playwright dependency and executes the same protocol. The benchmark remains independent of future framework adapters. Keep prior M1/M2 evidence immutable and record new runs separately.

## Static React adapter (experimental, not general React/Next.js support)

`app-ir inspect-react App.tsx AppName` parses a bounded UTF-8 file with the pinned TypeScript parser. It never imports the application, executes JavaScript, installs its dependencies or contacts a backend. Named, parameterless function components with a single JSX return may compose other same-file components. Literal inline style objects and plain JSX text lower through the existing HTML subset into the same versioned App IR and SwiftUI renderer. Original TSX hashes and UTF-8 byte ranges are retained; repeated component instances have distinct native node IDs while sharing definition ranges.

This is syntax inspection, not TypeScript type-checking or a React runtime. Only the five basic XML entities are decoded; other entity references and nonbreaking/special whitespace are rejected rather than silently changing wrapping.

Same-file components now accept literal string/number props, one props identifier or shallow named destructuring (including aliases), direct prop reads, forwarding, and literal style values. Explicit JSX children slots can be read as `children` or `props.children`, forwarded through wrappers, and rendered repeatedly with distinct native node IDs. Slots retain the caller’s lexical props; finite nested instances are distinguished from recursive component definitions. Missing accessed slots, render callbacks, and explicit `children=` attributes are rejected. Supplied children are syntax-validated even when a component discards them, because React constructs child expressions eagerly. Validation consumes the shared expansion budget; deeply nested wrappers can therefore reach the explicit limit before emitting 400 nodes. The entry remains parameterless. Each expanded node retains definition and invocation/value evidence. This is bounded syntax lowering, not JavaScript evaluation. Primitive template interpolation, numeric unary signs, and `+`, `-`, `*`, `/`, `%` over resolved literal operands are supported. Addition follows string/number operand semantics; other arithmetic requires numbers. Calls, implicit numeric string coercion, non-finite results, control characters, and excessive expression depth/output/work are rejected. No imported code executes.

Apart from the bounded boolean-state and MemoryRouter mappings below, imports, hooks, arbitrary expressions, object/boolean props, whole-parameter defaults/rest bindings, reserved key/ref props, spread attributes, async components, event handlers and unresolved components are rejected. Unsupported HTML elements/CSS remain limitations that block generation. This does not implement Next.js routing/server components, general React state, API calls, external stylesheets, images or arbitrary project conversion. A `use client` directive is accepted as syntax only; it does not enable client execution. The TypeScript parser is a runtime dependency because installed CLI users need it.

The shared fixture `benchmarks/universal/html-disclosure/App.tsx` is structurally equivalent to its HTML reference; a regression test requires identical native nodes/styles and generated SwiftUI. Run the same native verification protocol with `FIDELITY_ADAPTER=react-static`; the adapter choice is included in the resume contract. The HTML reference still comes from independently authored HTML, not a screenshot generated by the SwiftUI renderer. Do not describe this as a React browser runtime equivalence test.

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/html-disclosure/App.tsx FieldNotes > /tmp/react-ir.json
node mcp-server/dist/unified.js app-ir validate /tmp/react-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/react-ir.json /tmp/new-react-native
FIDELITY_ADAPTER=react-static node benchmarks/universal/fidelity/run.mjs benchmarks/universal/fidelity/local.json /tmp/new-react-evidence
# If Playwright's browser is unavailable, an explicit CHROME_PATH is supported;
# its actual browser version enters the pinned evidence contract.
```

### Boolean state and button transitions (experimental)

The same importer accepts `import {useState} from 'react'` as a syntax marker;
it never loads React. Only the parameterless entry component may declare up to
16 `const [value, setter] = useState(true/false)` bindings. A dedicated text
element may contain `value ? literalExpression : literalExpression`. A plain-text
`button` may use `onClick={() => setter(true)}`, `setter(false)` or `setter(!value)`.
State and setters remain lexical bindings, including children passed through
same-file wrappers. Inline controls inside text elements are rejected to avoid
HTML parser reparenting or loss of inherited style.

Stateful input emits App IR 1.1.0 with boolean state records, text bindings and
validated set/toggle actions; static input retains 1.0.0. The parser rejects
missing state references, invalid defaults, wrong node/action combinations and
state fields falsely labelled 1.0.0. Generated SwiftUI uses native `@State`,
`Button` and dynamic `Text`, with stable accessibility IDs and Dynamic Type.
The native button appearance is a platform mapping, not a browser fidelity claim.

Number/object state, general functional updater callbacks, state in reusable component
instances, effects, async events, event parameters, callback props, conditional
view trees and persistence remain unsupported; navigation is a separate bounded mapping below. No state is inferred
from names or comments. Source ranges include declarations, text branches and
handlers. Unsupported behavior fails before project generation.

[The independent native fixture](../../benchmarks/universal/react-state/README.md)
checks toggling, assignments, state isolation, relaunch, clipping and accessibility
at Large/XXXL. Its resumable raw evidence is separate from the HTML fidelity gate.
Do not count a native behavior pass as visual acceptance or support for arbitrary
React applications.

The [recorded local run](../../benchmarks/universal/evidence/react-boolean-state-local-20261021/README.md)
contains an unsigned build and three native tests executed at each of Large and
XXXL, followed by a completed-run resume that reused all four checkpoints. It
does not establish hosted success, crash recovery during an active native test,
or visual-fidelity acceptance.

### Optional local evidence viewer

`node benchmarks/universal/render-evidence.mjs EVIDENCE_DIRECTORY NEW_HTML_FILE` creates a standalone offline review page from a saved fidelity artifact: source reference, native captures, differences, environment, tests and repair outcomes. It works with HTML or React runs, is optional for CLI/MCP users, does not expose a network service, and cannot approve or promote a baseline. It escapes report content, embeds only bounded local PNG evidence and refuses overwrite/path escape. Missing evidence is labelled unavailable. This is saved-result review, not live simulator streaming or a Studio build backend.

### Next milestones and completion gates

1. Resolve the heading's actual wrap mismatch without changing source typography merely to fit the fixture; repeat local/hosted comparison. Passive observation itself now has hosted zero-difference evidence.
2. Obtain independent human reference approval only after reviewing source, images, word boundaries and capture pins. Approval cannot override a failed gate.
3. Extend React through explicit IR contracts for props/state/navigation, with unsupported-feature tests before adding other frameworks. Current implementation handles static components, bounded literal props and primitive constant expressions; general state, effects and arbitrary routing remain unsupported. Boolean-state and memory-route fixtures are separate native behavior benchmarks.
4. Connect the saved-evidence viewer to the optional Studio UI after its artifact boundary is established. Keep CLI use independent.
5. Add native dark-mode, responsive/multi-screen and asset fixtures before making wider design-quality claims. No backend contract, animation or framework support is implied by this prototype.

Literal-prop fixture verification uses `FIDELITY_ADAPTER=react-literal-props` with `App.props.tsx`. Portable tests require identical generated native source to the independent HTML fixture; this equivalence is not a new native execution claim. The hosted workflow exposes this adapter explicitly and preserves separate evidence.

### Explicit React memory routes (experimental)

The syntax-only adapter recognizes an explicit `react-router-dom` MemoryRouter,
flat Routes/Route declarations and literal Link pushes. It records an App IR 1.2.0
navigation table, validates every destination and preserves entry-owned boolean
state across screens. Node IDs and byte provenance remain distinct when components
are reused. The generator maps this contract to NavigationStack/NavigationLink
with native Back, without executing the imported project. Existing non-routed
1.0.0/1.1.0 generation stays unchanged. This does not enable general routing,
Next.js, nested/parameterized paths, redirects, history-forward synchronization,
component-local lifecycle or browser scroll restoration.

The [three-screen native benchmark](../../benchmarks/universal/react-navigation/README.md)
uses the same checkpointed runner as the boolean-state benchmark, with a separate
fixture/contract and three required tests at each text size. It records actual
stack transitions, state retention, accessibility audits and relaunch. No HTML
fidelity score, reference approval or known-good promotion is implied. See its
README for the exact supported grammar, unsupported behavior and reproduction.

## Conditional React views (source integration; native verification pending)

IR 1.3.0 adds a typed `conditional` node referencing an entry boolean state and up
to two exclusive child roots. The React importer accepts `state ? <Block/> : null`,
two JSX branches, `state && <Block/>` and a single `!state` inversion. It validates
both branches even if one starts inactive. Same-file components and children
composition reuse the existing bounded syntax importer; input JavaScript never
executes. The renderer emits native `@ViewBuilder`/`if` branches rather than hiding
inactive controls with opacity. Older IR schemas keep their existing output.

Each branch must expand to one block root. Inline span/strong roots, fragments,
unknown conditions, effectful expressions, conditional text mixtures and disclosure
lifecycle inside conditional views are rejected. The schema also rejects manually
constructed conditional disclosure trees. Styles belong to the branch roots, not
the structural conditional node. No local component state or effects are inferred.

See [the generation fixture](../../benchmarks/universal/react-conditional/README.md).
Portable source tests establish syntax/IR/rendering behavior only. Native execution,
VoiceOver, Dynamic Type and visual fidelity for this new fixture remain unverified.


### Previous-value boolean updates

The React adapter accepts `setSaved(previous => !previous)` in a supported
button handler. It maps to the existing native boolean toggle, preserving the
setter's state identity. Parenthesized expressions and parameter shadowing are
supported. Async/block callbacks, defaults, destructuring, captured state,
side effects and other expressions fail explicitly. This is a syntax mapping,
not a JavaScript evaluator. Portable tests compare its output with the existing
toggle and verify byte provenance; no new native runtime result is claimed.

### Vue static SFC adapter (experimental)

`app-ir inspect-vue App.vue` maps a single static template through the existing
HTML adapter into App IR. UTF-8 ranges and source hashes point into the original
SFC, including non-ASCII prefixes. HTML normalization cannot silently turn a
PascalCase Vue component into a native HTML mapping: those tags are rejected.
Scripts, style blocks, imports, interpolation, directives, component instances,
slots and custom template languages remain unsupported and block generation.
The CLI and Studio share this implementation. See the [fixture and exact scope](../../benchmarks/universal/vue-static/README.md).
Portable conversion is tested; native execution and visual fidelity for Vue are
not yet established. Other framework adapters are still unfinished.

### Connected MCP clients

The existing `ios_import_html` tool retains its name for client compatibility and
accepts optional `adapter: "html" | "react" | "vue"` (default HTML). All three use
the same bounded local-file readers and importers as the CLI. Unsupported adapters
are rejected by the tool schema. This read-only tool returns IR and limitations;
it does not generate, execute, build, score or publish an app. Source content is
returned to the connected client, so choose non-sensitive files.

### Local React modules

The CLI/MCP file importer now resolves a bounded tree of relative `.tsx` component
imports. It reads each source once, rejects cycles/escapes/aliases/name collisions,
and verifies that JSX components are visible in their original module before
linking through the existing parser. Imported JavaScript is never executed.
Source hashes and UTF-8 provenance remain tied to each original file, including
non-ASCII comments in removed import declarations. Existing single-file imports
retain their previous IR. Studio pasted source remains single-file.

See [the module fixture](../../benchmarks/universal/react-modules/README.md) for
supported grammar and limits. This is not a bundler, Next.js adapter or package
resolver. Native execution and fidelity of the new fixture remain unverified.

### Svelte static markup (experimental)

`app-ir inspect-svelte App.svelte`, the existing MCP import tool's `svelte`
adapter, and Studio map the bounded static-markup subset through the same IR.
The shared Vue/Svelte structural validator rejects implied, discarded or reparented
HTML nodes before lowering. Source code is never compiled or executed. Scripts,
stylesheets, expressions, blocks, runes, directives, components and SvelteKit are
unsupported; this is not general Svelte support. See the [fixture](../../benchmarks/universal/svelte-static/README.md).
Native execution and fidelity remain unverified for this new adapter.

### Authorized local initial baseline (October 28, 2026)

The user separately authorized the archived, verified UIKit candidate as an
initial known-good baseline for the exact approved local HTML capture. The
[baseline record](../../benchmarks/universal/evidence/local-known-good-20261028/README.md)
links the unchanged evidence, reference approval, policy and explicit permission.
All 44 archived hashes were rechecked; no native execution was repeated. The
original failed-baseline repair verdict is preserved. This does not enable the
UIKit production renderer, approve hosted captures or publish npm. Future repairs
still require complete verification against matching pins and reference.

### Controlled React text input (IR 1.4.0)

Entry-owned string state now supports controlled text inputs and dedicated text
bindings. The importer validates a single event-target-value assignment to the
same state as the field, with explicit accessible labels and no executed code.
The generator emits SwiftUI TextField bindings and preserves boolean transitions.
Schema validation rejects mismatched state types, invalid controls and older
versions carrying the new fields. Existing IR 1.0–1.3 output is preserved.
See [the input fixture](../../benchmarks/universal/react-input/README.md) for exact
syntax, limitations and outstanding native acceptance. This is not general forms,
authentication, validation or persistence support.

String-state buttons may assign a bounded literal (including an empty string),
providing clear/reset behavior through the same IR. The validator rejects type
mismatches and control characters; Swift assignments escape source values.
Explicit foreground/background button styles in IR 1.4 use plain native styling
rather than adding a translucent system fill. Older schema output is unchanged.

Reusable React components may borrow direct references to entry-owned states and
setters as props. These references retain their original state IDs and source
provenance; they do not instantiate component-local state or execute callbacks.
Controlled fields and explicit boolean/string actions use the same validation in
children as at the entry. Arbitrary callback props, computed state references and
component-local hooks remain unsupported. Inline and composed equivalents are
checked for identical generated SwiftUI. Native evidence for reset inputs must
not be represented as native verification of arbitrary reusable components.

### Studio native evidence (2026-10-28)

The authenticated local HTTP path imported a two-file React fixture, generated
SwiftUI, built and launched on the explicitly selected iPhone 18 Pro / iOS 27
simulator, captured the populated screen and exported an editable Xcode ZIP.
The first capture was a blank launch transition; both captures are retained in
[the evidence archive](../../benchmarks/universal/evidence/studio-native-local-20261028/README.md).
A cancellable two-second delay reduces that race but does not prove readiness.
The Studio smoke did not run native interactions or establish visual fidelity.
Separate input tests passed typing, reset and state retention at Large and XXXL;
the accessibility audit still failed at both sizes. Those failures are preserved
and do not become passing checkpoints.

### Conservative source reconciliation

`app-ir reconcile BASE_SWIFT LOCAL_SWIFT GENERATED_SWIFT NEW_REVIEW_DIRECTORY`
compares the previous generated source, the developer's current source, and newly
regenerated source. It preserves byte-for-byte local edits when generation has not
changed, chooses new generation when local source is unchanged, and accepts
identical edits on both sides. If both sides differ, it emits a conflict report
and all three inputs, with no candidate Swift file. Even non-overlapping edits
require review: semantic and line-level merges are not yet implemented.

The command never edits the project. It reserves a new directory, writes exact
input copies and any candidate, then writes `report.json` last. A missing report
means incomplete output. CLI exit 2 means conflict; exit 0 means a review bundle
was produced, not compilation or acceptance. Inputs must be bounded UTF-8 text
files; symlink leaves and existing output directories are refused. Developers
must keep the correct prior base; hashes identify supplied bytes but do not prove
their provenance. No source/IR stable-identity synchronization is claimed yet.

### Erased React type syntax

Local component interfaces/type aliases and explicit type-only imports are now
accepted without loading type dependencies. Type annotations do not authorize new
runtime behavior: props, state, events and expressions still use the existing
bounded mappings. This is not TypeScript type checking; runtime imports, enums,
namespaces and mixed value/type import lists remain unsupported. See
[the typed component fixture](../../benchmarks/universal/react-typed/README.md).

Matching primitive `useState<string>`/`useState<boolean>` annotations and input
event parameter/return annotations are supported without changing emitted Swift.
Inline `import {type T}` is rejected because compiler settings can preserve its
module evaluation. Full declaration-level `import type` is the supported form.

### Bounded React prop defaults

Shallow destructured component props may use string/number defaults expressed with
the existing bounded constant-expression evaluator. Omitted props use the default;
provided values (including empty strings and zero) take precedence. Renamed bindings
and original source evidence are preserved. Defaults are validated even when a
caller overrides them; calls, dependent defaults, objects, null/undefined values,
rest bindings and whole-parameter defaults remain unsupported. No imported code
is evaluated and no React runtime or TypeScript typechecker is invoked.

### React local primitive constants

Function components may declare one `const` string/number binding per statement
before their return, using the existing bounded arithmetic/template evaluator.
Bindings resolve in declaration order from literal props or earlier constants,
retain source evidence, and can supply text, props or mapped inline style values.
Component instances have separate scopes. This does not execute JavaScript or add
reactive derived state: calls, mutable declarations, objects, booleans, destructuring,
forward references, shadowing and state-derived constants fail explicitly, even
when unused. Existing entry boolean/string hooks continue to use their own IR mapping.
