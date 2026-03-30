import Observation
import SwiftUI

// MARK: - Route Definition

/// Define all navigable routes in your app.
enum Route: Hashable {
    case home
    case detail(id: String)
    case profile(userId: String)
    case settings
    case settingsDetail(SettingsRoute)
}

enum SettingsRoute: Hashable {
    case appearance
    case notifications
    case privacy
    case about
}

// MARK: - Router

@Observable
@MainActor
final class Router {
    var path = NavigationPath()
    var sheet: Route?
    var fullScreenCover: Route?

    // MARK: - Navigation

    func push(_ route: Route) {
        path.append(route)
    }

    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func popToRoot() {
        path.removeLast(path.count)
    }

    func replace(with route: Route) {
        popToRoot()
        push(route)
    }

    // MARK: - Modal Presentation

    func presentSheet(_ route: Route) {
        sheet = route
    }

    func presentFullScreenCover(_ route: Route) {
        fullScreenCover = route
    }

    func dismissSheet() {
        sheet = nil
    }

    func dismissFullScreenCover() {
        fullScreenCover = nil
    }

    // MARK: - Deep Linking

    func handleDeepLink(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else { return }

        switch host {
        case "home":
            popToRoot()
        case "detail":
            if let id = components.queryItems?.first(where: { $0.name == "id" })?.value {
                popToRoot()
                push(.detail(id: id))
            }
        case "profile":
            if let userId = components.queryItems?.first(where: { $0.name == "userId" })?.value {
                popToRoot()
                push(.profile(userId: userId))
            }
        case "settings":
            popToRoot()
            push(.settings)
        default:
            break
        }
    }
}

// MARK: - Router View

struct RouterView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeScreen()
                .navigationDestination(for: Route.self) { route in
                    destinationView(for: route)
                }
        }
        .sheet(item: $router.sheet) { route in
            NavigationStack {
                destinationView(for: route)
            }
        }
        .fullScreenCover(item: $router.fullScreenCover) { route in
            NavigationStack {
                destinationView(for: route)
            }
        }
        .environment(router)
        .onOpenURL { url in
            router.handleDeepLink(url)
        }
    }

    @ViewBuilder
    private func destinationView(for route: Route) -> some View {
        switch route {
        case .home:
            HomeScreen()
        case .detail(let id):
            DetailScreen(id: id)
        case .profile(let userId):
            ProfileScreen(userId: userId)
        case .settings:
            SettingsScreen()
        case .settingsDetail(let settingsRoute):
            settingsDetailView(for: settingsRoute)
        }
    }

    @ViewBuilder
    private func settingsDetailView(for route: SettingsRoute) -> some View {
        switch route {
        case .appearance:
            Text("Appearance Settings")
        case .notifications:
            Text("Notification Settings")
        case .privacy:
            Text("Privacy Settings")
        case .about:
            Text("About")
        }
    }
}

// Make Route conform to Identifiable for sheet/fullScreenCover
extension Route: Identifiable {
    var id: String {
        switch self {
        case .home: return "home"
        case .detail(let id): return "detail-\(id)"
        case .profile(let userId): return "profile-\(userId)"
        case .settings: return "settings"
        case .settingsDetail(let route): return "settings-\(route)"
        }
    }
}

// MARK: - Example Screens

struct HomeScreen: View {
    @Environment(Router.self) private var router

    var body: some View {
        List {
            Button("Go to Detail") {
                router.push(.detail(id: "123"))
            }
            Button("Go to Profile") {
                router.push(.profile(userId: "user-1"))
            }
            Button("Open Settings Sheet") {
                router.presentSheet(.settings)
            }
        }
        .navigationTitle("Home")
    }
}

struct DetailScreen: View {
    let id: String
    @Environment(Router.self) private var router

    var body: some View {
        VStack {
            Text("Detail: \(id)")
            Button("Go to Profile") {
                router.push(.profile(userId: "user-1"))
            }
            Button("Back to Root") {
                router.popToRoot()
            }
        }
        .navigationTitle("Detail")
    }
}

struct ProfileScreen: View {
    let userId: String

    var body: some View {
        Text("Profile: \(userId)")
            .navigationTitle("Profile")
    }
}

struct SettingsScreen: View {
    @Environment(Router.self) private var router

    var body: some View {
        List {
            Button("Appearance") { router.push(.settingsDetail(.appearance)) }
            Button("Notifications") { router.push(.settingsDetail(.notifications)) }
            Button("Privacy") { router.push(.settingsDetail(.privacy)) }
            Button("About") { router.push(.settingsDetail(.about)) }
        }
        .navigationTitle("Settings")
    }
}
