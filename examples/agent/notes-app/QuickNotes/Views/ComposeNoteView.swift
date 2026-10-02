import SwiftData
import SwiftUI

struct ComposeNoteView: View {
    @State private var viewModel: ComposeViewModel
    @State private var spacing = ScaledSpacing()
    @FocusState private var focus: Field?
    @Environment(\.dismiss) private var dismiss

    private enum Field { case title, body }

    init(noteID: UUID?, repository: any NoteRepository) {
        _viewModel = State(initialValue: ComposeViewModel(noteID: noteID, repository: repository))
    }

    var body: some View {
        @Bindable var vm = viewModel

        ScrollView {
            VStack(alignment: .leading, spacing: spacing.standard) {
                TextField("Title", text: $vm.title, axis: .vertical)
                    .font(.title2.weight(.semibold))
                    .focused($focus, equals: .title)
                    .submitLabel(.next)
                    .onSubmit { focus = .body }

                Divider()

                TextField("Start writing…", text: $vm.body, axis: .vertical)
                    .font(.body)
                    .focused($focus, equals: .body)
                    .frame(maxWidth: .infinity, minHeight: 240, alignment: .topLeading)
            }
            .padding(spacing.standard)
        }
        .scrollDismissesKeyboard(.interactively)
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
    let container = PreviewSupport.container(seeded: false)
    NavigationStack {
        ComposeNoteView(noteID: nil, repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Edit") {
    let container = PreviewSupport.container()
    NavigationStack {
        ComposeNoteView(
            noteID: PreviewSupport.firstNoteID(in: container),
            repository: SwiftDataNoteRepository(context: container.mainContext)
        )
    }
    .modelContainer(container)
}
