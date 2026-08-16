# Native vs. Web Animation and 3D

## Context

Use this when the user asks for Anime.js, GSAP, Framer Motion, Three.js, PixiJS, p5.js, Matter.js, WebGL, WebGPU, CSS animation, or a JavaScript-style visual effect inside an Apple-platform app.

The default answer is not to add web dependencies to a native iOS app. First translate the intent into native Apple frameworks. Use `WKWebView` only when the actual web runtime is the requirement.

## Decision Tree

```text
User asks for a web animation or 3D library
        |
        v
Is the app already a web app or must it render existing web content?
        | yes
        v
Use WKWebView with a narrow bridge and content-security rules.
        |
        no
        v
Translate the visual intent to native SwiftUI, UIKit, RealityKit, SpriteKit, or Metal.
```

## Translation Table

| Web vocabulary | Native Apple route |
|---|---|
| Anime.js timelines, stagger, keyframes | SwiftUI `KeyframeAnimator`, `PhaseAnimator`, explicit phase state |
| GSAP timelines and scroll triggers | SwiftUI animation state, scroll phase/offset, Core Animation when UIKit layers are involved |
| Framer Motion transitions | SwiftUI transitions, matched geometry, navigation transitions |
| Three.js product scenes | RealityKit, `Model3D`, `RealityView`, Metal only for custom rendering |
| PixiJS sprites and particles | SpriteKit, SwiftUI `Canvas`, or Metal particles |
| Matter.js physics | SpriteKit physics, RealityKit physics |
| p5.js generative visuals | SwiftUI `Canvas`, Core Graphics, Metal for GPU-heavy work |
| CSS transforms and filters | SwiftUI transforms, materials, `visualEffect`, layer effects |
| WebGL/WebGPU shaders | Metal shaders and compute |

## WKWebView Is Appropriate When

- the product already ships a web surface and the app is a native shell
- the user has a real existing Three.js/GSAP asset that must run unchanged
- the same visual must be shared with a web product
- the interaction depends on browser APIs or DOM layout
- a remote web team owns the experience

If you choose `WKWebView`, isolate it:

- disable arbitrary navigation unless explicitly needed
- use typed message handlers instead of stringly bridge calls
- validate every message from JavaScript
- avoid injecting secrets into the page context
- document offline behavior and loading/error states

## Native Is Preferred When

- the effect is decorative or UI-level
- the screen must feel like a platform-native iOS view
- accessibility, Dynamic Type, Reduce Motion, or VoiceOver are central
- the effect needs camera, AR, haptics, widgets, App Intents, or SwiftData
- App Store review risk is higher with remote executable behavior

## Anti-Patterns

```text
// WRONG: install Three.js because the user said "3D card".
Why: a simple tilt belongs in SwiftUI transforms.

// RIGHT: use SwiftUI for perspective-only effects; use RealityKit for real 3D assets.
```

```text
// WRONG: put a checkout, login, or settings screen in WKWebView for animation.
Why: native controls, accessibility, autofill, and platform trust matter more than animation syntax.

// RIGHT: build the screen natively and translate the animation vocabulary.
```

```text
// WRONG: bridge JavaScript by accepting arbitrary command strings.
Why: it creates injection and authorization bugs.

// RIGHT: expose a small typed message schema and reject unknown actions.
```
