# Habit Tracker simulator interaction evidence

On November 18, 2026, a separate XCUITest ran against the existing synthetic
HabitTracker example using Xcode 27.2 (27B52), Swift 6 and an iPhone 18 Pro
simulator running iOS 27.2 (24B8117). The unsigned simulator test build and
two executions of the same test passed, including one run through `run.py`.
It launched with the sample-data flag, opened “Read 20
minutes,” tapped “Mark Not Done,” and asserted that “Mark Done Today” appeared.
The test then issued a swipe and captured [the resulting screen](habit-after-tap.png).
The swipe's change in scroll position was not asserted. The screenshot uses
the example's synthetic in-memory data.

The [test source](HabitInteractionTests.swift) has SHA-256
`191aefcfb41d2f957ea7af32f4bc8913c83c00978b7af115ca832b35ff031c20`;
the screenshot has SHA-256
`96b55a8f49ffc00f14cb55a15c3ed1dad38e310cdbf902222e89478df0352d05`.
These values identify this captured evidence, not a visual-fidelity baseline.

To repeat the test, install Xcode, XcodeGen and an iOS Simulator runtime,
select an available simulator UDID with `xcrun simctl list devices available`,
and run from this repository:

```sh
python3 examples/agent/habit-tracker/verification/run.py \
  --device SIMULATOR-UDID --result /tmp/habit-interaction.xcresult
```

The runner copies the example into a temporary directory, adds a UI-test target
there, and performs an unsigned simulator build and test. The result path must
not already exist. This independent test does not run the agent's screenshot
loop, exercise a physical device, verify all screens, or establish provider,
StoreKit or Live Activity behavior.
