# Evidence, sources and scope

## What does this add to Xcode's built-in skills?

Xcode already includes agent skills and can build and test an app. Apple's
[agent customization guide](https://developer.apple.com/documentation/xcode/extending-and-customizing-agents/)
describes built-in expertise, skills, external MCP servers and plug-ins. This
repository does not claim to replace that expertise or produce better results
than Xcode's own skills.

Use the built-in workflow when it meets your needs. This project is useful when
you want version-controlled guidance shared across Claude, ChatGPT/Codex, Gemini
CLI and Muse; inspectable heuristic reviews; local source retrieval; or repeatable
asset-generation and simulator workflows outside a single editor. Those are
concrete capabilities, not evidence of a better model.

## Where do the rules come from?

The repository combines authored engineering guidance, public Apple references,
Swift examples and tests. It is not Apple's source code, an Apple-certified rule
set, or a claim that every recommendation came from personal production experience.

| Material | Provenance | How to assess it |
|---|---|---|
| Technology and update directory | Public Apple documentation metadata, with source URLs and snapshot dates | Follow the original page for current SDK details; metadata coverage is not implementation coverage. |
| Framework and design guides | Repository-authored explanations with primary references | Distinguish API requirements from recommendations and sample simplifications. |
| Static review rules | Inspectable TypeScript heuristics in the MCP server | Read the finding's rule and linked guide; evaluate false positives in your actual app. |
| Swift samples | Repository source and corresponding tests | Compilation and acceptance evidence are specific to the tested SDK and scenario. |
| Client compatibility | Recorded local connection checks | Discovery does not prove model-driven app creation. |

Examples: [release verification](apple/ios-27-release-verification.md),
[review scope](mcp/tools.md), [asset generation](design/asset-generation.md),
[Foundation Models sample](../samples/AppleRecipes/README.md), and
[Reading List acceptance checks](../samples/ReadingList/README.md).

## Does the skill improve generated output?

There is **no established quality or token-saving advantage** yet. A compiling
sample, successful tool connection or large guide library cannot answer that
question. A paired benchmark must give both conditions the same brief, client,
acceptance checks and retry budget; publish failures as well as successes.

The requested evaluation uses 20 fixed Swift microtasks with and without the
skill in Claude Code and Codex. It measures compilation, hidden assertions,
review blocker counts and reported tokens. Microtasks cannot establish complete
app quality, visual design, accessibility, App Store readiness or superiority to
Xcode's built-in skills. One trial per condition is exploratory, not a causal or
statistically reliable result. Publish the full protocol and results before
making improvement claims.

## Shipped versus unfinished

This status is about implementation and evidence, not promises made in conversation.

| Work | Status |
|---|---|
| Unified reviews, local references, app starter, simulator build/launch/screenshots | Published in npm 2.7.0; 36 tools, including local issue previews. |
| Real asset catalogs and offline SVG-layer PNG icon | CLI 0.3.0 and consolidated MCP 2.7.0 published; asset generation tested. |
| Muse setup; Gemini CLI setup | Muse discovery/Stop hook and Gemini connection verified; no complete app-generation claim. |
| Claude repair adapter | Real bounded repair passed; full generated-app run and model planning still unverified. |
| README, four-client focus, issue voting and automatic Pages feature updates | Pushed and deployed. |
| GitHub review Action, changed-lines mode, rule configuration, patch proposals | Local drafts; not shipped or advertised as available. |
| Accessibility-tree tooling and runtime log/hang measurements | Not implemented in the published simulator package. |
| Asset auditing, symbol-availability index, screenshot batches, dark-mode comparison | Not implemented in the published package. |
| Native Icon Composer .icon generation | Not implemented; use Apple's Icon Composer with the editable layers. |
| Paired benchmark | A 20-microtask harness exists; results are not published. A controlled full-app benchmark remains unfinished. |
| Xcode 27, Siri, Core AI and live model-routing integration | Documentation exists; runtime verification remains incomplete. |

Private developer-account data, API keys, certificates and signing profiles are
not documentation resources. Published artifacts use project source and public
references. No personal app source is needed for these public fixtures.
