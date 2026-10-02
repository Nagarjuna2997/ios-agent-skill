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

    func filtered(_ notes: [Note]) -> [Note] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return notes }
        return notes.filter {
            $0.title.localizedCaseInsensitiveContains(query) || $0.body.localizedCaseInsensitiveContains(query)
        }
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
