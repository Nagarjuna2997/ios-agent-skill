import SwiftData
import SwiftUI

@main
struct QuickNotesApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: [Note.self])
    }
}
