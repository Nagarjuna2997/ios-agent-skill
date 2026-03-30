# Coordinator Pattern

## Overview

The Coordinator pattern extracts navigation logic from views into dedicated coordinator objects. This enables deep linking, testable navigation, and complex flow management.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AppCoordinator │──▶│ AuthCoordinator │   │ TabCoordinator │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                   ┌──────────────┼──────────────┐
                                   ▼              ▼              ▼
                            HomeCoordinator  SearchCoordinator  ProfileCoordinator
```

---

## Coordinator Protocol

```swift
import SwiftUI

@MainActor
protocol Coordinator: AnyObject, Observable {
    associatedtype Route: Hashable
    var path: NavigationPath { get set }
    var sheet: Route? { get set }
    var fullScreenCover: Route? { get set }
    func navigate(to route: Route)
    func pop()
    func popToRoot()
}

extension Coordinator {
    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func popToRoot() {
        path = NavigationPath()
    }
}
```

---

## App Coordinator

```swift
@Observable
@MainActor
class AppCoordinator {
    var isAuthenticated = false
    var selectedTab: AppTab = .home
    var deepLinkPending: DeepLink?

    // Child coordinators
    let homeCoordinator = HomeCoordinator()
    let searchCoordinator = SearchCoordinator()
    let profileCoordinator = ProfileCoordinator()

    func handleDeepLink(_ url: URL) {
        guard let deepLink = DeepLink(url: url) else { return }

        if !isAuthenticated {
            deepLinkPending = deepLink
            return
        }

        switch deepLink {
        case .product(let id):
            selectedTab = .home
            homeCoordinator.navigate(to: .productDetail(id: id))
        case .search(let query):
            selectedTab = .search
            searchCoordinator.navigate(to: .results(query: query))
        case .profile:
            selectedTab = .profile
        case .settings:
            selectedTab = .profile
            profileCoordinator.navigate(to: .settings)
        }
    }

    func didAuthenticate() {
        isAuthenticated = true
        if let pending = deepLinkPending {
            deepLinkPending = nil
            handleDeepLink(pending)
        }
    }
}

enum AppTab: Hashable {
    case home, search, profile
}

enum DeepLink {
    case product(id: String)
    case search(query: String)
    case profile
    case settings

    init?(url: URL) {
        let path = url.pathComponents.filter { $0 != "/" }
        switch path.first {
        case "product": self = .product(id: path[safe: 1] ?? "")
        case "search":
            let query = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "q" })?.value ?? ""
            self = .search(query: query)
        case "profile": self = .profile
        case "settings": self = .settings
        default: return nil
        }
    }

    // Reconstruct as URL for forwarding
    func handleDeepLink(_ deepLink: DeepLink) {
        // handled in AppCoordinator
    }
}
```

---

## Child Coordinator (Home)

```swift
@Observable
@MainActor
class HomeCoordinator: Coordinator {
    var path = NavigationPath()
    var sheet: HomeRoute?
    var fullScreenCover: HomeRoute?

    enum HomeRoute: Hashable {
        case productDetail(id: String)
        case category(name: String)
        case cart
        case checkout
        case orderConfirmation(orderId: String)
    }

    func navigate(to route: HomeRoute) {
        switch route {
        case .cart:
            sheet = .cart
        case .checkout:
            sheet = nil  // Dismiss cart first
            fullScreenCover = .checkout
        default:
            path.append(route)
        }
    }

    // Flow-specific navigation
    func startCheckoutFlow() {
        sheet = nil
        fullScreenCover = .checkout
    }

    func completeCheckout(orderId: String) {
        fullScreenCover = nil
        path.append(HomeRoute.orderConfirmation(orderId: orderId))
    }
}
```

---

## Coordinator-Driven Views

### Root View

```swift
struct AppRootView: View {
    @State private var coordinator = AppCoordinator()

    var body: some View {
        Group {
            if coordinator.isAuthenticated {
                MainTabView()
            } else {
                AuthView(onAuthenticated: coordinator.didAuthenticate)
            }
        }
        .environment(coordinator)
        .onOpenURL { url in
            coordinator.handleDeepLink(url)
        }
    }
}

struct MainTabView: View {
    @Environment(AppCoordinator.self) private var appCoordinator

    var body: some View {
        @Bindable var coordinator = appCoordinator

        TabView(selection: $coordinator.selectedTab) {
            Tab("Home", systemImage: "house", value: .home) {
                HomeCoordinatorView()
            }
            Tab("Search", systemImage: "magnifyingglass", value: .search) {
                SearchCoordinatorView()
            }
            Tab("Profile", systemImage: "person", value: .profile) {
                ProfileCoordinatorView()
            }
        }
    }
}
```

### Home Coordinator View

```swift
struct HomeCoordinatorView: View {
    @Environment(AppCoordinator.self) private var appCoordinator

    var body: some View {
        @Bindable var coordinator = appCoordinator.homeCoordinator

        NavigationStack(path: $coordinator.path) {
            HomeView()
                .navigationDestination(for: HomeCoordinator.HomeRoute.self) { route in
                    destinationView(for: route)
                }
        }
        .sheet(item: $coordinator.sheet) { route in
            sheetView(for: route)
        }
        .fullScreenCover(item: $coordinator.fullScreenCover) { route in
            fullScreenView(for: route)
        }
    }

    @ViewBuilder
    private func destinationView(for route: HomeCoordinator.HomeRoute) -> some View {
        switch route {
        case .productDetail(let id):
            ProductDetailView(productId: id)
        case .category(let name):
            CategoryView(name: name)
        case .orderConfirmation(let orderId):
            OrderConfirmationView(orderId: orderId)
        default:
            EmptyView()
        }
    }

    @ViewBuilder
    private func sheetView(for route: HomeCoordinator.HomeRoute) -> some View {
        switch route {
        case .cart:
            CartView(onCheckout: {
                appCoordinator.homeCoordinator.startCheckoutFlow()
            })
        default:
            EmptyView()
        }
    }

    @ViewBuilder
    private func fullScreenView(for route: HomeCoordinator.HomeRoute) -> some View {
        switch route {
        case .checkout:
            CheckoutView(onComplete: { orderId in
                appCoordinator.homeCoordinator.completeCheckout(orderId: orderId)
            })
        default:
            EmptyView()
        }
    }
}

// Make HomeRoute conform to Identifiable for sheet/fullScreenCover
extension HomeCoordinator.HomeRoute: Identifiable {
    var id: String {
        switch self {
        case .productDetail(let id): "product-\(id)"
        case .category(let name): "category-\(name)"
        case .cart: "cart"
        case .checkout: "checkout"
        case .orderConfirmation(let id): "order-\(id)"
        }
    }
}
```

---

## Views Using Coordinator

```swift
struct ProductDetailView: View {
    let productId: String
    @Environment(AppCoordinator.self) private var appCoordinator

    var body: some View {
        VStack {
            Text("Product \(productId)")

            Button("View Related Category") {
                appCoordinator.homeCoordinator.navigate(to: .category(name: "Electronics"))
            }

            Button("Add to Cart & View Cart") {
                // Add to cart logic...
                appCoordinator.homeCoordinator.navigate(to: .cart)
            }

            Button("Go Home") {
                appCoordinator.homeCoordinator.popToRoot()
            }
        }
    }
}
```

---

## Deep Linking Integration

```swift
// SceneDelegate or SwiftUI onOpenURL
struct DeepLinkHandler {
    static func handle(_ url: URL, coordinator: AppCoordinator) {
        // Universal Link: https://example.com/product/123
        // Custom URL: myapp://product/123

        let pathComponents: [String]
        if url.scheme == "https" {
            pathComponents = url.pathComponents.filter { $0 != "/" }
        } else {
            // Custom scheme: host is first component
            pathComponents = [url.host].compactMap { $0 } + url.pathComponents.filter { $0 != "/" }
        }

        guard let first = pathComponents.first else { return }

        switch first {
        case "product":
            guard let id = pathComponents[safe: 1] else { return }
            coordinator.selectedTab = .home
            coordinator.homeCoordinator.popToRoot()
            coordinator.homeCoordinator.navigate(to: .productDetail(id: id))

        case "search":
            let query = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "q" })?.value ?? ""
            coordinator.selectedTab = .search
            coordinator.searchCoordinator.navigate(to: .results(query: query))

        default:
            break
        }
    }
}
```

---

## Testing

```swift
import Testing

@Suite("HomeCoordinator")
struct HomeCoordinatorTests {

    @Test("navigates to product detail via path")
    @MainActor
    func navigateToProduct() {
        let coordinator = HomeCoordinator()
        coordinator.navigate(to: .productDetail(id: "123"))
        #expect(coordinator.path.count == 1)
    }

    @Test("cart opens as sheet")
    @MainActor
    func openCart() {
        let coordinator = HomeCoordinator()
        coordinator.navigate(to: .cart)
        #expect(coordinator.sheet == .cart)
        #expect(coordinator.path.isEmpty)
    }

    @Test("checkout flow dismisses cart and opens full screen")
    @MainActor
    func checkoutFlow() {
        let coordinator = HomeCoordinator()
        coordinator.navigate(to: .cart)
        coordinator.startCheckoutFlow()
        #expect(coordinator.sheet == nil)
        #expect(coordinator.fullScreenCover == .checkout)
    }

    @Test("popToRoot clears navigation stack")
    @MainActor
    func popToRoot() {
        let coordinator = HomeCoordinator()
        coordinator.navigate(to: .productDetail(id: "1"))
        coordinator.navigate(to: .category(name: "Books"))
        coordinator.popToRoot()
        #expect(coordinator.path.isEmpty)
    }
}

@Suite("AppCoordinator Deep Linking")
struct DeepLinkTests {

    @Test("deep link to product selects home tab")
    @MainActor
    func deepLinkProduct() {
        let coordinator = AppCoordinator()
        coordinator.isAuthenticated = true
        let url = URL(string: "myapp://product/456")!
        coordinator.handleDeepLink(url)
        #expect(coordinator.selectedTab == .home)
    }

    @Test("deep link deferred until authenticated")
    @MainActor
    func deferredDeepLink() {
        let coordinator = AppCoordinator()
        let url = URL(string: "myapp://product/456")!
        coordinator.handleDeepLink(url)
        #expect(coordinator.deepLinkPending != nil)
    }
}
```

---

## When to Use the Coordinator Pattern

| Scenario | Use Coordinator? |
|----------|-----------------|
| Simple app (3-5 screens) | Probably not; NavigationStack suffices |
| Deep linking required | Yes |
| Complex flows (onboarding, checkout) | Yes |
| Reusable navigation across tabs | Yes |
| Need testable navigation logic | Yes |
| Multiple presentation styles (push, sheet, cover) | Yes |
