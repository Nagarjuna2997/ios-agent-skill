import SwiftData
import SwiftUI

struct RootView: View {
    @Environment(\.modelContext) private var context
    @State private var path: [Route]

    init() {
        // "notes-list" is the only top-level screen and the default; compose is offered for screenshots.
        let initial: [Route] = AgentLaunch.requestedScreen == "compose-note" ? [.compose(nil)] : []
        _path = State(initialValue: initial)
    }

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
    }
}

#Preview {
    RootView()
        .modelContainer(PreviewSupport.container())
}
