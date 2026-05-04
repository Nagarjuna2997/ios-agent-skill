# Contributing to ios-agent-skill

Thanks for your interest! This skill is community-maintained and PRs are welcome.

## Ways to contribute

- **Fix or improve a doc** in `docs/` (typo, outdated API, missing example).
- **Add a new framework guide** to `docs/frameworks/` -- follow the existing "Complete Guide" structure (overview -> permissions -> setup -> code samples -> pitfalls).
- **Add a code template** to `templates/common-patterns/` -- Swift files only, must compile against the latest stable Xcode.
- **Add an architecture pattern** to `patterns/` -- include rationale, sample code, and trade-offs.
- **Tighten the agent rules** in `SKILL.md` (the brain shared by `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, etc.). Any change here propagates to 25+ AI tools, so be conservative.

## Ground rules

1. **Code must compile.** Every Swift snippet in this repo is checked in as code an iOS engineer can paste into Xcode and run. No pseudo-code, no `// ...` placeholders that hide work.
2. **Modern-first.** Default to the latest stable APIs (Swift 5.9+, iOS 17+, SwiftUI, SwiftData, the Observation framework). Older APIs only when targeting earlier OS versions, and label them clearly.
3. **Match the house style.** Docs use sentence-case headings, fenced code blocks with the `swift` language tag, and short prose between examples. Keep tables for comparisons, not for prose.
4. **Don't bloat.** A doc should be long because the surface area is large, not because it repeats itself. Prefer linking to peer docs over duplicating content.
5. **Update the README** if you add a new top-level file or doc the user should discover.

## Workflow

1. Fork the repo.
2. Create a topic branch: `git checkout -b add-spritekit-doc`.
3. Make your change. Keep the diff focused -- one concern per PR.
4. Open a PR using the template. Explain *why*, not just *what*.

## Updating the agent brain

`SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `CONVENTIONS.md`, `replit.md`, `.cursorrules`, `.clinerules`, `.continuerules`, `.kilocoderules`, `.roorules`, `.rules`, `.windsurfrules`, and the rule files under `.aiassistant/`, `.amazonq/`, `.augment/`, `.continue/`, `.cursor/`, `.junie/`, `.kilocode/`, `.roo/`, `.tabnine/`, `.trae/`, `.windsurf/`, and `.github/copilot-instructions.md` are **all identical**. If you change one, run:

```bash
# From repo root
SRC=SKILL.md
for f in CLAUDE.md AGENTS.md GEMINI.md CONVENTIONS.md replit.md \
         .cursorrules .clinerules .continuerules .kilocoderules .roorules .rules .windsurfrules \
         .github/copilot-instructions.md \
         .aiassistant/rules/ios-skill.md .amazonq/rules/ios-skill.md .augment/rules/ios-skill.md \
         .continue/rules/ios-skill.md .cursor/rules/ios-skill.md .junie/guidelines.md \
         .kilocode/rules/ios-skill.md .roo/rules/ios-skill.md .tabnine/guidelines/ios-skill.md \
         .trae/rules/ios-skill.md .windsurf/rules/ios-skill.md; do
  cp "$SRC" "$f"
done
```

Otherwise the agents fall out of sync and the skill becomes inconsistent across tools.

## Reporting bugs

Use the GitHub issue tracker with the **bug report** template. Include:
- AI tool you were using (Claude Code, Cursor, Codex, etc.) and version
- The prompt that triggered the bad output
- The actual vs. expected behavior
- Xcode + iOS SDK versions if a code sample failed to compile

## Code of conduct

By participating, you agree to abide by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
