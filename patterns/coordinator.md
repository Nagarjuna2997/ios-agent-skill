# Coordinator Pattern in SwiftUI

The Coordinator pattern decouples navigation logic from views and ViewModels, centralizing flow control so that screens remain reusable and unaware of where they live in the navigation hierarchy.

## Core Protocol

```swift
import SwiftUI

// MARK: - Coordinator Protocol

@MainActor
protocol Coordinator: AnyObject, ObservableObject {
    associatedtype Content: View

    var navigationPath: NavigationPath { get set }
    var childCoordinators: [any Coordinator] { get set }

    @ViewBuilder func start() -> Content
}

extension Coordinator {
    func addChild(_ coordinator: some Coordinator) {
        childCoordinators.append(coordinator)
    }

    func removeChild(_ coordinator: some Coordinator) {
        childCoordinators.removeAll { $0 === coordinator }
    }

    func popToRoot() {
        navigationPath = NavigationPath()
    }
}
```

## Route Definition

Define routes as an enum that the coordinator resolves into views.

```swift
// MARK: - App Routes

enum AppRoute: Hashable {
    case home
    case profile(userId: String)
    case settings
    case detail(itemId: String)
}

enum AuthRoute: Hashable {
    case login
    case register
    case forgotPassword(email: String?)
    case verifyOTP(phoneNumber: String)
}

enum OnboardingRoute: Hashable {
    case welcome
    case permissions
    case profileSetup
    case complete
}
```

## AppCoordinator (Root)

The root coordinator owns top-level navigation and manages child coordinators for feature flows.

```swift
// MARK: - AppCoordinator

@MainActor
final class AppCoordinator: Coordinator, ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var childCoordinators: [any Coordinator] = []
    @Published var currentFlow: AppFlow = .loading

    enum AppFlow {
        case loading
        case onboarding
        case auth
        case main
    }

    private let authService: AuthServiceProtocol
    private let userDefaults: UserDefaults

    init(authService: AuthServiceProtocol, userDefaults: UserDefaults = .standard) {
        self.authService = authService
        self.userDefaults = userDefaults
    }

    func start() -> some View {
        AppCoordinatorView(coordinator: self)
    }

    func determineInitialFlow() {
        if !userDefaults.bool(forKey: "hasCompletedOnboarding") {
            currentFlow = .onboarding
        } else if authService.isAuthenticated {
            currentFlow = .main
        } else {
            currentFlow = .auth
        }
    }

    func navigate(to route: AppRoute) {
        navigationPath.append(route)
    }

    func completeOnboarding() {
        userDefaults.set(true, forKey: "hasCompletedOnboarding")
        currentFlow = .auth
    }

    func completeAuth() {
        currentFlow = .main
    }

    func signOut() {
        navigationPath = NavigationPath()
        childCoordinators.removeAll()
        currentFlow = .auth
    }

    @ViewBuilder
    func resolve(route: AppRoute) -> some View {
        switch route {
        case .home:
            HomeView(coordinator: self)
        case .profile(let userId):
            ProfileView(userId: userId, coordinator: self)
        case .settings:
            SettingsView(coordinator: self)
        case .detail(let itemId):
            DetailView(itemId: itemId, coordinator: self)
        }
    }
}
```

## AppCoordinator View

```swift
// MARK: - AppCoordinator View

struct AppCoordinatorView: View {
    @ObservedObject var coordinator: AppCoordinator

    var body: some View {
        Group {
            switch coordinator.currentFlow {
            case .loading:
                ProgressView("Loading...")
                    .task { coordinator.determineInitialFlow() }

            case .onboarding:
                OnboardingCoordinatorView(
                    coordinator: OnboardingCoordinator(
                        parent: coordinator
                    )
                )

            case .auth:
                AuthCoordinatorView(
                    coordinator: AuthCoordinator(
                        parent: coordinator
                    )
                )

            case .main:
                NavigationStack(path: $coordinator.navigationPath) {
                    HomeView(coordinator: coordinator)
                        .navigationDestination(for: AppRoute.self) { route in
                            coordinator.resolve(route: route)
                        }
                }
            }
        }
        .animation(.easeInOut(duration: 0.3), value: coordinator.currentFlow)
    }
}
```

## Child Coordinator: Auth Flow

```swift
// MARK: - Auth Coordinator

@MainActor
final class AuthCoordinator: Coordinator, ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var childCoordinators: [any Coordinator] = []

    private weak var parent: AppCoordinator?

    init(parent: AppCoordinator) {
        self.parent = parent
        parent.addChild(self)
    }

    func start() -> some View {
        AuthCoordinatorView(coordinator: self)
    }

    func navigate(to route: AuthRoute) {
        navigationPath.append(route)
    }

    func didCompleteLogin() {
        parent?.removeChild(self)
        parent?.completeAuth()
    }

    @ViewBuilder
    func resolve(route: AuthRoute) -> some View {
        switch route {
        case .login:
            LoginView(coordinator: self)
        case .register:
            RegisterView(coordinator: self)
        case .forgotPassword(let email):
            ForgotPasswordView(prefillEmail: email, coordinator: self)
        case .verifyOTP(let phoneNumber):
            OTPVerificationView(phoneNumber: phoneNumber, coordinator: self)
        }
    }
}

struct AuthCoordinatorView: View {
    @ObservedObject var coordinator: AuthCoordinator

    var body: some View {
        NavigationStack(path: $coordinator.navigationPath) {
            LoginView(coordinator: coordinator)
                .navigationDestination(for: AuthRoute.self) { route in
                    coordinator.resolve(route: route)
                }
        }
    }
}
```

## Child Coordinator: Onboarding Flow

```swift
// MARK: - Onboarding Coordinator

@MainActor
final class OnboardingCoordinator: Coordinator, ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var childCoordinators: [any Coordinator] = []
    @Published var currentStep: OnboardingRoute = .welcome

    private weak var parent: AppCoordinator?

    init(parent: AppCoordinator) {
        self.parent = parent
        parent.addChild(self)
    }

    func start() -> some View {
        OnboardingCoordinatorView(coordinator: self)
    }

    func advance() {
        switch currentStep {
        case .welcome:      currentStep = .permissions
        case .permissions:  currentStep = .profileSetup
        case .profileSetup: currentStep = .complete
        case .complete:
            parent?.removeChild(self)
            parent?.completeOnboarding()
        }
    }

    func skip() {
        parent?.removeChild(self)
        parent?.completeOnboarding()
    }
}

struct OnboardingCoordinatorView: View {
    @ObservedObject var coordinator: OnboardingCoordinator

    var body: some View {
        TabView(selection: $coordinator.currentStep) {
            WelcomeStepView(coordinator: coordinator)
                .tag(OnboardingRoute.welcome)
            PermissionsStepView(coordinator: coordinator)
                .tag(OnboardingRoute.permissions)
            ProfileSetupStepView(coordinator: coordinator)
                .tag(OnboardingRoute.profileSetup)
        }
        .tabViewStyle(.page(indexDisplayMode: .always))
        .animation(.easeInOut, value: coordinator.currentStep)
    }
}
```

## Deep Linking Through Coordinators

```swift
// MARK: - Deep Link Handler

enum DeepLink {
    case profile(userId: String)
    case item(itemId: String)
    case settings
    case auth(AuthRoute)

    init?(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else { return nil }

        let pathComponents = components.path
            .split(separator: "/")
            .map(String.init)

        switch host {
        case "profile":
            guard let userId = pathComponents.first else { return nil }
            self = .profile(userId: userId)
        case "item":
            guard let itemId = pathComponents.first else { return nil }
            self = .item(itemId: itemId)
        case "settings":
            self = .settings
        case "auth":
            if pathComponents.first == "reset" {
                let email = components.queryItems?
                    .first(where: { $0.name == "email" })?.value
                self = .auth(.forgotPassword(email: email))
            } else {
                self = .auth(.login)
            }
        default:
            return nil
        }
    }
}

extension AppCoordinator {
    func handleDeepLink(_ deepLink: DeepLink) {
        // Ensure user is authenticated for protected routes
        switch deepLink {
        case .profile(let userId):
            guard currentFlow == .main else {
                // Store pending deep link for after auth
                return
            }
            navigationPath = NavigationPath()
            navigate(to: .profile(userId: userId))

        case .item(let itemId):
            guard currentFlow == .main else { return }
            navigationPath = NavigationPath()
            navigate(to: .detail(itemId: itemId))

        case .settings:
            guard currentFlow == .main else { return }
            navigationPath = NavigationPath()
            navigate(to: .settings)

        case .auth(let authRoute):
            if currentFlow != .auth {
                currentFlow = .auth
            }
            // The auth coordinator handles internal navigation
        }
    }
}
```

## App Entry Point with Deep Linking

```swift
// MARK: - App Entry Point

@main
struct MyApp: App {
    @StateObject private var coordinator = AppCoordinator(
        authService: AuthService.shared
    )

    var body: some Scene {
        WindowGroup {
            coordinator.start()
                .onOpenURL { url in
                    if let deepLink = DeepLink(url: url) {
                        coordinator.handleDeepLink(deepLink)
                    }
                }
        }
    }
}
```

## Coordinator Lifecycle Management

```swift
// MARK: - Lifecycle Awareness

extension AppCoordinator {
    /// Call when the app enters the background.
    func appDidEnterBackground() {
        // Persist navigation state if needed.
        // Cancel non-essential child coordinator work.
        for child in childCoordinators {
            if let cancellable = child as? CancellableCoordinator {
                cancellable.cancelPendingWork()
            }
        }
    }

    /// Call when the app returns to the foreground.
    func appWillEnterForeground() {
        // Refresh auth state -- user session may have expired.
        if !authService.isAuthenticated && currentFlow == .main {
            signOut()
        }
    }

    /// Clean up a child coordinator and its descendants.
    func tearDown(_ coordinator: some Coordinator) {
        for child in coordinator.childCoordinators {
            tearDown(child)
        }
        coordinator.childCoordinators.removeAll()
        removeChild(coordinator)
    }
}

protocol CancellableCoordinator: Coordinator {
    func cancelPendingWork()
}
```

## Guidelines

- Coordinators own `NavigationPath` and route resolution. Views never push destinations directly.
- Use `weak` references from child to parent to avoid retain cycles.
- Each coordinator manages its own `NavigationStack` (or contributes `navigationDestination` to a parent stack).
- Store pending deep links when the user is not yet in the correct flow, and replay them after authentication or onboarding completes.
- Remove child coordinators as soon as their flow finishes to free memory.
- Keep route enums `Hashable` so they work with `NavigationPath`.
