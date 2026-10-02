# Background app refresh

`BackgroundRefresh` schedules a `BGAppRefreshTaskRequest` and runs the work inside SwiftUI's `.backgroundTask(.appRefresh(_:))`. The apply step adds the identifier (`<bundle id>.refresh`) and the `fetch` background mode to Info.plist.

## Use

```swift
WindowGroup { RootView() }
    .backgroundTask(.appRefresh(BackgroundRefresh.identifier)) {
        await BackgroundRefresh.run { try await store.refresh() }
    }
    .onChange(of: scenePhase) { _, phase in
        if phase == .background { BackgroundRefresh.schedule() }
    }
```

Test in the debugger with `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"<bundle id>.refresh"]`.

## Rules

From [background tasks](../../docs/frameworks/background-tasks.md):

- Keep the work short; the system ends it when time runs out.
- Schedule the next request every time.
