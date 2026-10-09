import SwiftData
import SwiftUI

/// "note-detail" screen: read one note, then edit, share or delete it.
struct NoteDetailView: View {
    @Query private var matches: [Note]
    @State private var viewModel: NoteDetailViewModel
    private let spacing = ScaledSpacing()
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
                        ThumbnailPlaceholder(symbol: "text.quote", title: "Note illustration")
                            .frame(height: 140)

                        Text(note.displayTitle)
                            .font(.largeTitle.weight(.bold))
                            .fixedSize(horizontal: false, vertical: true)
                            .accessibilityAddTraits(.isHeader)

                        metadata(for: note)

                        AppSectionHeader(title: "Note")
                            .accessibilityAddTraits(.isHeader)

                        AppCard {
                            if note.body.isEmpty {
                                Text("No text")
                                    .font(.body)
                                    .foregroundStyle(.secondary)
                            } else {
                                Text(note.body)
                                    .font(.body)
                                    .lineSpacing(spacing.compact / 2)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                        .textSelection(.enabled)

                        actions
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(AppTheme.screenInset)
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
                AppEmptyStateView(
                    title: "Note Not Found",
                    message: "This note may have been deleted.",
                    symbol: "questionmark.folder"
                )
            }
        }
        .fontDesign(AppTheme.fontDesign)
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

    private func metadata(for note: Note) -> some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: spacing.compact) { chips(for: note) }
            VStack(alignment: .leading, spacing: spacing.compact) { chips(for: note) }
        }
    }

    @ViewBuilder
    private func chips(for note: Note) -> some View {
        AppChip(title: "Updated \(note.updatedAt.formatted(.dateTime.day().month()))")
        AppChip(title: "Created \(note.createdAt.formatted(.dateTime.day().month()))")
        AppChip(title: "\(note.wordCount) words")
    }

    private var actions: some View {
        VStack(spacing: spacing.compact) {
            NavigationLink(value: Route.compose(noteID)) {
                Label("Edit Note", systemImage: "pencil")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(AppPrimaryButtonStyle())

            Button(role: .destructive) {
                viewModel.showDeleteConfirmation = true
            } label: {
                Label("Delete Note", systemImage: "trash")
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: AppTheme.controlMinimumHeight)
            }
            .buttonStyle(.bordered)
        }
        .padding(.top, spacing.compact)
    }
}

#Preview {
    let container = SampleData.previewContainer()
    NavigationStack {
        NoteDetailView(
            noteID: SampleData.mostRecentNoteID(in: container) ?? UUID(),
            repository: SwiftDataNoteRepository(context: container.mainContext)
        )
    }
    .modelContainer(container)
}

#Preview("Missing") {
    let container = SampleData.previewContainer(seeded: false)
    NavigationStack {
        NoteDetailView(noteID: UUID(), repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}
