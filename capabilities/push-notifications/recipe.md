# Push notifications (APNs)

`PushRegistration` requests permission and registers for remote notifications; `PushAppDelegate` receives the device token. APNs keys stay on your server (`APNS_KEY_ID`, `APNS_TEAM_ID` are listed in `.env.example` as server-only).

## Use

```swift
@main
struct ShopApp: App {
    @UIApplicationDelegateAdaptor(PushAppDelegate.self) private var pushDelegate
    var body: some Scene { WindowGroup { RootView() } }
}

Button("Notify me about my order") {
    Task { await PushRegistration.shared.requestAndRegister() }
}
```

Test in the simulator: `xcrun simctl push booted <bundle id> payload.json`.

## Rules

From [UserNotifications](../../docs/frameworks/usernotifications.md):

- Ask for permission in context, after explaining the benefit.
- The device token changes; send it to your server every launch after registration.
- `aps-environment` is `development` for debug builds; distribution signing sets production.
