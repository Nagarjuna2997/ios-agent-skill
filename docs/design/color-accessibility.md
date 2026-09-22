# Validate color relationships, not just swatches

## Context

The generator measures opaque sRGB foreground/background pairs using WCAG relative luminance. Its standard target for text is 4.5:1; the high setting targets 7:1. Focus against the base background is measured at 3:1. These are numerical guidance checks, not a complete native-app accessibility audit.

## What is measured

The report includes primary/secondary text on background, text on surface and elevated/grouped surfaces, primary and pressed buttons, secondary buttons, destructive labels, links, selected text, success/warning/error on their containers, focus and disabled controls. Ratios are evaluated before rounding.

Disabled controls are **informational**, because WCAG's minimum text contrast criterion exempts inactive components. Do not convert this observation into a requirement or silently count an inactive control as a failure. Readability may still be a product goal.

The project reviewer only diagnoses an explicit, contiguous `Text(...).foregroundStyle(Color("Name")).background(Color("Name"))` pair with unambiguous opaque sRGB catalog values. A ratio below 3:1 is a concern even for large text. The static catalog check leaves a conservative 0.05 margin because its inventory normalizes components to eight-bit sRGB. Between 3:1 and 4.5:1 requires font/context evidence that this lexical reviewer does not have. It does not claim coverage of all view compositions.

## What contrast cannot establish

Contrast does not establish Dynamic Type support, VoiceOver labels, focus order, usable touch targets, color-vision accessibility, or adequate error recovery. Links need a non-color cue when their surrounding context requires one. Selection, success, warning and destructive states need text, symbols, shape or other cues beyond color alone. Test Differentiate Without Color and Increase Contrast in the running app.

Materials, gradients, opacity, Display P3, HDR, dynamic UIColor providers and inherited modifiers require rendered inspection. A system color cannot be reduced to one universal RGB value. No warning is emitted simply because an app uses Apple semantic colors or legitimate custom branding.

## Source and formula

[WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) explains text thresholds and inactive-component exceptions. For each sRGB component c, linearize with c/12.92 below 0.04045, otherwise ((c+0.055)/1.055)^2.4. Relative luminance is 0.2126R + 0.7152G + 0.0722B. The ratio is (lighter+0.05)/(darker+0.05).

Apple's [SwiftUI Color](https://developer.apple.com/documentation/swiftui/color) and [UIColor](https://developer.apple.com/documentation/uikit/uicolor) documentation are the primary API sources for named and adaptive colors. WCAG is cited as contrast guidance, not an invented App Store rule.
