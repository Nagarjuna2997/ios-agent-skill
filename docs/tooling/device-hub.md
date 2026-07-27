# Device Hub

**Load this when:** reproducing a device-specific bug, managing simulators,
running accessibility checks, or testing across several devices at once.

Device Hub (Xcode 27) brings devices and simulators together in one place, so you
can diagnose and reproduce issues, inspect device state, and run testing
workflows without leaving Xcode.

> **Verification status:** written against Xcode 27 beta documentation. The
> workflows below are stable; exact UI placement may shift before release.

---

## 1. What it replaces

Previously these were four separate places — Devices and Simulators, the
Accessibility Inspector, `xcrun simctl`, and Console. Device Hub consolidates
them:

| Task | Before | Now |
|------|--------|-----|
| See connected devices and simulators | Devices and Simulators window | Device Hub |
| Inspect device state | Console + Settings on device | Device Hub |
| Reproduce a bug on a specific model | Manual scheme juggling | Device Hub |
| Run one test across several devices | Scripted `xcodebuild` loops | Device Hub |

The practical gain is fewer context switches while chasing a device-specific
bug — which is most of the cost of chasing one.

---

## 2. The matrix that actually matters

Testing "on a simulator" is not testing. This skill's rules produce bugs that
only appear on specific configurations:

| Configuration | Catches |
|---------------|---------|
| Smallest supported device (iPhone SE) | Truncation, layouts that assume height |
| Largest + landscape | Stretched layouts, wasted space |
| iPad | Missing `NavigationSplitView`, size-class assumptions, **app resizability** |
| Dark mode | Gray-on-gray, invisible shadows, unreadable pills |
| Accessibility text sizes | Clipped rows, fixed heights, unreflowed `HStack`s |
| RTL (Arabic, Hebrew) | Hardcoded leading/trailing, mirrored icons |
| Oldest supported OS | APIs used without an `@available` guard |
| Physical device | Performance, camera, motion, biometrics, real network |

The last one is not optional. A simulator has your Mac's CPU and no radio;
main-actor contention and network flakiness both hide there.

### iOS 27: app resizability

Rebuilding against the iOS 27 SDK **automatically opts your app into
resizability** on iPad and in iPhone Mirroring. This is a behavior change you
inherit without asking for it.

That makes iPad and resized-window testing mandatory on an SDK bump, not a nice
to have. Anything that assumed a fixed width will surface here:

```swift
// FRAGILE — assumes a width that resizing invalidates.
.frame(width: 390)
GeometryReader { geo in
    if geo.size.width > 700 { … }        // a resized window crosses this constantly
}

// ROBUST — adapts.
@Environment(\.horizontalSizeClass) private var sizeClass
ViewThatFits(in: .horizontal) { wideLayout; narrowLayout }
```

Verify: launch on iPad, drag the window through every width, and confirm nothing
clips, overlaps, or jumps layout mid-drag.

---

## 3. Accessibility testing

Device Hub surfaces accessibility inspection alongside the device, which makes
it practical to check per-device rather than once at the end.

What to verify — these map to the rules in `docs/design/design-tokens.md`:

- **VoiceOver** reaches every interactive element in a sensible order, and each
  has a meaningful label. Decorative images are hidden.
- **Dynamic Type** at `.accessibility5` — no clipping, rows reflow.
- **Contrast** ≥ 4.5:1 body, 3:1 large text and controls.
- **Tap targets** ≥ 44×44pt at every text size.
- **Reduce Motion** and **Reduce Transparency** are honoured.

```swift
// The three environment values every screen should respect.
@Environment(\.dynamicTypeSize) private var typeSize
@Environment(\.accessibilityReduceMotion) private var reduceMotion
@Environment(\.accessibilityReduceTransparency) private var reduceTransparency
```

Automate what you can so it does not depend on remembering:

```swift
@Test("no element is missing an accessibility label")
func labels() throws {
    let app = XCUIApplication()
    app.launch()
    for button in app.buttons.allElementsBoundByIndex {
        #expect(!button.label.isEmpty)
    }
}
```

Full reference: `docs/frameworks/accessibility.md`.

---

## 4. Reproducing a device-specific bug

```
1. Reproduce it on the exact reported configuration — model, OS, text size,
   appearance, language. Not an approximation.
2. Inspect device state at the moment of failure.
3. Narrow: does it reproduce on a simulator? A different model? A different
   OS version? Each "no" is information about the cause.
4. Fix.
5. Re-verify on the original configuration, then on the matrix above.
```

Step 1 is the one people skip. "It probably also happens on the 15 Pro" is a
guess, and the whole point of a device-specific bug is that the device is
specific.

This is the `swift-debugger` method — reproduce, isolate, fix, prove — applied to
hardware. See `.claude/agents/swift-debugger.md`.

---

## 5. Multi-device workflows

Running one test across several devices at once is worth it when:

- You are verifying a **layout** change (widths and text sizes vary).
- You are verifying an **availability** guard (OS versions vary).
- You are checking a **performance** regression (hardware varies).

It is not worth it for pure logic tests — those are the same everywhere, and a
unit test is faster than a UI test on five devices. Reserve the matrix for what
actually varies by device.

---

## Anti-Patterns

```
# 1. "Works on my simulator."
   No radio, your Mac's CPU. Performance and network bugs hide there.

# 2. Testing one device size.
   iPhone SE and iPad Pro are different products.

# 3. Skipping iPad after an SDK bump.
   iOS 27 auto-opts you into resizability. Fixed-width assumptions break.

# 4. Accessibility as a pre-release pass.
   Cheap per screen during development; expensive as a sweep at the end.

# 5. Approximating the reported configuration.
   The device is the variable. Reproduce it exactly.

# 6. Running the full matrix on logic-only tests.
   Slow, and it tells you nothing a unit test would not.

# 7. Testing only in English.
   German truncates, Arabic mirrors.
```

---

## Checklist

- [ ] Verified on the smallest and largest supported devices.
- [ ] Verified on iPad, including dragging the window across widths (iOS 27
      resizability).
- [ ] Verified in light and dark mode.
- [ ] Verified at `.accessibility5` text size.
- [ ] Verified in one RTL language.
- [ ] Verified on the oldest supported OS version.
- [ ] Verified on at least one physical device.
- [ ] VoiceOver reaches every control with a meaningful label.
- [ ] A reported bug was reproduced on its exact configuration before fixing.
