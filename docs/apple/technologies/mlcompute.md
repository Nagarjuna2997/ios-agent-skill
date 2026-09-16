# ML Compute

## Context

Load this when a task names **ML Compute** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/mlcompute) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Accelerate training and validation of neural networks across the CPU and one or more GPUs.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ML Compute`.

Documentation language identifiers: occ, swift.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |
| tvOS | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Components

- [MLCTensor](https://developer.apple.com/documentation/mlcompute/mlctensor) — deprecated
- [MLCPlatform](https://developer.apple.com/documentation/mlcompute/mlcplatform) — deprecated
- [Layers](https://developer.apple.com/documentation/mlcompute/layers)
- [Training and Validation](https://developer.apple.com/documentation/mlcompute/training-and-validation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
