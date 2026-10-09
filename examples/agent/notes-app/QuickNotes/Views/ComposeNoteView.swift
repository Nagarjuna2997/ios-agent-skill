import SwiftData
import SwiftUI

/// "compose-note" screen: a form for writing a new note or editing an existing one.
struct ComposeNoteView: View {
    @State private var viewModel: ComposeViewModel
    @FocusState private var focus: Field?
    @Environment(\.dismiss) private var dismiss

    private enum Field { case title, body }

    init(noteID: UUID?, repository: any NoteRepository) {
        _viewModel = State(initialValue: ComposeViewModel(noteID: noteID, repository: repository))
    }

    var body: some View {
        @Bindable var vm = viewModel

        Form {
            Section {
                TextField("Title", text: $vm.title, axis: .vertical)
                    .font(.title3.weight(.semibold))
                    .focused($focus, equals: .title)
                    .submitLabel(.next)
                    .onSubmit { focus = .body }
            } header: {
                Text("Title")
            } footer: {
                Text("A short line you will recognise in the list.")
            }

            Section {
                TextField("Start writing…", text: $vm.body, axis: .vertical)
                    .lineLimit(6...)
                    .focused($focus, equals: .body)
            } header: {
                Text("Note")
            } footer: {
                Text("\(vm.wordCount) words. Notes stay on this device.")
            }
        }
        .scrollDismissesKeyboard(.interactively)
        .fontDesign(AppTheme.fontDesign)
        .navigationTitle(vm.isEditing ? "Edit Note" : "New Note")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") {
                    if vm.save() {
                        Task {
                            try? await Task.sleep(for: .milliseconds(250))
                            dismiss()
                        }
                    }
                }
                .disabled(!vm.canSave)
            }
        }
        .appFeedback(.success, trigger: vm.saveCount)
        .onAppear {
            if !vm.isEditing { focus = .title }
        }
        .alert("Couldn't Save Note", isPresented: Binding(
            get: { vm.errorMessage != nil },
            set: { if !$0 { vm.errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }
}

#Preview("New") {
    let container = SampleData.previewContainer(seeded: false)
    NavigationStack {
        ComposeNoteView(noteID: nil, repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Edit") {
    let container = SampleData.previewContainer()
    NavigationStack {
        ComposeNoteView(
            noteID: SampleData.mostRecentNoteID(in: container),
            repository: SwiftDataNoteRepository(context: container.mainContext)
        )
    }
    .modelContainer(container)
}
