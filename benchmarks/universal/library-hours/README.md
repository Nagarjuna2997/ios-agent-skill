# Library hours typography benchmark

This single-screen HTML fixture has four visible text regions and one expandable disclosure. It exercises the same SwiftUI generator and native recorder as the Field Notes fixture. The expected word boundaries come from the rendered DOM for each size. The verifier observes the native app’s line boundaries, chooses up to three explicit-size text regions with measured discrepancies and tries one UIKit-backed repair in a separate generated project.

From the repository root on the Mac described in `local.json`, install the MCP server dependencies, build the server, and install Playwright from the fidelity benchmark’s lockfile. With a compatible Chrome installed, run:

```sh
FIDELITY_FIXTURE=library-hours FIDELITY_AUTO_REPAIR=1 \
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node benchmarks/universal/fidelity/run.mjs benchmarks/universal/library-hours/local.json /tmp/library-hours-first-run
```

Use a fresh output directory for each independent run. Append `--resume` to the same command to recover after interruption under the same inputs. On GitHub Actions choose the HTML adapter and the `measured-library-hours` strategy in the experimental native conversion fidelity workflow.

The report retains both builds, native screenshots, passive probe comparisons, interaction and accessibility tests, reference images and difference images at Large and XXXL. For the HTML XXXL reference the fixture scales computed font sizes by 23/17. The browser version, viewport and device scale are pinned in the evidence. This is an explicit HTML reference convention.

Each size must meet the existing pixel thresholds and wrapping criteria. A failed accessibility or interaction check or a measurable regression can reject a candidate. Independent approvals are bound to each screenshot and its capture pins. Supply the Large approval using `FIDELITY_REFERENCE_APPROVAL` and the XXXL approval using `FIDELITY_XXXL_REFERENCE_APPROVAL`. The measured experiment has no promotion path.
