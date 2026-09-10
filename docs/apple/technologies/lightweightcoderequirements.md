# LightweightCodeRequirements

## Context

Load this when a task names **LightweightCodeRequirements** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/lightweightcoderequirements) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Test the identity of executable code on disk and in running processes.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `LightweightCodeRequirements`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 17.4 | — | No |
| Mac Catalyst | 17.4 | — | No |
| macOS | 14.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Checking code requirements for running processes

- [SecTaskValidateForRequirement(task:requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/sectaskvalidateforrequirement(task:requirement:))
- [ProcessCodeRequirement](https://developer.apple.com/documentation/lightweightcoderequirements/processcoderequirement)
- [allOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/allof(requirement:)-4k3ay)
- [anyOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/anyof(requirement:)-vwhn)
- [ProcessConstraint](https://developer.apple.com/documentation/lightweightcoderequirements/processconstraint)
- [ProcessCodeSigningFlags](https://developer.apple.com/documentation/lightweightcoderequirements/processcodesigningflags)
- [ProcessConstraintBuilder](https://developer.apple.com/documentation/lightweightcoderequirements/processconstraintbuilder)
- [TeamIdentifierMatchesCurrentProcess](https://developer.apple.com/documentation/lightweightcoderequirements/teamidentifiermatchescurrentprocess)

### Checking code requirements for launching processes

- [SecCodeCheckValidityWithProcessRequirement(code:flags:requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/seccodecheckvaliditywithprocessrequirement(code:flags:requirement:))
- [launchRequirement](https://developer.apple.com/documentation/foundation/process/launchrequirement)
- [LaunchCodeRequirement](https://developer.apple.com/documentation/lightweightcoderequirements/launchcoderequirement)
- [allOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/allof(requirement:)-4gf5f)
- [anyOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/anyof(requirement:)-6nicx)
- [LaunchConstraint](https://developer.apple.com/documentation/lightweightcoderequirements/launchconstraint)
- [LaunchConstraintBuilder](https://developer.apple.com/documentation/lightweightcoderequirements/launchconstraintbuilder)

### Checking code requirements for code files on disk

- [SecStaticCodeCheckValidityWithOnDiskRequirement(code:flags:requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/secstaticcodecheckvaliditywithondiskrequirement(code:flags:requirement:))
- [SecCodeCheckValidityWithOnDiskRequirement(code:flags:requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/seccodecheckvaliditywithondiskrequirement(code:flags:requirement:))
- [ValidationResult](https://developer.apple.com/documentation/lightweightcoderequirements/validationresult)
- [OnDiskCodeRequirement](https://developer.apple.com/documentation/lightweightcoderequirements/ondiskcoderequirement)
- [allOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/allof(requirement:)-2ocwl)
- [anyOf(requirement:)](https://developer.apple.com/documentation/lightweightcoderequirements/anyof(requirement:)-71pff)
- [OnDiskConstraint](https://developer.apple.com/documentation/lightweightcoderequirements/ondiskconstraint)
- [OnDiskCodeSigningFlags](https://developer.apple.com/documentation/lightweightcoderequirements/ondiskcodesigningflags)
- [OnDiskConstraintBuilder](https://developer.apple.com/documentation/lightweightcoderequirements/ondiskconstraintbuilder)

### Testing properties of executable code

- [CodeDirectoryHash](https://developer.apple.com/documentation/lightweightcoderequirements/codedirectoryhash)
- [EntitlementsQuery](https://developer.apple.com/documentation/lightweightcoderequirements/entitlementsquery)
- [InfoPlistHash](https://developer.apple.com/documentation/lightweightcoderequirements/infoplisthash)
- [IsInitProcess](https://developer.apple.com/documentation/lightweightcoderequirements/isinitprocess)
- [IsMainBinary](https://developer.apple.com/documentation/lightweightcoderequirements/ismainbinary)
- [IsSIPProtected](https://developer.apple.com/documentation/lightweightcoderequirements/issipprotected)
- [PlatformType](https://developer.apple.com/documentation/lightweightcoderequirements/platformtype)
- [SigningIdentifier](https://developer.apple.com/documentation/lightweightcoderequirements/signingidentifier)
- [TeamIdentifier](https://developer.apple.com/documentation/lightweightcoderequirements/teamidentifier)
- [ValidationCategory](https://developer.apple.com/documentation/lightweightcoderequirements/validationcategory)

### Handling errors

- [ConstraintError](https://developer.apple.com/documentation/lightweightcoderequirements/constrainterror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
