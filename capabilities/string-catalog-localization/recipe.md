# String Catalog localization

Turns on string extraction (`SWIFT_EMIT_LOC_STRINGS`) and adds `Localizable.xcstrings` with a plural rule example.

## Use

```swift
Text("Welcome")
Text("\(cart.count) items")            // uses the plural variations
Text(order.total, format: .currency(code: "USD"))
```

## Rules

From [views and controls](../../docs/swiftui/views-and-controls.md):

- Literal strings in SwiftUI views are localizable keys; variables passed as `String` are not, use `LocalizedStringKey` or `String(localized:)`.
- Do not build sentences by concatenation; interpolate whole phrases.
