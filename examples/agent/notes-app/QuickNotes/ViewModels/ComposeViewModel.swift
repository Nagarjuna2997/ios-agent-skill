import Foundation
import Observation

@MainActor @Observable
final class ComposeViewModel {
    var title: String
    var body: String
    var errorMessage: String?
    private(set) var saveCount = 0

    @ObservationIgnored private let repository: any NoteRepository
    @ObservationIgnored private let noteID: UUID?

    init(noteID: UUID?, repository: any NoteRepository) {
        self.noteID = noteID
        self.repository = repository
        let existing = noteID.flatMap { repository.note(id: $0) }
        self.title = existing?.title ?? ""
        self.body = existing?.body ?? ""
    }

    var isEditing: Bool { noteID != nil }

    var wordCount: Int {
        body.split(whereSeparator: { $0.isWhitespace }).count
    }

    var canSave: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            || !body.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Returns true when the note was saved.
    func save() -> Bool {
        guard canSave else { return false }
        do {
            if let noteID {
                try repository.update(id: noteID, title: title, body: body)
            } else {
                try repository.add(title: title, body: body)
            }
            saveCount += 1
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
