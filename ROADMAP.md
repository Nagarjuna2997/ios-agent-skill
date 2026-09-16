# Roadmap

## Available

- One MCP installation for reviews, local references, app scaffolding and simulator tools.
- Dated Apple technology and release-note snapshots, with original Swift implementations and tests.
- Reading List demo with persistence, search and simulator acceptance checks.
- Resumable loop engine with bounded repairs and saved evidence; real Claude repair integration remains unverified.

## This release

- iOS 27/Xcode 27 release-status correction and refreshed Apple snapshots.
- `review_app_intents` with conservative migration advice and opt-in integration checks.
- Compiled Foundation Models tool-calling sample, availability fallback and deterministic tests.
- Official MCP Registry metadata; registry acceptance requires publication and authentication.

## Next verification gates

- Xcode 27 compilation and in-editor MCP/agent acceptance; current local host is Xcode 26.6.
- Live Foundation Models generation and provider routing, Core AI model execution and real Siri behavior.
- Muse Code MCP discovery, hook execution and verification observer; only CLI installation/skill discovery is verified.
- Real Claude repair session after local authentication. Never replace this check with a simulated success.

## Later, based on demand

- `review_foundation_models`, `review_core_ai` and the remaining [analysis tool contracts](docs/mcp/vnext-analysis-tools.md).
- Simulator video/log streaming, UI automation backend and visual review.
- Measured token/context savings on reproducible tasks.
