# Foundation Models Instruments

## Overview

The Foundation Models instrument in Instruments shows how an app uses language models at runtime: prompts, responses, token use, tool calls, tool latency, session timelines, and bottlenecks. Use it before optimizing prompts, Dynamic Profiles, tools, context windows, or Private Cloud Compute usage.

---

## 1. When to Profile

Profile whenever:

- a Foundation Models feature feels slow
- token usage grows unexpectedly
- a `LanguageModelSession` hits context limits
- tool calls take too long or return too much data
- Dynamic Profiles swap models/instructions unexpectedly
- PCC/server-model routing changes product cost or latency
- evaluation failures need runtime traces

Do not optimize prompts from intuition. Record the runtime behavior first.

---

## 2. Recording Workflow

1. Open the Xcode project.
2. Choose Product > Profile.
3. Select the Foundation Models template in Instruments.
4. Record while exercising the exact AI feature path.
5. Capture screenshots or export the trace for PR evidence.

Before recording, make sure the device is not thermally constrained and no background workload is skewing latency.

---

## 3. What to Inspect

| Signal | Why It Matters |
|--------|----------------|
| Input tokens | Long instructions, schemas, and tool descriptions can dominate context |
| Output tokens | Long answers can increase latency and power use |
| Cached tokens | Reused prefixes can reduce repeated work |
| Tool calls | Slow tools or verbose outputs often cause model delays |
| Session timeline | Reveals repeated calls, retries, or unexpected profile changes |
| Model/provider | Confirms on-device vs PCC/server routing |
| Errors | Shows context overflow, model unavailability, or tool failure |

Pair this with `tokenCount(for:)` and `contextSize` checks in code when available.

---

## 4. Optimization Playbook

| Finding | Fix |
|---------|-----|
| Huge instructions | Split feature roles, shorten policies, use Dynamic Profiles |
| Huge tool schemas | Reduce tool count, tighten argument types, avoid redundant descriptions |
| Huge tool output | Return compact structured summaries, page results, cap search count |
| Repeated cold latency | Use `prewarm(promptPrefix:)` where appropriate |
| Context overflow | Summarize transcript, start a new session, or split work |
| Wrong model route | Inspect profile/model selection and availability branches |
| PCC cost/latency too high | Route smaller tasks to `SystemLanguageModel` |

Always rerun evaluations after prompt or tool-schema changes. Lower token count is not a win if quality regresses.

---

## 5. PR Evidence Template

```text
Foundation Models profiling:
- Device / OS:
- Feature path:
- Input token range:
- Output token range:
- Tool calls:
- Slowest tool:
- On-device/PCC/server route:
- Optimization made:
- Evaluation result after optimization:
```

---

## 6. Review Checklist

- [ ] A trace exists for slow or complex AI flows
- [ ] Token use is measured before and after prompt/tool changes
- [ ] Tool outputs are bounded and summarized
- [ ] Dynamic Profile routing is visible in evidence
- [ ] Context overflow has an explicit mitigation
- [ ] Performance changes are paired with Evaluations results

See also: `docs/frameworks/foundation-models.md`, `docs/testing/evaluations.md`, `docs/frameworks/core-spotlight-rag.md`.
