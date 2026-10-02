import SwiftData
import SwiftUI

struct NotesListView: View {
    @Query(sort: \Note.updatedAt, order: .reverse) private var notes: [Note]
    @State private var viewModel: NotesListViewModel
    @State private var spacing = ScaledSpacing()

    init(repository: any NoteRepository) {
        _viewModel = State(initialValue: NotesListViewModel(repository: repository))
    }

    var body: some View {
        @Bindable var vm = viewModel
        let visible = vm.filtered(notes)

        Group {
            if notes.isEmpty {
                ContentUnavailableView(
                    "No Notes",
                    systemImage: "note.text",
                    description: Text("Tap the compose button to write your first note.")
                )
            } else if visible.isEmpty {
                ContentUnavailableView.search(text: vm.searchText)
            } else {
                List {
                    ForEach(visible) { note in
                        NavigationLink(value: Route.detail(note.id)) {
                            row(for: note)
                        }
                    }
                    .onDelete { offsets in
                        vm.delete(ids: offsets.map { visible[$0].id })
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Notes")
        .searchable(text: $vm.searchText, prompt: "Search notes")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink(value: Route.compose(nil)) {
                    Label("New Note", systemImage: "square.and.pencil")
                }
                .minimumTapTarget()
            }
        }
        .appFeedback(.warning, trigger: vm.deleteCount)
        .alert("Something Went Wrong", isPresented: Binding(
            get: { vm.errorMessage != nil },
            set: { if !$0 { vm.errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }

    private func row(for note: Note) -> some View {
        VStack(alignment: .leading, spacing: spacing.compact / 2) {
            Text(note.displayTitle)
                .font(.headline)
                .lineLimit(1)
            if !note.body.isEmpty {
                Text(note.body)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Text(note.updatedAt, format: .dateTime.day().month().year().hour().minute())
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, spacing.compact / 2)
        .accessibilityElement(children: .combine)
    }
}

#Preview("With notes") {
    let container = PreviewSupport.container()
    NavigationStack {
        NotesListView(repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Empty") {
    let container = PreviewSupport.container(seeded: false)
    NavigationStack {
        NotesListView(repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}
