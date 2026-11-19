import SwiftData
import SwiftUI
import UIKit

struct RootView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.horizontalSizeClass) private var sizeClass
    @Query(sort: \Note.createdAt, order: .reverse) private var notes: [Note]

    @State private var selectedID: UUID?
    @State private var preferredColumn: NavigationSplitViewColumn = .sidebar
    @State private var showingComposer = false
    @State private var appliedLaunchRoute = false

    private let requestedScreen: String?

    init(requestedScreen: String? = AgentLaunch.requestedScreen) {
        self.requestedScreen = requestedScreen
    }

    var body: some View {
        Group {
            if UIDevice.current.userInterfaceIdiom == .pad && sizeClass == .regular {
                NavigationSplitView(preferredCompactColumn: $preferredColumn) {
                    notesList
                } detail: {
                    detail(for: selectedID)
                }
            } else {
                NavigationStack {
                    notesList
                        .navigationDestination(item: $selectedID) { id in
                            detail(for: id)
                        }
                }
            }
        }
        .fontDesign(AppTheme.fontDesign)
        .tint(AppColor.primary)
        .sheet(isPresented: $showingComposer) {
            NavigationStack {
                NewNoteView(model: NewNoteViewModel(store: LocalNoteStore(context: context)))
            }
            .tint(AppColor.primary)
        }
        .onAppear(perform: applyLaunchRoute)
    }

    private var notesList: some View {
        NotesListView(notes: notes, selectedID: selectedID, store: LocalNoteStore(context: context)) { id in
            selectedID = id
            preferredColumn = .detail
        } add: {
            showingComposer = true
        } didDelete: { id in
            if selectedID == id {
                selectedID = nil
                preferredColumn = .sidebar
            }
        }
    }

    private func detail(for id: UUID?) -> some View {
        NoteDetailView(note: notes.first { $0.id == id })
    }

    private func applyLaunchRoute() {
        guard !appliedLaunchRoute else { return }
        appliedLaunchRoute = true
        switch requestedScreen {
        case "note-detail":
            selectedID = notes.first?.id ?? SampleData.firstNoteID
            preferredColumn = .detail
        case "new-note":
            showingComposer = true
        default:
            break
        }
    }
}

#Preview {
    RootView(requestedScreen: "notes")
        .modelContainer(SampleData.previewContainer())
}
