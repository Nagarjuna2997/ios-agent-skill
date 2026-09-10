# System

## Context

Load this when a task names **System** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/system) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Perform low-level file operations using type-safe APIs.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `System`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |
| tvOS | 14.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 7.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Adopting System

- [Adopting Swift File Operations](https://developer.apple.com/documentation/system/adopting-file-operations)
- [Adopting Swift File Options](https://developer.apple.com/documentation/system/adopting-file-options)
- [Adopting Swift Error Constants](https://developer.apple.com/documentation/system/adopting-errno)

### Files

- [FileDescriptor](https://developer.apple.com/documentation/system/filedescriptor)
- [FilePath](https://developer.apple.com/documentation/system/filepath)
- [FilePermissions](https://developer.apple.com/documentation/system/filepermissions)

### Errors

- [Errno](https://developer.apple.com/documentation/system/errno)

### Protocols

- [MachPortRight](https://developer.apple.com/documentation/system/machportright)

### Structures

- [DeviceID](https://developer.apple.com/documentation/system/deviceid)
- [FileFlags](https://developer.apple.com/documentation/system/fileflags)
- [FileMode](https://developer.apple.com/documentation/system/filemode)
- [FileType](https://developer.apple.com/documentation/system/filetype)
- [GroupID](https://developer.apple.com/documentation/system/groupid)
- [Inode](https://developer.apple.com/documentation/system/inode)
- [Stat](https://developer.apple.com/documentation/system/stat)
- [UserID](https://developer.apple.com/documentation/system/userid)

### Enumerations

- [CInterop](https://developer.apple.com/documentation/system/cinterop)
- [Mach](https://developer.apple.com/documentation/system/mach)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
