# Spatial

## Context

Load this when a task names **Spatial** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/spatial) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create and manipulate 3D mathematical primitives.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Spatial`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Data structures

- [Vector3D](https://developer.apple.com/documentation/spatial/vector3d)
- [Vector3DFloat](https://developer.apple.com/documentation/spatial/vector3dfloat)
- [Axis3D](https://developer.apple.com/documentation/spatial/axis3d)

### 2D primitives

- [Angle2D](https://developer.apple.com/documentation/spatial/angle2d)
- [Angle2DFloat](https://developer.apple.com/documentation/spatial/angle2dfloat)

### 3D primitives

- [Point3D](https://developer.apple.com/documentation/spatial/point3d)
- [Point3DFloat](https://developer.apple.com/documentation/spatial/point3dfloat)
- [Size3D](https://developer.apple.com/documentation/spatial/size3d)
- [Size3DFloat](https://developer.apple.com/documentation/spatial/size3dfloat)
- [Rect3D](https://developer.apple.com/documentation/spatial/rect3d)
- [Rect3DFloat](https://developer.apple.com/documentation/spatial/rect3dfloat)
- [Rotation3D](https://developer.apple.com/documentation/spatial/rotation3d)
- [Rotation3DFloat](https://developer.apple.com/documentation/spatial/rotation3dfloat)
- [RotationAxis3D](https://developer.apple.com/documentation/spatial/rotationaxis3d)
- [RotationAxis3DFloat](https://developer.apple.com/documentation/spatial/rotationaxis3dfloat)
- [Pose3D](https://developer.apple.com/documentation/spatial/pose3d)
- [Pose3DFloat](https://developer.apple.com/documentation/spatial/pose3dfloat)
- [ScaledPose3D](https://developer.apple.com/documentation/spatial/scaledpose3d)
- [ScaledPose3DFloat](https://developer.apple.com/documentation/spatial/scaledpose3dfloat)
- [SphericalCoordinates3D](https://developer.apple.com/documentation/spatial/sphericalcoordinates3d)
- [SphericalCoordinates3DFloat](https://developer.apple.com/documentation/spatial/sphericalcoordinates3dfloat)
- [Ray3D](https://developer.apple.com/documentation/spatial/ray3d)
- [Ray3DFloat](https://developer.apple.com/documentation/spatial/ray3dfloat)

### Affine and projective transforms

- [AffineTransform3D](https://developer.apple.com/documentation/spatial/affinetransform3d)
- [AffineTransform3DFloat](https://developer.apple.com/documentation/spatial/affinetransform3dfloat)
- [ProjectiveTransform3D](https://developer.apple.com/documentation/spatial/projectivetransform3d)
- [ProjectiveTransform3DFloat](https://developer.apple.com/documentation/spatial/projectivetransform3dfloat)

### Converting between coordinate spaces

- [CoordinateSpace3D](https://developer.apple.com/documentation/spatial/coordinatespace3d)
- [CoordinateSpace3DFloat](https://developer.apple.com/documentation/spatial/coordinatespace3dfloat)
- [CoordinateSpaceValue3D](https://developer.apple.com/documentation/spatial/coordinatespacevalue3d)
- [ProjectiveTransformable3D](https://developer.apple.com/documentation/spatial/projectivetransformable3d)
- [ProjectiveTransformable3DFloat](https://developer.apple.com/documentation/spatial/projectivetransformable3dfloat)
- [WorldReferenceCoordinateSpace](https://developer.apple.com/documentation/spatial/worldreferencecoordinatespace)

### Applying trigonometric functions

- [cos(_:)](https://developer.apple.com/documentation/spatial/cos(_:)-609v4)
- [cos(_:)](https://developer.apple.com/documentation/spatial/cos(_:)-79fxe)
- [cosh(_:)](https://developer.apple.com/documentation/spatial/cosh(_:)-6cg6v)
- [cosh(_:)](https://developer.apple.com/documentation/spatial/cosh(_:)-9mmhn)
- [sin(_:)](https://developer.apple.com/documentation/spatial/sin(_:)-46su7)
- [sin(_:)](https://developer.apple.com/documentation/spatial/sin(_:)-5tddt)
- [sinh(_:)](https://developer.apple.com/documentation/spatial/sinh(_:)-4m7ds)
- [sinh(_:)](https://developer.apple.com/documentation/spatial/sinh(_:)-8kigy)
- [tan(_:)](https://developer.apple.com/documentation/spatial/tan(_:)-1sjgu)
- [tan(_:)](https://developer.apple.com/documentation/spatial/tan(_:)-9x99s)
- [tanh(_:)](https://developer.apple.com/documentation/spatial/tanh(_:)-1f341)
- [tanh(_:)](https://developer.apple.com/documentation/spatial/tanh(_:)-5yozs)

### Protocols

- [Primitive3D](https://developer.apple.com/documentation/spatial/primitive3d)
- [Rotatable3D](https://developer.apple.com/documentation/spatial/rotatable3d)
- [Scalable3D](https://developer.apple.com/documentation/spatial/scalable3d)
- [Shearable3D](https://developer.apple.com/documentation/spatial/shearable3d)
- [Translatable3D](https://developer.apple.com/documentation/spatial/translatable3d)
- [Volumetric](https://developer.apple.com/documentation/spatial/volumetric)
- [ClampableWithinRectProtocol](https://developer.apple.com/documentation/spatial/clampablewithinrectprotocol)
- [Primitive3DProtocol](https://developer.apple.com/documentation/spatial/primitive3dprotocol)
- [Rotatable3DProtocol](https://developer.apple.com/documentation/spatial/rotatable3dprotocol)
- [Scalable3DProtocol](https://developer.apple.com/documentation/spatial/scalable3dprotocol)
- [Shearable3DProtocol](https://developer.apple.com/documentation/spatial/shearable3dprotocol)
- [SpatialTypeProtocol](https://developer.apple.com/documentation/spatial/spatialtypeprotocol)
- [Transform3DProtocol](https://developer.apple.com/documentation/spatial/transform3dprotocol)
- [Translatable3DProtocol](https://developer.apple.com/documentation/spatial/translatable3dprotocol)
- [VolumetricProtocol](https://developer.apple.com/documentation/spatial/volumetricprotocol)

### Macros

- [Macros & Global Variables](https://developer.apple.com/documentation/spatial/spatial-macros)

### Structures

- [EulerAnglesFloat](https://developer.apple.com/documentation/spatial/euleranglesfloat)

### Enumerations

- [AxisWithFactorsFloat](https://developer.apple.com/documentation/spatial/axiswithfactorsfloat)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
