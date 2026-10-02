# Deep links (URL scheme)

`DeepLink` parses `scheme://<screen>/<id>` into a typed route; `DeepLinkRouter` holds the pending route until the UI handles it. The apply step registers the scheme (the app name in lowercase) in Info.plist.

## Use

```swift
@State private var router = DeepLinkRouter()

RootView()
    .environment(router)
    .onOpenURL { router.open($0) }
```

In the root view:

```swift
.onChange(of: router.pending) { _, link in
    guard let link else { return }
    switch link {
    case .screen(let name): selectedTab = name
    case .item(let screen, let id): path.append(Route(screen: screen, id: id))
    }
    router.consume()
}
```

Try it in the simulator with `xcrun simctl openurl booted <scheme>://orders/42`.

## Rules

From [deep linking and routing](../../docs/swiftui/deep-linking-and-routing.md):

- Parse every link into a typed route in one place; never navigate from raw strings in views.
- Treat links as untrusted input: unknown screens are ignored, not crashed on.
- Custom schemes are not unique to your app; use universal links for anything sensitive.
