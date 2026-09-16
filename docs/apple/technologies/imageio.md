# Image I/O

## Context

Load this when a task names **Image I/O** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/imageio) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Read and write most image file formats, and access an image’s metadata.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Image I/O`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Image Management

- [CGImageSource](https://developer.apple.com/documentation/imageio/cgimagesource)
- [CGImageDestination](https://developer.apple.com/documentation/imageio/cgimagedestination)

### XMP Metadata

- [CGImageMetadata](https://developer.apple.com/documentation/imageio/cgimagemetadata)
- [CGMutableImageMetadata](https://developer.apple.com/documentation/imageio/cgmutableimagemetadata)
- [CGImageMetadataTag](https://developer.apple.com/documentation/imageio/cgimagemetadatatag)
- [XMP Namespaces and Prefixes](https://developer.apple.com/documentation/imageio/xmp-namespaces-and-prefixes)
- [kCFErrorDomainCGImageMetadata](https://developer.apple.com/documentation/imageio/kcferrordomaincgimagemetadata)
- [CGImageMetadataErrors](https://developer.apple.com/documentation/imageio/cgimagemetadataerrors)

### Common Image Properties

- [Image Properties](https://developer.apple.com/documentation/imageio/image-properties)
- [EXIF Dictionary Keys](https://developer.apple.com/documentation/imageio/exif-dictionary-keys)
- [IPTC Dictionary Keys](https://developer.apple.com/documentation/imageio/iptc-dictionary-keys)
- [GPS Dictionary Keys](https://developer.apple.com/documentation/imageio/gps-dictionary-keys)
- [WebP Data](https://developer.apple.com/documentation/imageio/webp-data)

### Format-Specific Properties

- [CIFF Image Properties](https://developer.apple.com/documentation/imageio/ciff-image-properties)
- [DNG Image Properties](https://developer.apple.com/documentation/imageio/dng-image-properties)
- [GIF Image Properties](https://developer.apple.com/documentation/imageio/gif-image-properties)
- [HEIC Image Properties](https://developer.apple.com/documentation/imageio/heic-image-properties)
- [JFIF Image Properties](https://developer.apple.com/documentation/imageio/jfif-image-properties)
- [PNG Image Properties](https://developer.apple.com/documentation/imageio/png-image-properties)
- [TGA Image Properties](https://developer.apple.com/documentation/imageio/tga-image-properties)
- [TIFF Image Properties](https://developer.apple.com/documentation/imageio/tiff-image-properties)
- [8BIM Image Properties](https://developer.apple.com/documentation/imageio/8bim-image-properties)

### Manufacturer-Specific Properties

- [Nikon Camera Dictionary Keys](https://developer.apple.com/documentation/imageio/nikon-camera-dictionary-keys)
- [Canon Camera Dictionary Keys](https://developer.apple.com/documentation/imageio/canon-camera-dictionary-keys)
- [kCGImagePropertyMakerAppleDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertymakerappledictionary)
- [kCGImagePropertyMakerMinoltaDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertymakerminoltadictionary)
- [kCGImagePropertyMakerFujiDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertymakerfujidictionary)
- [kCGImagePropertyMakerOlympusDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertymakerolympusdictionary)
- [kCGImagePropertyMakerPentaxDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertymakerpentaxdictionary)
- [kCGImagePropertyRawDictionary](https://developer.apple.com/documentation/imageio/kcgimagepropertyrawdictionary)

### Spatial Photos

- [Writing spatial photos](https://developer.apple.com/documentation/imageio/writing-spatial-photos)
- [Creating spatial photos and videos with spatial metadata](https://developer.apple.com/documentation/imageio/creating-spatial-photos-and-videos-with-spatial-metadata)

### Animations

- [CGAnimateImageAtURLWithBlock(_:_:_:)](https://developer.apple.com/documentation/imageio/cganimateimageaturlwithblock(_:_:_:))
- [CGAnimateImageDataWithBlock(_:_:_:)](https://developer.apple.com/documentation/imageio/cganimateimagedatawithblock(_:_:_:))
- [CGImageSourceAnimationBlock](https://developer.apple.com/documentation/imageio/cgimagesourceanimationblock)
- [kCGImageAnimationStartIndex](https://developer.apple.com/documentation/imageio/kcgimageanimationstartindex)
- [kCGImageAnimationDelayTime](https://developer.apple.com/documentation/imageio/kcgimageanimationdelaytime)
- [kCGImageAnimationLoopCount](https://developer.apple.com/documentation/imageio/kcgimageanimationloopcount)
- [CGImageAnimationStatus](https://developer.apple.com/documentation/imageio/cgimageanimationstatus)

### Reference

- [Image I/O Constants](https://developer.apple.com/documentation/imageio/image-i-o-constants)
- [Image I/O Functions](https://developer.apple.com/documentation/imageio/image-i-o-functions)
- [Image I/O Macros](https://developer.apple.com/documentation/imageio/image-i-o-macros)

### Variables

- [kCGComputeHDRStats](https://developer.apple.com/documentation/imageio/kcgcomputehdrstats)
- [kCGImageDestinationEncodeAlternateColorSpace](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodealternatecolorspace)
- [kCGImageDestinationEncodeBaseColorSpace](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodebasecolorspace)
- [kCGImageDestinationEncodeBaseIsSDR](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodebaseissdr)
- [kCGImageDestinationEncodeBasePixelFormatRequest](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodebasepixelformatrequest)
- [kCGImageDestinationEncodeGainMapPixelFormatRequest](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodegainmappixelformatrequest)
- [kCGImageDestinationEncodeGainMapSubsampleFactor](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodegainmapsubsamplefactor)
- [kCGImageDestinationEncodeGenerateGainMapWithBaseImage](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodegenerategainmapwithbaseimage)
- [kCGImageDestinationEncodeIsBaseImage](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodeisbaseimage)
- [kCGImageDestinationEncodeRequest](https://developer.apple.com/documentation/imageio/kcgimagedestinationencoderequest)
- [kCGImageDestinationEncodeRequestOptions](https://developer.apple.com/documentation/imageio/kcgimagedestinationencoderequestoptions)
- [kCGImageDestinationEncodeToISOGainmap](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodetoisogainmap)
- [kCGImageDestinationEncodeToISOHDR](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodetoisohdr)
- [kCGImageDestinationEncodeToSDR](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodetosdr)
- [kCGImageDestinationEncodeTonemapMode](https://developer.apple.com/documentation/imageio/kcgimagedestinationencodetonemapmode)
- [kCGImagePropertyASTCBlockSize](https://developer.apple.com/documentation/imageio/kcgimagepropertyastcblocksize)
- [kCGImagePropertyASTCBlockSize4x4](https://developer.apple.com/documentation/imageio/kcgimagepropertyastcblocksize4x4)
- [kCGImagePropertyASTCBlockSize8x8](https://developer.apple.com/documentation/imageio/kcgimagepropertyastcblocksize8x8)
- [kCGImagePropertyASTCEncoder](https://developer.apple.com/documentation/imageio/kcgimagepropertyastcencoder)
- [kCGImagePropertyBCEncoder](https://developer.apple.com/documentation/imageio/kcgimagepropertybcencoder)
- [kCGImagePropertyBCFormat](https://developer.apple.com/documentation/imageio/kcgimagepropertybcformat)
- [kCGImagePropertyEncoder](https://developer.apple.com/documentation/imageio/kcgimagepropertyencoder)
- [kCGImagePropertyOpenEXRCompression](https://developer.apple.com/documentation/imageio/kcgimagepropertyopenexrcompression)
- [kCGImagePropertyPVREncoder](https://developer.apple.com/documentation/imageio/kcgimagepropertypvrencoder)
- [kCGImageProviderPreferredTileHeight](https://developer.apple.com/documentation/imageio/kcgimageproviderpreferredtileheight)
- [kCGImageProviderPreferredTileWidth](https://developer.apple.com/documentation/imageio/kcgimageproviderpreferredtilewidth)
- [kCGImageSourceAllowableTypes](https://developer.apple.com/documentation/imageio/kcgimagesourceallowabletypes)
- [kCGImageSourceGenerateImageSpecificLumaScaling](https://developer.apple.com/documentation/imageio/kcgimagesourcegenerateimagespecificlumascaling)
- [kCGImageSourcePrioritizeQuality](https://developer.apple.com/documentation/imageio/kcgimagesourceprioritizequality)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
