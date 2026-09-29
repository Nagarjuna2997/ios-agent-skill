import SwiftUI
import UniformTypeIdentifiers

enum DocumentService {
    static func read(_ url: URL) throws -> Data {
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        // A false scope result may be an already accessible sandbox URL; the read is authoritative.
        return try Data(contentsOf: url)
    }
}
struct IntegrationDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.data] }
    var data: Data
    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents else { throw CocoaError(.fileReadCorruptFile) }
        self.data = data
    }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}
struct DocumentImportView: View {
    @State private var presenting = false
    let result: (Result<Data, Error>) -> Void
    var body: some View {
        Button("Import PDF or file") { presenting = true }
            .fileImporter(isPresented: $presenting, allowedContentTypes: [.pdf, .data]) { selection in
                result(selection.flatMap { url in Result { try DocumentService.read(url) } })
            }
    }
}
struct DocumentExportView: View {
    let document: IntegrationDocument
    @State private var presenting = false
    let result: (Result<URL, Error>) -> Void
    var body: some View {
        Button("Export file") { presenting = true }
            .fileExporter(isPresented: $presenting, document: document, contentType: .data, defaultFilename: "Export", onCompletion: result)
    }
}
