# Portable guidance pilot · November 22, 2026 UTC

The pinned Qwen2.5-Coder-0.5B-Instruct model solved **0 of 6 cases in each arm**. All twelve generations completed and reported token counts. Shortening the retrieved guide reduced input tokens in every pair. The zero success rate prevents a conclusion about efficiency on successful repairs. [Hosted model run](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/44969289326) · [Source commit](https://github.com/Nagarjuna2997/ios-agent-skill/commit/f5fcac249129e5d46980f1768adfba51ccb48091)

One trial used three Swift 6 tasks, run once with empty memory and once with an identical setup fact confirmed by two held-out tasks. Each model cell had one attempt at a complete Swift source replacement. Baseline and optimized arms differed only in the maximum length of the same retrieved guide (16,000 or 1,600 characters). Ollama 0.13.5 used a 12,288-token context, a 1,024-token generation limit, temperature 0 and seed 23. The compiler and behavior evaluator used Swift 6.2.3 on Linux. The archive records the exact model, images, guides, fixtures and evaluator hashes. [Runner and isolation contract](../../../v2/PAIRED.md)

| Task | Initial memory | Baseline result | Optimized result | Input tokens, baseline / optimized | Output tokens, baseline / optimized |
| --- | --- | --- | --- | ---: | ---: |
| C02 concurrency | Cold | Invalid response | Invalid response | 4,442 / 774 | 1,024 / 1,024 |
| D03 decoding | Cold | Compile failure | Compile failure | 3,105 / 717 | 70 / 68 |
| Q02 owner lifetime | Cold | Behavior failure | Behavior failure | 1,821 / 638 | 48 / 48 |
| C02 concurrency | Warm | Invalid response | Compile failure | 4,479 / 811 | 1,024 / 644 |
| D03 decoding | Warm | Invalid response | Compile failure | 3,142 / 754 | 1,024 / 68 |
| Q02 owner lifetime | Warm | Invalid response | Compile failure | 1,858 / 675 | 1,024 / 515 |

An invalid response failed the structured-source contract before compilation. Both Q02 cold outputs compiled and exited 1 on the independent behavioral check. Each original starter failed its oracle and each reference repair passed. All cells recorded three observer tool calls and zero retries. Elapsed times include retrieval and grading. Per-cell response bytes, overhead and raw token counts are in the archive. Billed cost and cached tokens are unavailable.

## Reproduce the score

The two ZIPs below are the exact uploaded GitHub artifacts. The model archive contains frozen protocol settings, controls, receipts, content-addressed evidence, receipt checksums and the summary. Independent rescoring reproduced all six outcomes. The separate smoke used an unchanged starter and generated zero model calls. [Container smoke and 19-fixture validation](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/44969289295)

| Archive | GitHub artifact | SHA-256 |
| --- | --- | --- |
| [Model evidence](model.zip) | [14733112154](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/44969289326/artifacts/14733112154) | `b1c9ff0355ca75e04c782da3e772edd99e929ea7677f869dc53f477f2f61262a` |
| [Smoke evidence](smoke.zip) | [14732309855](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/44969289295/artifacts/14732309855) | `324d7a8f9b9f35d287f1e3492bda1b6bec219b56ac3009302c412d0762df6700` |

From the repository root, unpack the model evidence in a temporary directory and recompute the pair scores.

```sh
evidence_dir="$(mktemp -d)"
unzip -q benchmarks/efficiency/evidence/portable-pilot-2026-11-22/model.zip -d "$evidence_dir"
python3 benchmarks/efficiency/evaluate.py "$evidence_dir/cells"
```

These measurements cover one small model, one generation per cell and three portable tasks. Multi-turn clients, other optimization components and Mac workloads require separate experiments.
