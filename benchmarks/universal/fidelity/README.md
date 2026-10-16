# M2: Visual Fidelity & Self-Repair (experimental)

This benchmark reuses App IR and the native project/build/test pipeline. The gate and repair coordinator in `mcp-server/src/app-ir/visual-gate.ts` accept framework-independent verifier evidence; future importers must use the same contract.

## Run locally

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
npm ci --prefix benchmarks/universal/fidelity
(cd benchmarks/universal/fidelity && npx playwright install chromium)
node benchmarks/universal/fidelity/run.mjs benchmarks/universal/fidelity/local.json /tmp/new-fidelity-run
```

Requires the exact Xcode build, SDK, simulator runtime and device type in the profile. Use `ci.json` for the hosted macOS profile. A mismatch stops before comparison. The runner creates and deletes its own simulator. No signing, credentials, provider calls or imported scripts are required. Installation may require network access; fixture rendering blocks external requests.

The capture records runtime build, browser version, host build, device dimensions, scale, appearance, locale, font configuration, Dynamic Type, orientation and collapsed UI state. Compare only identical capture pins and reference hashes. Browser and host versions are recorded rather than guaranteed across machines; a different environment needs its own baseline. Local overrides `PLAYWRIGHT_MODULE` and `CHROME_PATH` are recorded through the actual browser version. They are not used by CI.

## Evidence and decisions

Each candidate builds, tests disclosure expansion/collapse, runs Apple's accessibility audit collapsed and expanded, and repeats the tests at extra-extra-extra-large Dynamic Type. This is not the largest accessibility text category and does not replace manual VoiceOver navigation. Screenshot captures use the collapsed state. Test results, logs, screenshots, pixel differences, normalized crops and artifact hashes are preserved in the output directory.

Safe-area normalization is explicit: the profile excludes 62 points at the top and 34 at the bottom, at scale 3. No image resizing is used. Those offsets are fixture/device assumptions, not automatic measurements. The normalized browser viewport matches the resulting native content region.

The predeclared example thresholds are normalized mean channel error <= 0.02, changed-pixel fraction <= 0.10, minimum mean-error improvement 0.001, and zero measured line-break mismatches. These are experimental policy values, not calibrated perceptual similarity claims.

- **Accepted:** all required verifier checks pass, thresholds are met and neither visual metric nor functional/accessibility evidence regresses.
- **Rejected:** a required check fails, clipping/accessibility problems remain, test coverage decreases, or a measured metric regresses.
- **Requires review:** evidence is missing, capture conditions differ, source is unchanged, improvement is insufficient, or verification fails.

Unknown counts are null, never zero. A better pixel score alone cannot pass. CI exits nonzero for both rejected and requires-review outcomes and uploads evidence even on failure.

## Repair boundaries and resumability

The generic coordinator caps attempts at three. Completed attempt records are atomically written, hashed, schema-validated and their decisions recomputed on resume. An interrupted reserved attempt requires review and is not silently rerun. Hashes detect accidental modification; they are not signatures or an isolation boundary. Use a dedicated trusted directory with trusted parents and trusted verifier callbacks.

The current fixture implements **one deterministic repair**, moving the native disclosure indicator to the leading edge with a native button and expanded/collapsed accessibility value. It does not call a vision model or implement three distinct repair strategies. Candidates are isolated and never promoted automatically. The outer simulator benchmark checkpoints evidence but does not yet resume the entire build/capture pipeline; reruns require a new output directory.

## Completion status

M2 is **partial**. Automated viewport geometry/clipping and text-line extraction are unavailable, so this fixture cannot receive an automatic accepted verdict. Layout and typography remain explicitly unavailable even when XCUITest and pixel checks pass. Dark-mode capture, expanded-state pixel comparison, noise calibration, full-pipeline resume and additional repair strategies remain future work. Existing M1 evidence is unchanged.

The workflow `.github/workflows/universal-fidelity.yml` runs portable gate tests and a supported macOS profile. Adding the workflow does not establish a hosted simulator pass; inspect its actual run and uploaded evidence after the branch is published.

## Recorded local run: October 15, 2026

Both baseline and leading-disclosure candidate built with zero reported warnings/errors on Xcode 27.0 (27A266a), iPhone 18 Pro, iOS 27.0. Each passed two UI tests at large and at XXXL: eight executions total, zero failed/skipped. Mean pixel error increased from 0.0184852 to 0.0195067; changed-pixel fraction increased from 0.0704312 to 0.0885756. **The candidate regressed and must not be promoted.**

Raw evidence is preserved in `../evidence/fidelity-m2/`. The original runner attempted a nonexistent second strategy after rejecting the first and ended requires-review; this adapter now explicitly limits its strategy budget to one. The recorded runner also used zero placeholders for unavailable geometry counts; the current schema/adapter use null. These historical records are retained unmodified, not presented as an accepted current-protocol run. The final gate can be evaluated offline against the recorded metrics with unknown geometry explicitly null; a full rerun of the final runner remains outstanding.

Stored build/test logs are gzip-compressed without changing their original bytes; decompress them to compare against the raw log hashes in the original report. `hashes.json` covers the stored artifacts, including compressed files. `current-gate-evaluation.json` records the explicit offline re-evaluation and rejected verdict.
