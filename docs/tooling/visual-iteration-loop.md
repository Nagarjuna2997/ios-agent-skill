# Visual Iteration Loop

## Context

Use this when the user asks for a screen to look premium, polished, more native, more accessible, more animated, or closer to a reference. Static Swift review can find many issues, but visual quality needs a loop that sees the app running.

The workflow is:

```text
Design -> Build -> See -> Improve
```

## Pattern

1. **Design**: route to `ui-ux-designer`, `motion-designer`, `3d-experience-designer`, or `accessibility-reviewer` depending on the requested surface.
2. **Build**: compile with Xcode and run the narrowest test target available.
3. **See**: launch the app in the simulator, capture screenshots or video, and inspect the accessibility tree.
4. **Review**: compare the artifact against the request, platform conventions, Dynamic Type, contrast, spacing, reduced motion, and tap targets.
5. **Improve**: patch the SwiftUI/UIKit/RealityKit/Metal code and repeat until the stop condition is met.

## Stop Conditions

Declare the stop condition before the first edit. Good examples:

```text
GOAL: Checkout screen matches the provided reference while keeping native iOS controls.
CHECK: Build passes, home-to-checkout flow launches, screenshots captured at compact and large text sizes.
MAX: 3 visual passes.
ON-STALL: Return the best screenshot and the remaining issues.
```

## Visual Review Checklist

| Area | Questions |
|---|---|
| Hierarchy | Is the primary action obvious within two seconds? Does visual weight match importance? |
| Spacing | Are margins, gutters, and component gaps consistent with tokens? |
| Typography | Does the screen use Dynamic Type and avoid fixed font sizes? |
| Color | Does contrast pass, and do semantic roles survive dark mode? |
| Motion | Does animation clarify state, avoid fighting layout, and honor Reduce Motion? |
| Haptics | Are haptics tied to meaningful state transitions, not decoration? |
| Accessibility | Are labels, traits, focus order, tap targets, and content size tested? |
| Runtime | Does the captured screenshot/video prove the actual app state? |

## Artifact Naming

Use stable paths so iterations can be compared:

```text
artifacts/visual/home-pass-01-compact.png
artifacts/visual/home-pass-01-accessibility-xxl.png
artifacts/visual/home-pass-02-compact.png
artifacts/visual/home-pass-02.mov
```

When visual diffing is added, compare the same route, device, appearance, locale, and content-size category. A screenshot from a different simulator configuration is not a clean comparison.

## Anti-Patterns

```text
// WRONG: "I made it premium" after editing SwiftUI.
Why: visual quality was not observed.

// RIGHT: build, launch, capture, review, then report with artifacts.
```

```text
// WRONG: animate every entrance and every state change.
Why: excessive motion makes the app feel slower and can violate Reduce Motion.

// RIGHT: animate hierarchy changes, confirmations, and spatial continuity.
```

```text
// WRONG: judge accessibility from a screenshot only.
Why: labels, traits, focus order, and hit targets are semantic/runtime facts.

// RIGHT: pair screenshot review with accessibility-tree inspection and Dynamic Type captures.
```
