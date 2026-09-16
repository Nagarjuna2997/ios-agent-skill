import XCTest
@testable import ReadingList
@MainActor final class ReadingStoreTests: XCTestCase {
    func testPersistenceSearchAndProgress() throws {
        let folder = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: folder) }
        let storage = DiskBooks(url: folder.appending(path: "books.json"))
        let store = ReadingStore(persistence: storage); store.load()
        XCTAssertFalse(store.add(title: "  ", author: ""))
        XCTAssertTrue(store.add(title: "The Hobbit", author: "Tolkien"))
        XCTAssertEqual(store.filtered("tolKIEN").count, 1)
        XCTAssertTrue(store.filtered("missing").isEmpty)
        store.toggle(try XCTUnwrap(store.books.first))
        let restored = ReadingStore(persistence: storage); restored.load()
        XCTAssertEqual(restored.books.count, 1)
        XCTAssertTrue(try XCTUnwrap(restored.books.first).finished)
        restored.delete(try XCTUnwrap(restored.books.first))
        XCTAssertTrue(try storage.load().isEmpty)
    }
    func testLoadFailureDoesNotOverwriteCorruptFile() throws {
        let url = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: url) }
        let original = Data("invalid json".utf8); try original.write(to: url)
        let store = ReadingStore(persistence: DiskBooks(url: url)); store.load()
        XCTAssertNotNil(store.message)
        XCTAssertFalse(store.add(title: "Don't erase", author: ""))
        XCTAssertEqual(try Data(contentsOf: url), original)
    }
    func testSaveFailurePreservesInMemoryLibrary() {
        struct FailingSave: BookPersistence {
            func load() throws -> [Book] { [Book(title: "Existing", author: "")] }
            func save(_ books: [Book]) throws { throw CocoaError(.fileWriteNoPermission) }
        }
        let store = ReadingStore(persistence: FailingSave()); store.load()
        XCTAssertFalse(store.add(title: "New", author: ""))
        XCTAssertEqual(store.books.map(\.title), ["Existing"])
        XCTAssertNotNil(store.message)
    }
}
