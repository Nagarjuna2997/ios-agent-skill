import Foundation
import SwiftData

/// The composition root: every service is created here and injected into view models.
@MainActor
final class AppDependencies {
    let container: ModelContainer
    let auth: AuthCoordinator
    let location: any LocationProviding
    let restaurants: any RestaurantServicing
    let payment: any PaymentProcessing
    let liveActivity: any LiveActivityControlling
    let notifications: any NotificationScheduling
    let tracker: any OrderStatusStreaming
    let store: LocalStore

    init(
        container: ModelContainer,
        auth: AuthCoordinator,
        location: any LocationProviding,
        restaurants: any RestaurantServicing,
        payment: any PaymentProcessing,
        liveActivity: any LiveActivityControlling,
        notifications: any NotificationScheduling,
        tracker: any OrderStatusStreaming
    ) {
        self.container = container
        self.auth = auth
        self.location = location
        self.restaurants = restaurants
        self.payment = payment
        self.liveActivity = liveActivity
        self.notifications = notifications
        self.tracker = tracker
        self.store = LocalStore(context: container.mainContext)
    }

    func makeTrackingModel() -> OrderTrackingModel {
        OrderTrackingModel(tracker: tracker, liveActivity: liveActivity, notifications: notifications, store: store)
    }

    static func live() -> AppDependencies {
        let types: [any PersistentModel.Type] = [CartItem.self, Order.self]
        let container: ModelContainer
        do {
            container = try PersistenceController.container(for: types)
        } catch {
            container = PersistenceController.preview(for: types)
        }
        let service: any RestaurantServicing
        if let client = APIConfiguration.makeClient() {
            service = APIRestaurantService(client: client)
        } else {
            service = SampleRestaurantService()
        }
        return AppDependencies(
            container: container,
            auth: AuthCoordinator(
                apple: AppleSignInModel(store: KeychainStore()),
                email: EmailAuthModel(service: SupabaseEmailAuth.fromBundle(), store: KeychainStore())
            ),
            location: LocationService(),
            restaurants: service,
            payment: StoreKitPaymentProcessor(),
            liveActivity: LiveActivityController(),
            notifications: LocalNotificationScheduler(),
            tracker: SimulatedOrderTracker()
        )
    }

    /// In-memory dependencies with sample data, for previews.
    static func preview(seeded: Bool = false) -> AppDependencies {
        let container = PersistenceController.preview(for: [CartItem.self, Order.self])
        let deps = AppDependencies(
            container: container,
            auth: .preview(),
            location: PreviewLocationProvider(),
            restaurants: SampleRestaurantService(),
            payment: PreviewPaymentProcessor(),
            liveActivity: PreviewLiveActivityController(),
            notifications: NoopNotificationScheduler(),
            tracker: SimulatedOrderTracker(stepDelay: .seconds(3))
        )
        if seeded {
            let menu = SampleData.menu(for: "r1")
            deps.store.addToCart(menu[0])
            deps.store.addToCart(menu[1])
            let samples: [(String, Int, Int)] = [
                ("Sakura Sushi", 2598, 12), ("Luigi's Trattoria", 2148, 9), ("Taco Fiesta", 1898, 6),
                ("Sakura Sushi", 1798, 4), ("Spice Route", 2347, 2), ("Green Bowl", 1598, 0),
            ]
            for sample in samples {
                let date = Calendar.current.date(byAdding: .day, value: -sample.2, to: .now) ?? .now
                container.mainContext.insert(Order(restaurantName: sample.0, totalCents: sample.1, placedAt: date, status: OrderStage.delivered.rawValue, itemSummary: "2× House special"))
            }
            deps.store.saveChanges()
        }
        return deps
    }
}
