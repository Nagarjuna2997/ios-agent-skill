# vNext MCP Analysis Tools

## Context

Use this as the contract for expanding `ios-agent-mcp` beyond the current Swift engineering analyzers. These tools remain static, read-only project reviewers. Runtime behavior belongs in `ios-simulator-mcp`.

## Tool Plan

| Tool | Focus | Typical signals |
|---|---|---|
| `review_ui_ux` | Visual structure, native conventions, state coverage | hardcoded spacing, fixed fonts, missing loading/empty/error states, inconsistent radii, excessive `GeometryReader` |
| `review_motion` | SwiftUI animation correctness | broad `.animation`, missing value dependency, infinite animation, layout-heavy animation, Reduce Motion gaps |
| `review_accessibility` | Semantic and inclusive design | missing labels, small tap targets, fixed sizes, contrast-risk colors, ignored Dynamic Type |
| `review_haptics` | Meaningful feedback | haptics fired on appear, duplicated feedback, no reduced-sensory fallback, heavy impact for minor state |
| `review_realitykit` | 3D scene safety and native fit | unbounded asset loads, missing collision/input components, ARKit without permission copy, no fallback |
| `review_metal` | GPU rendering safety | per-frame allocation, missing drawable guard, unsafe buffer sizing, no pixel-format/depth consistency |
| `review_webkit` | Web/native interop safety | untyped JS bridge, broad navigation, injected secrets, WKWebView used where native controls fit better |
| `review_foundation_models` | Foundation Models usage | missing availability gates, no graceful fallback, unsafe prompt logging, absent evaluation path |
| `review_core_ai` | Core AI model integration | model lifecycle, privacy boundaries, device capability checks, background work isolation |
| `review_app_intents` | Siri/App Intents/App Shortcuts | missing parameter summaries, fragile identifiers, no localization, unavailable actions |
| `review_ai_security` | AI privacy and misuse resistance | prompt injection surfaces, secret leakage, unbounded tool calls, unsafe retrieval context |
| `review_ai_evaluations` | Evaluation coverage | no datasets, no code-based evaluators, no regression gate, no failure taxonomy |
| `review_networking` | Network correctness and resilience | unbounded retries, no cancellation, live API defaults in previews/tests, missing offline state |
| `review_persistence` | Data and storage safety | UserDefaults secrets, main-actor I/O, missing migrations, model objects crossing actor boundaries |
| `review_storekit` | Purchase readiness | missing restore path, unverified transactions, no pending/refund handling, live StoreKit in tests |
| `review_permissions` | Permission and entitlement correctness | missing purpose strings, overbroad entitlements, no denied/restricted state, privacy manifest gaps |

## Output Contract

Every new review tool should match the existing analyzer shape:

```json
{
  "summary": "Motion review found 3 issues.",
  "score": 82,
  "counts": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 0
  },
  "files_checked": 18,
  "issues": [
    {
      "rule": "animation-without-reduced-motion",
      "severity": "high",
      "file": "Sources/App/HomeView.swift",
      "line": 42,
      "message": "Animated transition has no Reduce Motion alternative.",
      "why": "Users who disable motion can still receive large movement.",
      "fix": "Read accessibilityReduceMotion and switch to opacity or no animation."
    }
  ],
  "suggestions": [
    "Centralize animation tokens for spring duration and response."
  ]
}
```

## Rule Design

Prefer high-signal rules over style opinions:

- Flag literal spacing only when repeated enough to indicate no token system, or when it creates inconsistent layout.
- Flag fixed font sizes when used in user-facing text without a Dynamic Type path.
- Flag animation problems when they can cause incorrect behavior, inaccessible motion, or performance cost.
- Flag AI issues when they expose privacy, availability, evaluation, or tool-call safety risk.
- Do not score "premium design" from static code alone. Leave aesthetic confirmation to the Visual Iteration Loop.

## Static vs. Runtime Boundary

| Static analyzer can say | Runtime loop must prove |
|---|---|
| A view uses fixed font sizes | Text actually fits at accessibility sizes |
| A button appears to lack a label | VoiceOver announces the correct label and trait |
| A Metal renderer allocates per frame | GPU frame pacing is stable on the simulator/device |
| A splash view ignores Reduce Motion | The captured intro avoids large motion when Reduce Motion is enabled |
| A Foundation Models flow lacks evaluations | The model meets pass/fail thresholds on a dataset |

## Anti-Patterns

```text
// WRONG: add a review tool whose finding is only "looks bad".
Why: static analyzers need reproducible evidence.

// RIGHT: detect concrete code patterns, then route aesthetic verification to screenshots.
```

```text
// WRONG: call App Intents or model providers during static review.
Why: ios-agent-mcp is read-only and network-free.

// RIGHT: inspect declarations, availability gates, privacy handling, and test/evaluation files.
```

```text
// WRONG: create separate output shapes per tool.
Why: clients cannot branch reliably.

// RIGHT: reuse summary, score, counts, files_checked, issues, and suggestions.
```
