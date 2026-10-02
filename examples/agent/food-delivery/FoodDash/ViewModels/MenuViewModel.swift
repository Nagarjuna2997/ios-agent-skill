import Foundation

@MainActor
@Observable
final class MenuViewModel {
    enum Phase {
        case loading
        case loaded
        case failed(String)
    }

    let restaurant: Restaurant
    private(set) var phase: Phase = .loading
    private(set) var items: [MenuItem] = []
    private(set) var addCount = 0
    private(set) var lastAdded: String?

    private let service: any RestaurantServicing
    private let store: LocalStore
    private var toastTask: Task<Void, Never>?

    init(restaurant: Restaurant, service: any RestaurantServicing, store: LocalStore) {
        self.restaurant = restaurant
        self.service = service
        self.store = store
    }

    func load() async {
        phase = .loading
        do {
            items = try await service.menu(for: restaurant.id)
            phase = .loaded
        } catch is CancellationError {
            return
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    func add(_ item: MenuItem) {
        store.addToCart(item)
        addCount += 1
        lastAdded = item.name
        toastTask?.cancel()
        toastTask = Task {
            try? await Task.sleep(for: .seconds(1.5))
            if !Task.isCancelled { lastAdded = nil }
        }
    }
}
