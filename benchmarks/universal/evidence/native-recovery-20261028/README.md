# Native verification recovery — October 28, 2026

Fresh local execution on Xcode 27.0 (27A266a), Simulator SDK 27.0, iPhone 18 Pro.
The original run reached build but failed because XcodeGen selected an absent
AppIcon set. Its report and compressed build log are preserved as `before-*`.

With explicit empty icon selection when no icon is configured, a fresh run built
successfully and passed all three native tests at Large and all three at XXXL:
**6 passed, 0 failed, 0 skipped**. These test state transitions, relaunch and
accessibility. Visual fidelity was not evaluated. A completed-run resume retained
all four checkpoint hashes without another native test run.

`after-report.json` and compressed logs retain actual outcomes and local paths.
The two PNGs are retained XCTest attachments, not generated mockups. Original
xcresults and complete attachment directories remain at the recorded local paths;
this compact archive does not contain every attachment or a portable checkpoint.
`hashes.json` hashes the archived bytes. Generated source/project settings are
included so the icon correction can be inspected. No baseline was promoted.

A separate intentionally impossible SDK profile failed before generation and is
classified `infrastructure_failure`; resume retained both failures. That is a
negative control, not a successful build. The boot-timeout retry path is covered
by deterministic tests; the successful local run did not require a second wait,
so recovery from an actual timeout is not claimed as natively verified.

Portable checks: 851 MCP tests passed / one existing skip; 19 setup and native
checkpoint tests passed. Independent review found no blocking defects. Hosted
verification is separate and remains pending; no model comparison or npm release.
