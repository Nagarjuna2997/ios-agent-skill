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

Implemented node kinds: column, text and disclosure. Implemented style fields: six-digit colors, padding, gap, scaled system font size, bold, corner radius and centered text. Requirements explicitly classify navigation/assets/motion/state/data/API/auth/native/accessibility/responsiveness/appearance as extracted, inferred or unknown. The current HTML adapter leaves hidden behavior unknown. This is a small typed IR, not a complete representation of every framework.

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
| 4. Reliable reference verification | 3 | Pinned capture conditions, aligned regions, state variants, accessibility checks, atomic resumable checkpoints and independently reviewed fixes | Partial: bounded repair, hashed checkpoints and regression rejection implemented; trusted typography still blocked |
| 5. CSS/assets/routes | 4 | Golden layouts, no silently dropped declarations, local asset hashes and licensing review, functional navigation tests | Planned |
| 6. React/Next adapters | 5 | AST/static evidence only; backend stays server-side; fixture builds/tests/captures; dynamic ambiguity reported | Planned |
| 7. Screenshot/Figma ingestion | 4 | Authorized image/design snapshots, visible facts separated from hidden requirements, traceable reconstruction | Planned |
| 8. Flutter/React Native/other adapters | 6 | Per-adapter independent fixtures and native replacement mapping | Planned |
| 9. Source synchronization | Stable node identity | Three-way source/IR/native diff, no overwrites on conflicts, regression tests | Planned |
| 10. Studio/roles/provider expansion | Proven contracts | Real events and evidence, provider capability negotiation, cancellation, shared checkpoints | Planned |
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

The shared `app-ir/typography.ts` contract compares visible region IDs and word-index line boundaries. The HTML adapter annotates original source byte ranges, then measures DOM word ranges without inserting layout-changing spans. The native benchmark uses opt-in SwiftUI `TextRenderer` / `TextAttribute` word identities (iOS 18+) and XCTest accessibility values. Container IDs are deliberately omitted because they propagate to descendants in SwiftUI; leaf IDs retain App IR traceability. Ordinary generated apps do not contain the probe.

Disclosure markers are not words: only the summary label enters the transcript. Closed disclosure body text is excluded. Exact visible text, unique IDs and complete ordered word coverage are mandatory. Split words, unsupported scripts/whitespace, missing regions and changed instrumentation remain unavailable. Current coverage is plain-text LTR English plus middot at the default text size; XXXL receives interaction and clipping checks, not a source typography equivalence claim. OCR is retained solely as supporting evidence.

The measurement probe must render pixel-identically to the ordinary app. A different image makes all probe conclusions provisional, including apparent text/truncation failures. No pixel tolerance has been relaxed. The initial local experiment detected one-level channel differences, so the probe cannot yet establish a trusted typography pass. This is an unresolved measurement limitation, not an accepted repair.

Known-good promotion additionally requires an independently reviewed reference. A human reviews the original source, reference image, native image, region mapping and capture conditions, then supplies a JSON file through `FIDELITY_REFERENCE_APPROVAL`:

```json
{"version":1,"referenceHash":"<sha256 of reference.png>","pinsHash":"<sha256 of JSON.stringify(evidence.pins)>","reviewer":"<reviewer's name>","reviewedAt":"<ISO 8601 UTC timestamp>","decision":"approved"}
```

This is trusted local input, not authentication or a cryptographic signature. The agent must not manufacture approval. The approval content is bound into the resume contract; adding or changing it requires a new run directory. Approval alone never overrides failed, unavailable or regressed quality checks. No reviewed reference or known-good baseline is claimed in this milestone.

Reproduce with the existing fidelity runner and `local.json` or `ci.json`; run the DOM test with `node --test benchmarks/universal/fidelity/dom-typography.test.mjs`. The hosted workflow installs its pinned Playwright dependency and executes the same protocol. The benchmark remains independent of future framework adapters. Keep prior M1/M2 evidence immutable and record new runs separately.
