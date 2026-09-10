# Metal Performance Shaders

## Context

Load this when a task names **Metal Performance Shaders** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/metalperformanceshaders) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Optimize graphics and compute performance with kernels that are fine-tuned for the unique characteristics of each Metal GPU family.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Metal Performance Shaders`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.13 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Fundamentals

- [The MPSKernel Class](https://developer.apple.com/documentation/metalperformanceshaders/the-mpskernel-class)
- [Tuning Hints](https://developer.apple.com/documentation/metalperformanceshaders/tuning-hints)

### Device Support

- [MPSSupportsMTLDevice(_:)](https://developer.apple.com/documentation/metalperformanceshaders/mpssupportsmtldevice(_:))

### Image Filters

- [Image Filters](https://developer.apple.com/documentation/metalperformanceshaders/image-filters)

### Neural Networks

- [Training a Neural Network with Metal Performance Shaders](https://developer.apple.com/documentation/metalperformanceshaders/training-a-neural-network-with-metal-performance-shaders)
- [MPSImage](https://developer.apple.com/documentation/metalperformanceshaders/mpsimage)
- [MPSTemporaryImage](https://developer.apple.com/documentation/metalperformanceshaders/mpstemporaryimage)
- [Objects that Simplify the Creation of Neural Networks](https://developer.apple.com/documentation/metalperformanceshaders/objects-that-simplify-the-creation-of-neural-networks)
- [Convolutional Neural Network Kernels](https://developer.apple.com/documentation/metalperformanceshaders/convolutional-neural-network-kernels)
- [Recurrent Neural Networks](https://developer.apple.com/documentation/metalperformanceshaders/recurrent-neural-networks)

### Matrices and Vectors

- [Matrices and Vectors](https://developer.apple.com/documentation/metalperformanceshaders/matrices-and-vectors)

### Kernel Base Classes

- [MPSKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpskernel)

### Keyed Archivers

- [NSKeyedArchiver](https://developer.apple.com/documentation/foundation/nskeyedarchiver)
- [MPSKeyedUnarchiver](https://developer.apple.com/documentation/metalperformanceshaders/mpskeyedunarchiver)
- [MPSDeviceProvider](https://developer.apple.com/documentation/metalperformanceshaders/mpsdeviceprovider)

### Ray Tracing

- [Accelerating ray tracing and motion blur using Metal](https://developer.apple.com/documentation/metal/accelerating-ray-tracing-and-motion-blur-using-metal)
- [MPSRayIntersector](https://developer.apple.com/documentation/metalperformanceshaders/mpsrayintersector) — deprecated
- [MPSAccelerationStructureGroup](https://developer.apple.com/documentation/metalperformanceshaders/mpsaccelerationstructuregroup) — deprecated
- [MPSInstanceAccelerationStructure](https://developer.apple.com/documentation/metalperformanceshaders/mpsinstanceaccelerationstructure) — deprecated
- [MPSTriangleAccelerationStructure](https://developer.apple.com/documentation/metalperformanceshaders/mpstriangleaccelerationstructure) — deprecated
- [MPSAccelerationStructure](https://developer.apple.com/documentation/metalperformanceshaders/mpsaccelerationstructure) — deprecated

### Articles

- [MetalPerformanceShaders Constants](https://developer.apple.com/documentation/metalperformanceshaders/metalperformanceshaders-constants)
- [MetalPerformanceShaders Data Types](https://developer.apple.com/documentation/metalperformanceshaders/metalperformanceshaders-data-types)
- [MetalPerformanceShaders Enumerations](https://developer.apple.com/documentation/metalperformanceshaders/metalperformanceshaders-enumerations)
- [MetalPerformanceShaders Functions](https://developer.apple.com/documentation/metalperformanceshaders/metalperformanceshaders-functions)
- [MetalPerformanceShaders Structures](https://developer.apple.com/documentation/metalperformanceshaders/metalperformanceshaders-structures)

### Classes

- [MPSCNNConvolutionTransposeGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnconvolutiontransposegradient)
- [MPSCNNConvolutionTransposeGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnconvolutiontransposegradientnode)
- [MPSCNNConvolutionTransposeGradientState](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnconvolutiontransposegradientstate)
- [MPSCNNConvolutionTransposeGradientStateNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnconvolutiontransposegradientstatenode)
- [MPSCNNFullyConnectedGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnfullyconnectedgradientnode)
- [MPSCNNGroupNormalization](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalization)
- [MPSCNNGroupNormalizationGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalizationgradient)
- [MPSCNNGroupNormalizationGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalizationgradientnode)
- [MPSCNNGroupNormalizationGradientState](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalizationgradientstate)
- [MPSCNNGroupNormalizationNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalizationnode)
- [MPSCNNMultiaryKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnmultiarykernel)
- [MPSCNNNeuronGeLUNode](https://developer.apple.com/documentation/metalperformanceshaders/mpscnnneurongelunode)
- [MPSCommandBuffer](https://developer.apple.com/documentation/metalperformanceshaders/mpscommandbuffer)
- [MPSFColorConversion](https://developer.apple.com/documentation/metalperformanceshaders/mpsfcolorconversion)
- [MPSFunction](https://developer.apple.com/documentation/metalperformanceshaders/mpsfunction)
- [MPSImageCanny](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagecanny)
- [MPSImageEDLines](https://developer.apple.com/documentation/metalperformanceshaders/mpsimageedlines)
- [MPSImageNormalizedHistogram](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagenormalizedhistogram)
- [MPSMatrixRandom](https://developer.apple.com/documentation/metalperformanceshaders/mpsmatrixrandom)
- [MPSMatrixRandomDistributionDescriptor](https://developer.apple.com/documentation/metalperformanceshaders/mpsmatrixrandomdistributiondescriptor)
- [MPSMatrixRandomMTGP32](https://developer.apple.com/documentation/metalperformanceshaders/mpsmatrixrandommtgp32)
- [MPSMatrixRandomPhilox](https://developer.apple.com/documentation/metalperformanceshaders/mpsmatrixrandomphilox)
- [MPSNDArray](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarray)
- [MPSNDArrayAffineInt4Dequantize](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayaffineint4dequantize)
- [MPSNDArrayAffineQuantizationDescriptor](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayaffinequantizationdescriptor)
- [MPSNDArrayBinaryKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraybinarykernel)
- [MPSNDArrayBinaryPrimaryGradientKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraybinaryprimarygradientkernel)
- [MPSNDArrayBinarySecondaryGradientKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraybinarysecondarygradientkernel)
- [MPSNDArrayDescriptor](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraydescriptor)
- [MPSNDArrayGather](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraygather)
- [MPSNDArrayGatherGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraygathergradient)
- [MPSNDArrayGatherGradientState](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraygathergradientstate)
- [MPSNDArrayGradientState](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraygradientstate)
- [MPSNDArrayIdentity](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayidentity)
- [MPSNDArrayLUTDequantize](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraylutdequantize)
- [MPSNDArrayLUTQuantizationDescriptor](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraylutquantizationdescriptor)
- [MPSNDArrayMatrixMultiplication](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraymatrixmultiplication)
- [MPSNDArrayMultiaryBase](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraymultiarybase)
- [MPSNDArrayMultiaryGradientKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraymultiarygradientkernel)
- [MPSNDArrayMultiaryKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraymultiarykernel)
- [MPSNDArrayQuantizationDescriptor](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayquantizationdescriptor)
- [MPSNDArrayQuantizedMatrixMultiplication](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayquantizedmatrixmultiplication)
- [MPSNDArrayStridedSlice](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraystridedslice)
- [MPSNDArrayStridedSliceGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarraystridedslicegradient)
- [MPSNDArrayUnaryGradientKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayunarygradientkernel)
- [MPSNDArrayUnaryKernel](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayunarykernel)
- [MPSNDArrayVectorLUTDequantize](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayvectorlutdequantize)
- [MPSNNCompare](https://developer.apple.com/documentation/metalperformanceshaders/mpsnncompare)
- [MPSNNComparisonNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnncomparisonnode)
- [MPSNNCropAndResizeBilinear](https://developer.apple.com/documentation/metalperformanceshaders/mpsnncropandresizebilinear)
- [MPSNNForwardLoss](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnforwardloss)
- [MPSNNForwardLossNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnforwardlossnode)
- [MPSNNGramMatrixCalculation](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngrammatrixcalculation)
- [MPSNNGramMatrixCalculationGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngrammatrixcalculationgradient)
- [MPSNNGramMatrixCalculationGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngrammatrixcalculationgradientnode)
- [MPSNNGramMatrixCalculationNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngrammatrixcalculationnode)
- [MPSNNGridSample](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngridsample)
- [MPSNNInitialGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsnninitialgradient)
- [MPSNNInitialGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnninitialgradientnode)
- [MPSNNLocalCorrelation](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnlocalcorrelation)
- [MPSNNLossGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnlossgradient)
- [MPSNNLossGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnlossgradientnode)
- [MPSNNMultiaryGradientState](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnmultiarygradientstate)
- [MPSNNMultiaryGradientStateNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnmultiarygradientstatenode)
- [MPSNNPad](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnpad)
- [MPSNNPadGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnpadgradient)
- [MPSNNPadGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnpadgradientnode)
- [MPSNNPadNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnpadnode)
- [MPSNNReductionColumnMaxNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductioncolumnmaxnode)
- [MPSNNReductionColumnMeanNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductioncolumnmeannode)
- [MPSNNReductionColumnMinNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductioncolumnminnode)
- [MPSNNReductionColumnSumNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductioncolumnsumnode)
- [MPSNNReductionFeatureChannelsArgumentMaxNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelsargumentmaxnode)
- [MPSNNReductionFeatureChannelsArgumentMinNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelsargumentminnode)
- [MPSNNReductionFeatureChannelsMaxNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelsmaxnode)
- [MPSNNReductionFeatureChannelsMeanNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelsmeannode)
- [MPSNNReductionFeatureChannelsMinNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelsminnode)
- [MPSNNReductionFeatureChannelsSumNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionfeaturechannelssumnode)
- [MPSNNReductionRowMaxNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionrowmaxnode)
- [MPSNNReductionRowMeanNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionrowmeannode)
- [MPSNNReductionRowMinNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionrowminnode)
- [MPSNNReductionRowSumNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionrowsumnode)
- [MPSNNReductionSpatialMeanGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionspatialmeangradientnode)
- [MPSNNReductionSpatialMeanNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreductionspatialmeannode)
- [MPSNNReshapeGradient](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreshapegradient)
- [MPSNNReshapeGradientNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreshapegradientnode)
- [MPSNNReshapeNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnreshapenode)
- [MPSNNResizeBilinear](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnresizebilinear)
- [MPSNNUnaryReductionNode](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnunaryreductionnode)
- [MPSPolygonAccelerationStructure](https://developer.apple.com/documentation/metalperformanceshaders/mpspolygonaccelerationstructure) — deprecated
- [MPSPolygonBuffer](https://developer.apple.com/documentation/metalperformanceshaders/mpspolygonbuffer) — deprecated
- [MPSPredicate](https://developer.apple.com/documentation/metalperformanceshaders/mpspredicate)
- [MPSQuadrilateralAccelerationStructure](https://developer.apple.com/documentation/metalperformanceshaders/mpsquadrilateralaccelerationstructure) — deprecated
- [MPSSVGF](https://developer.apple.com/documentation/metalperformanceshaders/mpssvgf)
- [MPSSVGFDefaultTextureAllocator](https://developer.apple.com/documentation/metalperformanceshaders/mpssvgfdefaulttextureallocator)
- [MPSSVGFDenoiser](https://developer.apple.com/documentation/metalperformanceshaders/mpssvgfdenoiser)
- [MPSStateResourceList](https://developer.apple.com/documentation/metalperformanceshaders/mpsstateresourcelist)
- [MPSTemporalAA](https://developer.apple.com/documentation/metalperformanceshaders/mpstemporalaa)
- [MPSTemporaryNDArray](https://developer.apple.com/documentation/metalperformanceshaders/mpstemporaryndarray)

### Protocols

- [MPSCNNGroupNormalizationDataSource](https://developer.apple.com/documentation/metalperformanceshaders/mpscnngroupnormalizationdatasource)
- [MPSHeapProvider](https://developer.apple.com/documentation/metalperformanceshaders/mpsheapprovider)
- [MPSNDArrayAllocator](https://developer.apple.com/documentation/metalperformanceshaders/mpsndarrayallocator)
- [MPSNNGramMatrixCallback](https://developer.apple.com/documentation/metalperformanceshaders/mpsnngrammatrixcallback)
- [MPSNNLossCallback](https://developer.apple.com/documentation/metalperformanceshaders/mpsnnlosscallback)
- [MPSSVGFTextureAllocator](https://developer.apple.com/documentation/metalperformanceshaders/mpssvgftextureallocator)

### Structures

- [MPSFColorConversionOptions](https://developer.apple.com/documentation/metalperformanceshaders/mpsfcolorconversionoptions)
- [MPSFunctions_AABB](https://developer.apple.com/documentation/metalperformanceshaders/mpsfunctions_aabb)
- [MPSOrigin](https://developer.apple.com/documentation/metalperformanceshaders/mpsorigin)
- [MPSSize](https://developer.apple.com/documentation/metalperformanceshaders/mpssize)

### Variables

- [MPSCustomKernelIndexDestIndex](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexdestindex)
- [MPSCustomKernelIndexSrc0Index](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexsrc0index)
- [MPSCustomKernelIndexSrc1Index](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexsrc1index)
- [MPSCustomKernelIndexSrc2Index](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexsrc2index)
- [MPSCustomKernelIndexSrc3Index](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexsrc3index)
- [MPSCustomKernelIndexSrc4Index](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexsrc4index)
- [MPSCustomKernelIndexUserDataIndex](https://developer.apple.com/documentation/metalperformanceshaders/mpscustomkernelindexuserdataindex)
- [MPSDeviceCapsLast](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicecapslast)
- [MPSDeviceCapsNull](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicecapsnull)
- [MPSDeviceIsAppleDevice](https://developer.apple.com/documentation/metalperformanceshaders/mpsdeviceisappledevice)
- [MPSDeviceSupportsBFloat16Arithmetic](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsbfloat16arithmetic)
- [MPSDeviceSupportsFloat16BicubicFiltering](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsfloat16bicubicfiltering)
- [MPSDeviceSupportsFloat32Filtering](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsfloat32filtering)
- [MPSDeviceSupportsNorm16BicubicFiltering](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsnorm16bicubicfiltering)
- [MPSDeviceSupportsQuadShuffle](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsquadshuffle)
- [MPSDeviceSupportsReadWriteTextures](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsreadwritetextures)
- [MPSDeviceSupportsReadableArrayOfTextures](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportsreadablearrayoftextures)
- [MPSDeviceSupportsSimdReduction](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportssimdreduction)
- [MPSDeviceSupportsSimdShuffle](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportssimdshuffle)
- [MPSDeviceSupportsSimdShuffleAndFill](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportssimdshuffleandfill)
- [MPSDeviceSupportsSimdgroupBarrier](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportssimdgroupbarrier)
- [MPSDeviceSupportsWritableArrayOfTextures](https://developer.apple.com/documentation/metalperformanceshaders/mpsdevicesupportswritablearrayoftextures)
- [MPSFColorConversion_h](https://developer.apple.com/documentation/metalperformanceshaders/mpsfcolorconversion_h)
- [MPSFunctions_AABB_SDR](https://developer.apple.com/documentation/metalperformanceshaders/mpsfunctions_aabb_sdr)
- [MPSFunctions_AABB_Unbounded](https://developer.apple.com/documentation/metalperformanceshaders/mpsfunctions_aabb_unbounded)
- [MPSImageType2d](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype2d)
- [MPSImageType2d_array](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype2d_array)
- [MPSImageType2d_array_noAlpha](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype2d_array_noalpha)
- [MPSImageType2d_noAlpha](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype2d_noalpha)
- [MPSImageTypeArray2d](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetypearray2d)
- [MPSImageTypeArray2d_array](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetypearray2d_array)
- [MPSImageTypeArray2d_array_noAlpha](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetypearray2d_array_noalpha)
- [MPSImageTypeArray2d_noAlpha](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetypearray2d_noalpha)
- [MPSImageType_ArrayMask](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_arraymask)
- [MPSImageType_BatchMask](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_batchmask)
- [MPSImageType_bitCount](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_bitcount)
- [MPSImageType_mask](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_mask)
- [MPSImageType_noAlpha](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_noalpha)
- [MPSImageType_texelFormatBFloat16](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatbfloat16)
- [MPSImageType_texelFormatFloat16](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatfloat16)
- [MPSImageType_texelFormatMask](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatmask)
- [MPSImageType_texelFormatShift](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatshift)
- [MPSImageType_texelFormatStandard](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatstandard)
- [MPSImageType_texelFormatUnorm8](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_texelformatunorm8)
- [MPSImageType_typeMask](https://developer.apple.com/documentation/metalperformanceshaders/mpsimagetype_typemask)
- [MPSRectNoClip](https://developer.apple.com/documentation/metalperformanceshaders/mpsrectnoclip)

### Type Aliases

- [MPSPackedFloat3](https://developer.apple.com/documentation/metalperformanceshaders/mpspackedfloat3-swift.typealias)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
