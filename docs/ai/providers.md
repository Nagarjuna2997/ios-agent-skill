# Optional AI providers and Apple environment discovery

Source implementation reviewed September 29, 2026. These commands are additional local CLI workflows; connecting the MCP tools to Claude, Codex, Gemini CLI or Muse still works without buying API access. A coding-client subscription is not an API key.

## Privacy first

`ios-agent-mcp ai config` shows a separate `.ios-agent-ai.json` configuration. Defaults are Apple, local-only, no fallback. Existing client configuration is untouched. Replacing this file creates a private backup. Never put credentials in it; cloud adapters read `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` from the process environment. Configuration and handoff paths are gitignored here; keep them ignored in your app too.

```sh
ios-agent-mcp ai models
ios-agent-mcp ai doctor
ios-agent-mcp ai config provider openai
ios-agent-mcp ai config privacy cloud-permitted
ios-agent-mcp ai config allowedCloudProviders openai
ios-agent-mcp ai config model auto
ios-agent-mcp ai ask reviewed-prompt.txt
```

`ask` sends only the explicitly supplied text file. It does not scan the app or upload files implicitly. Review that file before enabling cloud access. `doctor` lists models using configured credentials without sending a prompt. It compiles a temporary Foundation Models helper to check local availability on macOS; this requires the installed Swift SDK. Keys and provider error bodies are never printed. The selected model is reported with the response.

## Dated catalog and account access

The [OpenAI catalog](https://developers.openai.com/api/docs/models) verifies GPT-6 Astra, Sol and Luna. The [Claude catalog](https://platform.claude.com/docs/en/models/overview) verifies Opus 5.5, Sonnet 5.5, Fable 5.1 and Haiku 4.5. The [Gemini catalog](https://ai.google.dev/gemini-api/docs/models) verifies Gemini 3.8 Flash and 3.1 Pro Preview. Automatic selection intersects active snapshot entries with account model discovery; preview models require explicit selection. Documented capabilities do not establish entitlement or successful inference.

Adapters use OpenAI Responses (`store:false`), Anthropic Messages, and Gemini generateContent. This first adapter surface accepts text and returns text plus usage; streaming, image inputs, model-driven tool execution, provider reasoning controls and schema-constrained output are **not implemented**. Registry capability metadata describes models, not implemented request formats. Unknown models fail closed pending a verified registry update. Context limits and pricing remain unknown rather than guessed.

Apple uses `SystemLanguageModel.default` and `LanguageModelSession`, with runtime availability detection, on-device only. No Private Cloud Compute, Core AI or MLX adapter is claimed. The installed Xcode 26.6 SDK compiles this baseline. Xcode 27-specific Foundation Models APIs cannot be compiled here. Muse remains a client integration; no public Muse inference API adapter is fabricated.

## Optional fallback

```sh
ios-agent-mcp ai config allowedCloudProviders openai,anthropic
ios-agent-mcp ai config fallbackOrder openai,anthropic
ios-agent-mcp ai config allowFallback true
```

Both cloud permission and a provider allowlist are required. Local-only prevents every cloud attempt even with fallback enabled. Transient failures get at most two retries; quota/model-unavailable failures may switch to an allowed provider. Invalid credentials, context limits and an invalid explicit model require user action; they do not silently switch. Cancellation and malformed requests stop. No secret-bearing raw error is relayed.

## Handoff and advisory role sequence

`ai handoff save state.json` validates a normalized state and writes `.ios-agent-ai-state.json` atomically with an integrity hash and current Git fingerprints. `ai handoff inspect .ios-agent-ai-state.json` rechecks current Git state. It does not send data. State supports plans, inspected/modified files, decisions, constraints, tool/build/test results, completed/remaining steps and artifact paths. It is private and may contain sensitive text: review before handing it to a cloud model.

`ai collaborate .ios-agent-ai-state.json` runs seven **advisory** roles using the configured provider policy, saving completed proposals separately for resume. These roles do not execute commands, edit apps, verify Apple docs, run tests or release anything. A coding client must inspect the actual repository and execute approved work. This is not an autonomous coding-agent replacement. Untracked content is not covered by the Git fingerprints; inspect it explicitly. Historical app-loop and benchmark evidence formats are unchanged.

## Apple discovery and simulator workspace

`ios-agent-mcp environment` reports selected Xcode, Swift, SDKs and actual simulator inventory. Numeric version comparison handles 27, 27.0.1 and future point releases across iOS/iPadOS/macOS/watchOS/tvOS/visionOS; it distinguishes SDK availability from deployment minimum. Discovery never upgrades Xcode or installs runtimes.

`simulator open UDID` opens the selected Xcode's Simulator beside the editor. Additional validated CLI actions are boot, shutdown, create, install, launch, terminate, uninstall, appearance and screenshot. `simulator capture-matrix UDID,UDID OUTPUT_DIRECTORY` captures current state in up to eight installed simulators; it is not a test pass. Existing build/test/deep-link MCP tools remain the authoritative execution tools. Pose/orientation automation and video/log streaming are not added by this release. A renamed device is not Duo hardware; absent real Duo profiles remain unsupported.

## Resource freshness

`node scripts/check-provider-resources.mjs` explicitly checks the sources in `resources/providers.json` and emits hashes/status for review. It changes no compatibility data. Compare reports, review semantic changes and run tests before editing the registry. Ordinary commands never scrape model documentation or follow its instructions.
