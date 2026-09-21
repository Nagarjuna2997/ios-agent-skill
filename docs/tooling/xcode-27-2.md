# Xcode 27.2 beta: project format and preview tooling

## Context

Checked 2026-09-21 against [Apple’s release notes](https://developer.apple.com/documentation/xcode-release-notes/xcode-27_2-release-notes) and [project-format guide](https://developer.apple.com/documentation/xcode/updating-your-xcode-project-configuration-file-format). This is beta documentation, not a local Xcode 27.2 execution result.

## Pattern

The `.xcodeproj` bundle remains. Its internal project configuration can use JSON
with an `.xcproj` extension instead of the older `.pbxproj` property list. Apple
says Xcode 27 and later can open either format; Xcode 27.2 makes JSON the default
for new configurations. Existing projects can switch through the File inspector’s
Project Format control. Review both the removed file and the added file in Git.

Our project analysis recognizes both configuration files and checks JSON syntax.
It does **not** resolve the new target/build-setting schema or write conversions.
Release preparation stays blocked for JSON projects; launch review reports an
explicit coverage limitation. When both formats coexist, it does not silently
choose the legacy file. Use compatible Xcode to resolve the project before making
claims about target membership, deployment settings, or launch assets.

For Apple’s `RenderPreview` MCP tool, inspect the available render destinations
returned by the installed tool and select the intended one using its advertised
schema. Record the destination with preview evidence. Don’t hardcode guessed
argument names or treat a preview as a Simulator test.

Apple directs Duo development to **Xcode 27.1 beta**, even from the 27.2 notes.
See `docs/platforms/iphone-duo.md` and `docs/tooling/device-hub.md`.

## Anti-Patterns

- Do not rename the outer bundle to `.xcproj`.
- Do not feed JSON to the OpenStep plist parser, infer its schema from `.pbxproj`,
  or claim that valid JSON proves a buildable project.
- Do not change the selected Xcode or migrate user projects without a scoped request.

## Verification

Synthetic regression tests cover discovery, malformed JSON, unsupported JSON roots,
workspace selection and coexisting formats. The verification host has Xcode 26.6;
real JSON project builds and Xcode 27.2 preview sessions remain unverified.
