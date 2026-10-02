# Brand colors (asset catalog)

Writes four color sets into `Resources/Assets.xcassets` (BrandPrimary, BrandSecondary, BrandSurface, BrandOnPrimary), each with a dark variant, and `AppColor` accessors.

## Use

```swift
RootView()
    .tint(AppColor.primary)
```

## Rules

From [palette generation](../../docs/design/palette-generation.md):

- Brand colors are for accents and identity; body text uses system semantic colors.
- Check contrast for text on every brand surface in light and dark mode.
