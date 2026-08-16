# Motion Pattern Library

Native iOS motion should communicate state, hierarchy, and continuity. Use these
patterns with `docs/swiftui/animations.md` and `docs/design/interaction-standards.md`.

| Pattern | Preferred API | Review Notes |
|---------|---------------|--------------|
| Staggered entrance | per-item delay, stable IDs | Keep total sequence under user patience |
| Scroll reveal | scroll position/phase-driven state | Disable or simplify with Reduce Motion |
| Spring card | `.spring(...)`, drag gesture | Interruptible, reversible, no text clipping |
| Matched transition | `matchedGeometryEffect` | Stable namespace and IDs required |
| Morphing button | stateful label/shape transition | Preserve hit target during morph |
| Interactive drag | `DragGesture`, predicted end | Add accessible actions |
| Parallax | offset/depth tied to scroll/gesture | Reduce Motion fallback required |
| Animated gradient | `TimelineView` or phase state | Avoid low-contrast text over motion |
| Particle transition | Canvas/Metal depending on density | Do not use for actual launch screen |

Splash rule: the iOS launch screen stays static; cinematic motion belongs in an
in-app `AnimatedSplashView` that transitions into `MainAppView`.
