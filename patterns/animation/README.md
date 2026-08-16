# Animation Patterns

Use native motion patterns that communicate state. Representative patterns:

| Pattern | Native route | Watch for |
|---|---|---|
| staggered entrance | per-index delay or phase state | respect Reduce Motion |
| scroll reveal | scroll phase/offset | avoid hidden essential content |
| spring card | SwiftUI spring | tune damping, not bounciness for its own sake |
| matched transition | `matchedGeometryEffect` | stable ids and namespace scope |
| morphing button | state machine + transition | keep label accessible |
| interactive drag | gesture state + velocity | interruptible and reversible |
| parallax | offset/progress transform | reduced-motion fallback |
| animated gradient | `TimelineView` or phase | preserve text contrast |
| particle transition | Canvas/SpriteKit/Metal | battery and GPU budget |
