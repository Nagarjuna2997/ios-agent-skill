# AI Patterns

Use these patterns for Apple Intelligence features that stay additive, private, and testable.

| Pattern | Route | Checklist |
|---|---|---|
| structured generation | Foundation Models `@Generable` | guides, availability, fallback |
| tool calling | Foundation Models tools | Sendable tools, bounded loops |
| app-local RAG | Core Spotlight + Foundation Models | local index, no prompt logging |
| deterministic action | App Intents | schemas, localization, tests |
| prompt evaluation | Evaluations | dataset, pass gate, failure taxonomy |

AI features must degrade to a useful non-AI path.
