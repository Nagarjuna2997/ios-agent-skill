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
        // The agent's showcase uses a separate in-memory store and local services.
        // Normal launches continue to use the persistent store and configured services.
        if AgentLaunch.usesSampleData { return .preview(seeded: true) }
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
            SampleData.seed(into: container.mainContext)
        }
        return deps
    }
}
