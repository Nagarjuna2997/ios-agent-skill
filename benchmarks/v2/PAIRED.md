# Paired portable Swift repairs

The observer runs C02 (Swift concurrency), D03 (decoding) and Q02 (object lifetime) through a bounded source-replacement worker. The same hidden Swift assertions grade each arm. A starter failure and a passing reference repair are prerequisites for each task. A provider failure or a container timeout stays in the report. Each cell records source and evidence hashes, elapsed time, model-reported usage when available and the independent compile/behavior outcome.

## Run the free infrastructure smoke

Use an unprivileged user on a host with Docker Engine, Python 3.9+ and Node.js 20+. The Docker engine must be local and trusted. Preload the official Swift toolchain once. The runner starts containers with pulling disabled. Run from the repository root.

```sh
image="$(PYTHONPATH=benchmarks/v2 python3 -c 'import paired_worker; print(paired_worker.IMAGE)')"
docker pull "$image"
python3 benchmarks/v2/paired.py --mode smoke --condition both --output /tmp/ios-benchmark-smoke
```

The unchanged-starter smoke returns each broken starter verbatim. The expected result for one trial is six `tie_fail` pairs (twelve cells across cold and warm). All three reference controls must pass independently. A label of `non-model-smoke` and null token usage identify this mode. The GitHub workflow runs this command on Linux and uploads the evidence even on failure.

## Run a pinned local model

Start your own local Ollama service with a preloaded GGUF model and cloud inference disabled. Inspect `http://127.0.0.1:11434/api/tags` for its exact name and SHA-256 digest. The runner calls only that loopback service, does not pull models, passes no provider credentials, rejects cloud-designated models and rechecks model identity after each generation. Server configuration remains the operator's trust boundary. The model supplies one structured Swift source replacement per cell; it has no shell or external tools.

```sh
python3 benchmarks/v2/paired.py --mode ollama --model "$MODEL" --model-digest "$MODEL_SHA256" \
  --condition both --trials 2 --output /tmp/ios-benchmark-model
python3 benchmarks/efficiency/evaluate.py /tmp/ios-benchmark-model/cells
```

Both arms receive the same brief, starting source, model settings, hidden oracle and guide path. The experiment changes the maximum size of the supplied repository guide response, using the production offline retrieval command. Baseline allows 16,000 characters and optimized allows 1,600. Both receive offset zero. The reported tool count covers the two read operations and that lookup. Output size is measured in UTF-8 bytes for the guide response. Token fields come only from Ollama. This trial measures one response-budget tradeoff; longer interactions, MCP profile selection and savings across clients require separate experiments.

Cold runs start empty. For warm runs the observer first typechecks two different held-out starters, D04 and Q01. It injects the same resulting command fact into each warm arm and records the training hashes. Evaluation inputs, provider prompts, hidden diagnostics and reference repairs never become learned facts. The server is asked to unload its model after each request. OS and hardware caches may still differ; use repeated counterbalanced trials for timing comparisons.

## Evidence and isolation

- The exported starter has exactly `TASK.md` and `Solution.swift`. Fixed read operations run in a disposable, networkless container as the unprivileged workspace owner with a read-only root and bind mount, no host home, Docker socket or evaluator checkout, fresh temporary storage, and CPU/memory/PID limits. The observer checks those conditions before running cells. Docker CLI configuration is empty. Missing Docker or an unexpected toolchain stops execution.
- After the worker stops, the observer stages the candidate and a copy of the hidden check in a separate read-only workspace. It compiles and runs the candidate only inside a new restricted container. It never executes generated code on the host. References stay on the evaluator side. The observer trusts the existing fixture oracles and official toolchain and does not claim these educational oracles are adversarial proof systems.
- `protocol.json` freezes source, oracle, reference, harness and guide identities, toolchain, model, settings, conditions and trial count. Per-cell receipts link to hashed evidence; `controls/` records starter/reference outcomes and `summary.json` retains every pair. A single writer holds the output lock. Use the same arguments plus `--resume` to reuse intact cells under the same protocol. Completed cells, including failures, are immutable. Create a new output directory for a new attempt.
- The worker supports these three single-file portable Swift fixtures. Swift packages, Apple SDK fixtures and simulator workloads need separately implemented and verified runners. An unrestricted local folder is never used as a fallback. A passing smoke run cannot establish model accuracy or measured token savings.

[Fixture contracts](README.md) · [Efficiency receipt format](../efficiency/README.md) · [Ollama generation API](https://docs.ollama.com/api/generate) · [Ollama model inventory](https://docs.ollama.com/api/tags)

## Hosted open-model pilot

The [pilot workflow](../../.github/workflows/benchmark-v2-model-pilot.yml) runs on a public GitHub-hosted Linux runner. It pins the official Swift and Ollama image digests and the Qwen 2.5 Coder 0.5B Instruct GGUF manifest. Provisioning downloads public weights. Before any experiment begins, the provisioning server stops. The inference server has a loopback-only network namespace and no access to the checkout, Docker socket or provider secrets. The observer connects through the same network namespace; every candidate execution gets its own separate container. Model name, digest, version, context budget, seed and generation budget are pinned and recorded.

One trial covers the three fixtures in both response-budget arms at cold and warm start, for twelve model calls. A grade can fail even when inference succeeds. Malformed model output counts as failed task quality and retains measured usage. The workflow is limited to 35 minutes, runs on changes to its own pilot launcher or workflow, and can be manually dispatched. A single small-model trial cannot establish an efficiency improvement across clients. [Apache-2.0 model card](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct)

The [recorded pilot](../efficiency/evidence/portable-pilot-2026-11-22/README.md) includes the raw artifacts, per-pair outcomes, token counts and reproduction command.
