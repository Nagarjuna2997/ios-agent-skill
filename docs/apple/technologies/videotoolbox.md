# Video Toolbox

## Context

Load this when a task names **Video Toolbox** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/videotoolbox) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Work directly with hardware-accelerated video encoding and decoding capabilities.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Video Toolbox`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 6.0 | — | No |
| iPadOS | 6.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 10.2 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Frame Processing

- [Frame processing](https://developer.apple.com/documentation/videotoolbox/frame-processing)

### Motion Estimation

- [VTMotionEstimationSession](https://developer.apple.com/documentation/videotoolbox/vtmotionestimationsession)

### Compression

- [Encoding video for low-latency conferencing](https://developer.apple.com/documentation/videotoolbox/encoding-video-for-low-latency-conferencing)
- [Encoding video for live streaming](https://developer.apple.com/documentation/videotoolbox/encoding-video-for-live-streaming)
- [Encoding video for offline transcoding](https://developer.apple.com/documentation/videotoolbox/encoding-video-for-offline-transcoding)
- [VTCompressionSession](https://developer.apple.com/documentation/videotoolbox/vtcompressionsession-api-collection)
- [VTDecompressionSession](https://developer.apple.com/documentation/videotoolbox/vtdecompressionsession-api-collection)
- [VTFrameSilo](https://developer.apple.com/documentation/videotoolbox/vtframesilo-api-collection)
- [VTMultiPassStorage](https://developer.apple.com/documentation/videotoolbox/vtmultipassstorage-api-collection)

### Transformation

- [VTPixelTransferSession](https://developer.apple.com/documentation/videotoolbox/vtpixeltransfersession-api-collection)
- [VTPixelRotationSession](https://developer.apple.com/documentation/videotoolbox/vtpixelrotationsession-api-collection)

### RAW Processing

- [VTRAWProcessingSession](https://developer.apple.com/documentation/videotoolbox/vtrawprocessingsession)

### Media Extension

- [VTExtensionPropertiesKey](https://developer.apple.com/documentation/videotoolbox/vtextensionpropertieskey)

### HDR Metadata

- [VTHDRPerFrameMetadataGenerationSession](https://developer.apple.com/documentation/videotoolbox/vthdrperframemetadatagenerationsession)

### Codec Support

- [VTIsHardwareDecodeSupported(_:)](https://developer.apple.com/documentation/videotoolbox/vtishardwaredecodesupported(_:))
- [VTRegisterProfessionalVideoWorkflowVideoEncoders()](https://developer.apple.com/documentation/videotoolbox/vtregisterprofessionalvideoworkflowvideoencoders())
- [VTRegisterProfessionalVideoWorkflowVideoDecoders()](https://developer.apple.com/documentation/videotoolbox/vtregisterprofessionalvideoworkflowvideodecoders())
- [VTRegisterSupplementalVideoDecoderIfAvailable(_:)](https://developer.apple.com/documentation/videotoolbox/vtregistersupplementalvideodecoderifavailable(_:))
- [VTCopySupportedPropertyDictionaryForEncoder(width:height:codecType:encoderSpecification:encoderIDOut:supportedPropertiesOut:)](https://developer.apple.com/documentation/videotoolbox/vtcopysupportedpropertydictionaryforencoder(width:height:codectype:encoderspecification:encoderidout:supportedpropertiesout:))
- [VTCopyVideoEncoderList(_:_:)](https://developer.apple.com/documentation/videotoolbox/vtcopyvideoencoderlist(_:_:))
- [Video Encoder List Keys](https://developer.apple.com/documentation/videotoolbox/video-encoder-list-keys)

### Utilities

- [VTCreateCGImageFromCVPixelBuffer(_:options:imageOut:)](https://developer.apple.com/documentation/videotoolbox/vtcreatecgimagefromcvpixelbuffer(_:options:imageout:))

### Data Types

- [VTSession](https://developer.apple.com/documentation/videotoolbox/vtsession-api-collection)
- [VTInt32Point](https://developer.apple.com/documentation/videotoolbox/vtint32point)
- [VTInt32Size](https://developer.apple.com/documentation/videotoolbox/vtint32size)

### Errors

- [Error Code Constants](https://developer.apple.com/documentation/videotoolbox/1490398-error-code-constants)

### Reference

- [VideoToolbox Reference](https://developer.apple.com/documentation/videotoolbox/videotoolbox-reference)

### Variables

- [kVTCompressionPreset_ConsistentQuality](https://developer.apple.com/documentation/videotoolbox/kvtcompressionpreset_consistentquality)
- [kVTCompressionPropertyKey_ConstantQualityFactor](https://developer.apple.com/documentation/videotoolbox/kvtcompressionpropertykey_constantqualityfactor)
- [kVTCompressionPropertyKey_LogTransferFunction](https://developer.apple.com/documentation/videotoolbox/kvtcompressionpropertykey_logtransferfunction)
- [kVTLogTransferFunctionMismatchErr](https://developer.apple.com/documentation/videotoolbox/kvtlogtransferfunctionmismatcherr)
- [kVTProjectionKind_AppleImmersiveVideo](https://developer.apple.com/documentation/videotoolbox/kvtprojectionkind_appleimmersivevideo)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
