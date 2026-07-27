# Migrating Deployment Targets: iOS 17 → 26 → 27

**Load this when:** raising a deployment target, or rebuilding against a newer
SDK and deciding what that changes.

Two independent moves, routinely conflated:

| Move | Effect | Reversible? |
|------|--------|-------------|
| **Rebuild against a newer SDK** | New APIs become available (behind guards); some system behavior changes | Yes — build against the old SDK |
| **Raise the deployment target** | Removes users on older OS versions | Technically yes; commercially painful |

You almost always want the first without the second. See
`../compatibility-matrix.md`.

---

## Part 1 — Rebuilding against a newer SDK

You do this every time you adopt a new Xcode. It does **not** require raising
your deployment target — but it can change behavior, because the system checks
which SDK you linked against.

### iOS 26 SDK: Liquid Glass

Rebuilding against the iOS 26 SDK adopts the new design system for standard
controls: navigation bars, tab bars, toolbars, sheets. You do not opt in.

**What to check after the rebuild:**

- Custom navigation/tab bar backgrounds may now conflict with the system
  material. Remove hand-rolled chrome rather than fighting it.
- Custom "glassmorphism" (blur + white stroke + gradient) now looks dated next
  to real Liquid Glass. Replace with `.glassEffect()` behind an iOS 26 guard.
- Contrast: verify text over the new materials still meets 4.5:1.
- `.ultraThinMaterial` on a solid background looked mediocre before and looks
  worse now. It needs content behind it.

See `../design/design-tokens.md` §4.

### iOS 27 SDK: app resizability

**This is the one that breaks things.** Rebuilding against the iOS 27 SDK
**automatically opts your app into resizability** on iPad and in iPhone
Mirroring. No code change, no flag.

Anything assuming a fixed width breaks:

```swift
// BREAKS — a resized window invalidates this constantly.
.frame(width: 390)
GeometryReader { geo in
    if geo.size.width > 700 { iPadLayout() } else { phoneLayout() }
}
UIScreen.main.bounds.width          // wrong under multitasking too

// SURVIVES
@Environment(\.horizontalSizeClass) private var sizeClass
ViewThatFits(in: .horizontal) { wideLayout; narrowLayout }
```

**Verification after an iOS 27 SDK rebuild:**

1. Launch on iPad, drag the window slowly across every width.
2. Watch for clipping, overlap, and layout jumps mid-drag.
3. Repeat at `.accessibility5` text size — resizing plus large text is where
   fixed frames fail hardest.
4. Check iPhone Mirroring on macOS.

Grep first:

```bash
grep -rn "UIScreen.main" --include='*.swift' .
grep -rnE '\.frame\(width: *[0-9]+' --include='*.swift' .
grep -rn "GeometryReader" --include='*.swift' .
```

See `../tooling/device-hub.md`.

---

## Part 2 — Raising the deployment target

### The decision

**This is a product decision, not a technical one.** It removes users. Check
your own analytics for the OS split before you propose it; do not migrate on
aesthetics.

Legitimate reasons:
- A required API exists only on the newer OS with no viable fallback.
- The guard-and-fallback code has become more expensive to maintain than the
  users on the old OS are worth.
- Your install base on the old version is genuinely negligible.

Not a reason: "it's cleaner," or "the new API is nicer."

### iOS 17 → iOS 18

Small step. Almost nothing in this skill requires it.

**You gain:** `MeshGradient`, zoom navigation transitions, `TextRenderer`, the
new `Tab` API, Control Center widgets, SwiftData History API and `@Index`.

**Cleanup available:** remove `@available(iOS 18, *)` guards and their fallbacks.

### iOS 18 → iOS 26

The larger step, because it makes Liquid Glass and Foundation Models
unconditional.

**You gain:** `glassEffect` and friends without a guard; `SystemLanguageModel`,
`@Generable`, `@Guide`, and `Tool` without a guard.

**Still needed even at iOS 26:** the *runtime* availability check for Foundation
Models. The compile-time guard disappears; the device/region/setting check does
not.

```swift
// Still required at any deployment target.
guard case .available = SystemLanguageModel.default.availability else {
    return fallbackExperience()
}
```

### iOS 26 → iOS 27

**You gain:** `PrivateCloudComputeLanguageModel`, Dynamic Profiles, image
attachments, custom `LanguageModel` providers, built-in system tools — all
without guards.

**Cost:** the newest OS only. Rarely justified today.

---

## Part 3 — Mechanics

### Raising the target

```swift
// Package.swift
platforms: [.iOS(.v18), .macOS(.v15)]
```

In Xcode: `IPHONEOS_DEPLOYMENT_TARGET`, set at the project level and inherited by
targets. Check that no target overrides it — a stale per-target value is the
usual cause of "it still won't build."

### Then remove the newly-redundant guards

```bash
# Find guards now below your floor.
grep -rn "@available(iOS 1[78]" --include='*.swift' .
grep -rn "#available(iOS 1[78]" --include='*.swift' .
```

```swift
// BEFORE (target iOS 17)
if #available(iOS 18.0, *) {
    MeshGradient(width: 3, height: 3, points: pts, colors: colors)
} else {
    LinearGradient(colors: colors, startPoint: .top, endPoint: .bottom)
}

// AFTER (target iOS 18)
MeshGradient(width: 3, height: 3, points: pts, colors: colors)
```

Do this as a **separate commit** from the target bump. If something regresses,
you want to know whether it was the bump or the cleanup.

### Do not delete a fallback that is still doing work

```swift
// The guard is redundant at iOS 26 — but the runtime check is not.
if #available(iOS 26.0, *) {                       // ← removable
    guard case .available = SystemLanguageModel.default.availability else {
        return manualFlow()                        // ← NOT removable
    }
}
```

Anything conditional on hardware, region, or a user setting stays regardless of
the deployment target.

---

## Verification

```bash
# Builds at the new floor.
xcodebuild build -scheme "App" \
  -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -20

# No API used above the floor without a guard — this is what the compiler
# enforces, so a clean build IS the evidence.

# No stale guards below the floor.
grep -rn "@available(iOS 1[78]" --include='*.swift' .   # expect nothing after a bump to 18+
```

Then run the device matrix in `../tooling/device-hub.md`, especially the iPad
resizing pass after an iOS 27 SDK rebuild.

---

## Checklist

**Rebuilding against a newer SDK**
- [ ] Full device matrix re-run — system behavior changed even though your code did not.
- [ ] iOS 26 SDK: navigation chrome, custom glass, contrast over new materials.
- [ ] iOS 27 SDK: **iPad resizing verified at every width**, plus iPhone Mirroring.
- [ ] Grepped for `UIScreen.main`, fixed `.frame(width:)`, and width-branching `GeometryReader`.

**Raising the deployment target**
- [ ] Justified by data on your own install base, not aesthetics.
- [ ] Bumped in one commit, guard cleanup in another.
- [ ] No per-target override left at the old value.
- [ ] Removed only guards genuinely below the new floor.
- [ ] **Runtime availability checks kept** — they are not deployment-target guards.
- [ ] Newer-OS features still degrade gracefully where the check is runtime.
- [ ] CHANGELOG and README updated with the new minimum.
