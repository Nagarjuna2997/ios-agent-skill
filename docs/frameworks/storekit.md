# StoreKit 2

StoreKit 2 is Apple's modern Swift-native framework for in-app purchases and subscriptions. It replaces the original StoreKit with async/await APIs, automatic transaction verification, and a cleaner purchase flow.

## Product and Product.SubscriptionInfo

### Loading Products

```swift
import StoreKit

class StoreManager: ObservableObject {
    @Published var products: [Product] = []

    // Define product identifiers matching App Store Connect
    let productIDs: Set<String> = [
        "com.app.premium.monthly",
        "com.app.premium.yearly",
        "com.app.gems.100",
        "com.app.unlock.feature"
    ]

    func loadProducts() async {
        do {
            let storeProducts = try await Product.products(for: productIDs)

            // Sort by type and price
            products = storeProducts.sorted { $0.price < $1.price }

            for product in products {
                print("ID: \(product.id)")
                print("Display name: \(product.displayName)")
                print("Description: \(product.description)")
                print("Price: \(product.displayPrice)")
                print("Type: \(product.type)")  // .consumable, .nonConsumable, .autoRenewable, .nonRenewable
            }
        } catch {
            print("Failed to load products: \(error)")
        }
    }
}
```

### Subscription Info

```swift
func checkSubscriptionInfo(for product: Product) async {
    guard let subscription = product.subscription else {
        print("Not a subscription product")
        return
    }

    // Subscription properties
    print("Period: \(subscription.subscriptionPeriod)")           // e.g., 1 month
    print("Group ID: \(subscription.subscriptionGroupID)")
    print("Is eligible for intro offer: \(subscription.isEligibleForIntroOffer)")

    // Check subscription status
    if let statuses = try? await subscription.status {
        for status in statuses {
            switch status.state {
            case .subscribed:
                print("Active subscription")
            case .expired:
                print("Subscription expired")
            case .revoked:
                print("Subscription revoked")
            case .inGracePeriod:
                print("In grace period")
            case .inBillingRetryPeriod:
                print("Billing retry")
            default:
                print("Unknown state")
            }

            // Access renewal info
            if let renewalInfo = try? status.renewalInfo.payloadValue {
                print("Will renew: \(renewalInfo.willAutoRenew)")
                print("Auto-renew product: \(renewalInfo.autoRenewPreference ?? "none")")
                print("Expiration reason: \(String(describing: renewalInfo.expirationReason))")
            }
        }
    }
}
```

## Purchase Flow (Product.purchase())

```swift
class PurchaseManager: ObservableObject {
    @Published var purchasedProductIDs: Set<String> = []

    func purchase(_ product: Product) async throws -> Transaction? {
        // Optional: set purchase options
        let result = try await product.purchase(options: [
            .appAccountToken(UUID())  // Associate purchase with user account
        ])

        switch result {
        case .success(let verification):
            // Verify the transaction
            let transaction = try checkVerified(verification)

            // Deliver content
            await deliverContent(for: transaction)

            // CRITICAL: Always finish the transaction
            await transaction.finish()

            return transaction

        case .userCancelled:
            print("User cancelled the purchase")
            return nil

        case .pending:
            // Transaction requires approval (e.g., Ask to Buy)
            print("Purchase pending approval")
            return nil

        @unknown default:
            return nil
        }
    }

    func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw StoreError.verificationFailed(error)
        case .verified(let value):
            return value
        }
    }

    func deliverContent(for transaction: Transaction) async {
        purchasedProductIDs.insert(transaction.productID)
        // Update your app's state, unlock features, add consumables, etc.
    }
}

enum StoreError: Error {
    case verificationFailed(VerificationResult<Transaction>.VerificationError)
    case purchaseFailed
}
```

## Transaction Verification and Listener

Start the listener as early as possible (typically in your App init) to handle transactions completed outside of the purchase flow such as renewals, Ask to Buy approvals, and refunds.

```swift
@main
struct MyApp: App {
    @StateObject private var storeManager = StoreManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(storeManager)
                .task {
                    await storeManager.listenForTransactions()
                    await storeManager.checkEntitlements()
                }
        }
    }
}

extension StoreManager {
    func listenForTransactions() async {
        // Iterate through any transactions that are not yet finished
        for await result in Transaction.updates {
            do {
                let transaction = try checkVerified(result)
                await deliverContent(for: transaction)
                await transaction.finish()
            } catch {
                print("Transaction verification failed: \(error)")
            }
        }
    }

    // Check current entitlements on launch
    func checkEntitlements() async {
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                purchasedProductIDs.insert(transaction.productID)
            } catch {
                print("Entitlement verification failed: \(error)")
            }
        }
    }

    // Get the latest transaction for a specific product
    func latestTransaction(for productID: String) async -> Transaction? {
        guard let result = await Transaction.latest(for: productID) else {
            return nil
        }
        return try? checkVerified(result)
    }

    func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let value):
            return value
        }
    }
}
```

## Subscription Management and Status

```swift
class SubscriptionManager: ObservableObject {
    @Published var subscriptionGroupStatus: Product.SubscriptionInfo.Status?

    func updateSubscriptionStatus(products: [Product]) async {
        guard let groupID = products.first?.subscription?.subscriptionGroupID else { return }

        do {
            let statuses = try await Product.SubscriptionInfo.status(for: groupID)

            for status in statuses {
                guard case .verified(let renewalInfo) = status.renewalInfo,
                      case .verified(let transaction) = status.transaction else {
                    continue
                }

                switch status.state {
                case .subscribed:
                    print("Subscribed to: \(transaction.productID)")
                    print("Expires: \(transaction.expirationDate?.formatted() ?? "never")")
                    subscriptionGroupStatus = status

                case .expired:
                    if renewalInfo.gracePeriodExpirationDate != nil {
                        print("In grace period")
                    }

                case .revoked:
                    print("Revoked on: \(transaction.revocationDate?.formatted() ?? "")")

                case .inBillingRetryPeriod:
                    print("Billing retry - still provide access")
                    subscriptionGroupStatus = status

                case .inGracePeriod:
                    print("Grace period - still provide access")
                    subscriptionGroupStatus = status

                default:
                    break
                }
            }
        } catch {
            print("Failed to check status: \(error)")
        }
    }

    // Show the system manage subscriptions sheet
    func showManageSubscriptions() async {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene else { return }
        do {
            try await AppStore.showManageSubscriptions(in: windowScene)
        } catch {
            print("Failed to show manage subscriptions: \(error)")
        }
    }
}
```

## Offer Codes and Promotional Offers

```swift
extension StoreManager {
    // Present the system offer code redemption sheet
    func presentOfferCodeRedemption() async {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene else { return }
        do {
            try await AppStore.presentOfferCodeRedeemSheet(in: windowScene)
        } catch {
            print("Failed to present offer code sheet: \(error)")
        }
    }

    // Check introductory offer eligibility
    func checkIntroEligibility(for product: Product) async -> Bool {
        guard let subscription = product.subscription else { return false }
        return await subscription.isEligibleForIntroOffer
    }

    // Purchase with promotional offer (requires server-signed offer)
    func purchaseWithPromotionalOffer(
        _ product: Product,
        offerID: String,
        keyID: String,
        nonce: UUID,
        signature: Data,
        timestamp: Int
    ) async throws -> Transaction? {
        let offer = Product.PurchaseOption.promotionalOffer(
            offerID: offerID,
            keyID: keyID,
            nonce: nonce,
            signature: signature,
            timestamp: timestamp
        )

        let result = try await product.purchase(options: [offer])

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            return transaction
        case .userCancelled, .pending:
            return nil
        @unknown default:
            return nil
        }
    }
}
```

## StoreKit Configuration File for Testing

Create a StoreKit configuration file in Xcode: File > New > File > StoreKit Configuration File.

### Xcode Configuration Steps

1. Create a `.storekit` configuration file in your project
2. Add subscription groups and products with IDs matching your code
3. Set the configuration in your scheme: Edit Scheme > Run > Options > StoreKit Configuration
4. Products defined here are available in the simulator and SwiftUI previews

### Configuration Options

- **Subscription Group**: Group related subscription tiers with upgrade/downgrade ordering
- **Introductory Offer**: Free trial, pay-up-front, or pay-as-you-go
- **Promotional Offer**: Discounted pricing for existing or lapsed subscribers
- **Localization**: Add localized display names and descriptions per region
- **Price**: Set price in your base currency; Xcode simulates other currencies

### Synced Configuration (Xcode 14+)

Instead of a local file you can sync your StoreKit configuration directly from App Store Connect. This ensures product definitions match your live setup.

## Testing in Sandbox Environment

```swift
// Sandbox testing on device:
// 1. Create sandbox tester in App Store Connect > Users and Access > Sandbox
// 2. Sign in on device: Settings > App Store > Sandbox Account
// 3. Sandbox subscriptions renew at accelerated rates:
//    - 1 week  = 3 minutes
//    - 1 month = 5 minutes
//    - 1 year  = 1 hour
// 4. Subscriptions auto-renew up to 6 times then expire

// StoreKit Testing in Xcode (local .storekit file):
// - Use Transaction Manager: Debug > StoreKit > Manage Transactions
// - Approve or decline Ask to Buy transactions
// - Refund transactions
// - Trigger billing retry and grace period scenarios
// - Speed up or expire subscriptions
// - Force interrupted purchases

#if DEBUG
extension StoreManager {
    func debugPrintAllTransactions() async {
        var transactions: [Transaction] = []
        for await result in Transaction.all {
            if let transaction = try? checkVerified(result) {
                transactions.append(transaction)
            }
        }
        print("Total transactions: \(transactions.count)")
        for t in transactions {
            print("  \(t.productID) - \(t.purchaseDate) - revoked: \(t.revocationDate != nil)")
        }
    }
}
#endif
```

## Complete Purchase Flow Example

```swift
import SwiftUI
import StoreKit

struct PaywallView: View {
    @StateObject private var store = StoreManager()
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 20) {
            Text("Upgrade to Premium")
                .font(.largeTitle.bold())

            ForEach(store.products, id: \.id) { product in
                ProductCard(product: product) {
                    Task {
                        await purchaseProduct(product)
                    }
                }
                .disabled(isPurchasing || store.purchasedProductIDs.contains(product.id))
            }

            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }

            Button("Restore Purchases") {
                Task { await store.checkEntitlements() }
            }
        }
        .padding()
        .task {
            await store.loadProducts()
        }
    }

    func purchaseProduct(_ product: Product) async {
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            if let transaction = try await store.purchase(product) {
                print("Purchased: \(transaction.productID)")
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct ProductCard: View {
    let product: Product
    let onPurchase: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(product.displayName)
                .font(.headline)
            Text(product.description)
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                Text(product.displayPrice)
                    .font(.title2.bold())
                if let subscription = product.subscription {
                    Text("/ \(subscription.subscriptionPeriod.debugDescription)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Button("Subscribe", action: onPurchase)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(12)
    }
}

// SubscriptionStoreView (iOS 17+) - Apple's built-in paywall UI
struct SimplePaywall: View {
    var body: some View {
        SubscriptionStoreView(groupID: "your_group_id") {
            VStack {
                Image(systemName: "star.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.yellow)
                Text("Unlock Premium Features")
                    .font(.title.bold())
            }
        }
        .subscriptionStoreButtonLabel(.multiline)
        .subscriptionStorePickerItemBackground(.thinMaterial)
        .storeButton(.visible, for: .restorePurchases)
    }
}
```
