# Accessibility baseline

Small modifiers for the checks that most often fail review: tap targets, Reduce Motion and Dynamic Type spacing.

## Use

```swift
Button { cart.remove(item) } label: { Image(systemName: "minus.circle") }
    .accessibilityLabel("Remove one")
    .minimumTapTarget()

Badge(count: count)
    .motionAwareAnimation(.spring, value: count)
```

## Rules

From [accessibility](../../docs/frameworks/accessibility.md) and [color accessibility](../../docs/design/color-accessibility.md):

- Interactive elements are at least 44 by 44 points.
- Text uses Dynamic Type styles; layouts grow rather than truncate.
- Text contrast is at least 4.5:1; never convey state with color alone.
