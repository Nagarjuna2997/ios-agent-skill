# Live Activity

Adds `ProgressLiveActivity` to the app's WidgetKit extension (`<AppName>Widgets`, shared with the Home Screen widget) and `LiveActivityController` to the app.

Files:

- `Shared/ProgressActivityAttributes.swift`: attributes and content state, compiled into both targets.
- `App/LiveActivityController.swift`: start, advance and end from the app, behind the `LiveActivityControlling` protocol.
- `Widget/ProgressLiveActivity.swift`: Lock Screen, expanded, compact and minimal presentations.

## Use

```swift
let steps = ["Placed", "Preparing", "On the way", "Delivered"]
try liveActivity.start(title: "Order 1042", subtitle: "Sample Kitchen", steps: steps)
await liveActivity.advance(to: 2, eta: .now.addingTimeInterval(15 * 60))
await liveActivity.end()
```

## Rules

From [ActivityKit](../../docs/frameworks/activitykit.md):

- Check `ActivityAuthorizationInfo().areActivitiesEnabled`; the controller reports `.disabled` instead of throwing at launch.
- Implement every Dynamic Island presentation; the template does.
- Keep content state small; it has a size limit and is sent on every update.
- `Info.plist` gets `NSSupportsLiveActivities = YES`.
