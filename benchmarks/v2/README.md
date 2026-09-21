# Benchmark v2 fixture implementation

This is **fixture validation, not a scored agent comparison**. The 30 specifications
in [PLAN.md](PLAN.md) have standalone synthetic starter projects, evaluator-owned
checks, and reference repairs. No client/model is invoked by this directory.
Issue #12's JSONDecoder/JSONEncoder correction is already present; the v2 checks
use behavioral/compiler evidence, not performance-analyzer wording or style.
Historical 20-task/120-run evidence is not modified or rescored.

## Layout and lanes

Each `fixtures/<ID>/` contains `brief.md`, `fixture.json`, `starter/`, `oracle/`
and `reference/`. Only **starter + TASK.md** are exported to an agent. The reference
is one valid repair, not a required textual patch. Oracles check behavior, public
API contracts, real compilation or test mutation sensitivity.

- **portable (19):** C01–C05, D03–D05, T01–T05, B01–B02, Q01–Q02, Q04–Q05.
  Python 3.9+, Swift 6 with Foundation/XCTest/Swift Testing; no Apple SDK required.
- **macos (2):** D01–D02. macOS, Xcode and SwiftData; no Simulator needed.
- **simulator (9):** U01–U05, B03–B05, Q03. Xcode and an explicitly selected iOS
  Simulator. All builds force signing off; no account, identity or profile needed.

All packages use bundled local dependencies only. Toolchain provisioning is separate
from fixture execution. Fixtures use synthetic records, local files and controlled
services; no remote package resolution, live service or credential is needed.

## Validate (not a benchmark run)

```sh
python3 benchmarks/v2/test_harness.py
python3 benchmarks/v2/harness.py validate --lane portable --output /tmp/v2-portable
python3 benchmarks/v2/harness.py validate --lane macos --output /tmp/v2-macos
xcrun simctl list devices available
python3 benchmarks/v2/harness.py validate --lane simulator \
  --simulator YOUR_INSTALLED_UDID --output /tmp/v2-simulator
```

A validated pair means **starter fails and reference passes the same oracle**.
The testing-category oracle separately substitutes correct and defective production
implementations: both compile, correct behavior passes, defective behavior produces
an observed assertion failure. Timeouts, compiler failures and zero tests cannot
masquerade as successful mutation detection. Correct tests are repeated in parallel.

D01 seeds the old disk store with a separate frozen evaluator executable; a candidate
cannot redefine the old schema to avoid migration. D05 uses an externally released
checkpoint rather than requiring every duplicate call to suspend, so early-reservation
repairs remain valid. It exercises eight coordinated bursts without wall-clock sleeps;
thread interleaving is not itself a claim of a complete race proof.

The validator writes `protocol.json` **before** any checks: protocol version, exact
Swift/Xcode/SDK version, Simulator runtime/device and all input hashes. This protocol
explicitly records `client: none`, `model: none`, `purpose: fixture-validation-NOT-scored`.
It is not valid evidence for a model comparison. Changed inputs require a new output
directory; hashes are checked before and after each cell.

Each task/variant has independent atomic `result.json`, command logs and a hashed
completion marker. Resume verifies cell identity, protocol and evidence. A crash
leaves only an unfinished `.pending-*` directory; completed cells are preserved.
Do not edit completed evidence. Hashes detect corruption, not a malicious writer
who can replace the complete evidence directory.

`summary.json` keeps unsupported, lane-skipped, fixture errors and validated pairs
separate. Provider failures/ties/regressions are empty with `comparison_run: false`.
`protocol.py` defines separate future outcomes for unsupported, skipped, provider
failure, infrastructure error, incomplete, tie-pass, tie-fail, improvement and regression.
Missing metrics must remain unknown, never zero.

## Agent isolation — required before any future comparison

```sh
python3 benchmarks/v2/harness.py export --task C04 --output /tmp/agent-C04
```

**A different directory on the same unrestricted host is NOT isolation.** Export
refuses source symlinks and repository-contained destinations. It does not export
`.git`, hidden checks, repairs or evaluator files. Do not give either arm this clone.
Do not return evaluator copies or logs to the agent while a task is running.

`isolation.py` constructs a network-disabled, read-only-root container tool command
with a single exported-workspace mount, no host home/socket/secrets, dropped
capabilities and a preloaded toolchain image pinned by digest. The external agent
driver must use this tool boundary for **every** filesystem/command operation and
expose no host file/search/network tools. The tool driver must run as the unprivileged workspace owner; its UID/GID
are mapped into the container so exported files are writable. Root drivers and
foreign-owned workspaces are refused. The container command has not been smoke-tested
in this phase; verify the real isolated tool boundary before any comparison. The model control plane, if any, runs outside this
filesystem namespace and receives only the allowed prompt/tool results.

For Apple fixtures the boundary must be a **separate disposable macOS VM** containing
only exported starter/treatment material, SDK and Simulator. The evaluator checkout
must not be mounted/shared there. `isolation.py` refuses a host fallback for those
lanes. This phase does not provision a VM, infer client access, or launch an agent.
The evaluator runs hidden checks only after the agent has stopped, in a separate
copy. References/checks must never be included in the treatment skill archive.

A future scored runner must pass `protocol.validate_pins` before any score: exact
client/version, requested and observed model, Swift/SDK, protocol version, fixture,
oracle, repair, skill, harness and corrected-analyzer hashes, isolation, worker count
and cache policy. This fixture-only CLI intentionally has **no run/score/provider
command**. Do not reuse the older same-host harness as an isolation boundary.

## Scope and limits

- No scored baseline or skill arm has been executed for v2.
- Public fixture sources can in principle be memorized by models; network/filesystem
  isolation prevents tool retrieval, not pretraining contamination. Freeze before trials.
- Simulator fallback B04 is compiled at iOS 16 and exercised through its injected
  legacy capability path on the recorded installed runtime. It is not a claim that
  an iOS 16 runtime was installed or tested.
- Q04 validates a fixed manifest structure, not legal correctness or App Store approval.
- Q03 checks the named control and states, not a complete VoiceOver accessibility audit.
- Portable tests are intended for Linux CI and macOS. Record actual CI toolchain
  versions; never pool scores from different SDK/client/model protocols.

See [FIXTURES.md](FIXTURES.md) for every starting failure and acceptance check.
