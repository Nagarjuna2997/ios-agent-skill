# Accelerate

**Load this when:** processing audio or sensor buffers, computing an FFT or a
spectrogram, resizing or converting images outside Core Image, doing linear
algebra on real matrices, or when a profile shows a hand-written numeric loop at
the top of a trace.

Covers the routing decision between Accelerate's sub-libraries, the isolation
rule that governs all of them, vDSP transforms and their packed output format,
vImage buffer ownership, and the neighbouring libraries — simd, Spatial,
Compression, Apple Archive — that Apple documents alongside it.

**Availability:** Accelerate itself is iOS 4+/macOS 10.3+, so nothing here needs
an availability guard at this skill's iOS 17 floor. The *Swift overlay* — the
`vDSP.`, `vForce.`, and `vImage.` namespaced APIs rather than the `vDSP_`
C functions — is iOS 13+/macOS 10.15+. `vImage.PixelBuffer` is iOS 16+/macOS
13+. All are below the floor; write the Swift API and stop thinking about it.

> **Verification status:** the vDSP patterns in §3–§5 are compile-checked —
> `samples/SkillPatterns/Sources/SkillPatterns/SignalProcessing.swift` builds and
> its tests run on the macOS CI job. The vImage and linear-algebra sections are
> INSPECTED prose against Apple's documented signatures, not compiled here.

---

## 1. Decide whether you need it at all

Accelerate is not a general "make it fast" library. It is a set of routines that
dispatch to the CPU's vector unit, and that only pays when the same operation is
applied to *many* elements at once.

| Situation | Reach for |
|---|---|
| Elementwise arithmetic over thousands of samples | **vDSP** |
| `sin`, `exp`, `log`, `pow` over a whole array | **vForce** |
| FFT, DCT, convolution, biquad filtering | **vDSP** |
| Resize, crop, convert pixel format, histogram, blur | **vImage** |
| Dense `Ax = b`, SVD, eigenvalues | **LAPACK / BLAS** |
| Sparse `Ax = b` | **Sparse Solvers** |
| 2–4 element vectors, matrices, quaternions | **simd** — *not* vDSP |
| 3D points, sizes, rotations, affine transforms | **Spatial** |
| Neural network inference | **Core ML**, not BNNS (see §7) |
| Compressing a `Data` blob | `NSData.compressed(using:)` |
| Compressing a directory tree | **Apple Archive** |

**The two failure modes are symmetric.** Hand-writing a loop over 100,000
samples when `vDSP.multiply` exists wastes most of the CPU. Calling
`vDSP.multiply` on a four-element array wastes more time on the call than the
loop would have taken — that is what `simd` is for. Neither is a style
preference; both are measurable, so measure before and after rather than
asserting an improvement.

The energy argument is the one that usually decides it on a phone. A vectorised
routine finishes sooner and lets the core idle, which is why Apple frames
Accelerate as low-energy rather than merely fast. That benefit is invisible in a
wall-clock benchmark on a plugged-in Mac and very visible in battery telemetry.

---

## 2. The isolation rule — the part that matters most here

Accelerate functions are synchronous C. They inherit whatever isolation calls
them, and they do not yield. **A `@MainActor` view model calling vDSP directly
blocks the main thread for the whole computation**, and the code looks entirely
correct while doing it.

This is the concrete case of the rule in `SKILL.md`: `@MainActor` does not make
CPU work safe. The fix is the same as everywhere else in this skill — put the
work behind a protocol whose requirement is `async`, and implement it off the
main actor.

```swift
public protocol SpectrumAnalyzer: Sendable {
    /// `async` is deliberate: it is the only part of the signature that
    /// prevents a caller from doing this work on the main actor by accident.
    func magnitudeSpectrum(of samples: [Float]) async -> [Float]
}
```

**Why an `actor` and not a `struct`:** the FFT setup object is expensive to
build and is not `Sendable`, so it cannot be a stored property of a `Sendable`
value type. An actor owns it, and it never leaves. That is the same shape as
owning an `NWConnection` (`docs/frameworks/network-framework.md` §3) or a
`ModelContext` (`docs/frameworks/data-concurrency.md`) — a non-`Sendable`
resource lives inside one actor and the outside world talks to it by message.

For work that owns no state, a `nonisolated` free function or a caseless-enum
static is enough, and is better: it has no isolation to inherit, so it cannot
silently become main-actor work when a view model calls it.

---

## 3. The pattern

Full source: `samples/SkillPatterns/Sources/SkillPatterns/SignalProcessing.swift`.

```swift
#if canImport(Accelerate)
import Accelerate

/// Owns the FFT setup for one fixed frame size.
public actor AccelerateSpectrumAnalyzer: SpectrumAnalyzer {
    public let frameCount: Int
    private let fft: vDSP.FFT<DSPSplitComplex>

    /// - Parameter frameCount: samples per frame; a power of two, at least 4.
    ///   Returns `nil` rather than trapping — the value usually comes from an
    ///   audio format decided at runtime, so failure is a runtime condition,
    ///   not a programmer error.
    public init?(frameCount: Int) {
        guard frameCount >= 4, frameCount.nonzeroBitCount == 1 else { return nil }
        let log2n = vDSP_Length(frameCount.trailingZeroBitCount)
        guard let fft = vDSP.FFT(log2n: log2n, radix: .radix2, ofType: DSPSplitComplex.self) else {
            return nil
        }
        self.frameCount = frameCount
        self.fft = fft
    }

    public func magnitudeSpectrum(of samples: [Float]) -> [Float] {
        let binCount = frameCount / 2
        guard samples.count >= frameCount else { return [] }

        var inputReal = [Float](repeating: 0, count: binCount)
        var inputImaginary = [Float](repeating: 0, count: binCount)
        var outputReal = [Float](repeating: 0, count: binCount)
        var outputImaginary = [Float](repeating: 0, count: binCount)
        var magnitudes = [Float](repeating: 0, count: binCount)

        inputReal.withUnsafeMutableBufferPointer { inputRealBuffer in
        inputImaginary.withUnsafeMutableBufferPointer { inputImaginaryBuffer in
        outputReal.withUnsafeMutableBufferPointer { outputRealBuffer in
        outputImaginary.withUnsafeMutableBufferPointer { outputImaginaryBuffer in
            guard
                let inputRealBase = inputRealBuffer.baseAddress,
                let inputImaginaryBase = inputImaginaryBuffer.baseAddress,
                let outputRealBase = outputRealBuffer.baseAddress,
                let outputImaginaryBase = outputImaginaryBuffer.baseAddress
            else { return }

            var input = DSPSplitComplex(realp: inputRealBase, imagp: inputImaginaryBase)
            var output = DSPSplitComplex(realp: outputRealBase, imagp: outputImaginaryBase)

            // Deinterleave the real signal into split-complex form.
            samples.withUnsafeBytes { rawSamples in
                let interleaved = rawSamples.bindMemory(to: DSPComplex.self)
                guard let base = interleaved.baseAddress else { return }
                vDSP_ctoz(base, 2, &input, 1, vDSP_Length(binCount))
            }

            // Separate input and output buffers, not `&input` twice.
            fft.forward(input: input, output: &output)
            vDSP.squareMagnitudes(output, result: &magnitudes)
        }}}}

        return magnitudes
    }
}
#endif
```

Three things in that are not decoration:

**`init?`, not `init`.** `vDSP.FFT`'s initialiser is failable and the frame size
usually arrives from an `AVAudioFormat` at runtime. Force-unwrapping it turns a
recoverable "this device gave us an odd buffer size" into a crash.

**`#if canImport(Accelerate)`.** Accelerate is a Darwin framework. Guarding it
keeps a shared package compiling on Linux — which is why this file is in the
sample package at all rather than being prose.

**Separate input and output split-complex values.** `fft.forward(input: x,
output: &x)` is an exclusivity violation — the same value borrowed and mutated
in one call — and the compiler rejects it.

---

## 4. The packed output format, and why the first bin lies

`vDSP_ctoz` deinterleaves an *N*-element real signal into an *N/2*-element
split-complex value: even samples into `realp`, odd into `imagp`. A real-to-complex
forward transform then produces *N/2* bins in the same layout.

Two consequences that produce wrong-looking spectra:

- **Bin 0 is not purely DC.** The transform packs the Nyquist term into the
  imaginary part of element 0, because the DC and Nyquist components of a real
  signal are both purely real and there is a spare slot. Squaring the magnitude
  of bin 0 therefore mixes the two. If you display bin 0, say so, or drop it.
- **The output is scaled.** vDSP's real forward transform carries a factor of
  two relative to the textbook definition. It does not move any peak, so it
  never matters for "which frequency is loudest" — and it matters completely for
  any absolute magnitude you put a unit on. Scale by `1 / (2 * frameCount)`
  before claiming a dB value.

**Test transforms against a known answer, not a snapshot.** A signal with
exactly eight periods across the frame must peak in bin eight; a constant signal
must peak in bin zero. That is checkable arithmetic:

```swift
func testPureTonePeaksInItsOwnBin() async throws {
    let analyzer = try XCTUnwrap(AccelerateSpectrumAnalyzer(frameCount: 1024))
    let signal = SignalMath.sineWave(cycles: 8, count: 1024)

    let spectrum = await analyzer.magnitudeSpectrum(of: signal)

    XCTAssertEqual(spectrum.count, 512)
    XCTAssertEqual(SignalMath.indexOfMaximum(spectrum), 8)
}
```

A snapshot test over the same data fails when the numbers change; this one fails
when the transform is *wrong*. It is the check that catches the most common
error in this whole area — handing vDSP the raw `[Float]` without `vDSP_ctoz`,
which yields a spectrum that looks like a spectrum and peaks in the wrong place.

**Window before transforming any signal that is not an integer number of
periods**, which in practice is every real signal. Without a window the
discontinuity at the frame boundary smears energy across every bin — spectral
leakage — and a real tone reads as broadband noise. `vDSP.window(ofType:)`
produces the sequence; multiply it in with `vDSP.multiply` before the transform.

---

## 5. Vectorised arithmetic

The Swift overlay takes and returns `Array`, which is the right default: it is
readable, and the allocation is irrelevant next to the work when *N* is large
enough to be worth vectorising in the first place.

```swift
public enum SignalMath {
    /// A sine wave of `cycles` complete periods across `count` samples.
    public static func sineWave(cycles: Float, count: Int) -> [Float] {
        guard count > 0 else { return [] }
        let increment = 2 * Float.pi * cycles / Float(count)
        let phases = vDSP.ramp(withInitialValue: Float(0), increment: increment, count: count)
        return vForce.sin(phases)
    }

    /// Scales to unit RMS, leaving an all-zero signal alone.
    public static func normalizedByRMS(_ samples: [Float]) -> [Float] {
        guard !samples.isEmpty else { return [] }
        let rms = vDSP.rootMeanSquare(samples)
        // Silence is a normal microphone input. Dividing by its RMS produces
        // NaNs that propagate through every later stage and surface as a blank
        // chart with no error anywhere.
        guard rms > 0 else { return samples }
        return vDSP.multiply(1 / rms, samples)
    }
}
```

For a per-frame hot path where the allocation *does* show up in a trace, the
overlay has `result:` variants that write into an existing buffer
(`vDSP.multiply(_:_:result:)`), so the destination can be allocated once and
reused. Reach for those on evidence from Instruments, not on principle — the
`[Float]`-returning form is clearer, and clearer wins until measured otherwise.

**Length mismatches trap.** The overlay preconditions that operands and results
have equal counts; a mismatch is a runtime crash, not a truncated result. Derive
counts from one source rather than passing two independently-computed lengths.

---

## 6. vImage: the buffer is yours to free

*INSPECTED — not compile-checked in this repository.*

vImage has two layers, and the choice between them is entirely about ownership.

**Prefer `vImage.PixelBuffer`** (iOS 16+, and so always available at this
skill's floor). It is a generic Swift type parameterised on the pixel format —
`vImage.PixelBuffer<vImage.Interleaved8x4>`, `<vImage.PlanarF>` — and it manages
its own storage. Formats are checked by the type system rather than by passing
`bitsPerPixel` as an integer and hoping.

**The C layer, `vImage_Buffer`, is manual.** A buffer initialised with
`vImageBuffer_Init` or `vImageBuffer_InitWithCGImage` owns heap memory that
nothing will ever release for you:

```swift
var buffer = vImage_Buffer()
let error = vImageBuffer_Init(&buffer, height, width, 32, vImage_Flags(kvImageNoFlags))
guard error == kvImageNoError else { throw ImageError.allocationFailed(error) }
defer { free(buffer.data) }
```

`defer { free(buffer.data) }` on the line after the guard, every time. In a
video pipeline this is the difference between a working effect and a jetsam
kill after thirty seconds — and it will look like "the OS killed us for no
reason", because there is no leak warning for `malloc`ed memory the app still
holds a pointer to.

**Every vImage function returns `vImage_Error`, and ignoring it is the bug.**
`kvImageNoError` is 0; anything else means the output buffer holds whatever it
held before. Discarding the result produces an image that is silently stale
rather than an error you can act on.

**Interop, in the direction you actually need it:** Core Graphics for loading
and display (`vImageBuffer_InitWithCGImage`, `vImageCreateCGImageFromBuffer`),
Core Video for camera and video frames. If the work is a single filter on an
image already on screen, **Core Image is usually the better tool** — it composes
filters, runs on the GPU, and does not make you own memory. vImage wins when the
operation is not a filter (format conversion, histogram, precise resampling),
when the data is already in a `CVPixelBuffer` from the camera, or when the
result must be deterministic across devices.

---

## 7. Neighbouring libraries, briefly

**simd** — 2-to-4 element vectors, matrices, and quaternions, as value types
with operators. This is the right tool for geometry, and the wrong tool for
signal buffers. `simd_quatf` plus `simd_slerp` is how you interpolate rotations
without gimbal lock; see `docs/frameworks/realitykit.md`.

**Spatial** — `Point3D`, `Size3D`, `Rotation3D`, `AffineTransform3D`. Prefer it
over raw `simd` in visionOS code: the types carry meaning, so a size cannot be
passed where a point is expected. `docs/platforms/visionos.md`.

**BNNS** — subroutines for building and running neural networks directly. **Do
not start here.** Core ML compiles a model once and dispatches it across CPU,
GPU, and the Neural Engine; BNNS is CPU-only, so hand-building a network with it
gives up the Neural Engine entirely. Reach for `docs/frameworks/ml/coreml.md`,
and for BNNS only when you have a specific reason Core ML cannot serve — a model
whose weights change at runtime, or training on device.

**Compression** — for a `Data` blob in memory, `(data as NSData)
.compressed(using: .lzfse)` is one line and enough. LZFSE is Apple's default
tradeoff, LZ4 when speed dominates, ZLIB when another system has to read it.

**Apple Archive** — for a directory tree, where you need the archive to preserve
structure and the compression to be multithreaded. Do not build that out of
`Compression` primitives by hand.

**LAPACK / BLAS** — dense linear algebra. The one thing to internalise before
calling them: they are **column-major** Fortran routines. A row-major Swift
`[Double]` fed to `dgesv_` solves the transposed system and returns a plausible,
wrong answer. Transpose on the way in, or lay the matrix out column-major from
the start and say so in a comment.

---

## Anti-Patterns

```swift
// WRONG — vDSP called from a @MainActor view model.
// Accelerate is synchronous C: it inherits the caller's isolation and never
// yields. A 4096-point FFT per frame blocks the main thread for the whole
// computation, and nothing in this code looks incorrect.
@MainActor @Observable final class SpectrumModel {
    func update(_ samples: [Float]) {
        bins = vDSP.squareMagnitudes(...)   // main thread, every frame
    }
}

// RIGHT — an async requirement, implemented off the main actor.
let bins = await analyzer.magnitudeSpectrum(of: samples)
```

```swift
// WRONG — the FFT setup rebuilt on every call.
// vDSP.FFT precomputes twiddle factors; constructing one costs orders of
// magnitude more than running it. In a 60 Hz render loop this is the hitch.
func spectrum(of samples: [Float]) -> [Float] {
    let fft = vDSP.FFT(log2n: 10, radix: .radix2, ofType: DSPSplitComplex.self)!
    ...
}

// RIGHT — built once, owned by the actor that uses it.
private let fft: vDSP.FFT<DSPSplitComplex>
```

```swift
// WRONG — a failable setup force-unwrapped.
// The frame size comes from AVAudioFormat at runtime, so nil is a device
// condition, not a programmer error. This crashes on the one device that
// hands you a non-power-of-two buffer.
let fft = vDSP.FFT(log2n: log2n, radix: .radix2, ofType: DSPSplitComplex.self)!

// RIGHT — propagate the failure.
guard let fft = vDSP.FFT(log2n: log2n, radix: .radix2, ofType: DSPSplitComplex.self) else {
    return nil
}
```

```swift
// WRONG — the raw real signal handed to a real-to-complex transform.
// vDSP expects split-complex input. Skipping vDSP_ctoz produces a spectrum
// that looks like a spectrum, is the wrong length, and peaks in the wrong bin
// — so it passes a smoke test and fails a known-answer test.
fft.forward(input: DSPSplitComplex(realp: p, imagp: p), output: &output)

// RIGHT — deinterleave first.
vDSP_ctoz(interleavedBase, 2, &input, 1, vDSP_Length(binCount))
fft.forward(input: input, output: &output)
```

```swift
// WRONG — a pointer escaping the closure that made it valid.
// The pointer is only guaranteed for the duration of the call. Storing it is
// undefined behaviour that usually appears to work in debug and corrupts
// memory under optimisation.
var stored: UnsafeMutablePointer<Float>?
buffer.withUnsafeMutableBufferPointer { stored = $0.baseAddress }

// RIGHT — do the work inside, or allocate memory you own for real.
buffer.withUnsafeMutableBufferPointer { pointer in transform(pointer) }
```

```swift
// WRONG — a vImage buffer that nothing frees.
// vImageBuffer_Init malloc'd it. Per video frame this is a jetsam kill that
// looks like the OS killing the app for no reason.
var buffer = vImage_Buffer()
vImageBuffer_Init(&buffer, h, w, 32, vImage_Flags(kvImageNoFlags))

// RIGHT — defer the free on the next line, or use vImage.PixelBuffer.
guard error == kvImageNoError else { throw ImageError.allocationFailed(error) }
defer { free(buffer.data) }
```

```swift
// WRONG — vImage_Error discarded.
// On failure the destination still holds its previous contents, so the app
// renders a stale frame instead of reporting a problem.
vImageScale_ARGB8888(&source, &destination, nil, vImage_Flags(kvImageHighQualityResampling))

// RIGHT — check it; kvImageNoError is 0.
let error = vImageScale_ARGB8888(&source, &destination, nil, flags)
guard error == kvImageNoError else { throw ImageError.scaleFailed(error) }
```

```swift
// WRONG — Accelerate on a four-element vector.
// The call overhead exceeds the work. This is slower than the loop it replaced
// and much slower than the type built for it.
let sum = vDSP.add([x1, y1, z1], [x2, y2, z2])

// RIGHT — simd for small fixed-size vectors, vDSP for buffers.
let sum = SIMD3<Float>(x1, y1, z1) + SIMD3<Float>(x2, y2, z2)
```

---

## Checklist

- [ ] The operation is over enough elements to be worth vectorising — measured, not assumed
- [ ] Small fixed-size vectors use `simd`, not vDSP
- [ ] No Accelerate call runs on the main actor; the seam is an `async` protocol requirement
- [ ] Expensive setup (`vDSP.FFT`, `vDSP.DCT`, `vDSP.Biquad`) built once and owned by an actor
- [ ] Every failable setup initialiser handled with `guard let`, never `!`
- [ ] Real signals deinterleaved with `vDSP_ctoz` before a real-to-complex transform
- [ ] Bin 0 documented as DC+Nyquist, or excluded from anything displayed
- [ ] Absolute magnitudes scaled for vDSP's factor of two before being given a unit
- [ ] A window applied before transforming any non-integer-period signal
- [ ] Zero-signal inputs guarded so normalisation cannot emit NaNs
- [ ] Operand and result counts derived from one source — a mismatch traps
- [ ] Transforms tested against a known answer, not a recorded snapshot
- [ ] No pointer from `withUnsafe*` stored beyond the closure
- [ ] Every `vImage_Buffer` from `vImageBuffer_Init*` paired with `free(buffer.data)`
- [ ] Every `vImage_Error` checked against `kvImageNoError`
- [ ] Core Image ruled out for a stated reason before hand-rolling a vImage filter
- [ ] Core ML ruled out for a stated reason before building a network with BNNS
- [ ] Matrices handed to LAPACK/BLAS are column-major
- [ ] Darwin-only code behind `#if canImport(Accelerate)` if the package is cross-platform
