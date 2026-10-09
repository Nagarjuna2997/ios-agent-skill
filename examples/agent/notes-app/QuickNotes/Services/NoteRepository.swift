import Foundation
import SwiftData

@MainActor
protocol NoteRepository {
    func note(id: UUID) -> Note?
    func add(title: String, body: String) throws
    func update(id: UUID, title: String, body: String) throws
    func delete(id: UUID) throws
}

@MainActor
struct SwiftDataNoteRepository: NoteRepository {
    let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func note(id: UUID) -> Note? {
        var descriptor = FetchDescriptor<Note>(predicate: #Predicate<Note> { $0.id == id })
        descriptor.fetchLimit = 1
        return try? context.fetch(descriptor).first
    }

    func add(title: String, body: String) throws {
        context.insert(Note(title: title, body: body))
        try context.save()
    }

    func update(id: UUID, title: String, body: String) throws {
        guard let note = note(id: id) else { return }
        note.title = title
        note.body = body
        note.updatedAt = .now
        try context.save()
    }

    func delete(id: UUID) throws {
        guard let note = note(id: id) else { return }
        context.delete(note)
        try context.save()
    }
}
