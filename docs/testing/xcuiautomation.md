# XCUIAutomation

## Context

Use XCUIAutomation when behavior must be proven through the running app: navigation, permissions, gestures, forms, accessibility labels, deep links, onboarding, checkout, App Intents launch paths, and future simulator-driven visual iteration.

Unit tests prove logic. XCUI tests prove the built app can be operated.

## Pattern

Stabilize UI tests with accessibility identifiers at meaningful boundaries:

```swift
Button("Continue") {
    viewModel.continueTapped()
}
.accessibilityIdentifier("onboarding.continue")
```

Then test the user path, not the view hierarchy:

```swift
import XCTest

final class OnboardingUITests: XCTestCase {
    func testContinueOpensHome() {
        let app = XCUIApplication()
        app.launchArguments = ["--ui-testing", "--mock-state=first-run"]
        app.launch()

        app.buttons["onboarding.continue"].tap()

        XCTAssertTrue(app.navigationBars["Home"].waitForExistence(timeout: 2))
    }
}
```

## Architecture Rules

- UI tests launch with deterministic state through arguments or environment.
- Network, model, and store dependencies switch to debug/test fakes in UI-test mode.
- Identifiers describe product intent, not implementation shape.
- Tests wait for state, not fixed sleeps.
- Permission prompts are handled explicitly.
- Deep links are tested through app launch or simulator URL open.

## Visual Iteration Contract

Future `ios-simulator-mcp` tools should rely on the same semantic surface:

| Runtime artifact | Needs |
|---|---|
| Tap by element | accessibility identifier or label |
| Inspect tree | labels, traits, enabled state |
| Screenshot review | deterministic content and appearance |
| Visual diff | stable route, device, locale, Dynamic Type |

## Common Mistakes

- Testing by coordinate when an accessibility identifier can be used.
- Using `sleep` instead of `waitForExistence`.
- Running against live network or production accounts.
- Making identifiers mirror private view names.
- Claiming a UI is accessible because a screenshot looks correct.

## Checklist

- [ ] UI test mode is impossible in release builds or ignored there.
- [ ] Critical flows have stable identifiers.
- [ ] Tests use deterministic data and no live network.
- [ ] Permission prompts have explicit handling.
- [ ] Deep links and restoration paths are covered.
- [ ] Screenshots for visual review are captured from known state.
