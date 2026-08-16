# Web Animation Concepts in Native Apple Apps

## Context

Use this when the request names Anime.js, GSAP, Framer Motion, Motion One, CSS animation, Three.js, PixiJS, p5.js, Matter.js, Rive, Lottie, WebGL, or WebGPU.

The agent should understand the vocabulary and translate intent. Do not add those libraries to a native iOS app unless the explicit product requirement is a web or hybrid surface.

## Vocabulary Map

| Term | Meaning | Native route |
|---|---|---|
| stagger | offset start times across children | per-index delay, phase arrays |
| timeline | ordered animation sequence | state machine, keyframes, `TimelineView` |
| scrub | bind animation progress to scroll/gesture | scroll offset, drag progress |
| yoyo/reverse | repeat direction changes | phase toggles, repeating animation with reverse |
| morph | interpolate shape/content | matched geometry, path interpolation, Canvas |
| mask/reveal | expose content progressively | `mask`, clipping, gradients |
| orbit | camera around object | RealityKit camera/control state |
| particles/trails | many small animated elements | SpriteKit, Canvas, Metal |
| shader/distortion | pixel or vertex effect | SwiftUI shader, Metal |
| physics/inertia | movement from velocity/collision | gesture velocity, SpriteKit, RealityKit physics |

## When WKWebView Is Right

Use `../web/native-vs-web-animation.md` when choosing between native and web. WKWebView is appropriate for existing web assets that must run unchanged, shared web/native product surfaces, or a real browser API dependency.

## Checklist

- [ ] The desired effect is described in platform-neutral terms.
- [ ] Native route is considered before WKWebView.
- [ ] Reduce Motion fallback exists.
- [ ] Text remains readable during motion.
- [ ] Heavy GPU work is justified by visual need.
- [ ] Third-party assets do not become core dependencies of this skill.
