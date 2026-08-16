# Evaluations -- Testing Intelligence-Powered Features

## Overview

The Evaluations framework measures the quality of AI-powered features with executable Swift definitions. Use it to compare prompt strategies, catch regressions, test tool calls, evaluate model-as-judge criteria, and attach results to Swift Testing.

> Evaluations is beta in the iOS 27 / Xcode 27 generation. Keep evaluation code close to tests, and expect API names to settle as the SDK stabilizes.

---

## 1. What an Evaluation Contains

Every useful evaluation has four parts:

| Part | Purpose |
|------|---------|
| Dataset | Realistic samples, expected values, edge cases, and adversarial inputs |
| Subject | The feature under test, not just the raw model |
| Evaluators | Code-based checks, model-as-judge checks, or tool-call trajectory checks |
| Aggregation | Summary metrics that decide whether the build can ship |

Avoid vague criteria like "good answer." Convert them into measurable claims: "returns valid JSON," "uses only allowed tags," "calls `SearchNotes` before `CreateSummary`," or "scores 4/5 or higher for factual grounding."

---

## 2. Minimal Evaluation Shape

```swift
import Evaluations
import FoundationModels
import Testing

@available(iOS 27.0, macOS 27.0, *)
struct TaggingEvaluation: Evaluation {
    let dataset = ArrayLoader(samples: [
        ModelSample(prompt: "A quiet mystery set in a coastal town.", expected: ["mystery"]),
        ModelSample(prompt: "A practical guide to sourdough bread.", expected: ["cooking"]),
        ModelSample(prompt: "A memoir about training for a marathon.", expected: ["memoir"]),
    ])

    let subject = BookTaggingService()

    var evaluators: [Evaluator<[String]>] {
        [
            Evaluator("contains expected tag") { sample, response in
                let passed = sample.expected.allSatisfy(response.contains)
                return Metric("expected_tag_present", passed)
            },
            Evaluator("bounded tag count") { _, response in
                Metric("tag_count_valid", (3...8).contains(response.count))
            },
        ]
    }
}
```

Exact signatures can vary during beta seeds. Preserve the architecture: samples in, feature response out, metrics aggregated.

---

## 3. Dataset Design

Build datasets like product specifications:

- **Golden paths:** the most common user requests.
- **Boundary cases:** empty input, max length, ambiguous language, unsupported locale.
- **Safety cases:** sensitive requests, dangerous recommendations, privacy-sensitive data.
- **Regression cases:** every fixed production bug becomes a sample.
- **Tool cases:** expected tool names, call order, and argument constraints.

Keep sample data deterministic and reviewable. Generated synthetic samples are useful for scale, but hand-curated samples should define the release gate.

---

## 4. Evaluator Types

| Evaluator | Use When |
|-----------|----------|
| Code-based `Evaluator` | Correctness has a computable definition: schema, range, exact match, contains, count |
| `ModelJudgeEvaluator` | Tone, helpfulness, relevance, or clarity needs rubric scoring |
| `ToolCallEvaluator` | The feature is agentic and correctness depends on tool selection/order/arguments |

Start with code-based checks. Add model-as-judge only for qualities that code cannot score reliably, and calibrate judge scores against human review.

---

## 5. Tool-Calling Evaluations

Tool failures are often silent product failures. Evaluate:

- selected tool name
- argument names and values
- call ordering
- whether a tool should not be called
- recovery after tool errors
- final answer grounding in tool output

```swift
let expectation = TrajectoryExpectation([
    .tool("search_notes", arguments: [
        "query": .contains("project deadline"),
    ]),
    .tool("summarize_results"),
])

let evaluator = ToolCallEvaluator(expectation: expectation)
```

If a tool has side effects, use test doubles. Evaluation runs must never create real reminders, send messages, spend money, or mutate production data.

---

## 6. Swift Testing Integration

Run important evaluations in CI:

```swift
@Test(.evaluation(TaggingEvaluation()))
func bookTaggingQuality(context: EvaluationContext<TaggingEvaluation>) async throws {
    let result = try await context.result
    #expect(result.summary.metric("expected_tag_present").passRate >= 0.95)
}
```

Attach detailed result tables as artifacts so a failing run tells reviewers which samples regressed.

---

## 7. Ship Criteria

Define thresholds before prompt tuning:

- required pass rate per metric
- maximum latency or token budget
- minimum tool-call correctness
- allowed fallback rate
- model-as-judge threshold and confidence range
- reviewed dataset size and coverage categories

When changing prompts, models, tool schemas, or Dynamic Profiles, rerun the full evaluation suite. Do not merge "it looks better" changes without metric movement.

---

## 8. Review Checklist

- [ ] Dataset includes golden, boundary, safety, and regression samples
- [ ] Metrics are measurable and named
- [ ] Tool calls have expected trajectories and argument validation
- [ ] Model-as-judge rubric is calibrated against human examples
- [ ] CI fails on threshold regression
- [ ] Evaluation artifacts are attached for diagnosis
- [ ] Production side effects are replaced with test doubles
- [ ] Prompt/model/tool changes update or rerun evaluations

See also: `docs/frameworks/foundation-models.md`, `docs/tooling/foundation-models-instruments.md`, `docs/testing/mocking-strategy.md`.
