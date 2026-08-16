# UI Pattern Library

Use these as implementation briefs for premium SwiftUI screens. They point to
the existing design-system docs instead of duplicating every token.

| Pattern | Native Building Blocks | Notes |
|---------|------------------------|-------|
| Animated login | `NavigationStack`, form validation, `PhaseAnimator` | Keep auth errors inline and accessible |
| Premium onboarding | paged `TabView`, progress, skip/continue actions | Do not block app access behind decorative motion |
| Animated tab bar | `TabView`, `matchedGeometryEffect`, haptics | Preserve standard tab semantics |
| Floating card | tokens, shadows, `safeAreaInset` | Avoid nested cards |
| Hero header | image/media first, content below fold visible | No generic gradient-only hero |
| Glass dashboard | Liquid Glass rules, contrast checks | Respect reduced transparency |
| Animated settings | grouped sections, disclosure, subtle transitions | Settings should remain scannable |
| Profile screen | avatar, identity, stats, actions | Avoid card-heavy marketing layouts |
| Empty state | icon/image, concise cause, primary action | State must explain what to do next |
| Skeleton loader | redaction, stable dimensions | Never shift layout when content arrives |
| Animated search | searchable, suggestions, result states | Keyboard and VoiceOver first |
| Interactive cards | drag gestures, spring return, actions | Provide non-gesture alternatives |

References: `docs/design/design-tokens.md`, `docs/design/interaction-standards.md`,
`docs/swiftui/layout.md`, `docs/frameworks/accessibility.md`.
