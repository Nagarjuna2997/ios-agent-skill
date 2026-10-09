import SwiftData
import SwiftUI

/// The single navigation stack. "notes-list" is the only top-level screen and the default;
/// the compose and detail screens can be opened directly for agent screenshots.
struct RootView: View {
    @Environment(\.modelContext) private var context
    @State private var path: [Route] = []
    @State private var didHandleLaunch = false

    var body: some View {
        let repository = SwiftDataNoteRepository(context: context)

        NavigationStack(path: $path) {
            NotesListView(repository: repository)
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .detail(let id):
                        NoteDetailView(noteID: id, repository: repository)
                    case .compose(let id):
                        ComposeNoteView(noteID: id, repository: repository)
                    }
                }
        }
        .tint(AppColor.primary)
        .fontDesign(AppTheme.fontDesign)
        .onAppear(perform: openRequestedScreen)
    }

    private func openRequestedScreen() {
        guard !didHandleLaunch else { return }
        didHandleLaunch = true

        let destination: [Route]
        switch AgentLaunch.requestedScreen {
        case "compose-note":
            destination = [.compose(nil)]
        case "note-detail":
            destination = mostRecentNoteID().map { [.detail($0)] } ?? []
        default:
            // "notes-list", nil and unknown values all show the list.
            destination = []
        }
        guard !destination.isEmpty else { return }

        var transaction = Transaction()
        transaction.disablesAnimations = true
        withTransaction(transaction) {
            path = destination
        }
    }

    private func mostRecentNoteID() -> UUID? {
        var descriptor = FetchDescriptor<Note>(sortBy: [SortDescriptor(\Note.updatedAt, order: .reverse)])
        descriptor.fetchLimit = 1
        return (try? context.fetch(descriptor))?.first?.id
    }
}

#Preview("With notes") {
    RootView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("Empty") {
    RootView()
        .modelContainer(SampleData.previewContainer(seeded: false))
}
