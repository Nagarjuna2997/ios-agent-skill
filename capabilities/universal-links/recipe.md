# Universal links

`UniversalLink` maps `https://<your domain>/<screen>/<id>` onto the deep-links module's `DeepLink`, so one router handles both link kinds. The manifest adds `applinks:$(ASSOCIATED_DOMAIN)` to the associated domains entitlement.

## Use

```swift
.onOpenURL { router.open(UniversalLink.normalize($0) ?? $0) }

ShareLink(item: UniversalLink.url(for: .item(screen: "orders", id: order.id)) ?? fallback)
```

Your domain must serve `/.well-known/apple-app-site-association`:

```json
{ "applinks": { "details": [ { "appIDs": ["TEAMID.com.example.app"], "components": [ { "/": "/*" } ] } ] } }
```

## Rules

From [deep linking and routing](../../docs/swiftui/deep-linking-and-routing.md):

- Universal links need a domain you control and a signed app; they do not open from the simulator without that setup.
- Route every link through one typed parser.
