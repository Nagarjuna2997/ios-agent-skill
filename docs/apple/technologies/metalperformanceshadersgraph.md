# Metal Performance Shaders Graph

## Context

Load this when a task names **Metal Performance Shaders Graph** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/metalperformanceshadersgraph) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build, compile, and execute compute graphs utilizing all the different compute devices on the platform, including GPU, CPU, and Neural Engine.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Metal Performance Shaders Graph`.

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

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Adding custom functions to a shader graph](https://developer.apple.com/documentation/metalperformanceshadersgraph/adding-custom-functions-to-a-shader-graph)
- [Training a neural network using MPSGraph](https://developer.apple.com/documentation/metalperformanceshadersgraph/training-a-neural-network-using-mps-graph)
- [Filtering images with MPSGraph FFT operations](https://developer.apple.com/documentation/metalperformanceshadersgraph/filtering-images-with-mpsgraph-fft-operations)

### Classes

- [MPSGraph](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraph)
- [MPSGraphCompilationDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphcompilationdescriptor)
- [MPSGraphConvolution2DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphconvolution2dopdescriptor)
- [MPSGraphConvolution3DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphconvolution3dopdescriptor)
- [MPSGraphCreateSparseOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphcreatesparseopdescriptor)
- [MPSGraphDepthwiseConvolution2DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphdepthwiseconvolution2dopdescriptor)
- [MPSGraphDepthwiseConvolution3DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphdepthwiseconvolution3dopdescriptor)
- [MPSGraphDevice](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphdevice)
- [MPSGraphExecutable](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutable)
- [MPSGraphExecutableExecutionDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutableexecutiondescriptor)
- [MPSGraphExecutableSerializationDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutableserializationdescriptor)
- [MPSGraphExecutionDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutiondescriptor)
- [MPSGraphFFTDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphfftdescriptor)
- [MPSGraphGRUDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphgrudescriptor)
- [MPSGraphImToColOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphimtocolopdescriptor)
- [MPSGraphLSTMDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphlstmdescriptor)
- [MPSGraphObject](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphobject)
- [MPSGraphOperation](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphoperation)
- [MPSGraphPooling2DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphpooling2dopdescriptor)
- [MPSGraphPooling4DOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphpooling4dopdescriptor)
- [MPSGraphRandomOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphrandomopdescriptor)
- [MPSGraphShapedType](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphshapedtype)
- [MPSGraphSingleGateRNNDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphsinglegaternndescriptor)
- [MPSGraphStencilOpDescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphstencilopdescriptor)
- [MPSGraphTensor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphtensor)
- [MPSGraphTensorData](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphtensordata)
- [MPSGraphType](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphtype)
- [MPSGraphVariableOp](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphvariableop)
- [MPSGraphSDPADescriptor](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphsdpadescriptor)

### Structures

- [MPSGraphReducedPrecisionFastMath](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphreducedprecisionfastmath)

### Type Aliases

- [MPSGraphCompilationCompletionHandler](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphcompilationcompletionhandler)
- [MPSGraphCompletionHandler](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphcompletionhandler)
- [MPSGraphControlFlowDependencyBlock](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphcontrolflowdependencyblock)
- [MPSGraphExecutableCompletionHandler](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutablecompletionhandler)
- [MPSGraphExecutableScheduledHandler](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutablescheduledhandler)
- [MPSGraphForLoopBodyBlock](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphforloopbodyblock)
- [MPSGraphIfThenElseBlock](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphifthenelseblock)
- [MPSGraphScheduledHandler](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphscheduledhandler)
- [MPSGraphWhileAfterBlock](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphwhileafterblock)
- [MPSGraphWhileBeforeBlock](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphwhilebeforeblock)

### Enumerations

- [MPSGraphDeploymentPlatform](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphdeploymentplatform)
- [MPSGraphDeviceType](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphdevicetype)
- [MPSGraphExecutionStage](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphexecutionstage)
- [MPSGraphFFTScalingMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphfftscalingmode)
- [MPSGraphLossReductionType](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphlossreductiontype)
- [MPSGraphNonMaximumSuppressionCoordinateMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphnonmaximumsuppressioncoordinatemode)
- [MPSGraphOptimization](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphoptimization)
- [MPSGraphOptimizationProfile](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphoptimizationprofile)
- [MPSGraphOptions](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphoptions)
- [MPSGraphPaddingMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphpaddingmode)
- [MPSGraphPaddingStyle](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphpaddingstyle)
- [MPSGraphPoolingReturnIndicesMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphpoolingreturnindicesmode)
- [MPSGraphRNNActivation](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphrnnactivation)
- [MPSGraphRandomDistribution](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphrandomdistribution)
- [MPSGraphRandomNormalSamplingMethod](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphrandomnormalsamplingmethod)
- [MPSGraphReductionMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphreductionmode)
- [MPSGraphResizeMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphresizemode)
- [MPSGraphResizeNearestRoundingMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphresizenearestroundingmode)
- [MPSGraphScatterMode](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphscattermode)
- [MPSGraphSparseStorageType](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphsparsestoragetype)
- [MPSGraphTensorNamedDataLayout](https://developer.apple.com/documentation/metalperformanceshadersgraph/mpsgraphtensornameddatalayout)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
