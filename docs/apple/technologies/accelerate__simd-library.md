# simd

## Context

Load this when a task names **simd** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/accelerate/simd-library) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Perform computations on small vectors and matrices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accelerate`.

Documentation language identifiers: occ, swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Boolean Scalar Data Type

- [simd_bool](https://developer.apple.com/documentation/simd/simd_bool)

### Signed Integer Vectors

- [8-Bit Signed Integer Vectors](https://developer.apple.com/documentation/accelerate/8-bit-signed-integer-vectors)
- [16-Bit Signed Integer Vectors](https://developer.apple.com/documentation/accelerate/16-bit-signed-integer-vectors)
- [32-Bit Signed Integer Vectors](https://developer.apple.com/documentation/accelerate/32-bit-signed-integer-vectors)
- [64-Bit Signed Integer Vectors](https://developer.apple.com/documentation/accelerate/64-bit-signed-integer-vectors)

### Unsigned Integer Vectors

- [8-Bit Unsigned Integer Vectors](https://developer.apple.com/documentation/accelerate/8-bit-unsigned-integer-vectors)
- [16-Bit Unsigned Integer Vectors](https://developer.apple.com/documentation/accelerate/16-bit-unsigned-integer-vectors)
- [32-Bit Unsigned Integer Vectors](https://developer.apple.com/documentation/accelerate/32-bit-unsigned-integer-vectors)
- [64-Bit Unsigned Integer Vectors](https://developer.apple.com/documentation/accelerate/64-bit-unsigned-integer-vectors)

### Floating-Point Vectors

- [Working with Vectors](https://developer.apple.com/documentation/accelerate/working-with-vectors)
- [Half-precision floating-point vectors](https://developer.apple.com/documentation/accelerate/half-precision-floating-point-vectors)
- [Single-precision floating-point vectors](https://developer.apple.com/documentation/accelerate/single-precision-floating-point-vectors)
- [Double-precision floating-point vectors](https://developer.apple.com/documentation/accelerate/double-precision-floating-point-vectors)

### Matrices

- [Working with Matrices](https://developer.apple.com/documentation/accelerate/working-with-matrices)
- [Half-precision floating-point matrices](https://developer.apple.com/documentation/accelerate/half-precision-floating-point-matrices)
- [Single-precision floating-point matrices](https://developer.apple.com/documentation/accelerate/single-precision-floating-point-matrices)
- [Double-precision floating-point matrices](https://developer.apple.com/documentation/accelerate/double-precision-floating-point-matrices)

### Quaternions

- [Working with Quaternions](https://developer.apple.com/documentation/accelerate/working-with-quaternions)
- [Rotating a cube by transforming its vertices](https://developer.apple.com/documentation/accelerate/rotating-a-cube-by-transforming-its-vertices)
- [simd_quatf](https://developer.apple.com/documentation/simd/simd_quatf)
- [simd_quatd](https://developer.apple.com/documentation/simd/simd_quatd)

### Constants

- [SIMD_COMPILER_HAS_REQUIRED_FEATURES](https://developer.apple.com/documentation/simd/simd_compiler_has_required_features)
- [SIMD_LIBRARY_VERSION](https://developer.apple.com/documentation/simd/simd_library_version)

### Macros

- [simd Macros](https://developer.apple.com/documentation/accelerate/simd-macros)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
