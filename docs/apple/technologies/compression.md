# Compression

## Context

Load this when a task names **Compression** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/compression) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Leverage compression algorithms for lossless data compression.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Compression`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.11 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Objects that simplify multiple-step compression

- [Compressing and decompressing data with input and output filters](https://developer.apple.com/documentation/accelerate/compressing-and-decompressing-data-with-input-and-output-filters)
- [Compressing and decompressing files with stream compression](https://developer.apple.com/documentation/accelerate/compressing-and-decompressing-files-with-stream-compression)
- [InputFilter](https://developer.apple.com/documentation/compression/inputfilter)
- [OutputFilter](https://developer.apple.com/documentation/compression/outputfilter)
- [Algorithm](https://developer.apple.com/documentation/compression/algorithm)
- [FilterError](https://developer.apple.com/documentation/compression/filtererror)
- [FilterOperation](https://developer.apple.com/documentation/compression/filteroperation)

### Multiple-step compression

- [compression_stream](https://developer.apple.com/documentation/compression/compression_stream)
- [compression_stream_init(_:_:_:)](https://developer.apple.com/documentation/compression/compression_stream_init(_:_:_:))
- [compression_stream_process(_:_:)](https://developer.apple.com/documentation/compression/compression_stream_process(_:_:))
- [compression_stream_destroy(_:)](https://developer.apple.com/documentation/compression/compression_stream_destroy(_:))
- [compression_status](https://developer.apple.com/documentation/compression/compression_status)
- [compression_stream_flags](https://developer.apple.com/documentation/compression/compression_stream_flags)
- [compression_stream_operation](https://developer.apple.com/documentation/compression/compression_stream_operation)
- [compression_algorithm](https://developer.apple.com/documentation/compression/compression_algorithm)

### Single-step compression

- [Compressing and decompressing data with buffer compression](https://developer.apple.com/documentation/accelerate/compressing-and-decompressing-data-with-buffer-compression)
- [compression_encode_scratch_buffer_size(_:)](https://developer.apple.com/documentation/compression/compression_encode_scratch_buffer_size(_:))
- [compression_encode_buffer(_:_:_:_:_:_:)](https://developer.apple.com/documentation/compression/compression_encode_buffer(_:_:_:_:_:_:))
- [compression_decode_scratch_buffer_size(_:)](https://developer.apple.com/documentation/compression/compression_decode_scratch_buffer_size(_:))
- [compression_decode_buffer(_:_:_:_:_:_:)](https://developer.apple.com/documentation/compression/compression_decode_buffer(_:_:_:_:_:_:))
- [compression_algorithm](https://developer.apple.com/documentation/compression/compression_algorithm)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
