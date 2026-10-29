# Design-review evaluation

Fixtures for the design-contract workflow in `docs/tooling/design-review.md`. Ten
contracts: one clean control and nine with seeded structural defects. Each fixture
is `fixtures/<id>/contract.json` plus `expected.json` listing the lint rules the
defect should trigger.

| Fixture | Seeded defect |
|---|---|
| clean-control | none; any finding is a false positive |
| persistence-no-migration | persistence decision without a migration plan |
| screen-missing-states | screen without error and empty states |
| auth-no-credential-boundary | authentication in scope with no credential boundary |
| concurrency-no-isolation | concurrency decisions that never name actor isolation |
| service-no-failure-handling | external service with empty failure handling |
| criteria-untraceable | test and simulator criteria with no target to trace evidence to |
| current-code-assumed | current code described only by assumptions |
| permission-and-unknown | permission without purpose; unknown without a settling check |
| no-steps | criteria not connected to implementation steps |

## Deterministic run

```sh
cd mcp-server && npm run build && cd ..
node benchmarks/design-review/evaluate.mjs            # JSON report
node benchmarks/design-review/evaluate.mjs --self-test
```

The deterministic run scores `lintContract` against the seeded rules: detected, missed,
false positives, and acceptance-criteria coverage (criteria covered by a step, criteria
with a traceable target). It measures what a script can decide. It is not an
independent review and says nothing about reviewer judgment. Current result: 12/12
detected, 0 false positives.

## Live run

```sh
node benchmarks/design-review/evaluate.mjs --live --provider claude-code --out benchmarks/design-review/results
node benchmarks/design-review/evaluate.mjs --live --provider ai-route   --out benchmarks/design-review/results
```

The live run creates a temporary project per fixture, runs a full independent review
through the chosen provider, and scores findings by category against the seeded
defects. It records reviewers, completed and malformed counts, elapsed time,
unsupported findings and model-reported usage (`unavailable` when the provider reports
none). Cost is never computed. If the provider is unavailable the report says
`not-run` with the reason instead of pretending.

Live results are written to separate files and must not be combined with the
deterministic numbers. `results/` holds two recorded `claude-code` runs from
2026-10-28: run 1 (25/50 reviewers malformed because sub-section names were
rejected; kept as evidence of the defect) and run 2 after the fix (48/50 completed,
8/10 rounds independent, 12/12 seeded categories reported). Findings beyond the seeded
defect are reported as `beyondSeeded`: the fixtures are thin and most of those are real
gaps, so they are not counted as false positives. A category-level match is a weak proxy for "found the real
problem"; read the finding titles before drawing conclusions. No run here claims
improved quality or reduced rework; that needs a paired evaluation with and without
the workflow, which has not been done.
