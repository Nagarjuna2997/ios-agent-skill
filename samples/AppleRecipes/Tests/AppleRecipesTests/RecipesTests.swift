import Foundation
import CoreGraphics
import CoreText
import Testing
@testable import AppleRecipes

@Test func knownDigest() {
    #expect(ContentDigest.sha256(Data("abc".utf8)) == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
    #expect(ContentDigest.sha256(Data()) == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
}

@Test func languageRecognition() throws {
    #expect(TextLanguage.detect(" \n ") == nil)
    let result = try #require(TextLanguage.detect("The library is open today and everyone is welcome to read a book."))
    #expect(result.code == "en")
    #expect((0...1).contains(result.confidence))
}

private struct Settings: Codable, Sendable, Equatable { let title: String; let count: Int }

@Test func persistenceRoundTripAndRemoval() async throws {
    let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: directory) } // Best-effort test cleanup only.
    let store = try JSONFileStore<Settings>(fileURL: directory.appendingPathComponent("state.json"))
    #expect(try await store.load() == nil)
    try await store.remove()
    let expected = Settings(title: "Café", count: 5)
    try await store.save(expected)
    #expect(try await store.load() == expected)
    try await store.save(Settings(title: "Updated", count: 6))
    #expect(try await store.load()?.count == 6)
    try await store.remove()
    #expect(try await store.load() == nil)
}

@Test func corruptStateIsReported() async throws {
    let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: file) }
    try Data("not JSON".utf8).write(to: file)
    let store = try JSONFileStore<Settings>(fileURL: file)
    await #expect(throws: DecodingError.self) { try await store.load() }
    #expect(throws: JSONFileStore<Settings>.StoreError.self) {
        try JSONFileStore<Settings>(fileURL: #require(URL(string: "https://example.com/state")))
    }
}

@Test func vectorStatisticsAndBoundaries() async throws {
    let statistics = VectorStatistics()
    let result = try await statistics.summarize([1, 2, 3, 4])
    #expect(result.minimum == 1 && result.maximum == 4 && result.mean == 2.5)
    #expect(abs(result.rootMeanSquare - sqrt(7.5)) < 1e-12)
    let zeros = try await statistics.summarize([0, 0])
    #expect(zeros.mean == 0 && zeros.rootMeanSquare == 0)
    let large = try await statistics.summarize([Double.greatestFiniteMagnitude, Double.greatestFiniteMagnitude])
    #expect(large.mean.isFinite && large.rootMeanSquare.isFinite)
    await #expect(throws: VectorStatistics.InputError.self) { try await statistics.summarize([]) }
    await #expect(throws: VectorStatistics.InputError.self) { try await statistics.summarize([.nan]) }
    await #expect(throws: VectorStatistics.InputError.self) { try await statistics.summarize([.infinity]) }
}

@Test func queryValuesRoundTrip() throws {
    let base = try #require(URL(string: "https://example.com/search?tag=one#results"))
    let result = try HTTPSQuery.appending([URLQueryItem(name: "q", value: "a+b & café"), URLQueryItem(name: "tag", value: "two")], to: base)
    let components = try #require(URLComponents(url: result, resolvingAgainstBaseURL: false))
    #expect(components.queryItems?.map(\.value) == ["one", "a+b & café", "two"])
    #expect(result.absoluteString.contains("%2B"))
    #expect(components.fragment == "results")
    #expect(throws: HTTPSQuery.QueryError.self) { try HTTPSQuery.appending([], to: #require(URL(string: "http://example.com"))) }
    #expect(throws: HTTPSQuery.QueryError.self) { try HTTPSQuery.appending([], to: #require(URL(string: "https://user:password@example.com"))) }
}

@Test func pdfExtraction() async throws {
    let buffer = NSMutableData()
    let consumer = try #require(CGDataConsumer(data: buffer))
    var rect = CGRect(x: 0, y: 0, width: 100, height: 100)
    let context = try #require(CGContext(consumer: consumer, mediaBox: &rect, nil))
    context.beginPDFPage(nil)
    let font = CTFontCreateWithName("Helvetica" as CFString, 12, nil)
    let line = CTLineCreateWithAttributedString(NSAttributedString(
        string: "Hello PDF", attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font]
    ))
    context.textPosition = CGPoint(x: 10, y: 50)
    CTLineDraw(line, context)
    context.endPDFPage()
    context.closePDF()
    let extractor = PDFTextExtractor()
    let pages = try await extractor.extract(buffer as Data)
    #expect(pages.count == 1 && pages[0].number == 1)
    #expect(pages[0].text.contains("Hello PDF"))
    await #expect(throws: PDFTextExtractor.ExtractionError.self) { try await extractor.extract(Data("invalid PDF".utf8)) }
}
