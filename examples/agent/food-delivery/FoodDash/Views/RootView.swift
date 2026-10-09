import SwiftUI

enum AppTab: String, Hashable {
    case restaurants
    case cart
    case orderStatus = "order-status"
    case dashboard
    case account
}

struct RootView: View {
    let dependencies: AppDependencies
    @State private var selection: AppTab
    @State private var restaurantsModel: RestaurantsViewModel
    @State private var tracking: OrderTrackingModel

    init(dependencies: AppDependencies) {
        self.dependencies = dependencies
        _selection = State(initialValue: AppTab(rawValue: AgentLaunch.requestedScreen ?? "") ?? .restaurants)
        _restaurantsModel = State(initialValue: RestaurantsViewModel(service: dependencies.restaurants, location: dependencies.location))
        let tracking = dependencies.makeTrackingModel()
        if AgentLaunch.usesSampleData, let order = SampleData.orders.first {
            tracking.showSampleOrder(order, address: "Market Street, San Francisco")
        }
        _tracking = State(initialValue: tracking)
    }

    private var requested: String? { AgentLaunch.requestedScreen }

    var body: some View {
        Group {
            if requested == "splash" {
                SplashView()
            } else if (requested != nil && requested != "sign-in") || dependencies.auth.isSignedIn {
                tabs
            } else if dependencies.auth.isRestoring {
                ProgressView("Loading…")
            } else {
                SignInView(auth: dependencies.auth)
            }
        }
        .task { await dependencies.auth.restore() }
        .fontDesign(AppTheme.fontDesign)
    }

    private var tabs: some View {
        TabView(selection: $selection) {
            RestaurantsView(model: restaurantsModel, dependencies: dependencies)
                .tabItem { Label("Restaurants", systemImage: "fork.knife") }
                .tag(AppTab.restaurants)
            CartView(dependencies: dependencies, tracking: tracking) {
                selection = .orderStatus
            }
            .tabItem { Label("Cart", systemImage: "cart") }
            .tag(AppTab.cart)
            OrderStatusView(model: tracking)
                .tabItem { Label("Order", systemImage: "bag") }
                .tag(AppTab.orderStatus)
            DashboardView()
                .tabItem { Label("Past Orders", systemImage: "chart.bar.xaxis") }
                .tag(AppTab.dashboard)
            AccountView(auth: dependencies.auth)
                .tabItem { Label("Account", systemImage: "person.crop.circle") }
                .tag(AppTab.account)
        }
    }
}

#Preview {
    RootView(dependencies: .preview(seeded: true))
}
