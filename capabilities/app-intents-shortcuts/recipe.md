# Siri and Shortcuts (App Intents)

`OpenScreenIntent` opens the app at an `AppScreen`; `AppShortcuts` registers phrases such as "Open Orders in <app name>".

## Use

```swift
.onChange(of: IntentNavigation.shared.requested) { _, screen in
    guard let screen else { return }
    selectedTab = screen.rawValue
    IntentNavigation.shared.requested = nil
}
```

## Rules

From [App Intents](../../docs/frameworks/app-intents.md):

- Every App Shortcut phrase includes the application name.
- Intent static metadata is declared with `static let` (Swift 6 rejects mutable static state).
- Keep `perform()` fast; open the app for anything that needs UI.
