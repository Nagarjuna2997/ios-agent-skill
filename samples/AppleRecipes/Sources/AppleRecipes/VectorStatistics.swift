import Accelerate

public struct VectorSummary: Sendable, Equatable {
    public let minimum: Double
    public let maximum: Double
    public let mean: Double
    public let rootMeanSquare: Double
}

public protocol VectorSummarizing: Sendable {
    func summarize(_ values: [Double]) async throws -> VectorSummary
}

public actor VectorStatistics: VectorSummarizing {
    public enum InputError: Error { case empty, nonFinite }
    public init() {}

    public func summarize(_ values: [Double]) throws -> VectorSummary {
        guard !values.isEmpty else { throw InputError.empty }
        guard values.allSatisfy(\.isFinite) else { throw InputError.nonFinite }
        // Scale before squaring/summing so large finite inputs do not overflow.
        let scale = max(abs(vDSP.minimum(values)), abs(vDSP.maximum(values)))
        let normalized = scale == 0 ? values : vDSP.divide(values, scale)
        return VectorSummary(
            minimum: vDSP.minimum(values), maximum: vDSP.maximum(values),
            mean: vDSP.mean(normalized) * scale,
            rootMeanSquare: min(vDSP.rootMeanSquare(normalized), 1) * scale
        )
    }
}
