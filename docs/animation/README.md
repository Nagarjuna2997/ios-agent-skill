# Professional Motion and Animation

## Context

Use this hub for SwiftUI animation, UIKit/Core Animation, gesture response, text reveals, hero entrances, scroll effects, splash intros, haptics, and web-animation vocabulary such as Anime.js, GSAP, Framer Motion, Motion One, Lottie, Rive, PixiJS, p5.js, Matter.js, WebGL, or WebGPU.

## Translation Table

| Request vocabulary | Native Apple implementation |
|---|---|
| stagger, delay, sequence | SwiftUI phase state, `KeyframeAnimator`, explicit delays |
| timeline, scrub, progress | `TimelineView`, scroll offset/phase, custom progress state |
| spring, bounce, elastic, damping | SwiftUI spring parameters, UIKit animators |
| shared element, hero transition | `matchedGeometryEffect`, navigation transitions |
| parallax, depth, perspective | SwiftUI transforms, `visualEffect`, RealityKit for real 3D |
| particles, trails, glow | SpriteKit, SwiftUI `Canvas`, Metal when GPU-heavy |
| shader, distortion, liquid, noise | SwiftUI shaders or Metal |
| orbit, camera, model animation | RealityKit / `RealityView` / `Model3D` |

## Purpose Rules

| Animation purpose | Good use |
|---|---|
| Navigation | communicate hierarchy and spatial continuity |
| Button feedback | communicate interaction and commitment |
| Loading | communicate progress or uncertainty |
| Success | communicate completion |
| Error | attract attention without disorienting |
| Gesture | feel interruptible, reversible, physical |
| Onboarding | guide attention |
| Hero/marketing | create emotion without blocking task completion |

## Pattern

Centralize motion tokens:

```swift
enum MotionToken {
    static let quick = Duration.milliseconds(180)
    static let standard = Duration.milliseconds(320)
    static let emphasized = Duration.milliseconds(520)
    static let spring = Animation.spring(response: 0.38, dampingFraction: 0.82)
}
```

Respect Reduce Motion at the call site:

```swift
withAnimation(reduceMotion ? nil : MotionToken.spring) {
    phase = .expanded
}
```

## Performance and Accessibility

- Animate transforms and opacity before layout.
- Avoid unbounded infinite animations.
- Do not attach broad `.animation` modifiers high in the view tree.
- Keep interaction responsive at 60Hz and 120Hz.
- Provide reduced-motion paths for large movement, parallax, 3D orbit, and scroll-triggered reveals.
- Pair haptics with meaningful state changes only.

## Common Mistakes

- "GSAP-style" interpreted as "GSAP is unavailable" instead of translating the desired effect.
- Multiple animations fighting the same state.
- Infinite background motion under text.
- Fake loading delays to show an animation.
- Hero animation that blocks the first task.
- Using Metal for a simple SwiftUI transform.
