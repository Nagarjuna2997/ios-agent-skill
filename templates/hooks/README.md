# Hook Templates for iOS Projects

Drop-in hooks that enforce this skill's rules **deterministically** in a real
Xcode/SPM project. A hook runs at a fixed lifecycle point and cannot be
reasoned out of its verdict, which makes it the right place for anything a
script can decide.

Model judgment is for things rules cannot express. Everything here is a rule.

## Install

```bash
# From your iOS project root
mkdir -p .claude/hooks
cp path/to/ios-agent-skill/templates/hooks/*.sh .claude/hooks/
chmod +x .claude/hooks/*.sh
```

Then merge `settings.json.example` into your `.claude/settings.json`.

## What each hook does

| Hook | Event | Effect |
|------|-------|--------|
| `swift-format.sh` | PostToolUse (Edit/Write) | Runs SwiftFormat + SwiftLint autocorrect on the edited `.swift` file |
| `forbid-antipatterns.sh` | PostToolUse (Edit/Write) | Blocks the banned patterns from `SKILL.md` and tells the model what to use instead |
| `build-check.sh` | Stop | Builds (and optionally tests) before the turn ends; feeds failures back |

## Exit-code contract

| Exit | Meaning |
|------|---------|
| `0` | Pass. stdout appears in the transcript. |
| `2` | **Block.** stderr is fed back to the model as the reason to fix and retry. |
| other | Non-blocking error, surfaced to the user. |

Exit 2 is the useful one: the model sees the failure and self-corrects without
the user ever having to point it out.

## Cost

`build-check.sh` runs a real build on every Stop. On a large project that is
slow. Options, in order of preference:

1. Leave it on. A slow turn beats a broken commit.
2. Set `SKIP_TESTS=1` so it builds but does not test.
3. Move it to CI only, and keep the two fast PostToolUse hooks locally.

Never solve slowness by deleting the check and asserting the build passes.
