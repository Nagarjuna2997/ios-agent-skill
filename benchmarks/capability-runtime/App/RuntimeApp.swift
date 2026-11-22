import SwiftUI
import SwiftData

@Model final class Receipt {
    var marker: String
    init(marker: String) { self.marker = marker }
}

@main struct RuntimeApp: App {
    var body: some Scene {
        WindowGroup {
            if let container = try? PersistenceController.container(for: [Receipt.self]) {
                Receipts().modelContainer(container)
            } else {
                Text("Failed to open SwiftData")
            }
        }
    }
}

struct Receipts: View {
    @Environment(\.modelContext) private var context
    @Query private var receipts: [Receipt]
    @State private var failure: String?
    private var marker: String { ProcessInfo.processInfo.environment["RUNTIME_TEST_MARKER"] ?? "demo" }
    var body: some View {
        VStack {
            Button("Save marker") {
                do { context.insert(Receipt(marker: marker)); try context.save() }
                catch { failure = error.localizedDescription }
            }
            if receipts.contains(where: { $0.marker == marker }) {
                Text(marker).accessibilityIdentifier("stored-marker")
            }
            if let failure { Text(failure) }
        }
    }
}
