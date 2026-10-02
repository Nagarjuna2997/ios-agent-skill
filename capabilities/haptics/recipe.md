# Haptic feedback

`appFeedback(_:trigger:)` wraps SwiftUI's `sensoryFeedback` and respects an in-app setting (`HapticsToggle`).

## Use

```swift
Button("Add to cart") { cart.add(item) }
    .appFeedback(.success, trigger: cart.count)
```

## Rules

From [interaction standards](../../docs/design/interaction-standards.md):

- Feedback confirms an outcome; do not add it to every tap.
- Pair haptics with a visible change; never use them as the only signal.
