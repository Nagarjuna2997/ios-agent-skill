# MediaExtension

## Context

Load this when a task names **MediaExtension** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediaextension) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> This framework provides a means for developers to create format readers, video decoders, and RAW processors for media that the system doesn’t natively support.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MediaExtension`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 18.0 | — | No |
| macOS | 15.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Format readers

- [MEFormatReader](https://developer.apple.com/documentation/mediaextension/meformatreader)
- [MEFormatReaderExtension](https://developer.apple.com/documentation/mediaextension/meformatreaderextension)
- [MEFormatReaderInstantiationOptions](https://developer.apple.com/documentation/mediaextension/meformatreaderinstantiationoptions)
- [MEFileInfo](https://developer.apple.com/documentation/mediaextension/mefileinfo)
- [Format reader property list dictionaries](https://developer.apple.com/documentation/mediaextension/format-reader-property-list-dictionaries)
- [Format reader entitlement](https://developer.apple.com/documentation/mediaextension/format-reader-entitlement)

### Track readers

- [METrackReader](https://developer.apple.com/documentation/mediaextension/metrackreader)
- [METrackInfo](https://developer.apple.com/documentation/mediaextension/metrackinfo)

### Sample cursors

- [MESampleCursor](https://developer.apple.com/documentation/mediaextension/mesamplecursor)
- [MESampleLocation](https://developer.apple.com/documentation/mediaextension/mesamplelocation)
- [MESampleCursorChunk](https://developer.apple.com/documentation/mediaextension/mesamplecursorchunk)
- [MEEstimatedSampleLocation](https://developer.apple.com/documentation/mediaextension/meestimatedsamplelocation)
- [MEHEVCDependencyInfo](https://developer.apple.com/documentation/mediaextension/mehevcdependencyinfo)

### Byte sources

- [MEByteSource](https://developer.apple.com/documentation/mediaextension/mebytesource)

### Video decoders

- [MEVideoDecoder](https://developer.apple.com/documentation/mediaextension/mevideodecoder)
- [MEVideoDecoderExtension](https://developer.apple.com/documentation/mediaextension/mevideodecoderextension)
- [MEDecodeFrameOptions](https://developer.apple.com/documentation/mediaextension/medecodeframeoptions)
- [MEVideoDecoderPixelBufferManager](https://developer.apple.com/documentation/mediaextension/mevideodecoderpixelbuffermanager)
- [Video decoder property list dictionary](https://developer.apple.com/documentation/mediaextension/video-decoder-property-list-dictionary)
- [Video decoder entitlement](https://developer.apple.com/documentation/mediaextension/video-decoder-entitlement)

### RAW processors

- [MERAWProcessor](https://developer.apple.com/documentation/mediaextension/merawprocessor)
- [MERAWProcessorExtension](https://developer.apple.com/documentation/mediaextension/merawprocessorextension)
- [MERAWProcessorPixelBufferManager](https://developer.apple.com/documentation/mediaextension/merawprocessorpixelbuffermanager)
- [MERAWProcessingParameter](https://developer.apple.com/documentation/mediaextension/merawprocessingparameter)
- [MERAWProcessorNotification](https://developer.apple.com/documentation/mediaextension/merawprocessornotification)
- [RAW processor property list dictionary](https://developer.apple.com/documentation/mediaextension/raw-processor-property-list-dictionary)
- [RAW processor entitlement](https://developer.apple.com/documentation/mediaextension/raw-processor-entitlement)

### Errors

- [MediaExtensionErrorDomain](https://developer.apple.com/documentation/mediaextension/mediaextensionerrordomain)
- [MEError](https://developer.apple.com/documentation/mediaextension/meerror-swift.struct)
- [MEError.Code](https://developer.apple.com/documentation/mediaextension/meerror-swift.struct/code)

### Variables

- [kMEFormatReaderSidecarFileNameExtensionArrayKey](https://developer.apple.com/documentation/mediaextension/kmeformatreadersidecarfilenameextensionarraykey)
- [kMERAWProcessorClassImplementationIDKey](https://developer.apple.com/documentation/mediaextension/kmerawprocessorclassimplementationidkey)
- [kMERAWProcessorCodecNameKey](https://developer.apple.com/documentation/mediaextension/kmerawprocessorcodecnamekey)
- [kMERAWProcessorCodecTypeKey](https://developer.apple.com/documentation/mediaextension/kmerawprocessorcodectypekey)
- [kMERAWProcessorObjectNameKey](https://developer.apple.com/documentation/mediaextension/kmerawprocessorobjectnamekey)
- [kMERAWProcessorProcessorInfoKey](https://developer.apple.com/documentation/mediaextension/kmerawprocessorprocessorinfokey)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
