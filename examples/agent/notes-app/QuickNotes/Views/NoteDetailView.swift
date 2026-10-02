import SwiftData
import SwiftUI

struct NoteDetailView: View {
    @Query private var matches: [Note]
    @State private var viewModel: NoteDetailViewModel
    @State private var spacing = ScaledSpacing()
    @Environment(\.dismiss) private var dismiss

    private let noteID: UUID

    init(noteID: UUID, repository: any NoteRepository) {
        self.noteID = noteID
        _matches = Query(filter: #Predicate<Note> { $0.id == noteID })
        _viewModel = State(initialValue: NoteDetailViewModel(repository: repository))
    }

    var body: some View {
        @Bindable var vm = viewModel

        Group {
            if let note = matches.first {
                ScrollView {
                    VStack(alignment: .leading, spacing: spacing.standard) {
                        Text(note.displayTitle)
                            .font(.title2.weight(.semibold))
                            .accessibilityAddTraits(.isHeader)
                        Text(note.updatedAt, format: .dateTime.day().month().year().hour().minute())
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if note.body.isEmpty {
                            Text("No text")
                                .font(.body)
                                .foregroundStyle(.secondary)
                        } else {
                            Text(note.body)
                                .font(.body)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(spacing.standard)
                    .textSelection(.enabled)
                }
                .toolbar {
                    ToolbarItemGroup(placement: .primaryAction) {
                        ShareItemButton(item: vm.sharedItem(for: note))
                            .labelStyle(.iconOnly)
                        NavigationLink(value: Route.compose(noteID)) {
                            Label("Edit", systemImage: "pencil")
                        }
                        Button(role: .destructive) {
                            vm.showDeleteConfirmation = true
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            } else {
                ContentUnavailableView("Note Not Found", systemImage: "questionmark.folder")
            }
        }
        .navigationTitle("Note")
        .navigationBarTitleDisplayMode(.inline)
        .appFeedback(.warning, trigger: vm.deleteCount)
        .confirmationDialog("Delete this note?", isPresented: $vm.showDeleteConfirmation, titleVisibility: .visible) {
            Button("Delete", role: .destructive) {
                if vm.delete(id: noteID) {
                    Task {
                        try? await Task.sleep(for: .milliseconds(250))
                        dismiss()
                    }
                }
            }
            Button("Cancel", role: .cancel) {}
        }
        .alert("Couldn't Delete Note", isPresented: Binding(
            get: { vm.errorMessage != nil },
            set: { if !$0 { vm.errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }
}

#Preview {
    let container = PreviewSupport.container()
    NavigationStack {
        NoteDetailView(
            noteID: PreviewSupport.firstNoteID(in: container) ?? UUID(),
            repository: SwiftDataNoteRepository(context: container.mainContext)
        )
    }
    .modelContainer(container)
}
