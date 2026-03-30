// macOS-specific extensions and configurations

import SwiftUI

// MARK: - macOS-Specific View Modifiers

extension View {
    /// Apply macOS-specific window styling
    func macOSWindowStyle() -> some View {
        #if os(macOS)
        self.frame(minWidth: 600, minHeight: 400)
        #else
        self
        #endif
    }
}

// MARK: - macOS Menu Commands

#if os(macOS)
struct AppCommands: Commands {
    var body: some Commands {
        CommandGroup(replacing: .newItem) {
            Button("New Document") {
                // Handle new document
            }
            .keyboardShortcut("n")
        }

        CommandMenu("Tools") {
            Button("Run Analysis") {
                // Handle analysis
            }
            .keyboardShortcut("r", modifiers: [.command, .shift])

            Divider()

            Button("Clear Cache") {
                // Handle cache clearing
            }
        }
    }
}
#endif
