# Submission Tracker — ios-agent-skill

Tracks submission status for `ios-agent-skill` across public AI skill directories and awesome-lists.

> **Generated:** 2026-05-04
> **Repo:** https://github.com/Nagarjuna2997/ios-agent-skill
> **Description (long):** Production-ready iOS SwiftUI guidance for AI coding agents.
> **Description (short):** iOS SwiftUI guidance for AI coding agents.

---

## Summary

| # | Target | Status | Action needed |
|---|--------|--------|---------------|
| 1 | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | **Not eligible (yet)** | Wait for community adoption |
| 2 | [github/awesome-copilot](https://github.com/github/awesome-copilot) | **Prepared** | Fork + branch off `staged` + add file + PR |
| 3 | [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | **Not eligible (yet)** | Need 10+ stars AND no AI assistance |
| 4 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | **Prepared** | Fork + branch + README edit + PR |
| 5 | [ComposioHQ/awesome-codex-skills](https://github.com/ComposioHQ/awesome-codex-skills) | **Prepared** | Fork + branch + README edit + PR |
| 6 | [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | **Prepared** | Fork + branch + folder + README edit + PR |
| 7 | awesomeskills.dev | **Manual** | Site returned 403 to automated fetch — visit manually |
| 8 | [skillsdirectory.com](https://skillsdirectory.com/submit) | **Manual** | Requires GitHub login — sign in and paste prepared text |

---

## 1. VoltAgent/awesome-agent-skills — Not eligible

**Status:** Not eligible (yet)
**Link to PR:** None
**What changed:** Nothing.
**Next action:** Re-evaluate after `ios-agent-skill` accumulates measurable community usage (stars, forks, references in third-party repos). Their `CONTRIBUTING.md` is explicit:

> Skill must have real community usage. We focus on community-adopted, proven skills. Brand new skills that were just created are not accepted. Give your skill time to mature and gain users before submitting.

When ready, the entry would go in **Community Skills → Development and Testing** alongside `AvdLee/swiftui-expert-skill`, `efremidze/swift-patterns-skill`, and `Joannis/claude-skills`.

---

## 2. github/awesome-copilot — Prepared

**Status:** Prepared (PR not opened — requires user's GitHub fork + branch creation)
**Link to PR:** N/A (to be created)
**What changed:** New `instructions/swift-ios-development.instructions.md` file, adapted from `SKILL.md` to the awesome-copilot frontmatter format.

### Steps to submit

```bash
# 1. Fork github/awesome-copilot on GitHub (web UI)
# 2. Clone your fork and branch off `staged` (NOT main — they reject PRs from main)
git clone https://github.com/YOUR-USERNAME/awesome-copilot.git
cd awesome-copilot
git checkout staged
git pull origin staged
git checkout -b add-ios-agent-skill

# 3. Copy the prepared file:
cp /tmp/awesome-targets/_patches/copilot/instructions/swift-ios-development.instructions.md instructions/

# 4. Run their build script to update README tables
npm install
npm start

# 5. Commit and push
git add instructions/swift-ios-development.instructions.md README.md
git commit -m "Add Swift / iOS development instructions"
git push origin add-ios-agent-skill

# 6. Open PR targeting `staged` branch
```

**PR title:** `Add Swift / iOS development instructions 🤖🤖🤖`
*(The `🤖🤖🤖` suffix is required by their CONTRIBUTING.md when an AI agent assisted — this is policy, not optional.)*

**PR body:**
```
This PR adds a new `swift-ios-development.instructions.md` file under `instructions/`,
providing best practices for building production-ready iOS, iPadOS, macOS, watchOS,
tvOS, and visionOS apps with Copilot.

The instructions cover:
- Workflow boundary (Copilot generates .swift files; user creates the Xcode project)
- Core principles: zero-error code, modern-first APIs (Swift 5.9+, iOS 17+, SwiftData,
  @Observable), platform-aware code, safe-by-default
- UI design rules with non-negotiable readability/contrast standards
- Framework selection matrix (SwiftUI vs UIKit, SwiftData vs CoreData, etc.)
- Standard SwiftUI project structure
- Code-quality rules and a top-10 pitfalls list

Adapted from the open-source ios-agent-skill repository
(https://github.com/Nagarjuna2997/ios-agent-skill), which contains extended
documentation, code templates, and architecture patterns for all major Apple
frameworks.

Branch is based on `staged` per CONTRIBUTING.md.
```

**Next action for you:** Run the steps above. The prepared file is at `/tmp/awesome-targets/_patches/copilot/instructions/swift-ios-development.instructions.md`.

---

## 3. travisvn/awesome-claude-skills — Not eligible

**Status:** Not eligible (two hard blockers)
**Link to PR:** None
**What changed:** Nothing.
**Next action:** Their `CONTRIBUTING.md` has two policies that block submission:

1. **Stars threshold (auto-close):** "If your skill hasn't acquired a basic 10 stars, it will be closed automatically."
2. **No AI-assisted PRs (auto-close):** "PR not be explicitly generated / submitted with AI-assistance ... PRs will be closed without comment if the submitter has failed to acknowledge this or adhere by its basic tenets."

Submit only after `ios-agent-skill` reaches 10+ stars, **and write the PR yourself by hand** (don't have an AI agent draft it). The entry would go under **Community Skills**.

---

## 4. ComposioHQ/awesome-claude-skills — Prepared

**Status:** Prepared (PR not opened)
**Link to PR:** N/A (to be created)
**What changed:** Single-line addition to README under `### Development & Code Tools`.

### Steps to submit

```bash
# 1. Fork ComposioHQ/awesome-claude-skills on GitHub
# 2. Clone and branch
git clone https://github.com/YOUR-USERNAME/awesome-claude-skills.git
cd awesome-claude-skills
git checkout -b add-ios-agent-skill

# 3. Edit README.md — find "### Development & Code Tools" and add this line
#    in alphabetical position (after Changelog Generator, before next entry):
```

```markdown
- [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) - Production-ready iOS SwiftUI guidance for AI coding agents covering Swift 5.9+, SwiftUI, UIKit interop, SwiftData, MVVM, and all Apple platforms (iOS, macOS, watchOS, tvOS, visionOS). *By [@Nagarjuna2997](https://github.com/Nagarjuna2997)*
```

```bash
# 4. Commit and push
git add README.md
git commit -m "Add ios-agent-skill"
git push origin add-ios-agent-skill

# 5. Open PR
```

**PR title:** `Add skill: ios-agent-skill`

**PR body:**
```
This PR adds ios-agent-skill, a public repository that provides production-ready
iOS SwiftUI guidance for AI coding agents.

Repository: https://github.com/Nagarjuna2997/ios-agent-skill

It includes guidance for Swift, SwiftUI, iOS architecture, UI polish, animation,
app structure, and agent-friendly development workflows. Supports Claude Code,
Codex, Cursor, GitHub Copilot, Windsurf, and 20+ other AI tools via dedicated
rule files (CLAUDE.md, AGENTS.md, .cursorrules, etc.) that all map to the same
SKILL.md system prompt.

Added to "Development & Code Tools" since it is a development skill. Format
matches existing external-link entries in this category (e.g., aws-skills,
deep-research, CSV Data Summarizer).
```

**Note on CONTRIBUTING vs precedent:** Their CONTRIBUTING.md describes adding a folder with `SKILL.md` inside their repo. However the README has multiple external-link entries (aws-skills, deep-research, etc.), so an external link should be acceptable. If the maintainer requires a folder, the fallback is to copy `SKILL.md` from your repo into a new `ios-swiftui/` folder in their repo.

**Next action for you:** Fork, edit README, push, PR.

---

## 5. ComposioHQ/awesome-codex-skills — Prepared

**Status:** Prepared (PR not opened)
**Link to PR:** N/A (to be created)
**What changed:** Single-line addition to README under `### Development & Code Tools`.

### Steps to submit

```bash
# 1. Fork ComposioHQ/awesome-codex-skills on GitHub
# 2. Clone and branch
git clone https://github.com/YOUR-USERNAME/awesome-codex-skills.git
cd awesome-codex-skills
git checkout -b add-ios-agent-skill

# 3. Edit README.md — find "### Development & Code Tools" and add this line
#    in alphabetical position (after gh-fix-ci, before pr-review-ci-fix):
```

```markdown
- [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) - Production-ready iOS SwiftUI guidance for Codex covering Swift 5.9+, SwiftUI, UIKit interop, SwiftData, MVVM, and all Apple platforms (iOS, macOS, watchOS, tvOS, visionOS). Auto-detected via `AGENTS.md`. Install: `git clone https://github.com/Nagarjuna2997/ios-agent-skill.git ~/.codex/skills/ios-agent-skill`
```

```bash
# 4. Commit and push
git add README.md
git commit -m "Add ios-agent-skill"
git push origin add-ios-agent-skill

# 5. Open PR
```

**PR title:** `Add skill: ios-agent-skill`

**PR body:**
```
This PR adds ios-agent-skill, a public repository that provides production-ready
iOS SwiftUI guidance for the Codex CLI.

Repository: https://github.com/Nagarjuna2997/ios-agent-skill

It includes guidance for Swift, SwiftUI, iOS architecture, UI polish, animation,
app structure, and agent-friendly development workflows. Codex auto-detects the
skill via the included `AGENTS.md` file when cloned to `~/.codex/skills/`.

Added to "Development & Code Tools" alongside other external-repo skill entries
(brooks-lint, codebase-recon, Emdash Skills).
```

**Next action for you:** Fork, edit README, push, PR.

---

## 6. PatrickJS/awesome-cursorrules — Prepared

**Status:** Prepared (PR not opened)
**Link to PR:** N/A (to be created)
**What changed:** New folder `rules/ios-swiftui-agent-skill-cursorrules-prompt-file/` containing `.cursorrules` and `README.md`, plus a single line added to the main README's `### Mobile Development` section.

### Steps to submit

```bash
# 1. Fork PatrickJS/awesome-cursorrules on GitHub
# 2. Clone and branch
git clone https://github.com/YOUR-USERNAME/awesome-cursorrules.git
cd awesome-cursorrules
git checkout -b add-ios-agent-skill

# 3. Copy the prepared folder:
mkdir -p rules/ios-swiftui-agent-skill-cursorrules-prompt-file
cp /tmp/awesome-targets/_patches/cursorrules/rules/ios-swiftui-agent-skill-cursorrules-prompt-file/.cursorrules \
   rules/ios-swiftui-agent-skill-cursorrules-prompt-file/
cp /tmp/awesome-targets/_patches/cursorrules/rules/ios-swiftui-agent-skill-cursorrules-prompt-file/README.md \
   rules/ios-swiftui-agent-skill-cursorrules-prompt-file/

# 4. Edit README.md — find "### Mobile Development" and add this line in
#    alphabetical position (between Flutter Expert and NativeScript):
```

```markdown
- [iOS SwiftUI Agent Skill](./rules/ios-swiftui-agent-skill-cursorrules-prompt-file/.cursorrules) - Cursor rules for iOS/Swift/SwiftUI development across all Apple platforms with modern APIs and design standards.
```

```bash
# 5. Commit and push
git add rules/ios-swiftui-agent-skill-cursorrules-prompt-file/ README.md
git commit -m "Add ios-agent-skill"
git push origin add-ios-agent-skill

# 6. Open PR
```

**PR title:** `Add skill: ios-agent-skill`

**PR body:**
```
This PR adds an iOS SwiftUI Agent Skill cursor rule file.

Repository: https://github.com/Nagarjuna2997/ios-agent-skill

The new folder `rules/ios-swiftui-agent-skill-cursorrules-prompt-file/` contains:
- `.cursorrules` — full system prompt covering Swift 5.9+, SwiftUI, UIKit interop,
  SwiftData, MVVM, design standards, and platform-specific guidance for iOS,
  macOS, watchOS, tvOS, and visionOS.
- `README.md` — author, what-you-can-build, benefits, synopsis, and overview,
  matching the format used by neighboring rule folders (e.g., swiftui-guidelines).

Added a corresponding entry to the "Mobile Development" section of the main
README, placed alphabetically.

Companion repo provides extended documentation, code templates, and architecture
patterns covering ARKit, RealityKit, CoreML, Vision, HealthKit, StoreKit 2,
WidgetKit, ActivityKit, App Intents, and other Apple frameworks.
```

**Next action for you:** Fork, copy files, edit README, push, PR.

---

## 7. awesomeskills.dev — Manual visit required

**Status:** Manual / not submitted
**Link to PR:** N/A
**What changed:** Nothing (site returned HTTP 403 to automated fetch — likely Cloudflare bot protection).

**Next action for you:** Visit https://www.awesomeskills.dev in your browser and look for a "Submit" or "Add Skill" link. Use this prepared text:

| Field (likely) | Value |
|----------------|-------|
| Skill name | `ios-agent-skill` |
| GitHub URL | `https://github.com/Nagarjuna2997/ios-agent-skill` |
| Author | `Nagarjuna Reddy` |
| Author URL | `https://github.com/Nagarjuna2997` |
| Short description (≤10 words) | `iOS SwiftUI guidance for AI coding agents.` |
| Long description | `Production-ready iOS SwiftUI guidance for AI coding agents. Covers Swift 5.9+, SwiftUI, UIKit interop, SwiftData, MVVM, and all Apple platforms (iOS, macOS, watchOS, tvOS, visionOS). Includes 50,000+ lines of documentation, code templates, architecture patterns (MVVM, Clean Architecture, TCA, Coordinator), UI design system, and rule files for 25+ AI tools (Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, etc.).` |
| Category | `Development` (or `Mobile` if available) |
| Tags | `ios, swift, swiftui, mobile, ai-agents, claude-code, codex, cursor, copilot, developer-tools` |
| Supports | Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, Gemini CLI, Antigravity, Cline, Roo Code |
| License | `MIT` |

---

## 8. skillsdirectory.com — Manual visit required (login)

**Status:** Manual / not submitted
**Link to PR:** N/A
**What changed:** Nothing (submission gated by GitHub login).

**Next action for you:**
1. Visit https://skillsdirectory.com/submit
2. Click **"Sign in with GitHub"** and authorize.
3. Fill the form with this text:

| Field (likely) | Value |
|----------------|-------|
| Skill name | `ios-agent-skill` |
| GitHub repo URL | `https://github.com/Nagarjuna2997/ios-agent-skill` |
| Description | `Production-ready iOS SwiftUI guidance for AI coding agents. Covers Swift 5.9+, SwiftUI, UIKit interop, SwiftData, MVVM, and all Apple platforms.` |
| Category | `Development` (their primary categories include Development, Marketing, Research, Writing, Business, Design, Data & Analytics, Productivity, Legal) |
| Tags | `ios, swift, swiftui, ai-agents, claude-code, codex, cursor, copilot` |
| Supports | Claude Code, Codex, Cursor, GitHub Copilot, plus 20+ other agents |
| License | `MIT` |

> Note: Skills Directory runs automated security analysis on every submission (prompt injection, credential theft, data exfiltration screening). The repo contains only documentation and Swift code samples — no scripts that touch credentials or make outbound requests — so it should pass cleanly.

---

## GitHub repo topics — add manually

In the GitHub web UI for `ios-agent-skill`:

1. Go to https://github.com/Nagarjuna2997/ios-agent-skill
2. Click the gear icon next to **About** in the right sidebar
3. In the **Topics** field, paste:

```
agent-skills claude-code codex cursor github-copilot swift swiftui ios ai-agents developer-tools
```

4. Click **Save changes**

Topics make the repo discoverable on https://github.com/topics/agent-skills, https://github.com/topics/swiftui, etc.

---

## Re-eligibility checklist (for re-submitting #1 and #3 later)

Both VoltAgent/awesome-agent-skills and travisvn/awesome-claude-skills will accept submissions once the repo matures. Track these signals:

- [ ] 10+ GitHub stars (hard requirement for travisvn/awesome-claude-skills)
- [ ] At least one external reference (blog post, tweet, mention in another repo)
- [ ] At least one issue or PR from a user other than yourself
- [ ] Repo has been public for ≥30 days

When all four are true:
- For **travisvn/awesome-claude-skills**: write the PR yourself by hand, do not use AI assistance for the PR text — they auto-close AI-drafted PRs.
- For **VoltAgent/awesome-agent-skills**: Add to **Community Skills → Development and Testing** alongside `AvdLee/swiftui-expert-skill` and `efremidze/swift-patterns-skill`.

---

## Patch files on disk

The source files for #2 and #6 were prepared at:

```
/tmp/awesome-targets/_patches/copilot/instructions/swift-ios-development.instructions.md
/tmp/awesome-targets/_patches/cursorrules/rules/ios-swiftui-agent-skill-cursorrules-prompt-file/.cursorrules
/tmp/awesome-targets/_patches/cursorrules/rules/ios-swiftui-agent-skill-cursorrules-prompt-file/README.md
```

`/tmp` is wiped on reboot. The two non-trivial files are inlined below so they survive. The `.cursorrules` file is **byte-identical to `SKILL.md` in this repo** — just copy `SKILL.md` and rename it to `.cursorrules`.

---

### Inline: `instructions/swift-ios-development.instructions.md` (for awesome-copilot)

````markdown
---
description: 'Best practices for building production-ready iOS, iPadOS, macOS, watchOS, tvOS, and visionOS apps with Swift, SwiftUI, UIKit, SwiftData, and modern Apple frameworks. Adapted from the public ios-agent-skill repository.'
applyTo: "**/*.swift, **/Package.swift, **/Package.resolved, **/*.xcodeproj/**, **/Info.plist"
---

# Swift / iOS Development Guidelines

You are an expert iOS/Swift developer. Generate Swift source files that compile against the latest stable Xcode and follow Apple's current APIs, design patterns, and Human Interface Guidelines.

## Workflow boundary

- You generate `.swift` files. You do NOT create Xcode projects (`.xcodeproj`), asset catalogs, or build configurations.
- If the user has no Xcode project yet, instruct them to create one: **File → New → Project → App (SwiftUI, Swift)**.
- Place new files into a standard SwiftUI app structure: `Models/`, `Views/`, `ViewModels/`, `Services/`, `Utilities/`. Tell the user to add new files via Xcode → right-click → Add Files.

## Core principles

1. **Zero-error code.** Every snippet must compile. Use correct types, valid imports, and current API signatures.
2. **Modern-first.** Default to Swift 5.9+, iOS 17+, SwiftUI, SwiftData, the Observation framework. Use older APIs only when explicitly targeting older OS versions, and label the requirement.
3. **Platform-aware.** Tailor code to the target platform (iOS, macOS, watchOS, tvOS, visionOS). Use platform-specific APIs and patterns where appropriate.
4. **Safe by default.** Use the type system, optionals, and error handling. Never force-unwrap unless the value is guaranteed by program logic.
5. **Stunning UI by default.** Every UI must be visually polished — proper colors, typography, spacing, shadows, animations. Never ship flat or unstyled interfaces.

## UI design — non-negotiable readability rules

1. Text must be readable against its background — minimum 4.5:1 contrast for body, 3:1 for large text (18pt+).
2. Never use gray text on gray backgrounds. Light background → dark text (`.primary` or `Color(.label)`); dark background → white text.
3. Never use low-opacity text on colored backgrounds. Use full-opacity white or `.primary`, not `.secondary` or `.opacity(0.6)`.
4. Card backgrounds must contrast with the page background. Use `Color(.systemBackground)` for pages and `Color(.secondarySystemBackground)` (or pure white with a soft shadow) for cards. No gray-on-gray.
5. Colored pills and tags must use vivid, saturated colors with white text — not pastel or washed-out tints.
6. Test light and dark mode. Use Apple's semantic colors (`.systemBackground`, `.label`, `.secondaryLabel`) for guaranteed adaptation.

## Framework selection

| Need | Use | Avoid |
|------|-----|-------|
| New SwiftUI app | SwiftUI + `@Observable` + SwiftData | UIKit + Core Data unless required |
| Cross-platform | SwiftUI with platform-conditional code | Separate UIKit/AppKit projects |
| Persistence (iOS 17+) | SwiftData (`@Model`, `@Query`, `#Predicate`) | Core Data unless legacy |
| Persistence (iOS < 17) | Core Data with `NSPersistentContainer` | UserDefaults for structured data |
| Networking | `URLSession` + `async/await` + `Codable` | `Combine` for new code unless reactive UI |
| Concurrency | `async/await`, `Task`, actors, `@MainActor` | Completion handlers for new code |
| State (iOS 17+) | `@Observable` + `@Bindable` + `@State` | `ObservableObject` + `@Published` |
| State (iOS < 17) | `ObservableObject` + `@Published` | Static singletons |
| Architecture | MVVM with `@Observable` view models | Massive view files with logic in body |

## Project structure (matches Xcode SwiftUI template)

```
YourAppName/
├── YourAppNameApp.swift       // @main, App protocol
├── ContentView.swift          // Root view
├── Models/                    // Data models, SwiftData @Model types
├── Views/                     // SwiftUI views
├── ViewModels/                // @Observable view models
├── Services/                  // Networking, persistence, auth
└── Utilities/                 // Extensions, helpers, formatters
```

## Code quality rules

- Use `struct` for views; never `class` for SwiftUI views.
- Mark view models `@MainActor` or annotate the methods that touch the UI.
- Wrap async work in `.task { ... }` (cancellation-aware) rather than `.onAppear { Task { ... } }`.
- Use `@Sendable` closures and `Sendable` types in concurrent code.
- Prefer `#Predicate { ... }` over `NSPredicate` in SwiftData.
- For navigation, use `NavigationStack` with a typed path; avoid the deprecated `NavigationView`.
- Use SF Symbols for iconography; avoid bundling custom raster icons.
- Bind formatters with `.formatted(...)` (Foundation FormatStyle), not `DateFormatter` instances.

## Top pitfalls to avoid

1. Force-unwrapping optionals without a programmatic guarantee.
2. Using `NavigationView` instead of `NavigationStack` (iOS 16+).
3. Putting network calls or heavy work directly in `View.body`.
4. Forgetting `@MainActor` on view models that mutate `@Published` / `@Observable` state.
5. Using `DispatchQueue.main.async` to escape concurrency mistakes — fix the root cause with structured concurrency.
6. Writing custom singleton stores instead of using `@Environment` and dependency injection.
7. Hardcoding hex colors instead of using semantic colors and asset-catalog color sets for dark-mode support.
8. Ignoring Dynamic Type — every text view should respect the user's chosen size.
9. Skipping accessibility labels on `Image` and `Button` with icon-only labels.
10. Targeting too-low minimum OS — defaults of iOS 17 unlock SwiftData, `@Observable`, and zoom transitions.

## Reference

This file is adapted from the open-source [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) repository, which contains extended documentation, code templates, and architecture patterns covering SwiftUI, UIKit, SwiftData, ARKit, RealityKit, CoreML, Vision, HealthKit, StoreKit 2, WidgetKit, ActivityKit, App Intents, and all major Apple frameworks.
````

---

### Inline: `rules/ios-swiftui-agent-skill-cursorrules-prompt-file/README.md` (for awesome-cursorrules)

````markdown
# iOS SwiftUI Agent Skill .cursorrules prompt file

Author: Nagarjuna Reddy

Source: https://github.com/Nagarjuna2997/ios-agent-skill

## What you can build

Production-ready iOS, iPadOS, macOS, watchOS, tvOS, and visionOS apps with Cursor. The rules cover Swift 5.9+, SwiftUI, UIKit interop, SwiftData, the Observation framework, MVVM, Clean Architecture, TCA, and modern Apple frameworks (CloudKit, StoreKit 2, WidgetKit, ActivityKit, App Intents, ARKit, RealityKit, HealthKit, CoreML, Vision, and more).

## Benefits

- Zero-error Swift output: every code suggestion uses correct types, valid imports, and current API signatures.
- Modern-first defaults: Swift 5.9+, iOS 17+, SwiftUI, SwiftData, `@Observable`.
- Platform-aware: tailors code to iOS, macOS, watchOS, tvOS, or visionOS based on context.
- UI design standards baked in: WCAG-compliant color contrast, semantic system colors, typography hierarchy, spacing, shadows, and animation curves.
- MVVM project structure with sensible naming conventions.
- Top-10 pitfalls list to avoid common Swift/SwiftUI mistakes.

## Synopsis

iOS developers can use this rule file to make Cursor produce production-quality SwiftUI code with proper architecture, modern Apple APIs, and visually polished UI without the usual back-and-forth corrections.

## Overview of .cursorrules prompt

The `.cursorrules` file establishes Cursor as an expert iOS/Swift developer. It enforces an Xcode-project-first workflow (Cursor generates `.swift` files; the user creates the Xcode project), defines the standard SwiftUI app structure (`Models/`, `Views/`, `ViewModels/`, `Services/`, `Utilities/`), and lays out non-negotiable UI design rules: minimum 4.5:1 text contrast, semantic color usage (`Color(.systemBackground)`, `Color(.label)`), card and pill styling, animation curves, and dark-mode parity. It also covers framework selection (SwiftUI vs UIKit, SwiftData vs CoreData), platform-specific guidance for all five Apple platforms, and a top-10 pitfalls reference. The companion repo at https://github.com/Nagarjuna2997/ios-agent-skill ships extended documentation, code templates, and architecture patterns for deeper reference.
````
