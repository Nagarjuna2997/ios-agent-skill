# WebKit Patterns

Use WKWebView intentionally, not as an animation shortcut.

| Pattern | Use | Checklist |
|---|---|---|
| existing web experience | product already owns web UI | loading/offline/error states |
| typed JS bridge | native controls web content | validate message schema |
| web auth | provider-hosted login | prefer ASWebAuthenticationSession |
| WebGL embed | existing asset must run unchanged | navigation restrictions, no secrets |

For native screens, translate Anime.js/GSAP/Three.js-style requests to SwiftUI, RealityKit, SpriteKit, or Metal first.
