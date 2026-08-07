#if canImport(Accelerate)
import XCTest
@testable import SkillPatterns

/// Accelerate patterns.
///
/// The FFT tests assert on a *known answer* rather than on a snapshot: a signal
/// with exactly eight periods across the frame must peak in bin eight, and a
/// constant signal must peak in bin zero. That is checkable arithmetic, so the
/// test fails when the transform is wrong instead of when the numbers change —
/// which is the difference between a test and a tripwire.
///
/// It is also the check that catches the classic error: feeding the raw
/// `[Float]` to vDSP without `vDSP_ctoz` produces a spectrum that looks like a
/// spectrum and peaks in the wrong place.
final class SignalProcessingTests: XCTestCase {

    // MARK: Setup validation

    func testInitRejectsNonPowerOfTwoFrameCounts() {
        XCTAssertNil(AccelerateSpectrumAnalyzer(frameCount: 1000))
        XCTAssertNil(AccelerateSpectrumAnalyzer(frameCount: 3))
        XCTAssertNil(AccelerateSpectrumAnalyzer(frameCount: 0))
    }

    func testInitRejectsFrameCountsBelowTheMinimum() {
        XCTAssertNil(AccelerateSpectrumAnalyzer(frameCount: 2))
        XCTAssertNil(AccelerateSpectrumAnalyzer(frameCount: -8))
    }

    func testInitAcceptsPowersOfTwo() {
        XCTAssertNotNil(AccelerateSpectrumAnalyzer(frameCount: 4))
        XCTAssertNotNil(AccelerateSpectrumAnalyzer(frameCount: 1024))
    }

    // MARK: Known-answer transforms

    func testPureTonePeaksInItsOwnBin() async throws {
        let frameCount = 1024
        let cycles = 8
        let analyzer = try XCTUnwrap(AccelerateSpectrumAnalyzer(frameCount: frameCount))

        let signal = SignalMath.sineWave(cycles: Float(cycles), count: frameCount)
        let spectrum = await analyzer.magnitudeSpectrum(of: signal)

        XCTAssertEqual(spectrum.count, frameCount / 2)
        XCTAssertEqual(SignalMath.indexOfMaximum(spectrum), cycles)
    }

    func testADifferentToneMovesThePeak() async throws {
        let frameCount = 512
        let analyzer = try XCTUnwrap(AccelerateSpectrumAnalyzer(frameCount: frameCount))

        let signal = SignalMath.sineWave(cycles: 32, count: frameCount)
        let spectrum = await analyzer.magnitudeSpectrum(of: signal)

        XCTAssertEqual(SignalMath.indexOfMaximum(spectrum), 32)
    }

    func testConstantSignalPeaksInBinZero() async throws {
        let frameCount = 256
        let analyzer = try XCTUnwrap(AccelerateSpectrumAnalyzer(frameCount: frameCount))

        let signal = [Float](repeating: 1, count: frameCount)
        let spectrum = await analyzer.magnitudeSpectrum(of: signal)

        XCTAssertEqual(SignalMath.indexOfMaximum(spectrum), 0)
    }

    func testShortInputReturnsNoBinsRatherThanReadingPastTheEnd() async throws {
        let analyzer = try XCTUnwrap(AccelerateSpectrumAnalyzer(frameCount: 1024))

        let spectrum = await analyzer.magnitudeSpectrum(of: [1, 2, 3, 4])

        XCTAssertTrue(spectrum.isEmpty)
    }

    // MARK: Normalisation

    func testNormalizationProducesUnitRMS() {
        let signal = SignalMath.sineWave(cycles: 4, count: 512)

        let normalized = SignalMath.normalizedByRMS(signal)
        let sumOfSquares = normalized.reduce(Float(0)) { $0 + $1 * $1 }
        let rms = (sumOfSquares / Float(normalized.count)).squareRoot()

        XCTAssertEqual(rms, 1, accuracy: 0.001)
    }

    func testSilenceSurvivesNormalizationWithoutNaNs() {
        let silence = [Float](repeating: 0, count: 64)

        let normalized = SignalMath.normalizedByRMS(silence)

        XCTAssertEqual(normalized.count, 64)
        XCTAssertFalse(normalized.contains { $0.isNaN }, "dividing by a zero RMS must not produce NaNs")
    }

    func testNormalizingAnEmptySignalIsEmpty() {
        XCTAssertTrue(SignalMath.normalizedByRMS([]).isEmpty)
    }

    // MARK: Generation

    func testSineWaveStartsAtZeroAndStaysInRange() {
        let signal = SignalMath.sineWave(cycles: 3, count: 128)

        XCTAssertEqual(signal.count, 128)
        XCTAssertEqual(signal.first ?? .nan, 0, accuracy: 0.0001)
        XCTAssertTrue(signal.allSatisfy { $0 >= -1.0001 && $0 <= 1.0001 })
    }

    func testSineWaveOfZeroLengthIsEmpty() {
        XCTAssertTrue(SignalMath.sineWave(cycles: 3, count: 0).isEmpty)
    }

    // MARK: The seam

    func testAStubWitnessesTheSameRequirement() async {
        let analyzer: any SpectrumAnalyzer = ConstantSpectrumAnalyzer(spectrum: [1, 2, 3])

        let spectrum = await analyzer.magnitudeSpectrum(of: [])

        XCTAssertEqual(spectrum, [1, 2, 3])
    }

    func testIndexOfMaximumIsNilForAnEmptyVector() {
        XCTAssertNil(SignalMath.indexOfMaximum([]))
    }
}
#endif
