# Core Image

## Context

Load this when a task names **Core Image** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/coreimage) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Use built-in or custom filters to process still and video images.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Image`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 5.0 | — | No |
| iPadOS | 5.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.11 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Processing an Image Using Built-in Filters](https://developer.apple.com/documentation/coreimage/processing-an-image-using-built-in-filters)
- [CIContext](https://developer.apple.com/documentation/coreimage/cicontext)
- [CIImage](https://developer.apple.com/documentation/coreimage/ciimage)

### Filters

- [CIFilter](https://developer.apple.com/documentation/coreimage/cifilter-swift.class)
- [CIRAWFilter](https://developer.apple.com/documentation/coreimage/cirawfilter)
- [CIColor](https://developer.apple.com/documentation/coreimage/cicolor)
- [CIVector](https://developer.apple.com/documentation/coreimage/civector)

### Filter Catalog

- [Blur Filters](https://developer.apple.com/documentation/coreimage/blur-filters)
- [Color Adjustment Filters](https://developer.apple.com/documentation/coreimage/color-adjustment-filters)
- [Color Effect Filters](https://developer.apple.com/documentation/coreimage/color-effect-filters)
- [Composite Operations](https://developer.apple.com/documentation/coreimage/composite-operations)
- [Convolution Filters](https://developer.apple.com/documentation/coreimage/convolution-filters)
- [Distortion Filters](https://developer.apple.com/documentation/coreimage/distortion-filters)
- [Generator Filters](https://developer.apple.com/documentation/coreimage/generator-filters)
- [Geometry Adjustment Filters](https://developer.apple.com/documentation/coreimage/geometry-adjustment-filters)
- [Gradient Filters](https://developer.apple.com/documentation/coreimage/gradient-filters)
- [Halftone Effect Filters](https://developer.apple.com/documentation/coreimage/halftone-effect-filters)
- [Reduction Filters](https://developer.apple.com/documentation/coreimage/reduction-filters)
- [Sharpening Filters](https://developer.apple.com/documentation/coreimage/sharpening-filters)
- [Stylizing Filters](https://developer.apple.com/documentation/coreimage/stylizing-filters)
- [Tile Effect Filters](https://developer.apple.com/documentation/coreimage/tile-effect-filters)
- [Transition Filters](https://developer.apple.com/documentation/coreimage/transition-filters)

### Filter Recipes

- [Applying a Chroma Key Effect](https://developer.apple.com/documentation/coreimage/applying-a-chroma-key-effect)
- [Selectively Focusing on an Image](https://developer.apple.com/documentation/coreimage/selectively-focusing-on-an-image)
- [Customizing Image Transitions](https://developer.apple.com/documentation/coreimage/customizing-image-transitions)
- [Simulating Scratchy Analog Film](https://developer.apple.com/documentation/coreimage/simulating-scratchy-analog-film)

### Custom Filters

- [Writing Custom Kernels](https://developer.apple.com/documentation/coreimage/writing-custom-kernels)
- [CIKernel](https://developer.apple.com/documentation/coreimage/cikernel)
- [CIColorKernel](https://developer.apple.com/documentation/coreimage/cicolorkernel)
- [CIWarpKernel](https://developer.apple.com/documentation/coreimage/ciwarpkernel)
- [CIBlendKernel](https://developer.apple.com/documentation/coreimage/ciblendkernel)
- [CISampler](https://developer.apple.com/documentation/coreimage/cisampler)
- [CIFilterShape](https://developer.apple.com/documentation/coreimage/cifiltershape)
- [CIFormat](https://developer.apple.com/documentation/coreimage/ciformat)

### Custom Image Processors

- [CIImageProcessorKernel](https://developer.apple.com/documentation/coreimage/ciimageprocessorkernel)
- [CIImageProcessorInput](https://developer.apple.com/documentation/coreimage/ciimageprocessorinput)
- [CIImageProcessorOutput](https://developer.apple.com/documentation/coreimage/ciimageprocessoroutput)

### Custom Render Destination

- [Generating an animation with a Core Image Render Destination](https://developer.apple.com/documentation/coreimage/generating-an-animation-with-a-core-image-render-destination)
- [CIRenderDestination](https://developer.apple.com/documentation/coreimage/cirenderdestination)
- [CIRenderInfo](https://developer.apple.com/documentation/coreimage/cirenderinfo)
- [CIRenderTask](https://developer.apple.com/documentation/coreimage/cirendertask)
- [CIRenderDestinationAlphaMode](https://developer.apple.com/documentation/coreimage/cirenderdestinationalphamode)

### Feedback-Based Processing

- [CIImageAccumulator](https://developer.apple.com/documentation/coreimage/ciimageaccumulator)

### Barcode Descriptions

- [CIBarcodeDescriptor](https://developer.apple.com/documentation/coreimage/cibarcodedescriptor)
- [CIQRCodeDescriptor](https://developer.apple.com/documentation/coreimage/ciqrcodedescriptor)
- [CIAztecCodeDescriptor](https://developer.apple.com/documentation/coreimage/ciazteccodedescriptor)
- [CIPDF417CodeDescriptor](https://developer.apple.com/documentation/coreimage/cipdf417codedescriptor)
- [CIDataMatrixCodeDescriptor](https://developer.apple.com/documentation/coreimage/cidatamatrixcodedescriptor)

### Image Feature Detection

- [CIDetector](https://developer.apple.com/documentation/coreimage/cidetector)
- [CIFeature](https://developer.apple.com/documentation/coreimage/cifeature)
- [CIFaceFeature](https://developer.apple.com/documentation/coreimage/cifacefeature)
- [CIRectangleFeature](https://developer.apple.com/documentation/coreimage/cirectanglefeature)
- [CITextFeature](https://developer.apple.com/documentation/coreimage/citextfeature)
- [CIQRCodeFeature](https://developer.apple.com/documentation/coreimage/ciqrcodefeature)

### Image Units

- [CIPlugIn](https://developer.apple.com/documentation/coreimage/ciplugin)
- [CIFilterGenerator](https://developer.apple.com/documentation/coreimage/cifiltergenerator)
- [CIPlugInRegistration](https://developer.apple.com/documentation/coreimage/cipluginregistration)
- [CIFilterConstructor](https://developer.apple.com/documentation/coreimage/cifilterconstructor)

### Protocols

- [CIAreaBoundsRed](https://developer.apple.com/documentation/coreimage/ciareaboundsred)
- [CIMaximumScaleTransform](https://developer.apple.com/documentation/coreimage/cimaximumscaletransform)
- [CIToneMapHeadroom](https://developer.apple.com/documentation/coreimage/citonemapheadroom)
- [CIAreaAverageMaximumRed](https://developer.apple.com/documentation/coreimage/ciareaaveragemaximumred)
- [CIBlurredRoundedRectangleGenerator](https://developer.apple.com/documentation/coreimage/ciblurredroundedrectanglegenerator)
- [CIDistanceGradientFromRedMask](https://developer.apple.com/documentation/coreimage/cidistancegradientfromredmask)
- [CIRoundedQRCodeGenerator](https://developer.apple.com/documentation/coreimage/ciroundedqrcodegenerator)
- [CISignedDistanceGradientFromRedMask](https://developer.apple.com/documentation/coreimage/cisigneddistancegradientfromredmask)

### Reference

- [Core Image Constants](https://developer.apple.com/documentation/coreimage/core-image-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
