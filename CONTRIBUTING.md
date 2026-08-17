# Contributing to ios-agent-skill

Thanks for your interest! This skill is community-maintained and PRs are welcome.

## Ways to contribute

- **Fix or improve a doc** in `docs/` (typo, outdated API, missing example).
- **Add a new framework guide** to `docs/frameworks/` -- follow the existing "Complete Guide" structure (overview -> permissions -> setup -> code samples -> pitfalls).
- **Add a code template** to `templates/common-patterns/` -- Swift files only, must compile against the latest stable Xcode.
- **Add an architecture pattern** to `patterns/` -- include rationale, sample code, and trade-offs.
- **Tighten the agent rules** in `SKILL.md` (the brain shared by Claude, ChatGPT/Codex, and Gemini entry files). Any change here propagates to mirrored instruction files, so be conservative.

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

## Commit signing

Signed commits are **preferred but not required**. GitHub shows them as
*Verified*, which tells reviewers a commit came from who it claims to.

Some commits in this repository's history are unsigned — they predate signing
being configured. That history is left as-is deliberately: rewriting merged
commits to change a badge means force pushes, changed SHAs, and broken
references in issues and PRs, for no gain in correctness.

To sign your contributions, using an SSH key:

```bash
# 1. Generate a key (or reuse an existing one).
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/git_signing_key

# 2. Add the PUBLIC key to GitHub as a SIGNING key.
#    Settings -> SSH and GPG keys -> New SSH key -> Key type: "Signing Key"
#    An authentication key is NOT enough — the type matters.
cat ~/.ssh/git_signing_key.pub

# 3. Configure git.
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/git_signing_key.pub
git config --global commit.gpgsign true
```

Verify it actually worked before relying on it — a misconfigured key produces
unsigned commits **without an error**:

```bash
git commit --allow-empty -m "signing check"
git log -1 --format='%G?'    # G = good signature; N = not signed
```

`N` means signing silently did not happen. The usual causes are a key path that
does not exist, an empty key file, or a key registered as an authentication key
rather than a signing key.

## Updating the agent brain

`SKILL.md` is the **single source of truth**. `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` are generated copies of `SKILL.md` **with the YAML frontmatter stripped**. The repository intentionally focuses on Claude, ChatGPT/Codex-style agents, and Gemini.

Never edit a mirror by hand. Edit `SKILL.md`, then run:

```bash
./scripts/sync-mirrors.sh          # regenerate supported mirrors
./scripts/sync-mirrors.sh --check  # verify they are current (what CI runs)
```

The `docs-consistency` GitHub Actions workflow fails any PR whose mirrors are stale, so run the sync before you push.

To support a new AI entry point, add its path to the `MIRRORS` array in `scripts/sync-mirrors.sh` and re-run the script — do not add another `cp` line anywhere else.

## Publishing

Pushing a `v*` tag runs `.github/workflows/release.yml`. The workflow creates
the GitHub Release. npm packages are published manually from a local trusted
machine after the package build and tests pass.

Do **not** put `npm login`, usernames, passwords, or raw tokens in a workflow
file. Use `npm login` locally, then publish from the package directory with
`npm publish --access public`.

### House rules for `SKILL.md` itself

- Frontmatter must stay valid YAML with `name` and `description` present. The `description` is what agents match on to decide whether to load the skill, so it should name concrete triggers (frameworks, task types), not adjectives.
- Bump `version` on any behavioral change to the rules.
- Every documentation file referenced in the index must exist. CI checks this.
- New docs follow **Context → Pattern → Anti-Patterns**: state the trigger, show complete compiling Swift, then show the `// WRONG` forms with the failure each one causes. The anti-pattern block is not optional — it is the part that stops an agent from emitting plausible-but-wrong boilerplate.

## Reporting bugs

Use the GitHub issue tracker with the **bug report** template. Include:
- AI tool you were using (Claude Code, ChatGPT/Codex, or Gemini) and version
- The prompt that triggered the bad output
- The actual vs. expected behavior
- Xcode + iOS SDK versions if a code sample failed to compile

## Code of conduct

By participating, you agree to abide by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
