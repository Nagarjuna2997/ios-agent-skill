# SF Symbols

`SymbolImage` falls back to another symbol when the requested one is missing on the running OS (an unknown name otherwise renders nothing). `symbolBounce(trigger:)` wraps `symbolEffect` and respects Reduce Motion.

## Use

```swift
SymbolImage("fork.knife.circle.fill", fallback: "fork.knife")
    .symbolBounce(trigger: cart.count)
    .accessibilityLabel("Restaurants")
```

## Rules

From [Apple design resources](../../docs/design/apple-design-resources.md):

- Prefer symbols that exist on the deployment target; check availability in the SF Symbols app.
- Icon-only controls need an accessibility label.
- Use symbol rendering modes and weights that match adjacent text.
