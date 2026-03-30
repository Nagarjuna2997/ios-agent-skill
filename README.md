# ios-agent-skill

A comprehensive Claude AI skill for expert-level iOS/Swift development across all Apple platforms.

## What This Is

This repository turns Claude into an expert iOS/Swift developer. It contains:

- **CLAUDE.md** — Master skill instructions that make Claude generate production-ready, error-free Swift code
- **docs/** — Comprehensive Apple framework documentation (Swift, SwiftUI, UIKit, Foundation, CoreData, SwiftData, ARKit, visionOS, and more)
- **templates/** — Ready-to-use Swift project templates (iOS, multiplatform, common patterns)
- **patterns/** — Architecture and design pattern guides (MVVM, Clean Architecture, Coordinator, Repository)
- **checklists/** — Quality checklists for App Store submission, performance, security, and testing

## Supported Platforms

- iOS 15+ (SwiftUI focus on iOS 17+)
- macOS 13+
- watchOS 9+
- tvOS 16+
- visionOS 1.0+

## How to Use

### With Claude Code

Clone this repo and use it as your working directory or reference it in your project's CLAUDE.md:

```bash
git clone https://github.com/YOUR_USERNAME/ios-agent-skill.git
cd ios-agent-skill
claude
```

### As a Reference in Your Project

Add to your project's `CLAUDE.md`:

```markdown
Refer to the ios-agent-skill repository for Apple development expertise.
Import knowledge from: /path/to/ios-agent-skill/docs/
Follow patterns from: /path/to/ios-agent-skill/patterns/
Use templates from: /path/to/ios-agent-skill/templates/
```

## Repository Structure

```
ios-agent-skill/
├── CLAUDE.md                    # Master skill — Claude's iOS brain
├── docs/
│   ├── swift/                   # Swift language, concurrency, stdlib
│   ├── swiftui/                 # Views, state, navigation, layout, animations
│   ├── uikit/                   # UIKit essentials and SwiftUI interop
│   ├── frameworks/              # Foundation, CoreData, SwiftData, MapKit, etc.
│   └── platforms/               # iOS, macOS, watchOS, tvOS, visionOS
├── templates/
│   ├── ios-app/                 # Basic iOS SwiftUI app template
│   ├── multiplatform-app/       # Multi-platform SwiftUI template
│   └── common-patterns/         # Networking, persistence, auth, navigation, DI
├── patterns/                    # MVVM, Clean Architecture, Coordinator, etc.
└── checklists/                  # App Store, performance, security, testing
```

## Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI (primary), UIKit (interop)
- **Persistence**: SwiftData (iOS 17+), CoreData (legacy)
- **Concurrency**: Swift Concurrency (async/await, actors)
- **State Management**: Observation framework (iOS 17+)
- **Architecture**: MVVM (primary)

## Contributing

1. Fork this repository
2. Add or update documentation in `docs/`
3. Add new templates or patterns
4. Submit a pull request

## License

MIT License
