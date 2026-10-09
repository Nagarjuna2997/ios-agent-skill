import Foundation
import Observation

@MainActor @Observable
final class NotesListViewModel {
    var searchText = ""
    var errorMessage: String?
    private(set) var deleteCount = 0

    @ObservationIgnored private let repository: any NoteRepository

    init(repository: any NoteRepository) {
        self.repository = repository
    }

    var isSearching: Bool {
        !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Case-insensitive match on title or body; an empty query returns every note.
    func filtered(_ notes: [Note]) -> [Note] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return notes }
        return notes.filter {
            $0.title.localizedCaseInsensitiveContains(query) || $0.body.localizedCaseInsensitiveContains(query)
        }
    }

    /// Notes updated within the last seven days, for the overview tiles.
    func updatedThisWeekCount(_ notes: [Note], now: Date = .now) -> Int {
        let cutoff = now.addingTimeInterval(-7 * 86_400)
        return notes.filter { $0.updatedAt >= cutoff }.count
    }

    func totalWordCount(_ notes: [Note]) -> Int {
        notes.reduce(0) { $0 + $1.wordCount }
    }

    func delete(ids: [UUID]) {
        do {
            for id in ids {
                try repository.delete(id: id)
            }
            deleteCount += 1
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
