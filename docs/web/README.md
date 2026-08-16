# WebKit and JavaScript Interoperability

## Context

Use this hub when a native app embeds web content, bridges Swift and JavaScript, runs existing Three.js/GSAP/Anime.js/WebGL content, handles web authentication, or chooses between WKWebView and native implementation.

## Decision Matrix

| Requirement | Prefer |
|---|---|
| Existing web experience must run unchanged | WKWebView |
| Native screen with animation vocabulary from web | SwiftUI / UIKit / RealityKit / Metal |
| Authentication through provider website | ASWebAuthenticationSession |
| Render remote content with app shell | WKWebView with navigation/content restrictions |
| Swift-to-JS command bridge | Typed message handlers |

## Bridge Rules

- Treat JavaScript messages as untrusted input.
- Use a small typed schema; reject unknown commands.
- Do not inject secrets into the page context.
- Restrict navigation and file access.
- Make loading, offline, and error states native.
- Prefer `ASWebAuthenticationSession` for login rather than custom cookie handling.

## Native vs Web

Start with `native-vs-web-animation.md`. A request for "Three.js-style" or "GSAP-like" usually describes an effect, not a dependency requirement.

## Common Mistakes

- Putting login, checkout, or settings in WKWebView only for animation.
- Accepting arbitrary bridge command strings.
- Letting remote content navigate the app shell.
- Forgetting Dynamic Type, VoiceOver, and Reduce Motion outside the web surface.
- Treating WKWebView as a shortcut around native platform conventions.
