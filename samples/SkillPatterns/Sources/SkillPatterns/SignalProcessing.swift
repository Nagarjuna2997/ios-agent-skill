#if canImport(Accelerate)
import Accelerate
import Foundation

// MARK: - Heavy CPU work behind a boundary
//
// Accelerate is the clearest case in this package of the rule that `@MainActor`
// does not make CPU work safe. A 4096-point FFT is a few hundred microseconds;
// run it per frame from a view body and the main actor misses its frame budget
// while every vDSP call is technically "correct".
//
// So the presentation layer depends on `SpectrumAnalyzer`, never on vDSP:
//
//   - the requirement is `async`, so no caller can accidentally run it inline
//     on the main actor;
//   - the Accelerate implementation is an `actor`, because the FFT setup object
//     is expensive to build and is not `Sendable`;
//   - a synchronous stub witnesses the same requirement, so a preview or a test
//     needs no audio, no device, and no Accelerate at all.

public protocol SpectrumAnalyzer: Sendable {
    /// Magnitude (squared) per frequency bin, low to high.
    ///
    /// `async` is deliberate: it is the only part of the signature that
    /// prevents a caller from doing this work on the main actor by accident.
    func magnitudeSpectrum(of samples: [Float]) async -> [Float]
}

// MARK: - The Accelerate implementation

/// Owns the FFT setup for one fixed frame size.
///
/// An actor rather than a struct for a specific reason: `vDSP.FFT` is costly to
/// construct and is not `Sendable`, so it cannot be a stored property of a
/// `Sendable` value type. The same shape as owning an `NWConnection` — the
/// non-`Sendable` resource lives inside the actor and never leaves it.
public actor AccelerateSpectrumAnalyzer: SpectrumAnalyzer {
    /// Number of input samples per call. Always a power of two.
    public let frameCount: Int

    private let fft: vDSP.FFT<DSPSplitComplex>

    /// - Parameter frameCount: samples per analysis frame; must be a power of
    ///   two of at least 4. Returns `nil` rather than trapping, because the
    ///   value usually comes from an audio format decided at runtime.
    public init?(frameCount: Int) {
        guard frameCount >= 4, frameCount.nonzeroBitCount == 1 else { return nil }
        let log2n = vDSP_Length(frameCount.trailingZeroBitCount)
        guard let fft = vDSP.FFT(log2n: log2n, radix: .radix2, ofType: DSPSplitComplex.self) else {
            return nil
        }
        self.frameCount = frameCount
        self.fft = fft
    }

    /// Returns `frameCount / 2` bins.
    ///
    /// Bin 0 is not purely DC: the real-to-complex transform packs the Nyquist
    /// term into the imaginary part of element 0, so bin 0 carries both. That
    /// is a property of the packed format, not a bug — see
    /// `docs/frameworks/accelerate.md` §4.
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
                        else {
                            return
                        }

                        var input = DSPSplitComplex(realp: inputRealBase, imagp: inputImaginaryBase)
                        var output = DSPSplitComplex(realp: outputRealBase, imagp: outputImaginaryBase)

                        // Deinterleave the real signal into the split-complex
                        // form every vDSP transform expects. Skipping this and
                        // handing vDSP the raw [Float] is the single most
                        // common way to get a spectrum that looks plausible and
                        // is wrong.
                        samples.withUnsafeBytes { rawSamples in
                            let interleaved = rawSamples.bindMemory(to: DSPComplex.self)
                            guard let interleavedBase = interleaved.baseAddress else { return }
                            vDSP_ctoz(interleavedBase, 2, &input, 1, vDSP_Length(binCount))
                        }

                        // Separate input and output buffers, not `&input`
                        // twice: passing the same value as both a borrow and an
                        // inout argument is an exclusivity violation.
                        fft.forward(input: input, output: &output)

                        vDSP.squareMagnitudes(output, result: &magnitudes)
                    }
                }
            }
        }

        return magnitudes
    }
}

// MARK: - Test double

/// Returns a fixed spectrum. Enough for a preview or a view-model test, which
/// care that a spectrum arrived and not what is in it.
public struct ConstantSpectrumAnalyzer: SpectrumAnalyzer {
    public let spectrum: [Float]

    public init(spectrum: [Float]) {
        self.spectrum = spectrum
    }

    /// A synchronous function legally witnesses an `async` requirement — the
    /// stub costs nothing, so there is nothing to suspend for.
    public func magnitudeSpectrum(of samples: [Float]) -> [Float] {
        spectrum
    }
}

// MARK: - Vectorised helpers
//
// Small, pure, and `nonisolated` by construction: free functions on a caseless
// enum have no isolation to inherit, so they cannot silently become main-actor
// work when called from a view model.

public enum SignalMath {
    /// A sine wave of `cycles` complete periods across `count` samples.
    ///
    /// `vDSP.ramp` then `vForce.sin` rather than a `for` loop and `sin()`:
    /// vForce evaluates transcendentals across the vector unit, and the whole
    /// point of Accelerate is that this is both faster and cheaper in energy
    /// than the scalar version the compiler would otherwise emit.
    public static func sineWave(cycles: Float, count: Int) -> [Float] {
        guard count > 0 else { return [] }
        let increment = 2 * Float.pi * cycles / Float(count)
        let phases = vDSP.ramp(withInitialValue: Float(0), increment: increment, count: count)
        return vForce.sin(phases)
    }

    /// Scales the signal to unit RMS, leaving an all-zero signal alone.
    ///
    /// The guard is not defensive noise: silence is a normal input from a
    /// microphone, and dividing by its RMS produces NaNs that propagate
    /// through every later stage and surface as a blank chart.
    public static func normalizedByRMS(_ samples: [Float]) -> [Float] {
        guard !samples.isEmpty else { return [] }
        let rms = vDSP.rootMeanSquare(samples)
        guard rms > 0 else { return samples }
        return vDSP.multiply(1 / rms, samples)
    }

    /// Index of the largest element, or `nil` for an empty input.
    public static func indexOfMaximum(_ values: [Float]) -> Int? {
        guard !values.isEmpty else { return nil }
        var best = 0
        for index in values.indices where values[index] > values[best] {
            best = index
        }
        return best
    }
}
#endif
