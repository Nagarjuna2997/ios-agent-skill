import Foundation
import NaturalLanguage

public struct LanguageGuess: Sendable, Equatable {
    public let code: String
    public let confidence: Double
}

public enum TextLanguage {
    /// Returns nil for empty input or when the system cannot identify a language.
    /// Confidence is a model score; short or mixed-language text can be ambiguous.
    public static func detect(_ text: String) -> LanguageGuess? {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(text)
        guard let language = recognizer.dominantLanguage else { return nil }
        let score = recognizer.languageHypotheses(withMaximum: 1)[language] ?? 0
        return LanguageGuess(code: language.rawValue, confidence: score)
    }
}
