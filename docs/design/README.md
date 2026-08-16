# Professional UI/UX System

## Context

Use this hub when a user asks for professional polish, better hierarchy, premium design, improved onboarding, stronger empty/loading/error states, better iPad adaptation, or a screen that feels native instead of merely functional.

## Design Stack

| Layer | Use |
|---|---|
| `design-tokens.md` | Source of truth for color, spacing, radius, typography, shadows |
| `typography-system.md` | Semantic text hierarchy and Dynamic Type |
| `color-system.md` | Contrast, semantic color roles, dark mode |
| `interaction-standards.md` | Touch targets, gestures, haptics, animation purpose |
| `liquid-glass-adoption.md` | Modern materials without contrast loss |
| `stunning-ui-patterns.md` | Full-screen composition patterns |

## Review Order

1. Primary task: can the user see what to do in two seconds?
2. Hierarchy: do size, weight, color, and position match importance?
3. Layout: are alignment, rhythm, gutters, and touch targets consistent?
4. Type: semantic styles first; fixed sizes only with a clear reason.
5. State: loading, empty, error, success, offline, disabled.
6. Adaptation: compact/regular widths, iPad resizability, keyboard, pointer.
7. Accessibility: VoiceOver labels, focus order, Dynamic Type, contrast, Reduce Motion.

## Pattern

Prefer a compact state model over scattered booleans:

```swift
enum ScreenState<Content: Equatable>: Equatable {
    case loading
    case empty
    case failed(message: String)
    case loaded(Content)
}
```

Each state gets a designed view that keeps the same layout frame when possible. Loading should not resize the final surface; empty states should name the next action; errors should explain recovery.

## Anti-Patterns

```text
// WRONG: "premium" means adding gradients and cards everywhere.
Why: polish comes from hierarchy, restraint, rhythm, and state quality.

// RIGHT: define the primary task, reduce competing emphasis, then add motion/material only where it explains state.
```

```text
// WRONG: a phone layout stretched full-width on iPad.
Why: density and reading length break.

// RIGHT: use navigation split, max readable width, sidebars, inspector panes, or two-column layouts.
```

## Production Checklist

- [ ] Primary action is visually dominant and reachable.
- [ ] Every repeated spacing/color/type value comes from a token.
- [ ] Text wraps at accessibility sizes.
- [ ] Tap targets are at least 44x44pt.
- [ ] Dark mode and contrast are checked.
- [ ] Loading, empty, error, success, and offline states exist where relevant.
- [ ] iPad layout is not a stretched phone screen.
- [ ] Motion and haptics clarify state, not decoration.
