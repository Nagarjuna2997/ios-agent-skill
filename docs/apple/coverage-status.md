# Apple Documentation Memory Coverage Status

## Context

Load this when the user asks whether Apple documentation memory is complete, how much is covered, what remains, or whether the repo mirrors the Apple Developer Documentation navigator.

## Current status

As of this repo update, Apple Developer Documentation memory is covered at the navigator, footer, topic-family, and framework-family level.

Covered memory layers:

- Top-level documentation navigator.
- Platforms.
- Tools.
- Topics and technologies.
- Resources.
- Support.
- Account areas.
- Programs.
- Events.
- A-section framework memory.
- B-M framework family memory.
- N-Z framework family memory.
- Swift brain.
- AI and Machine Learning brain.
- Xcode memory debugging brain.
- Apple framework catalog: `99/99`, `100.0%` for the repo's tracked app-development technologies.

## What "covered" means here

Covered means the repo contains internal agent memory for:

- what the area is for
- when to choose it
- when not to choose it
- setup and entitlement risks
- privacy/security rules
- performance/lifecycle risks
- implementation defaults
- verification habits
- anti-patterns
- routing to deeper local docs

Covered does not mean:

- every Apple symbol page is copied
- every one of the 404 navigator items has a dedicated single file
- every API method/property/type has full sample code
- beta documentation has been treated as stable
- local Xcode/device verification has been run for every framework

## Truthful answer to "full covered or not?"

Full category/family memory coverage: YES.

Literal 404-item per-symbol mirror: NO.

The repo now has enough memory for an agent to route and reason across the Apple Developer Documentation navigator without opening links first. When a user asks for a specific obscure framework or symbol, the agent should use the relevant family memory, then create or deepen a dedicated framework/symbol file if needed.

## Next deepening levels

If the user asks to go deeper after this point, proceed in this order:

1. Add dedicated files for high-value obscure frameworks from the navigator.
2. Expand framework files with compile-oriented Swift examples.
3. Add entitlement/setup checklists.
4. Add failure-mode playbooks.
5. Add sample-app patterns.
6. Add MCP static analyzers or lint checks where the rule can be automated.

## Reporting template

```text
Apple docs memory status:
Category/family memory: covered
Tracked Apple technology catalog: 99/99, 100.0%
Per-symbol Apple docs mirror: not attempted
Latest added memory files: docs/apple/...
Remaining work only if user wants deeper: specific framework/symbol files
```
