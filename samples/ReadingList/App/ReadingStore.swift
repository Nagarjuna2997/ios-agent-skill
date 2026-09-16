import Foundation
import Observation

struct Book: Codable, Identifiable, Equatable, Sendable {
    var id = UUID()
    var title: String
    var author: String
    var finished = false
}
protocol BookPersistence {
    func load() throws -> [Book]
    func save(_ books: [Book]) throws
}
struct DiskBooks: BookPersistence {
    let url: URL
    func load() throws -> [Book] {
        guard FileManager.default.fileExists(atPath: url.path) else { return [] }
        return try JSONDecoder().decode([Book].self, from: Data(contentsOf: url))
    }
    func save(_ books: [Book]) throws {
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        try JSONEncoder().encode(books).write(to: url, options: .atomic)
    }
}
struct MemoryBooks: BookPersistence {
    var books: [Book] = []
    func load() throws -> [Book] { books }
    func save(_ books: [Book]) throws {}
}
struct UnavailableBooks: BookPersistence {
    func load() throws -> [Book] { throw CocoaError(.fileReadNoPermission) }
    func save(_ books: [Book]) throws { throw CocoaError(.fileWriteNoPermission) }
}
@MainActor @Observable final class ReadingStore {
    private(set) var books: [Book] = []
    var message: String?
    var loading = true
    private let persistence: any BookPersistence
    init(persistence: any BookPersistence) { self.persistence = persistence }
    func load() {
        loading = true
        defer { loading = false }
        do { books = try persistence.load(); message = nil }
        catch { message = "Your library couldn't be opened. Try again; your saved file has not been changed." }
    }
    func filtered(_ query: String) -> [Book] {
        let query = query.trimmingCharacters(in: .whitespacesAndNewlines)
        return query.isEmpty ? books : books.filter { $0.title.localizedCaseInsensitiveContains(query) || $0.author.localizedCaseInsensitiveContains(query) }
    }
    @discardableResult func add(title: String, author: String) -> Bool {
        let title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !title.isEmpty else { return false }
        return commit(books + [Book(title: title, author: author.trimmingCharacters(in: .whitespacesAndNewlines))])
    }
    func toggle(_ book: Book) {
        var next = books
        guard let index = next.firstIndex(where: { $0.id == book.id }) else { return }
        next[index].finished.toggle(); _ = commit(next)
    }
    func delete(_ book: Book) { _ = commit(books.filter { $0.id != book.id }) }
    private func commit(_ next: [Book]) -> Bool {
        guard message == nil else { return false }
        do { try persistence.save(next); books = next; return true }
        catch { message = "Your changes couldn't be saved. Your previous library is still available."; return false }
    }
}
