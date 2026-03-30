import Foundation
import Observation

@Observable
final class HomeViewModel {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    private(set) var error: Error?

    @MainActor
    func loadItems() async {
        guard items.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            // Replace with actual data fetching
            try await Task.sleep(for: .milliseconds(500))
            items = Item.samples
        } catch {
            self.error = error
        }
    }

    @MainActor
    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await Task.sleep(for: .milliseconds(300))
            items = Item.samples
        } catch {
            self.error = error
        }
    }
}
