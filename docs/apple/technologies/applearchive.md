# Apple Archive

## Context

Load this when a task names **Apple Archive** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/applearchive) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Perform multithreaded lossless compression of directories, files, and data.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Archive`.

Documentation language identifiers: occ, swift.

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

### Apple Archive essentials

- [Compressing single files](https://developer.apple.com/documentation/accelerate/compressing-single-files)
- [Decompressing single files](https://developer.apple.com/documentation/accelerate/decompressing-single-files)
- [Compressing file system directories](https://developer.apple.com/documentation/accelerate/compressing-file-system-directories)
- [Decompressing and extracting an archived directory](https://developer.apple.com/documentation/accelerate/decompressing-and-extracting-an-archived-directory)
- [Compressing and saving a string to the file system](https://developer.apple.com/documentation/accelerate/compressing-and-saving-a-string-to-the-file-system)
- [Decompressing and parsing an archived string](https://developer.apple.com/documentation/accelerate/decompressing-and-parsing-an-archived-string)

### Apple Encrypted Archive essentials

- [Encrypting and Decrypting a String](https://developer.apple.com/documentation/applearchive/encrypting-and-decrypting-a-string)
- [Encrypting and Decrypting a Single File](https://developer.apple.com/documentation/applearchive/encrypting-and-decrypting-a-single-file)
- [Encrypting and Decrypting Directories](https://developer.apple.com/documentation/applearchive/encrypting-and-decrypting-directories)
- [ArchiveEncryptionContext](https://developer.apple.com/documentation/applearchive/archiveencryptioncontext)

### Apple Archive headers

- [ArchiveHeader](https://developer.apple.com/documentation/applearchive/archiveheader)

### Apple Archive streams

- [ArchiveStreamProtocol](https://developer.apple.com/documentation/applearchive/archivestreamprotocol)
- [ArchiveStream](https://developer.apple.com/documentation/applearchive/archivestream)
- [ArchiveByteStreamProtocol](https://developer.apple.com/documentation/applearchive/archivebytestreamprotocol)
- [ArchiveByteStream](https://developer.apple.com/documentation/applearchive/archivebytestream)

### Apple Archive errors

- [ArchiveError](https://developer.apple.com/documentation/applearchive/archiveerror)

### Constants

- [APPLE_ARCHIVE_API_VERSION](https://developer.apple.com/documentation/applearchive/apple_archive_api_version)

### Reference

- [Apple Archive structures](https://developer.apple.com/documentation/applearchive/apple-archive-structures)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
