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

#if DEBUG
@MainActor
enum PreviewSupport {
    static func container(seeded: Bool = true) -> ModelContainer {
        let container = PersistenceController.preview(for: [Note.self])
        if seeded {
            let context = container.mainContext
            context.insert(Note(title: "Groceries", body: "Milk, eggs, bread and coffee.", updatedAt: .now))
            context.insert(Note(title: "Ideas", body: "A small app for jotting thoughts down quickly.", updatedAt: .now.addingTimeInterval(-86_400)))
            context.insert(Note(title: "Meeting", body: "Discuss roadmap and the next release.", updatedAt: .now.addingTimeInterval(-172_800)))
        }
        return container
    }

    static func firstNoteID(in container: ModelContainer) -> UUID? {
        (try? container.mainContext.fetch(FetchDescriptor<Note>()))?.first?.id
    }
}
#endif
