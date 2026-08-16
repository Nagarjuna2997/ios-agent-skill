# Foundation Models `fm` CLI

## Overview

Apple announced the `fm` command-line tool for prompting Foundation Models from the terminal. This fits agent workflows: use it to explore prompts, inspect model behavior, and produce quick repros before moving a prompt into app code or Evaluations.

> Do not hardcode undocumented flags in automation. Use the installed tool's `fm --help` output for exact syntax in the current Xcode seed.

---

## 1. Use Cases

- quick prompt exploration
- comparing short instruction variants
- creating repro steps for prompt bugs
- generating sample outputs for evaluation design
- validating model availability on a development Mac
- pairing with the Foundation Models Python SDK for scripts

Do not treat manual CLI output as a release gate. Promote important cases into `docs/testing/evaluations.md`.

---

## 2. Safe Workflow

```bash
xcrun --find fm
fm --help
```

Then run the current seed's documented prompt/evaluation commands. Capture:

- Xcode version
- OS version
- model/provider route if shown
- prompt
- instructions
- output
- token/latency data if shown

Keep prompt experiments under `work/` or another ignored scratch location. Do not commit transcripts that contain private user data.

---

## 3. Agent Integration Pattern

1. Draft a prompt in a plain text file.
2. Run it through `fm` manually.
3. Save only sanitized outputs that illustrate a failure or improvement.
4. Convert the prompt into app code with availability checks.
5. Add an Evaluations dataset before merging.
6. Profile the real app path with Instruments.

This keeps terminal exploration useful without letting it replace app-level testing.

---

## 4. What Not to Do

- Do not rely on beta CLI output format for stable CI parsing.
- Do not paste real user data into terminal prompts.
- Do not commit large generated transcripts.
- Do not assume CLI behavior matches a device with different model availability.
- Do not ship prompt changes based only on one or two successful CLI samples.

---

## 5. Review Checklist

- [ ] CLI experiment includes Xcode/OS seed info
- [ ] Exact `fm --help` syntax was checked locally
- [ ] Private data removed from prompt/output artifacts
- [ ] Important cases promoted to Evaluations
- [ ] Real app path profiled with Foundation Models Instruments

See also: `docs/frameworks/foundation-models.md`, `docs/testing/evaluations.md`, `docs/tooling/foundation-models-instruments.md`.
