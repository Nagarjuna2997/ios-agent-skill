import Foundation
import Observation

@MainActor @Observable final class NewNoteViewModel {
    var title = ""
    var body = ""
    var showsSaveError = false

    private let store: any NoteStore

    init(store: any NoteStore) {
        self.store = store
    }

    private var trimmedTitle: String {
        title.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var canSave: Bool { !trimmedTitle.isEmpty }

    func save() -> Bool {
        guard canSave else { return false }
        do {
            try store.add(title: trimmedTitle, body: body)
            return true
        } catch {
            showsSaveError = true
            return false
        }
    }
}
