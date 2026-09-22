# Dark and increased-contrast app colors

## Context

A dark palette is not an RGB inverse. The generator independently assigns a dark base, raised and grouped surfaces, text and state colors. The primary seed retains its hue identity while foreground roles are adjusted for contrast.

## Pattern

Use named asset colors with Any and Dark values. The existing asset schema also requires highContrastLight and highContrastDark; these map to Xcode's contrast appearance selectors. Keep the same semantic role across appearances. A light brand blue can become lighter in dark mode while the button foreground changes to black.

OLED preference sets only the dark base to black. Elevated and grouped surfaces remain visible. Do not assume black alone reduces energy consumption for every device or screen composition. Shadows are not reliable separation on a black base; use native materials, spacing or appropriate boundaries.

For native lists prefer `UIColor.systemGroupedBackground` and the secondary/tertiary system grouped backgrounds. In SwiftUI `.primary`, `.secondary`, `.background` and system materials adapt to context. The custom `SurfaceOverlay` token is an opaque fallback, not a substitute for blur or Liquid Glass.

## Verification sequence

1. Inspect text, buttons, selection and status indicators in Any and Dark.
2. Turn on Increase Contrast; check the selected asset variants and native material changes.
3. Turn on Differentiate Without Color; selected and error states need icons, labels or shape cues.
4. Increase Dynamic Type and check truncation, alignment and touch targets separately.
5. Check toolbar, navigation and tab tint in actual native containers. Avoid coloring every symbol or toolbar background manually.

SwiftUI `tint` is the preferred control-level customization where supported. `Color.accentColor` reads the asset accent; it is not a guarantee that every control is tinted identically. For SF Symbols retain hierarchical/monochrome system rendering unless palette rendering carries meaning that remains understandable without color.

## Sources

[Apple UIColor](https://developer.apple.com/documentation/uikit/uicolor), [SwiftUI Color](https://developer.apple.com/documentation/swiftui/color), and [Xcode color-scheme setup](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme) describe adaptive color and appearance assets. Consult the [HIG Dark Mode page](https://developer.apple.com/design/human-interface-guidelines/dark-mode) when evaluating the finished UI; its JavaScript-only content was not used as evidence of new requirements in this implementation.
