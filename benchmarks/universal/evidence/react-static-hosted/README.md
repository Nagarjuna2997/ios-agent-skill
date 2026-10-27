# Hosted static React verification

Independent workflow_dispatch run [38858015941](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38858015941), commit 8a6ec6ab4474d235aa6a6e7b4ec010f536de8bfb, adapter `react-static`. This is separate from the automatic HTML run.

Both builds and twelve native test executions passed on Xcode 26.5 / iOS 26.5 / iPhone 17 Pro. All four normal/probe comparisons had zero decoded pixel error. The repair gate rejected the candidate: typography failed (two boundary mismatches) and a visual metric regressed. No known-good baseline exists. This establishes hosted execution of this static React fixture, not passing visual fidelity or arbitrary React support.

The complete raw artifact remains on the linked run; a local downloaded archive is retained outside the repository. This report preserves its paths/hashes and actual gate decision. No historical evidence was overwritten.
