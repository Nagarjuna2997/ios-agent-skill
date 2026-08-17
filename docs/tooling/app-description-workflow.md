# App Description Workflow

## Context

Use this when the user describes an app in natural language and expects the AI
to turn that description into a complete iOS build plan, implementation prompt,
and visual direction.

This workflow is for prompts and product direction. It does not replace Xcode
project creation, static MCP review, simulator screenshots, or user feedback.

## Goal

Given one user description, produce:

1. A clear app brief.
2. A complete implementation prompt the coding agent can execute.
3. A design system derived from the description.
4. A color palette with accessible foreground choices.
5. A first-screen plan and navigation model.
6. A feedback loop so the user can update the result by saying what should
   change.

## Input Contract

Accept short, messy descriptions. Do not require the user to fill a long form.

Example:

```text
Create a fitness app for beginners. It should track workouts, show progress,
feel energetic, and use blue and green.
```

If details are missing, infer reasonable defaults and label them as assumptions.
Ask a question only when the missing detail blocks implementation, such as
whether the app needs authentication, payments, health data, or backend sync.

## Output Shape

Return the generated prompt in this order:

```text
APP BRIEF
- Product type:
- Target users:
- Primary outcome:
- Core flows:
- Assumptions:

BUILD PROMPT
Build a native iOS app named <Name> using SwiftUI...

FEATURES
- ...

ARCHITECTURE
- ...

DESIGN SYSTEM
- Personality:
- Typography:
- Spacing:
- Components:

COLOR SYSTEM
- Primary:
- Secondary:
- Accent:
- Background:
- Surface:
- Text:
- Success/warning/error:
- Foreground decisions:

SCREENS
- ...

IMPLEMENTATION ORDER
1. ...

VERIFICATION
- Static MCP checks:
- Build/test command:
- Simulator screenshot path:
```

The `BUILD PROMPT` must be ready to paste into an AI coding agent. It should
name the framework choices, file boundaries, data models, screens, design
tokens, previews, and verification commands.

## Color Generation Rules

Derive colors from the app description, not from a generic favorite palette.

Map product language to color direction:

| Description signal | Likely direction |
|---|---|
| finance, trust, business, security | blues, deep greens, neutral surfaces |
| health, fitness, outdoors, growth | greens, teals, energetic accents |
| food, cooking, hospitality | warm reds, oranges, tomato, cream surfaces |
| education, productivity, notes | calm blues, indigo, focused neutrals |
| kids, creativity, games | brighter multi-color accents with restraint |
| luxury, fashion, portfolio | black, ivory, metallic accents, high contrast |
| meditation, sleep, wellness | muted lavender, sage, soft blue, low glare |
| developer, AI, automation | electric blue, violet, graphite, cyan accents |

Always produce a tokenized palette:

```swift
enum AppTheme {
    static let primary = Color(hex: "#0A6EBD")
    static let secondary = Color(hex: "#18A058")
    static let accent = Color(hex: "#F59E0B")
    static let background = Color(.systemBackground)
    static let surface = Color(.secondarySystemBackground)
    static let text = Color(.label)
}
```

Rules:

- Use semantic system colors for background, surface, and body text wherever
  possible.
- Never scatter raw hex values at call sites. Put all custom colors in one
  theme type.
- Pick foreground text for colored surfaces by contrast measurement, not by
  guessing white.
- If black and white both fail 4.5:1 on a small label, darken or lighten the
  fill color.
- Provide light and dark mode behavior.
- Keep palettes domain-appropriate. A banking app should not look like a toy;
  a game should not look like enterprise settings.

## Prompt Template

Use this exact template when turning a description into an executable prompt:

```text
You are building a native iOS app from this user description:
"<USER_DESCRIPTION>"

Create a production-ready SwiftUI implementation with:
- iOS deployment target: iOS 17+ unless the user asks otherwise
- Architecture: MVVM with protocol-based dependencies
- State: @MainActor @Observable view models for UI-rendered state
- Navigation: typed routes and deep-link-ready structure
- Design: tokenized colors, spacing, typography, radius, shadows
- Accessibility: Dynamic Type, VoiceOver labels, 44pt targets, contrast checks
- Previews: every main state must render without network or disk
- Testing: unit-testable use cases and injected repositories

Derived product brief:
- Name:
- Audience:
- Problem:
- Primary user journey:
- Secondary flows:
- Data model:
- Offline behavior:

Derived visual direction:
- Personality:
- Color tokens:
- Typography:
- Component style:
- Motion:

Implement:
1. App entry point
2. Theme/design tokens
3. Models
4. Repository protocols and mock repositories
5. View models
6. Screens
7. Reusable components
8. Previews
9. Tests where practical

Do not:
- Use raw colors, spacing, or font sizes in views
- Create live dependencies inside view models
- Use @Observable without @MainActor for UI state
- Claim the app works without build/test/screenshot evidence
```

## User Update Loop

When the user gives feedback, update only the affected parts.

Examples:

| User says | Update |
|---|---|
| "make it more premium" | Typography, spacing, surface treatment, color saturation, motion restraint |
| "change to red and black" | Color tokens, gradients, button fills, chart/category colors, contrast notes |
| "for kids" | Tone, iconography, larger touch targets, playful accents, simpler navigation |
| "add AI chat" | Feature list, architecture, privacy rules, Foundation Models availability |
| "make it for gym trainers" | Audience, workflows, data model, dashboard hierarchy |

After updating, return:

```text
UPDATED SECTIONS
- ...

UNCHANGED SECTIONS
- ...

NEXT EXECUTION PROMPT
...
```

Do not regenerate the whole plan unless the user's feedback changes the product
category or primary user journey.

## Anti-Patterns

```text
// WRONG: ask the user 15 setup questions before doing anything.
Why: the user gave enough signal to create a first useful prompt.

// RIGHT: infer defaults, label assumptions, and ask only blocking questions.
```

```text
// WRONG: "Use blue because blue looks modern."
Why: color must follow the product domain and accessibility contrast.

// RIGHT: derive a palette from the app's audience, emotional tone, and task
context, then choose foreground colors by measurement.
```

```text
// WRONG: rewrite the full prompt after every small user change.
Why: it loses continuity and makes user feedback feel ignored.

// RIGHT: update the affected prompt sections and preserve the rest.
```
