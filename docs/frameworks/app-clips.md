# App Clips

App Clips are lightweight versions of your app that users can discover and launch instantly from NFC tags, QR codes, Safari Smart Banners, Maps, and Messages. They provide focused functionality without requiring a full app download, with a strict 15 MB size limit.

## App Clip Target Setup in Xcode

An App Clip is a separate target in your Xcode project that shares code with the main app through shared frameworks or file membership.

```swift
// 1. In Xcode: File > New > Target > App Clip
// 2. The App Clip target gets its own bundle identifier:
//    Main app: com.example.myapp
//    App Clip: com.example.myapp.Clip

// 3. App Clip entry point — same as a regular SwiftUI app
import SwiftUI

@main
struct MyAppClip: App {
    var body: some Scene {
        WindowGroup {
            AppClipRootView()
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    // Handle the invocation URL
                    handleInvocation(activity)
                }
        }
    }

    private func handleInvocation(_ activity: NSUserActivity) {
        guard let url = activity.webpageURL else { return }
        // Parse the URL to determine what to show
        // e.g., https://example.com/store/123 → show store 123
        AppClipRouter.shared.route(to: url)
    }
}

// 4. Share code between the main app and App Clip
// Use a shared framework or add files to both targets
// In Build Settings, set:
//   _APP_CLIP = 1  (for the App Clip target)

// Conditional compilation for target-specific code
#if APPCLIP
let isAppClip = true
#else
let isAppClip = false
#endif
```

## Invocation URLs and Advanced Matching

Configure invocation URLs in App Store Connect. Each URL maps to a specific App Clip experience.

```swift
import SwiftUI

// URL routing for the App Clip
@Observable
class AppClipRouter {
    static let shared = AppClipRouter()

    var currentExperience: AppClipExperience = .default

    enum AppClipExperience {
        case `default`
        case store(storeID: String)
        case product(productID: String)
        case orderPickup(orderID: String)
    }

    func route(to url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            currentExperience = .default
            return
        }

        let pathComponents = components.path.split(separator: "/").map(String.init)

        // Match URL patterns:
        // https://example.com/store/123        → Store experience
        // https://example.com/product/abc      → Product experience
        // https://example.com/order/pickup/789 → Order pickup
        switch (pathComponents.first, pathComponents.dropFirst().first) {
        case ("store", let storeID?):
            currentExperience = .store(storeID: storeID)
        case ("product", let productID?):
            currentExperience = .product(productID: productID)
        case ("order", _):
            if let orderID = pathComponents.last, pathComponents.contains("pickup") {
                currentExperience = .orderPickup(orderID: orderID)
            }
        default:
            currentExperience = .default
        }
    }
}

// Root view that renders based on the invocation URL
struct AppClipRootView: View {
    var router = AppClipRouter.shared

    var body: some View {
        Group {
            switch router.currentExperience {
            case .default:
                DefaultExperienceView()
            case .store(let storeID):
                StoreExperienceView(storeID: storeID)
            case .product(let productID):
                ProductExperienceView(productID: productID)
            case .orderPickup(let orderID):
                OrderPickupView(orderID: orderID)
            }
        }
    }
}
```

## NFC Tag and QR Code Triggers

App Clips can be triggered by NFC tags and QR codes that encode your registered invocation URL.

```swift
// NFC Tag Configuration:
// 1. Write an NDEF record to the NFC tag containing your invocation URL
// 2. The URL must match a registered App Clip experience in App Store Connect
// 3. Use Apple App Clip Codes (designed NFC + visual codes) for best UX

// QR Code Generation (for server or marketing team):
// The QR code simply encodes the invocation URL
// Example: https://appclip.example.com/store/downtown

// Reading NFC tag data within the App Clip (if needed)
import CoreNFC

class NFCReader: NSObject, NFCNDEFReaderSessionDelegate {
    var session: NFCNDEFReaderSession?

    func startScanning() {
        guard NFCNDEFReaderSession.readingAvailable else {
            print("NFC not available on this device")
            return
        }

        session = NFCNDEFReaderSession(
            delegate: self,
            queue: nil,
            invalidateAfterFirstRead: true
        )
        session?.alertMessage = "Hold your iPhone near the tag."
        session?.begin()
    }

    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        for message in messages {
            for record in message.records {
                if let url = record.wellKnownTypeURIPayload() {
                    print("NFC URL: \(url)")
                    Task { @MainActor in
                        AppClipRouter.shared.route(to: url)
                    }
                }
            }
        }
    }

    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        print("NFC session invalidated: \(error.localizedDescription)")
    }
}
```

## App Clip Card Configuration

The App Clip Card is the system UI that appears before the App Clip launches. Configure it in App Store Connect.

```swift
// App Clip Card metadata is set in App Store Connect, not in code:
// - Header image: 3000 x 2000 px recommended
// - Title: Your app name or experience title
// - Subtitle: Brief description (up to 56 characters)
// - Call-to-action button: "Open" (default) or custom text

// In your app, provide metadata for the card via the associated website
// Add this to your webpage's <head>:
//
// <meta name="apple-itunes-app"
//       content="app-id=123456789,
//                app-clip-bundle-id=com.example.myapp.Clip,
//                app-clip-display=card">

// Smart App Banner for Safari (also triggers App Clip Card)
// <meta name="apple-itunes-app" content="app-id=123456789">

// Programmatically check if running as App Clip
import StoreKit

struct AppClipBanner: View {
    @State private var showingFullAppOverlay = false

    var body: some View {
        VStack {
            Text("You're using the App Clip")
                .font(.headline)
            Text("Download the full app for all features.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}
```

## Size Limitations (15 MB)

App Clips must be under 15 MB (uncompressed, thinned for a specific device). Strategies to stay within the limit.

```swift
// Strategies to minimize App Clip size:

// 1. Share only necessary code — don't include unused frameworks
// In Build Phases, only include files the App Clip needs

// 2. Use on-demand resources for images and assets
// In the asset catalog, assign assets to "App Clip" tag
// Load them at runtime:
import Foundation

func loadOnDemandImage(tag: String) async throws -> Data {
    let request = NSBundleResourceRequest(tags: [tag])
    try await request.beginAccessingResources()
    // Access the resource
    guard let url = Bundle.main.url(forResource: "hero", withExtension: "jpg") else {
        throw AppClipError.resourceNotFound
    }
    let data = try Data(contentsOf: url)
    request.endAccessingResources()
    return data
}

enum AppClipError: Error {
    case resourceNotFound
}

// 3. Use SF Symbols instead of custom images where possible
// 4. Use system fonts instead of bundled custom fonts
// 5. Remove unused localizations
// 6. Use Asset Catalog slicing for images
// 7. Check size: Product > Archive > Distribute App > App Thinning report

// 8. Verify the thinned size:
// $ xcrun app-clip-size --app-clip-path path/to/MyAppClip.app
```

## App Group Data Handoff to Full App

Share data from the App Clip to the full app using App Groups so users don't lose progress.

```swift
import Foundation

// Both the App Clip and main app must have the same App Group entitlement:
// group.com.example.myapp.shared

struct SharedDataManager {
    static let suiteName = "group.com.example.myapp.shared"

    // Save data from App Clip for the full app to read
    static func saveFromAppClip(userPreferences: UserPreferences) {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }

        if let data = try? JSONEncoder().encode(userPreferences) {
            defaults.set(data, forKey: "userPreferences")
        }
        defaults.set(true, forKey: "hasAppClipData")
        defaults.set(Date(), forKey: "appClipLastUsed")
    }

    // Read App Clip data from the full app
    static func loadAppClipData() -> UserPreferences? {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return nil }
        guard defaults.bool(forKey: "hasAppClipData") else { return nil }

        guard let data = defaults.data(forKey: "userPreferences") else { return nil }
        return try? JSONDecoder().decode(UserPreferences.self, from: data)
    }

    // Share files via the shared container
    static var sharedContainerURL: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: suiteName)
    }

    static func saveOrderData(_ order: Order) throws {
        guard let containerURL = sharedContainerURL else {
            throw AppClipError.resourceNotFound
        }
        let fileURL = containerURL.appendingPathComponent("pending_order.json")
        let data = try JSONEncoder().encode(order)
        try data.write(to: fileURL)
    }

    static func loadPendingOrder() throws -> Order? {
        guard let containerURL = sharedContainerURL else { return nil }
        let fileURL = containerURL.appendingPathComponent("pending_order.json")
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
        let data = try Data(contentsOf: fileURL)
        return try JSONDecoder().decode(Order.self, from: data)
    }
}

struct UserPreferences: Codable {
    var favoriteStoreID: String?
    var preferredPaymentMethod: String?
    var hasCompletedOnboarding: Bool
}

struct Order: Codable {
    let id: String
    let items: [OrderItem]
    let total: Decimal
    let storeID: String
}

struct OrderItem: Codable {
    let name: String
    let quantity: Int
    let price: Decimal
}
```

## Location Confirmation with CLAppClipCodeLocation

Verify that the user is physically present at the expected location to prevent relay attacks.

```swift
import AppClip
import CoreLocation

class LocationVerifier {
    func verifyLocation(for activity: NSUserActivity) async -> Bool {
        // Check if the invocation included location data
        guard let payload = activity.appClipActivationPayload else {
            print("No App Clip activation payload")
            return false
        }

        // Define the expected region (set in App Store Connect)
        let expectedCenter = CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194)
        let expectedRegion = CLCircularRegion(
            center: expectedCenter,
            radius: 100,  // meters
            identifier: "store-downtown"
        )

        do {
            try await payload.confirmAcquired(in: expectedRegion)
            print("Location confirmed — user is at the expected location")
            return true
        } catch let error as APActivationPayloadError {
            switch error.code {
            case .disallowed:
                print("User denied location access")
            case .doesNotMatch:
                print("User is not at the expected location")
            @unknown default:
                print("Unknown location error: \(error)")
            }
            return false
        } catch {
            print("Location verification failed: \(error)")
            return false
        }
    }
}

// Use in the App Clip's onContinueUserActivity handler
struct LocationAwareAppClip: View {
    @State private var isVerified = false
    @State private var isVerifying = true
    let verifier = LocationVerifier()

    var body: some View {
        Group {
            if isVerifying {
                ProgressView("Verifying location...")
            } else if isVerified {
                StoreExperienceView(storeID: "downtown")
            } else {
                ContentUnavailableView(
                    "Location Required",
                    systemImage: "location.slash",
                    description: Text("Please visit the store to use this App Clip.")
                )
            }
        }
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
            Task {
                isVerified = await verifier.verifyLocation(for: activity)
                isVerifying = false
            }
        }
    }
}
```

## SKOverlay for Full App Promotion

Show an App Store overlay that encourages users to download the full app.

```swift
import StoreKit
import SwiftUI

// SwiftUI approach using appStoreOverlay
struct AppClipWithOverlay: View {
    @State private var showOverlay = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Thanks for your order!")
                .font(.title.bold())

            Text("Download the full app to earn rewards, track orders, and more.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button("Get the Full App") {
                showOverlay = true
            }
            .buttonStyle(.borderedProminent)
        }
        .appStoreOverlay(isPresented: $showOverlay) {
            SKOverlay.AppClipConfiguration(position: .bottom)
        }
        .onAppear {
            // Show overlay automatically after a delay
            Task {
                try? await Task.sleep(for: .seconds(3))
                showOverlay = true
            }
        }
    }
}

// UIKit approach for more control
import UIKit

class AppClipOverlayViewController: UIViewController, SKOverlayDelegate {
    private var overlay: SKOverlay?

    func presentFullAppOverlay() {
        let config = SKOverlay.AppClipConfiguration(position: .bottom)
        overlay = SKOverlay(configuration: config)
        overlay?.delegate = self

        guard let windowScene = view.window?.windowScene else { return }
        overlay?.present(in: windowScene)
    }

    func dismissOverlay() {
        guard let windowScene = view.window?.windowScene else { return }
        SKOverlay.dismiss(in: windowScene)
    }

    // SKOverlayDelegate
    func storeOverlayDidFinishDismissal(_ overlay: SKOverlay, transitionContext: SKOverlay.TransitionContext) {
        print("Overlay dismissed")
    }

    func storeOverlayDidFinishPresentation(_ overlay: SKOverlay, transitionContext: SKOverlay.TransitionContext) {
        print("Overlay presented")
    }

    func storeOverlay(_ overlay: SKOverlay, didFailToLoadWithError error: Error) {
        print("Overlay failed to load: \(error)")
    }
}
```

## Complete App Clip Example

A full coffee shop ordering App Clip that demonstrates invocation handling, location verification, ordering flow, data handoff, and full app promotion.

```swift
import SwiftUI
import AppClip
import StoreKit

// MARK: - App Entry Point

@main
struct CoffeeShopClip: App {
    @State private var router = ClipRouter()

    var body: some Scene {
        WindowGroup {
            ClipContentView()
                .environment(router)
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    router.handleInvocation(activity)
                }
        }
    }
}

// MARK: - Router

@Observable
class ClipRouter {
    var shopID: String?
    var isLocationVerified = false
    var isLoading = true

    func handleInvocation(_ activity: NSUserActivity) {
        guard let url = activity.webpageURL,
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            isLoading = false
            return
        }

        // Parse shop ID from URL: https://coffeeapp.example.com/shop/downtown
        let parts = components.path.split(separator: "/").map(String.init)
        if let shopIndex = parts.firstIndex(of: "shop"),
           shopIndex + 1 < parts.count {
            shopID = parts[shopIndex + 1]
        }

        // Verify location
        Task {
            await verifyLocation(activity)
            isLoading = false
        }
    }

    private func verifyLocation(_ activity: NSUserActivity) async {
        guard let payload = activity.appClipActivationPayload else {
            isLocationVerified = true  // Allow without location for testing
            return
        }

        let region = CLCircularRegion(
            center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
            radius: 200,
            identifier: "shop"
        )

        do {
            try await payload.confirmAcquired(in: region)
            isLocationVerified = true
        } catch {
            isLocationVerified = false
        }
    }
}

// MARK: - Content View

struct ClipContentView: View {
    @Environment(ClipRouter.self) private var router

    var body: some View {
        Group {
            if router.isLoading {
                ProgressView("Loading...")
            } else if let shopID = router.shopID {
                CoffeeOrderView(shopID: shopID)
            } else {
                ContentUnavailableView(
                    "Scan to Order",
                    systemImage: "qrcode.viewfinder",
                    description: Text("Scan a QR code at a participating coffee shop to start ordering.")
                )
            }
        }
    }
}

// MARK: - Order View

struct CoffeeOrderView: View {
    let shopID: String

    @State private var menuItems: [MenuItem] = MenuItem.sampleMenu
    @State private var cart: [CartItem] = []
    @State private var showCheckout = false
    @State private var showFullAppOverlay = false

    var cartTotal: Decimal {
        cart.reduce(0) { $0 + $1.menuItem.price * Decimal($1.quantity) }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Menu") {
                    ForEach(menuItems) { item in
                        MenuItemRow(item: item) {
                            addToCart(item)
                        }
                    }
                }

                if !cart.isEmpty {
                    Section("Your Order") {
                        ForEach(cart) { cartItem in
                            HStack {
                                Text(cartItem.menuItem.name)
                                Spacer()
                                Text("\(cartItem.quantity)x")
                                    .foregroundStyle(.secondary)
                                Text("$\(cartItem.menuItem.price * Decimal(cartItem.quantity))")
                                    .fontWeight(.medium)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Order Coffee")
            .toolbar {
                ToolbarItem(placement: .bottomBar) {
                    if !cart.isEmpty {
                        Button {
                            showCheckout = true
                        } label: {
                            HStack {
                                Text("Checkout")
                                Spacer()
                                Text("$\(cartTotal)")
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                    }
                }
            }
            .sheet(isPresented: $showCheckout) {
                CheckoutView(
                    cart: cart,
                    total: cartTotal,
                    shopID: shopID,
                    onComplete: {
                        showFullAppOverlay = true
                        saveOrderForFullApp()
                    }
                )
            }
            .appStoreOverlay(isPresented: $showFullAppOverlay) {
                SKOverlay.AppClipConfiguration(position: .bottom)
            }
        }
    }

    private func addToCart(_ item: MenuItem) {
        if let index = cart.firstIndex(where: { $0.menuItem.id == item.id }) {
            cart[index].quantity += 1
        } else {
            cart.append(CartItem(menuItem: item, quantity: 1))
        }
    }

    private func saveOrderForFullApp() {
        let order = Order(
            id: UUID().uuidString,
            items: cart.map { OrderItem(name: $0.menuItem.name, quantity: $0.quantity, price: $0.menuItem.price) },
            total: cartTotal,
            storeID: shopID
        )
        try? SharedDataManager.saveOrderData(order)
    }
}

// MARK: - Checkout View

struct CheckoutView: View {
    let cart: [CartItem]
    let total: Decimal
    let shopID: String
    let onComplete: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var isProcessing = false
    @State private var orderComplete = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if orderComplete {
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.green)

                        Text("Order Placed!")
                            .font(.title.bold())

                        Text("Your order will be ready in 5-10 minutes.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 40)
                } else {
                    List {
                        Section("Order Summary") {
                            ForEach(cart) { item in
                                HStack {
                                    Text("\(item.quantity)x \(item.menuItem.name)")
                                    Spacer()
                                    Text("$\(item.menuItem.price * Decimal(item.quantity))")
                                }
                            }
                        }

                        Section {
                            HStack {
                                Text("Total")
                                    .fontWeight(.bold)
                                Spacer()
                                Text("$\(total)")
                                    .fontWeight(.bold)
                            }
                        }
                    }

                    Button {
                        placeOrder()
                    } label: {
                        if isProcessing {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Pay $\(total)")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(isProcessing)
                    .padding()
                }

                Spacer()
            }
            .navigationTitle(orderComplete ? "Confirmed" : "Checkout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func placeOrder() {
        isProcessing = true
        Task {
            // Simulate payment processing
            try? await Task.sleep(for: .seconds(2))
            isProcessing = false
            orderComplete = true
            onComplete()
        }
    }
}

// MARK: - Supporting Views and Models

struct MenuItemRow: View {
    let item: MenuItem
    let onAdd: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.headline)
                Text(item.itemDescription)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text("$\(item.price)")
                .font(.subheadline.bold())
            Button {
                onAdd()
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.title3)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.blue)
        }
    }
}

struct MenuItem: Identifiable {
    let id = UUID()
    let name: String
    let itemDescription: String
    let price: Decimal

    static var sampleMenu: [MenuItem] {
        [
            MenuItem(name: "Espresso", itemDescription: "Rich single shot", price: 3.50),
            MenuItem(name: "Latte", itemDescription: "Espresso with steamed milk", price: 5.00),
            MenuItem(name: "Cold Brew", itemDescription: "Smooth, cold-steeped coffee", price: 4.50),
            MenuItem(name: "Matcha Latte", itemDescription: "Ceremonial grade matcha", price: 5.50),
            MenuItem(name: "Croissant", itemDescription: "Buttery, flaky pastry", price: 3.75)
        ]
    }
}

struct CartItem: Identifiable {
    let id = UUID()
    let menuItem: MenuItem
    var quantity: Int
}
```

## Key Considerations

- **Size limit**: App Clips must be under 15 MB (thinned, uncompressed). Check with `xcrun app-clip-size`.
- **Capabilities**: App Clips support Sign in with Apple, Apple Pay, notifications (for 8 hours after launch), and App Groups. They cannot access HealthKit, CallKit, or perform background networking.
- **Data persistence**: App Clip data may be deleted by the system after a period of inactivity. Use App Groups to hand off important data to the full app.
- **Invocation URLs**: Register all URLs in App Store Connect. URLs must use HTTPS. Each URL maps to one App Clip experience.
- **Apple App Clip Codes**: These are Apple-designed visual codes that combine NFC and visual scanning. Generate them in App Store Connect.
- **Notifications**: App Clips can request notification permission, but it expires 8 hours after last launch. Encourage users to download the full app for persistent notifications.
- **Sign in with Apple**: Credentials are shared between the App Clip and full app if both use the same team ID.
- **Testing**: Use the `_XCAppClipURL` environment variable in the Xcode scheme to simulate invocation URLs during development.
