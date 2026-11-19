import Testing
@testable import PocketNotes

@MainActor
struct NewNoteViewModelTests {
    @Test func startsWithAnEmptyDraftAndSaveDisabled() {
        let model = NewNoteViewModel(store: RecordingNoteStore())

        #expect(model.title.isEmpty)
        #expect(model.body.isEmpty)
        #expect(!model.canSave)
        #expect(!model.showsSaveError)
    }

    @Test func rejectsEmptyAndWhitespaceOnlyTitlesWithoutWriting() {
        let store = RecordingNoteStore()
        let model = NewNoteViewModel(store: store)
        model.body = "A body cannot substitute for a title."

        for title in ["", " \t\n "] {
            model.title = title

            #expect(!model.canSave)
            let saved = model.save()
            #expect(!saved)
            #expect(!model.showsSaveError)
        }

        #expect(store.addAttempts.isEmpty)
    }

    @Test func savesTrimmedTitleAndPreservesBodyVerbatim() {
        let store = RecordingNoteStore()
        let model = NewNoteViewModel(store: store)
        let body = "  Rolled oats\n\nBrown rice\n"
        model.title = " \tPantry  restock\n"
        model.body = body

        #expect(model.canSave)
        let saved = model.save()

        #expect(saved)
        #expect(store.addAttempts == [.init(title: "Pantry  restock", body: body)])
        #expect(!model.showsSaveError)
    }

    @Test func savesWithAnEmptyOptionalBody() {
        let store = RecordingNoteStore()
        let model = NewNoteViewModel(store: store)
        model.title = "Call the library"

        let saved = model.save()

        #expect(saved)
        #expect(store.addAttempts == [.init(title: "Call the library", body: "")])
    }

    @Test func failedSaveKeepsTheDraftAvailableForRetry() {
        let store = RecordingNoteStore()
        store.shouldFail = true
        let model = NewNoteViewModel(store: store)
        model.title = "  Packing list  "
        model.body = "Notebook\nPencil"
        let expectedWrite = RecordingNoteStore.AddAttempt(title: "Packing list", body: "Notebook\nPencil")

        let firstSave = model.save()

        #expect(!firstSave)
        #expect(model.showsSaveError)
        #expect(model.title == "  Packing list  ")
        #expect(model.body == "Notebook\nPencil")
        #expect(model.canSave)
        #expect(store.addAttempts == [expectedWrite])

        // Dismissing the alert resets its presentation binding before the user retries.
        model.showsSaveError = false
        store.shouldFail = false
        let retry = model.save()

        #expect(retry)
        #expect(!model.showsSaveError)
        #expect(store.addAttempts == [expectedWrite, expectedWrite])
    }
}

@MainActor
private final class RecordingNoteStore: NoteStore {
    struct AddAttempt: Equatable {
        let title: String
        let body: String
    }

    private enum StoreError: Error {
        case writeFailed
        case unexpectedDeletion
    }

    private(set) var addAttempts: [AddAttempt] = []
    var shouldFail = false

    func add(title: String, body: String) throws {
        addAttempts.append(AddAttempt(title: title, body: body))
        if shouldFail {
            throw StoreError.writeFailed
        }
    }

    func delete(_ note: Note) throws {
        Issue.record("Saving a new note must not call delete.")
        throw StoreError.unexpectedDeletion
    }
}
