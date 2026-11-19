import Foundation
import SwiftData
import SwiftUI

@main
struct PocketNotesApp: App {
    @State private var container: ModelContainer?
    @State private var failedToOpen = false

    var body: some Scene {
        WindowGroup {
            Group {
                if let container {
                    RootView()
                        .modelContainer(container)
                } else if failedToOpen {
                    AppErrorStateView(title: "Couldn’t open notes", message: "Your notes couldn’t be loaded from this device.", retry: openStore)
                        .accessibilityIdentifier("screen-notes")
                } else {
                    ProgressView("Opening notes…")
                }
            }
            .fontDesign(AppTheme.fontDesign)
            .tint(AppColor.primary)
            .task {
                if container == nil && !failedToOpen {
                    openStore()
                }
            }
        }
    }

    private func openStore() {
        let demo = AgentLaunch.usesSampleData
        let defaults = UserDefaults.standard
        let seedKey = "pocketnotes.didInitializeLocalStore"
        do {
            let opened = try PersistenceController.container(for: [Note.self], inMemory: demo)
            if demo || !defaults.bool(forKey: seedKey) {
                try LocalNoteStore(context: opened.mainContext).insertStarterNotesIfEmpty()
                if !demo {
                    defaults.set(true, forKey: seedKey)
                }
            }
            container = opened
            failedToOpen = false
        } catch {
            failedToOpen = true
        }
    }
}
