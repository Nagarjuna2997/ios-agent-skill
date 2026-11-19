import Foundation
import SwiftData

@MainActor
protocol NoteStore {
    func add(title: String, body: String) throws
    func delete(_ note: Note) throws
}

@MainActor
struct LocalNoteStore: NoteStore {
    let context: ModelContext

    func add(title: String, body: String) throws {
        context.insert(Note(title: title, body: body))
        try commit()
    }

    func delete(_ note: Note) throws {
        context.delete(note)
        try commit()
    }

    func insertStarterNotesIfEmpty() throws {
        guard try context.fetchCount(FetchDescriptor<Note>()) == 0 else { return }
        for note in SampleData.makeNotes() {
            context.insert(note)
        }
        try commit()
    }

    private func commit() throws {
        do {
            try context.save()
        } catch {
            context.rollback()
            throw error
        }
    }
}
