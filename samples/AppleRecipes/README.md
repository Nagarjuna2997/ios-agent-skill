# AppleRecipes — complete local Swift source

## Context

Use these six small, original implementations when you need working building blocks rather than another API link. Each source file is self-contained; load only the relevant file and its test to save model context. This package complements the larger `SkillPatterns` sample. It does not implement every Apple technology or reproduce Apple's framework internals.

The package has no external dependencies. It targets macOS 13 and iOS 16 or later and uses Swift 6 language mode. Tests run on macOS; iOS runtime behavior is not yet verified. CryptoKit, NaturalLanguage, Accelerate and PDFKit are provided by the Apple SDK, not vendored here.

## Pattern

From this directory:

```bash
swift test
```

Add this directory as a local Swift package in Xcode and import `AppleRecipes`, or copy a relevant source file into your target.

| Need | Complete source | Contract |
| --- | --- | --- |
| Stable content digest | [ContentDigest.swift](Sources/AppleRecipes/ContentDigest.swift) | SHA-256 lowercase hex; accepts arbitrary Data |
| Detect text language | [TextLanguage.swift](Sources/AppleRecipes/TextLanguage.swift) | Local recognizer, language code and score, nil for empty/unknown input |
| Persist Codable state | [JSONFileStore.swift](Sources/AppleRecipes/JSONFileStore.swift) | Actor, atomic file replacement, missing state, explicit corrupt-data errors |
| Summarize a vector | [VectorStatistics.swift](Sources/AppleRecipes/VectorStatistics.swift) | Actor, min/max/mean/RMS, rejects empty/nonfinite input; scaled arithmetic |
| Extract PDF text | [PDFTextExtractor.swift](Sources/AppleRecipes/PDFTextExtractor.swift) | Actor, numbered pages, locked/invalid input errors; text layers only |
| Build HTTPS queries | [HTTPSQuery.swift](Sources/AppleRecipes/HTTPSQuery.swift) | Preserves repeated items, percent encodes values, rejects credentials and non-HTTPS schemes |

A complete callable composition example (the caller chooses its own writable application-support URL):

```swift
import AppleRecipes
import Foundation

struct ReadingState: Codable, Sendable {
    let title: String
    let completedPages: Int
}

func saveProgress(at fileURL: URL) async throws -> String {
    let store: any ValueStore<ReadingState> = try JSONFileStore(fileURL: fileURL)
    try await store.save(ReadingState(title: "Swift", completedPages: 12))
    let restored = try await store.load()
    return restored?.title ?? "No saved book"
}
```

The actor-backed recipes keep their synchronous work off the main actor. Their work is not streaming or interruptible; pass bounded inputs and use dedicated file coordination or a database for large data, shared files, or multiple processes. Instantiate one store per file. Choose an application-support or user-authorized file URL; the store does not request sandbox permissions. These recipes do not encrypt saved state.

## Anti-Patterns

- **Wrong:** use SHA-256 as a password database or proof of authenticity. **Right:** use a dedicated password KDF or authenticated protocol appropriate to the application.
- **Wrong:** treat absent data and corrupted JSON as the same state. **Right:** first run returns nil; decoding failures propagate to the caller.
- **Wrong:** concatenate query strings containing user text. **Right:** pass URLQueryItem values; this implementation also escapes literal plus signs for form-style servers.
- **Wrong:** assume a scanned PDF contains extractable text. **Right:** detect empty page text and offer a separately implemented OCR path.
- **Wrong:** interpret a language confidence score as certainty. **Right:** handle nil and ambiguous short text in the product.

## Verification and Apple guide attribution

`swift test` compiles all six implementations and runs seven tests covering published SHA-256 vectors, language detection, persistence and corruption, vector numerical extremes, URL encoding and rejection, and generated PDF text extraction. PDFKit may log an expected diagnostic for the deliberately invalid PDF test. The tests require no network access.

The implementations are original repository source under the repository MIT license. Apple owns its SDK implementations and documentation. These links identify the official API guides; they are provenance and further reading, not required downloads for understanding the local recipes:

- [Apple CryptoKit SHA256](https://developer.apple.com/documentation/cryptokit/sha256)
- [Apple NLLanguageRecognizer](https://developer.apple.com/documentation/naturallanguage/nllanguagerecognizer)
- [Apple JSONEncoder](https://developer.apple.com/documentation/foundation/jsonencoder)
- [Apple vDSP](https://developer.apple.com/documentation/accelerate/vdsp)
- [Apple PDFDocument](https://developer.apple.com/documentation/pdfkit/pdfdocument)
- [Apple URLComponents](https://developer.apple.com/documentation/foundation/urlcomponents)
