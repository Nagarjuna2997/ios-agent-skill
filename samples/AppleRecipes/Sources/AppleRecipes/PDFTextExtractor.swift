import Foundation
import PDFKit

public struct PDFTextPage: Sendable, Equatable {
    public let number: Int
    public let text: String
}

public protocol PDFTextExtracting: Sendable {
    func extract(_ data: Data) async throws -> [PDFTextPage]
}

/// Extracts an existing PDF text layer. Scanned pages need a separate Vision OCR pipeline.
public actor PDFTextExtractor: PDFTextExtracting {
    public enum ExtractionError: Error { case invalidDocument, lockedDocument, missingPage(Int) }
    public init() {}

    public func extract(_ data: Data) throws -> [PDFTextPage] {
        guard let document = PDFDocument(data: data) else { throw ExtractionError.invalidDocument }
        guard !document.isLocked else { throw ExtractionError.lockedDocument }
        return try (0..<document.pageCount).map { index in
            guard let page = document.page(at: index) else { throw ExtractionError.missingPage(index + 1) }
            return PDFTextPage(number: index + 1, text: page.string ?? "")
        }
    }
}
