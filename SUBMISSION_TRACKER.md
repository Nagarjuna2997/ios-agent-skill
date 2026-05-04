# Submission Tracker

Repository: https://github.com/Nagarjuna2997/ios-agent-skill
Description: Production-ready iOS SwiftUI guidance for AI coding agents.
Short description: iOS SwiftUI guidance for AI coding agents.
Last updated: 2026-05-04

---

## 1. VoltAgent/awesome-agent-skills

**Status:** Prepared only (PR not opened — repo requires community-adopted skills with real usage; repo is 2 months old)

**Link to PR or submission:** N/A

**What changed:** Prepared exact patch below. This list explicitly states "brand new skills that were just created are not accepted" and requires real community usage before submission.

**Next action for me:** Wait until the repo has stars, forks, and community usage (aim for 10+ stars and some forks). Then open a PR with this exact patch:

**Target file:** `README.md`

**Category:** Community Skills > Development and Testing

**Line to insert after** the `conorluddy/ios-simulator-skill` entry (Mobile/iOS section of Development):

```
- **[Nagarjuna2997/ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill)** - iOS SwiftUI guidance for AI coding agents.
```

**Full PR spec:**
- Branch: `add-ios-agent-skill`
- Commit message: `Add ios-agent-skill`
- PR title: `Add skill: ios-agent-skill`
- PR body:
  ```
    This PR adds ios-agent-skill, a public repository that provides production-ready iOS SwiftUI guidance for AI coding agents.

      Repository: https://github.com/Nagarjuna2997/ios-agent-skill

        It includes guidance for Swift, SwiftUI, iOS architecture, UI polish, animation, app structure, and agent-friendly development workflows.
          ```

          ---

          ## 2. github/awesome-copilot

          **Status:** Prepared only (PR requires local npm tooling — `npm run skill:create` and `npm run build` must be run locally)

          **Link to PR or submission:** N/A

          **What changed:** Prepared exact skill folder structure and content below. The github/awesome-copilot repo hosts skills directly in the `skills/` directory using a SKILL.md format with npm validation. PRs must target the `staged` branch, not `main`.

          **Next action for me:**

          1. Fork `github/awesome-copilot`
          2. Create a branch from `staged` (not main): `git checkout -b add-ios-agent-skill staged`
          3. Run: `npm install`
          4. Run: `npm run skill:create -- --name ios-swiftui-development --description "Production-ready iOS SwiftUI guidance for AI coding agents"`
          5. Edit the generated `skills/ios-swiftui-development/SKILL.md` with this content:

          ```markdown
          ---
          name: ios-swiftui-development
          description: Production-ready iOS SwiftUI guidance for AI coding agents. Covers Swift, SwiftUI, MVVM, animations, Apple frameworks, and agent-friendly iOS development workflows.
          ---

          # iOS SwiftUI Development

          Expert iOS and Swift development guidance for AI coding agents. Use this skill when working on iOS, macOS, watchOS, tvOS, or visionOS apps using SwiftUI.

          ## When to Use This Skill

          - Building iOS apps with SwiftUI and Swift
          - Implementing MVVM architecture with @Observable
          - Using SwiftData, CoreML, ARKit, or Apple frameworks
          - Creating polished UI with animations and design systems
          - Following Apple Human Interface Guidelines

          ## Instructions

          This skill loads guidance from [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill), a comprehensive iOS development reference covering:

          - Zero-error Swift code generation rules
          - SwiftUI best practices (iOS 17+, @Observable, NavigationStack)
          - MVVM project structure with naming conventions
          - Platform-specific guidance (iOS, macOS, watchOS, tvOS, visionOS)
          - UI design standards with color palettes, typography, and animations
          - Apple framework selection guide (50+ frameworks covered)
          - Common pitfalls and how to avoid them

          ## Source Repository

          https://github.com/Nagarjuna2997/ios-agent-skill
          ```

          6. Run: `npm run skill:validate`
          7. Run: `npm run build`
          8. Commit and push, then open PR targeting `staged` branch
          9. Add `🤖🤖🤖` at end of PR title for AI fast-track processing
          - PR title: `Add skill: ios-agent-skill 🤖🤖🤖`
          - PR body: (use standard body above)

          ---

          ## 3. travisvn/awesome-claude-skills

          **Status:** Prepared only (PR requires fork and edit; login to GitHub required to open PR)

          **Link to PR or submission:** N/A

          **What changed:** Prepared exact line to add to README.md under the Individual Skills table.

          **Next action for me:**

          1. Fork `travisvn/awesome-claude-skills`
          2. Create branch: `add-ios-agent-skill`
          3. Edit `README.md`
          4. Find the Individual Skills table (under "Community Skills > Individual Skills")
          5. Add this row in the table after the `ios-simulator-skill` row:

          ```
          | ios-agent-skill | Production-ready iOS SwiftUI guidance for AI coding agents |
          ```

          With the proper link format matching existing entries:
          ```
          | [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) | Production-ready iOS SwiftUI guidance for AI coding agents |
          ```

          - Branch: `add-ios-agent-skill`
          - Commit message: `Add ios-agent-skill`
          - PR title: `Add skill: ios-agent-skill`
          - PR body: (use standard body above)

          ---

          ## 4. ComposioHQ/awesome-claude-skills

          **Status:** Prepared only (PR requires fork and edit)

          **Link to PR or submission:** N/A

          **What changed:** Prepared exact line to add to README.md under the Development section.

          **Next action for me:**

          1. Fork `ComposioHQ/awesome-claude-skills` (default branch: `master`)
          2. Create branch: `add-ios-agent-skill`
          3. Edit `README.md`
          4. Find the **Development & Code Tools** section
          5. Add this line in alphabetical order (after "iOS Simulator"):

          ```
          iOS Agent Skill - [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) - Production-ready iOS SwiftUI guidance for AI coding agents.
          ```

          - Branch: `add-ios-agent-skill`
          - Commit message: `Add ios-agent-skill`
          - PR title: `Add skill: ios-agent-skill`
          - PR body: (use standard body above)

          ---

          ## 5. ComposioHQ/awesome-codex-skills

          **Status:** Prepared only (PR requires fork and edit)

          **Link to PR or submission:** N/A

          **What changed:** Prepared exact line to add to README.md under the Development & Code Tools section.

          **Next action for me:**

          1. Fork `ComposioHQ/awesome-codex-skills`
          2. Create branch: `add-ios-agent-skill`
          3. Edit `README.md`
          4. Find the **Development & Code Tools** section
          5. Add this line (keep alphabetical order):

          ```
          ios-agent-skill/ - Production-ready iOS SwiftUI guidance for AI coding agents.
          ```

          With link:
          ```
          [ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) - Production-ready iOS SwiftUI guidance for AI coding agents.
          ```

          - Branch: `add-ios-agent-skill`
          - Commit message: `Add ios-agent-skill`
          - PR title: `Add skill: ios-agent-skill`
          - PR body: (use standard body above)

          ---

          ## 6. PatrickJS/awesome-cursorrules

          **Status:** Prepared only (PR requires fork; also the .cursor/rules folder already qualifies)

          **Link to PR or submission:** N/A

          **What changed:** Prepared exact README.md addition and new rules folder. The repo already has a `swiftui-guidelines-cursorrules-prompt-file` entry. ios-agent-skill provides a `.cursor/rules/ios-skill.md` file which qualifies as a cursor rules contribution.

          **Next action for me:**

          1. Fork `PatrickJS/awesome-cursorrules`
          2. Create branch: `add-ios-agent-skill`
          3. Create folder: `rules/ios-swiftui-agent-cursorrules-prompt-file/`
          4. Copy `https://raw.githubusercontent.com/Nagarjuna2997/ios-agent-skill/main/.cursor/rules/ios-skill.md` as `.cursorrules` in that folder
          5. Create `rules/ios-swiftui-agent-cursorrules-prompt-file/README.md` with:

          ```markdown
          # iOS SwiftUI Agent cursor rules prompt file

          Author: Nagarjuna2997

          ## What is this?

          Rules file that configures Cursor AI as a production-ready iOS/Swift developer for SwiftUI projects.

          Source: https://github.com/Nagarjuna2997/ios-agent-skill
          ```

          6. Edit the main `README.md` to add in the **Mobile Development** section:

          ```
          - [iOS SwiftUI Agent](./rules/ios-swiftui-agent-cursorrules-prompt-file/.cursorrules) - Cursor rules for production-ready iOS SwiftUI development with AI agents.
          ```

          - Branch: `add-ios-agent-skill`
          - Commit message: `Add ios-agent-skill`
          - PR title: `Add skill: ios-agent-skill`
          - PR body: (use standard body above)

          ---

          ## 7. awesomeskills.dev

          **Status:** Prepared only (website has a "Submit a Skill" link but no functional submission form at time of check)

          **Link to PR or submission:** https://www.awesomeskills.dev/en (Submit a Skill button present)

          **What changed:** The site shows "We're building a submission system to make contributing easy. Submit a Skill →" — the submission system was not yet functional at time of inspection.

          **Next action for me:** Check https://www.awesomeskills.dev/en periodically and use the "Submit a Skill" form when it becomes available. Fill in:
          - Repository URL: https://github.com/Nagarjuna2997/ios-agent-skill
          - Category: Coding & Development
          - Description: Production-ready iOS SwiftUI guidance for AI coding agents.

          ---

          ## 8. skillsdirectory.com

          **Status:** Not eligible (site does not exist or is not accessible — no valid page found at skillsdirectory.com)

          **Link to PR or submission:** N/A

          **What changed:** Nothing. The URL skillsdirectory.com did not resolve to a functional skills directory at time of inspection.

          **Next action for me:** No action needed unless the site becomes active.

          ---

          ## Repo Improvements Made

          1. **SKILL.md** — Added YAML frontmatter with `name` and `description` fields for proper agent skill discovery across Claude Code, Codex, Cursor, and other platforms.

          ## GitHub Topics to Add

          Go to https://github.com/Nagarjuna2997/ios-agent-skill and click the gear icon next to "About" to add these topics:

          ```
          agent-skills
          claude-code
          codex
          cursor
          github-copilot
          swift
          swiftui
          ios
          ai-agents
          developer-tools
          ```

          ## Notes

          - VoltAgent/awesome-agent-skills and travisvn/awesome-claude-skills both require demonstrated community adoption before accepting new skills. Build stars/forks first.
          - github/awesome-copilot requires local npm toolchain to validate skill structure before PR.
          - PatrickJS/awesome-cursorrules is a good fit because the repo already has `.cursor/rules/ios-skill.md`.
          - ComposioHQ repos (awesome-claude-skills and awesome-codex-skills) are open to community PRs with no adoption requirement stated.
          
