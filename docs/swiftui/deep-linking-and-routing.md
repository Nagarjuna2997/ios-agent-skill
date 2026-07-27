# Routing, Deep Links, and State Restoration

**Load this when:** adding navigation to more than two screens, handling a URL
scheme or universal link, restoring navigation state across launches, or
reviewing anything that mutates a `NavigationPath`.

`docs/swiftui/navigation.md` covers the navigation *APIs*.
`patterns/coordinator.md` covers the coordinator *pattern*.
This document covers the piece that breaks in production: making a single typed
route model the only way navigation state changes, so a deep link, a button tap,
and a restored session all go through the same code.

---

## 1. Typed Routes

Model every destination as a value. Strings and `Any` in a `NavigationPath` are
how you get silent no-op links.

```swift
// Navigation/Route.swift
enum Route: Hashable, Codable, Sendable {
    case productDetail(id: Product.ID)
    case category(Product.Category)
    case orderHistory
    case orderDetail(id: Order.ID)
    case settings
    case profile(userID: User.ID)
}

// Modal presentation is a different axis — model it separately.
enum Sheet: Identifiable, Hashable {
    case checkout(cart: [CartItem])
    case editProfile
    case filter

    var id: Self { self }
}

enum FullScreenRoute: Identifiable, Hashable {
    case onboarding
    case paywall(trigger: String)

    var id: Self { self }
}
```

`Codable` conformance is what makes state restoration possible (§4). Add it now
even if you do not restore yet — retrofitting it later means touching every case.

---

## 2. The Router

One `@MainActor @Observable` object owns navigation state. Views send it intent;
they never mutate a path directly.

```swift
// Navigation/Router.swift
@MainActor
@Observable
final class Router {
    var path = NavigationPath()
    var sheet: Sheet?
    var fullScreen: FullScreenRoute?

    // MARK: Stack

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

    /// Replaces the entire stack — used by deep links so a link never
    /// accumulates screens on top of wherever the user happened to be.
    func replaceStack(with routes: [Route]) {
        var newPath = NavigationPath()
        for route in routes { newPath.append(route) }
        path = newPath
    }

    // MARK: Modals

    func present(_ sheet: Sheet) { self.sheet = sheet }
    func present(_ route: FullScreenRoute) { fullScreen = route }
    func dismissModal() { sheet = nil; fullScreen = nil }
}
```

### Wiring it once, at the root

```swift
struct RootView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            ProductListView()
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                }
        }
        .environment(router)
        .sheet(item: $router.sheet) { sheet in
            switch sheet {
            case .checkout(let cart): CheckoutView(cart: cart)
            case .editProfile:        EditProfileView()
            case .filter:             FilterView()
            }
        }
        .fullScreenCover(item: $router.fullScreen) { route in
            switch route {
            case .onboarding:            OnboardingView()
            case .paywall(let trigger):  PaywallView(trigger: trigger)
            }
        }
    }

    // One exhaustive switch. The compiler catches every route you forget to handle.
    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .productDetail(let id):  ProductDetailView(id: id)
        case .category(let category): CategoryView(category: category)
        case .orderHistory:           OrderHistoryView()
        case .orderDetail(let id):    OrderDetailView(id: id)
        case .settings:               SettingsView()
        case .profile(let userID):    ProfileView(userID: userID)
        }
    }
}
```

### Views send intent

```swift
struct ProductRow: View {
    @Environment(Router.self) private var router
    let product: Product

    var body: some View {
        Button {
            router.push(.productDetail(id: product.id))
        } label: {
            ProductRowContent(product: product)
        }
    }
}
```

`NavigationLink(value:)` is equally fine for a plain push and keeps the row
accessible for free. Use the router when the destination depends on logic
(auth checks, A/B branching, analytics side effects).

### Anti-patterns

```swift
// WRONG — a screen that owns its own NavigationStack cannot be pushed
// onto another one. You get a nested stack and a doubled navigation bar.
struct ProductDetailView: View {
    var body: some View { NavigationStack { … } }   // only the ROOT has a stack
}

// WRONG — deprecated, and it silently breaks programmatic navigation.
NavigationView { … }
NavigationLink(destination: DetailView(), isActive: $isActive) { … }

// WRONG — untyped path. A mismatched type is a silent no-op, not an error.
path.append("product-\(id)")

// WRONG — every view reaching into the path directly. Now nothing can
// enforce an invariant like "checkout requires a signed-in user".
@Environment(Router.self) var router
router.path.append(Route.checkout)     // use router.push(_:)

// WRONG — navigation state on a screen's view model. Two screens now
// disagree about what is on the stack.
@Observable final class ProductListViewModel { var path = NavigationPath() }
```

---

## 3. Deep Links

### Parse into routes, then apply

Separate **parsing** (pure, testable, no UI) from **applying** (mutates the
router). This is what makes deep links unit-testable without launching the app.

```swift
// Navigation/DeepLink.swift
struct DeepLink: Equatable {
    var tab: AppTab
    var routes: [Route]
    var sheet: Sheet?
}

enum DeepLinkParser {
    /// Pure function: URL in, intent out. No side effects, no router.
    static func parse(_ url: URL) -> DeepLink? {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return nil
        }

        switch (components.scheme, components.host) {
        // Custom scheme: myshop://product/1234
        case ("myshop", let host?):
            return parsePath(host: host, segments: pathSegments(components), query: components)

        // Universal link: https://shop.example.com/product/1234
        case ("https", "shop.example.com"):
            var segments = pathSegments(components)
            guard !segments.isEmpty else { return DeepLink(tab: .home, routes: []) }
            let host = segments.removeFirst()
            return parsePath(host: host, segments: segments, query: components)

        default:
            return nil
        }
    }

    private static func pathSegments(_ components: URLComponents) -> [String] {
        components.path.split(separator: "/").map(String.init)
    }

    private static func parsePath(
        host: String,
        segments: [String],
        query components: URLComponents
    ) -> DeepLink? {
        switch host {
        case "product":
            guard let raw = segments.first, let id = Product.ID(uuidString: raw) else { return nil }
            return DeepLink(tab: .home, routes: [.productDetail(id: id)])

        case "category":
            guard let raw = segments.first,
                  let category = Product.Category(rawValue: raw) else { return nil }
            return DeepLink(tab: .home, routes: [.category(category)])

        case "orders":
            // /orders            -> the list
            // /orders/<uuid>     -> the list, then the detail pushed on top,
            //                       so Back goes somewhere sensible.
            guard let raw = segments.first else {
                return DeepLink(tab: .orders, routes: [.orderHistory])
            }
            guard let id = Order.ID(uuidString: raw) else { return nil }
            return DeepLink(tab: .orders, routes: [.orderHistory, .orderDetail(id: id)])

        case "checkout":
            return DeepLink(tab: .home, routes: [], sheet: .checkout(cart: []))

        default:
            return nil                                   // unknown -> ignore, never crash
        }
    }
}
```

Two details that matter:

- **A deep link builds the whole stack, not just the leaf.** Landing on an order
  detail with an empty back stack strands the user.
- **An unrecognised URL returns `nil`.** It must never crash and never navigate
  somewhere arbitrary. Log it and stay put.

### Applying

```swift
extension Router {
    func handle(_ url: URL) {
        guard let link = DeepLinkParser.parse(url) else {
            Logger.navigation.warning("Unhandled deep link: \(url, privacy: .public)")
            return
        }
        apply(link)
    }

    func apply(_ link: DeepLink) {
        dismissModal()                       // never open a link behind a sheet
        selectedTab = link.tab
        replaceStack(with: link.routes)
        if let sheet = link.sheet { present(sheet) }
    }
}

@main
struct ShopApp: App {
    @State private var router = Router()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(router)
                .onOpenURL { router.handle($0) }
                // Universal links arrive as a user activity, not onOpenURL.
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    guard let url = activity.webpageURL else { return }
                    router.handle(url)
                }
        }
    }
}
```

### Links that arrive before the app is ready

A link can land during launch, before sign-in resolves. Queue it rather than
dropping it:

```swift
@MainActor
@Observable
final class Router {
    private var pendingLink: DeepLink?
    var isReady = false {
        didSet { if isReady { flushPendingLink() } }
    }

    func apply(_ link: DeepLink) {
        guard isReady else { pendingLink = link; return }
        // … as above
    }

    private func flushPendingLink() {
        guard let link = pendingLink else { return }
        pendingLink = nil
        apply(link)
    }
}
```

Set `isReady = true` once the session is loaded and the root UI is on screen.
The same queue handles links that require authentication: present the login
sheet, keep `pendingLink`, flush it after a successful sign-in.

### Configuration

```xml
<!-- Info.plist — custom scheme -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.example.myshop</string>
        <key>CFBundleURLSchemes</key>
        <array><string>myshop</string></array>
    </dict>
</array>
```

Universal links additionally need the **Associated Domains** capability
(`applinks:shop.example.com`) and an `apple-app-site-association` file served
from `https://shop.example.com/.well-known/` over HTTPS with no redirects.
Prefer universal links: they work when the app is not installed, and they cannot
be hijacked by another app registering the same scheme.

### Testing the parser

Because parsing is pure, this needs no simulator:

```swift
@Suite("DeepLinkParser")
struct DeepLinkParserTests {
    private func url(_ string: String) -> URL { URL(string: string)! }

    @Test("product link builds a single-screen stack")
    func productLink() throws {
        let id = UUID()
        let link = try #require(DeepLinkParser.parse(url("myshop://product/\(id)")))
        #expect(link.tab == .home)
        #expect(link.routes == [.productDetail(id: id)])
    }

    @Test("order detail keeps the list underneath it")
    func orderDetailStack() throws {
        let id = UUID()
        let link = try #require(DeepLinkParser.parse(url("myshop://orders/\(id)")))
        #expect(link.routes == [.orderHistory, .orderDetail(id: id)])
    }

    @Test("universal link parses the same as the custom scheme")
    func universalLink() throws {
        let id = UUID()
        let custom = DeepLinkParser.parse(url("myshop://product/\(id)"))
        let web = DeepLinkParser.parse(url("https://shop.example.com/product/\(id)"))
        #expect(custom == web)
    }

    @Test("malformed links are ignored, not fatal", arguments: [
        "myshop://product/not-a-uuid",
        "myshop://nonsense",
        "https://evil.example.com/product/123",
        "myshop://"
    ])
    func malformed(_ string: String) {
        #expect(DeepLinkParser.parse(url(string)) == nil)
    }
}
```

---

## 4. State Restoration

`NavigationPath` has a `CodableRepresentation` that works when **every** route
in it is `Codable` and `Hashable`. That is the payoff for §1.

```swift
extension Router {
    /// nil when the path holds a non-Codable value — fail quietly, never crash.
    var encodedPath: Data? {
        guard let representation = path.codable else { return nil }
        return try? JSONEncoder().encode(representation)
    }

    func restorePath(from data: Data) {
        guard let representation = try? JSONDecoder()
            .decode(NavigationPath.CodableRepresentation.self, from: data)
        else { return }
        path = NavigationPath(representation)
    }
}
```

### Persisting per scene

```swift
struct RootView: View {
    @Environment(Router.self) private var router
    @SceneStorage("navigation.path") private var storedPath: Data?

    var body: some View {
        NavigationStack(path: Bindable(router).path) {
            ProductListView()
                .navigationDestination(for: Route.self) { destination(for: $0) }
        }
        .task {
            if let storedPath { router.restorePath(from: storedPath) }
        }
        .onChange(of: router.path) {
            storedPath = router.encodedPath
        }
    }
}
```

`@SceneStorage` is the right tool: it is per-window (correct on iPad and
visionOS, where two windows have different stacks) and the system clears it when
the user explicitly closes the scene.

**Restore defensively.** A restored route may point at a product that has since
been deleted or a screen behind a subscription that has lapsed. Destination
views must handle a missing entity with a `ContentUnavailableView`, not a force
unwrap. Validate before restoring anything sensitive:

```swift
func restorePath(from data: Data, isSignedIn: Bool) {
    guard isSignedIn else { return }        // never restore into a gated screen
    // … decode as above
}
```

---

## 5. Multiple Stacks (Tabs)

Each tab owns its own path. A single shared `NavigationPath` across tabs will
push the wrong screen into the wrong tab.

```swift
enum AppTab: String, Hashable, CaseIterable, Codable {
    case home, search, orders, profile
}

@MainActor
@Observable
final class Router {
    var selectedTab: AppTab = .home
    private var paths: [AppTab: NavigationPath] = [:]

    subscript(tab: AppTab) -> NavigationPath {
        get { paths[tab] ?? NavigationPath() }
        set { paths[tab] = newValue }
    }

    func push(_ route: Route, in tab: AppTab? = nil) {
        let target = tab ?? selectedTab
        paths[target, default: NavigationPath()].append(route)
    }

    /// Tapping the active tab again pops it to root — expected iOS behaviour.
    func select(_ tab: AppTab) {
        if selectedTab == tab {
            paths[tab] = NavigationPath()
        } else {
            selectedTab = tab
        }
    }
}

struct AppTabView: View {
    @Environment(Router.self) private var router

    var body: some View {
        @Bindable var router = router

        TabView(selection: Binding(
            get: { router.selectedTab },
            set: { router.select($0) }        // routes through the pop-to-root rule
        )) {
            ForEach(AppTab.allCases, id: \.self) { tab in
                NavigationStack(path: Binding(
                    get: { router[tab] },
                    set: { router[tab] = $0 }
                )) {
                    rootView(for: tab)
                        .navigationDestination(for: Route.self) { destination(for: $0) }
                }
                .tabItem { Label(tab.title, systemImage: tab.systemImage) }
                .tag(tab)
            }
        }
    }
}
```

---

## 6. Router vs Coordinator

| Use | When |
|-----|------|
| `NavigationLink(value:)` alone | 1–3 screens, no deep links, no conditional destinations |
| A single `Router` (this document) | Most apps: typed routes, deep links, restoration |
| Coordinators (`patterns/coordinator.md`) | Independent flows with their own lifecycle — onboarding, auth, checkout — especially when a team owns each flow as a module |

Do not start with coordinators. Start with a `Router`, and split a flow out only
when its navigation rules stop fitting in one exhaustive switch.

---

## Checklist

- [ ] Exactly one `NavigationStack` per tab, owned by the root — never inside a
      pushed screen.
- [ ] Routes are a `Hashable, Codable, Sendable` enum; nothing is appended as a
      `String`.
- [ ] Views call `router.push(_:)`; nothing mutates `path` directly.
- [ ] `DeepLinkParser.parse` is pure and unit-tested, including malformed input.
- [ ] Deep links build a full back stack and dismiss any open modal first.
- [ ] An unknown URL logs and no-ops. It never crashes and never navigates blind.
- [ ] Universal links handled via `onContinueUserActivity`, not just `onOpenURL`.
- [ ] Links arriving before the app is ready are queued, not dropped.
- [ ] Restored destinations tolerate deleted entities and revoked access.
- [ ] `Router` is `@MainActor @Observable final class`.
