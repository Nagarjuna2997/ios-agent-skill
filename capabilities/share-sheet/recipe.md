# Share sheet

`SharedItem` is a `Transferable` value (plain text with an optional link); `ShareItemButton` presents it with `ShareLink`.

## Use

```swift
ShareItemButton(item: SharedItem(title: restaurant.name, text: "Try \(restaurant.name)", url: restaurant.link))
```

## Rules

From [system integrations](../../docs/integrations/README.md):

- Use `ShareLink`; do not wrap `UIActivityViewController` unless a custom activity is needed.
- Share links that open the app (deep links) rather than screenshots of content.
