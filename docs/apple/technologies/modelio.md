# Model I/O

## Context

Load this when a task names **Model I/O** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/modelio) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Import, export, and manipulate 3D models using a common infrastructure that integrates MetalKit, GLKit, and SceneKit.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Model I/O`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.11 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### 3D Asset Basics

- [MDLAsset](https://developer.apple.com/documentation/modelio/mdlasset)
- [MDLObject](https://developer.apple.com/documentation/modelio/mdlobject)
- [MDLTransform](https://developer.apple.com/documentation/modelio/mdltransform)
- [MDLMesh](https://developer.apple.com/documentation/modelio/mdlmesh)
- [MDLSubmesh](https://developer.apple.com/documentation/modelio/mdlsubmesh)
- [MDLSubmeshTopology](https://developer.apple.com/documentation/modelio/mdlsubmeshtopology)
- [MDLNamed](https://developer.apple.com/documentation/modelio/mdlnamed)

### Managing Mesh Data

- [MDLMeshBuffer](https://developer.apple.com/documentation/modelio/mdlmeshbuffer)
- [MDLMeshBufferAllocator](https://developer.apple.com/documentation/modelio/mdlmeshbufferallocator)
- [MDLMeshBufferData](https://developer.apple.com/documentation/modelio/mdlmeshbufferdata)
- [MDLMeshBufferDataAllocator](https://developer.apple.com/documentation/modelio/mdlmeshbufferdataallocator)
- [MDLMeshBufferMap](https://developer.apple.com/documentation/modelio/mdlmeshbuffermap)
- [MDLMeshBufferZone](https://developer.apple.com/documentation/modelio/mdlmeshbufferzone)
- [MDLMeshBufferZoneDefault](https://developer.apple.com/documentation/modelio/mdlmeshbufferzonedefault)
- [MDLVertexAttribute](https://developer.apple.com/documentation/modelio/mdlvertexattribute)
- [MDLVertexAttributeData](https://developer.apple.com/documentation/modelio/mdlvertexattributedata)
- [MDLVertexBufferLayout](https://developer.apple.com/documentation/modelio/mdlvertexbufferlayout)
- [MDLVertexDescriptor](https://developer.apple.com/documentation/modelio/mdlvertexdescriptor)

### Materials

- [MDLMaterial](https://developer.apple.com/documentation/modelio/mdlmaterial)
- [MDLMaterialProperty](https://developer.apple.com/documentation/modelio/mdlmaterialproperty)
- [MDLMaterialPropertyConnection](https://developer.apple.com/documentation/modelio/mdlmaterialpropertyconnection)
- [MDLMaterialPropertyGraph](https://developer.apple.com/documentation/modelio/mdlmaterialpropertygraph)
- [MDLMaterialPropertyNode](https://developer.apple.com/documentation/modelio/mdlmaterialpropertynode)
- [MDLScatteringFunction](https://developer.apple.com/documentation/modelio/mdlscatteringfunction)
- [MDLPhysicallyPlausibleScatteringFunction](https://developer.apple.com/documentation/modelio/mdlphysicallyplausiblescatteringfunction)

### Textures

- [MDLTexture](https://developer.apple.com/documentation/modelio/mdltexture)
- [MDLCheckerboardTexture](https://developer.apple.com/documentation/modelio/mdlcheckerboardtexture)
- [MDLColorSwatchTexture](https://developer.apple.com/documentation/modelio/mdlcolorswatchtexture)
- [MDLNoiseTexture](https://developer.apple.com/documentation/modelio/mdlnoisetexture)
- [MDLNormalMapTexture](https://developer.apple.com/documentation/modelio/mdlnormalmaptexture)
- [MDLSkyCubeTexture](https://developer.apple.com/documentation/modelio/mdlskycubetexture)
- [MDLURLTexture](https://developer.apple.com/documentation/modelio/mdlurltexture)
- [MDLTextureFilter](https://developer.apple.com/documentation/modelio/mdltexturefilter)
- [MDLTextureSampler](https://developer.apple.com/documentation/modelio/mdltexturesampler)

### Lights

- [MDLLight](https://developer.apple.com/documentation/modelio/mdllight)
- [MDLAreaLight](https://developer.apple.com/documentation/modelio/mdlarealight)
- [MDLLightProbe](https://developer.apple.com/documentation/modelio/mdllightprobe)
- [MDLLightProbeIrradianceDataSource](https://developer.apple.com/documentation/modelio/mdllightprobeirradiancedatasource)
- [MDLPhotometricLight](https://developer.apple.com/documentation/modelio/mdlphotometriclight)
- [MDLPhysicallyPlausibleLight](https://developer.apple.com/documentation/modelio/mdlphysicallyplausiblelight)

### Cameras

- [MDLCamera](https://developer.apple.com/documentation/modelio/mdlcamera)
- [MDLStereoscopicCamera](https://developer.apple.com/documentation/modelio/mdlstereoscopiccamera)

### Extensible Asset Format Support

- [MDLComponent](https://developer.apple.com/documentation/modelio/mdlcomponent)
- [MDLObjectContainer](https://developer.apple.com/documentation/modelio/mdlobjectcontainer)
- [MDLObjectContainerComponent](https://developer.apple.com/documentation/modelio/mdlobjectcontainercomponent)
- [MDLTransformComponent](https://developer.apple.com/documentation/modelio/mdltransformcomponent)

### Volumetric Representations

- [MDLVoxelArray](https://developer.apple.com/documentation/modelio/mdlvoxelarray)

### Reference

- [Model I/O Data Types](https://developer.apple.com/documentation/modelio/model-i-o-data-types)
- [Model I/O Structures](https://developer.apple.com/documentation/modelio/model-i-o-structures)
- [Model I/O Enumerations](https://developer.apple.com/documentation/modelio/model-i-o-enumerations)
- [Model I/O Constants](https://developer.apple.com/documentation/modelio/model-i-o-constants)

### Classes

- [MDLAnimatedMatrix4x4](https://developer.apple.com/documentation/modelio/mdlanimatedmatrix4x4)
- [MDLAnimatedQuaternion](https://developer.apple.com/documentation/modelio/mdlanimatedquaternion)
- [MDLAnimatedQuaternionArray](https://developer.apple.com/documentation/modelio/mdlanimatedquaternionarray)
- [MDLAnimatedScalar](https://developer.apple.com/documentation/modelio/mdlanimatedscalar)
- [MDLAnimatedScalarArray](https://developer.apple.com/documentation/modelio/mdlanimatedscalararray)
- [MDLAnimatedValue](https://developer.apple.com/documentation/modelio/mdlanimatedvalue)
- [MDLAnimatedVector2](https://developer.apple.com/documentation/modelio/mdlanimatedvector2)
- [MDLAnimatedVector3](https://developer.apple.com/documentation/modelio/mdlanimatedvector3)
- [MDLAnimatedVector3Array](https://developer.apple.com/documentation/modelio/mdlanimatedvector3array)
- [MDLAnimatedVector4](https://developer.apple.com/documentation/modelio/mdlanimatedvector4)
- [MDLAnimationBindComponent](https://developer.apple.com/documentation/modelio/mdlanimationbindcomponent)
- [MDLBundleAssetResolver](https://developer.apple.com/documentation/modelio/mdlbundleassetresolver)
- [MDLMatrix4x4Array](https://developer.apple.com/documentation/modelio/mdlmatrix4x4array)
- [MDLPackedJointAnimation](https://developer.apple.com/documentation/modelio/mdlpackedjointanimation)
- [MDLPathAssetResolver](https://developer.apple.com/documentation/modelio/mdlpathassetresolver)
- [MDLRelativeAssetResolver](https://developer.apple.com/documentation/modelio/mdlrelativeassetresolver)
- [MDLSkeleton](https://developer.apple.com/documentation/modelio/mdlskeleton)
- [MDLTransformMatrixOp](https://developer.apple.com/documentation/modelio/mdltransformmatrixop)
- [MDLTransformOrientOp](https://developer.apple.com/documentation/modelio/mdltransformorientop)
- [MDLTransformRotateOp](https://developer.apple.com/documentation/modelio/mdltransformrotateop)
- [MDLTransformRotateXOp](https://developer.apple.com/documentation/modelio/mdltransformrotatexop)
- [MDLTransformRotateYOp](https://developer.apple.com/documentation/modelio/mdltransformrotateyop)
- [MDLTransformRotateZOp](https://developer.apple.com/documentation/modelio/mdltransformrotatezop)
- [MDLTransformScaleOp](https://developer.apple.com/documentation/modelio/mdltransformscaleop)
- [MDLTransformStack](https://developer.apple.com/documentation/modelio/mdltransformstack)
- [MDLTransformTranslateOp](https://developer.apple.com/documentation/modelio/mdltransformtranslateop)
- [MDLUtility](https://developer.apple.com/documentation/modelio/mdlutility)

### Protocols

- [MDLAssetResolver](https://developer.apple.com/documentation/modelio/mdlassetresolver)
- [MDLJointAnimation](https://developer.apple.com/documentation/modelio/mdljointanimation)
- [MDLTransformOp](https://developer.apple.com/documentation/modelio/mdltransformop)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
