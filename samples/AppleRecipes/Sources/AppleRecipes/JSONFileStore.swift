import Foundation

public protocol ValueStore<Value>: Sendable {
    associatedtype Value: Codable & Sendable
    func load() async throws -> Value?
    func save(_ value: Value) async throws
    func remove() async throws
}

/// One actor per file. Atomic writes avoid partial JSON; they do not coordinate other processes.
/// Encoding and file I/O run on this actor, not the main actor. Small app state only.
public actor JSONFileStore<Value: Codable & Sendable>: ValueStore {
    private let fileURL: URL

    public init(fileURL: URL) throws {
        guard fileURL.isFileURL else { throw StoreError.requiresFileURL }
        self.fileURL = fileURL
    }

    public enum StoreError: Error { case requiresFileURL }

    public func load() throws -> Value? {
        do {
            return try JSONDecoder().decode(Value.self, from: Data(contentsOf: fileURL))
        } catch let error as CocoaError where error.code == .fileReadNoSuchFile {
            return nil // A missing first-run file represents no saved value.
        }
    }

    public func save(_ value: Value) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        let data = try encoder.encode(value)
        try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try data.write(to: fileURL, options: .atomic)
    }

    public func remove() throws {
        do {
            try FileManager.default.removeItem(at: fileURL)
        } catch let error as CocoaError where error.code == .fileNoSuchFile {
            return // Deleting absent state is deliberately idempotent.
        }
    }
}
