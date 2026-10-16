# Hosted infrastructure failures

Run 38869328566 (HTML, UIKit candidate at 9d98768) built the baseline, then failed simulator discovery before native tests. The prior runner did not retain discovery-command output, so the precise failure is unknown.

Run 38869946732 (React literal props at 84312b5) timed out during first-boot data migration at the 120-second bootstatus budget. No native build, test or fidelity verdict was produced.

Neither is visual regression evidence or a native pass. Follow-up records discovery output and raises only the bootstatus budget to an explicit bounded 300 seconds; build/test and visual thresholds are unchanged. Original reports are retained verbatim.
