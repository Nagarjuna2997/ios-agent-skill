import Foundation
import Observation

@MainActor @Observable
final class NoteDetailViewModel {
    var errorMessage: String?
    var showDeleteConfirmation = false
    private(set) var deleteCount = 0

    @ObservationIgnored private let repository: any NoteRepository

    init(repository: any NoteRepository) {
        self.repository = repository
    }

    /// Returns true when the note was deleted.
    func delete(id: UUID) -> Bool {
        do {
            try repository.delete(id: id)
            deleteCount += 1
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func sharedItem(for note: Note) -> SharedItem {
        let text = note.body.isEmpty ? note.displayTitle : "\(note.displayTitle)\n\n\(note.body)"
        return SharedItem(title: note.displayTitle, text: text, url: nil)
    }
}
