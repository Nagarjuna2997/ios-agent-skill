import Foundation
import FirebaseCore
import FirebaseFirestore

@MainActor
final class FirestoreDocuments<Row: Codable> {
    private let collection: CollectionReference
    init(database: Firestore, collection: String) { self.collection = database.collection(collection) }
    func load(id: String) async throws -> Row? {
        let snapshot = try await collection.document(id).getDocument()
        return snapshot.exists ? try snapshot.data(as: Row.self) : nil
    }
    func save(_ value: Row, id: String) async throws {
        let data = try Firestore.Encoder().encode(value)
        try await collection.document(id).setData(data)
    }
    func remove(id: String) async throws { try await collection.document(id).delete() }
}
