import Foundation
import FoundationModels

enum OnDeviceAIError: LocalizedError {
    case unavailable

    var errorDescription: String? { "On-device intelligence is not available on this device." }
}

enum OnDeviceAI {
    /// True on iOS 26 or later when the system model is ready.
    static var isAvailable: Bool {
        if #available(iOS 26.0, *) {
            if case .available = SystemLanguageModel.default.availability { return true }
        }
        return false
    }

    /// One prompt, one answer, in a fresh session.
    static func respond(to prompt: String, instructions: String) async throws -> String {
        guard #available(iOS 26.0, *), isAvailable else { throw OnDeviceAIError.unavailable }
        let session = LanguageModelSession(instructions: instructions)
        return try await session.respond(to: prompt).content
    }
}
