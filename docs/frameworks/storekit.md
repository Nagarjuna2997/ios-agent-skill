# StoreKit 2

## Product and Product.SubscriptionInfo

```swift
import StoreKit

// Define product identifiers
enum ProductID {
    static let weeklySubscription = "com.myapp.weekly"
    static let monthlySubscription = "com.myapp.monthly"
    static let yearlySubscription = "com.myapp.yearly"
    static let premiumLifetime = "com.myapp.premium.lifetime"
    static let coinPack100 = "com.myapp.coins.100"

    static let allSubscriptions = [weeklySubscription, monthlySubscription, yearlySubscription]
    static let allProducts = allSubscriptions + [premiumLifetime, coinPack100]
}

// Fetch products
@Observable
class StoreManager {
    var products: [Product] = []
    var purchasedProductIDs: Set<String> = []
    var isLoading = false

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            products = try await Product.products(for: ProductID.allProducts)
            products.sort { $0.price < $1.price }
        } catch {
            print("Failed to load products: \(error)")
        }
    }

    // Access subscription info
    func subscriptionDetails(for product: Product) -> (period: String, introOffer: String?)? {
        guard let subscription = product.subscription else { return nil }

        let period: String
        switch subscription.subscriptionPeriod.unit {
        case .day: period = "\(subscription.subscriptionPeriod.value) day(s)"
        case .week: period = "\(subscription.subscriptionPeriod.value) week(s)"
        case .month: period = "\(subscription.subscriptionPeriod.value) month(s)"
        case .year: period = "\(subscription.subscriptionPeriod.value) year(s)"
        @unknown default: period = "Unknown"
        }

        var introOffer: String?
        if let offer = subscription.introductoryOffer {
            switch offer.paymentMode {
            case .freeTrial:
                introOffer = "Free trial for \(offer.period.value) \(offer.period.unit)"
            case .payAsYouGo:
                introOffer = "\(offer.displayPrice) per \(offer.period.unit) for \(offer.periodCount) periods"
            case .payUpFront:
                introOffer = "\(offer.displayPrice) for \(offer.periodCount) \(offer.period.unit)(s)"
            default:
                break
            }
        }
        return (period, introOffer)
    }
}
```

## Purchase Flow

```swift
extension StoreManager {

    func purchase(_ product: Product) async throws -> Transaction? {
        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await updatePurchasedProducts()
            return transaction

        case .userCancelled:
            return nil

        case .pending:
            // Transaction requires approval (Ask to Buy, SCA)
            return nil

        @unknown default:
            return nil
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw StoreError.verificationFailed(error)
        case .verified(let safe):
            return safe
        }
    }

    // Restore purchases
    func restorePurchases() async {
        try? await AppStore.sync()
        await updatePurchasedProducts()
    }
}

enum StoreError: LocalizedError {
    case verificationFailed(Error)
    case purchaseFailed

    var errorDescription: String? {
        switch self {
        case .verificationFailed(let error): return "Verification failed: \(error.localizedDescription)"
        case .purchaseFailed: return "Purchase failed"
        }
    }
}
```

## Transaction Verification and Listening

```swift
extension StoreManager {

    // Check current entitlements on app launch
    func updatePurchasedProducts() async {
        var purchased = Set<String>()

        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                purchased.insert(transaction.productID)
            }
        }
        purchasedProductIDs = purchased
    }

    // Listen for transaction updates (renewals, refunds, etc.)
    func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)

                    // Handle the transaction
                    await self.updatePurchasedProducts()
                    await transaction.finish()
                } catch {
                    print("Transaction verification failed: \(error)")
                }
            }
        }
    }

    var isPremium: Bool {
        !purchasedProductIDs.intersection(
            Set(ProductID.allSubscriptions + [ProductID.premiumLifetime])
        ).isEmpty
    }
}
```

## Subscription Management

```swift
extension StoreManager {

    // Get current subscription status
    func subscriptionStatus() async -> Product.SubscriptionInfo.Status? {
        guard let product = products.first(where: { $0.subscription != nil }) else { return nil }

        do {
            let statuses = try await product.subscription?.status ?? []
            return statuses.first { status in
                switch status.state {
                case .subscribed, .inGracePeriod, .inBillingRetryPeriod:
                    return true
                default:
                    return false
                }
            }
        } catch {
            return nil
        }
    }

    // Check renewal info
    func renewalInfo() async -> Product.SubscriptionInfo.RenewalInfo? {
        guard let status = await subscriptionStatus() else { return nil }
        if case .verified(let renewalInfo) = status.renewalInfo {
            return renewalInfo
        }
        return nil
    }

    // Open subscription management
    func manageSubscriptions() async {
        guard let windowScene = await UIApplication.shared.connectedScenes.first as? UIWindowScene else { return }
        try? await AppStore.showManageSubscriptions(in: windowScene)
    }
}

// SwiftUI subscription store view (iOS 17+)
struct PaywallView: View {
    let productIDs = ProductID.allSubscriptions

    var body: some View {
        SubscriptionStoreView(productIDs: productIDs) {
            VStack {
                Image(systemName: "crown.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.yellow)
                Text("Upgrade to Premium")
                    .font(.largeTitle.bold())
                Text("Unlock all features and content")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .subscriptionStoreControlStyle(.prominentPicker)
        .storeButton(.visible, for: .restorePurchases)
    }
}
```

## StoreKit Configuration for Testing

Create a StoreKit Configuration file in Xcode for local testing:

1. File > New > File > StoreKit Configuration File
2. Add products matching your App Store Connect products
3. Edit Scheme > Options > StoreKit Configuration > select your file

```swift
// Test transaction history in unit tests
import StoreKitTest

class StoreTests: XCTestCase {
    var session: SKTestSession!

    override func setUp() async throws {
        session = try SKTestSession(configurationFileNamed: "Products")
        session.disableDialogs = true
        session.clearTransactions()
    }

    func testPurchase() async throws {
        let products = try await Product.products(for: [ProductID.monthlySubscription])
        let product = try XCTUnwrap(products.first)
        let result = try await product.purchase()

        if case .success(let verification) = result,
           case .verified(let transaction) = verification {
            XCTAssertEqual(transaction.productID, ProductID.monthlySubscription)
            await transaction.finish()
        } else {
            XCTFail("Purchase should succeed")
        }
    }

    func testExpiredSubscription() async throws {
        // Buy then expire
        try session.buyProduct(productIdentifier: ProductID.monthlySubscription)
        try session.expireSubscription(productIdentifier: ProductID.monthlySubscription)

        let store = StoreManager()
        await store.updatePurchasedProducts()
        XCTAssertFalse(store.isPremium)
    }
}
```

## App Store Server API

```swift
// Server-side verification (call from your backend, not the app)
// The app sends the transaction's originalID or JWS to your server.

// In the app: get the transaction JWS for server verification
func getTransactionJWS(for productID: String) async -> String? {
    for await result in Transaction.currentEntitlements {
        if case .verified(let transaction) = result,
           transaction.productID == productID {
            return transaction.jsonRepresentation.base64EncodedString()
        }
    }
    return nil
}

// Check entitlement from AppTransaction (app-level receipt)
func verifyAppInstallation() async throws {
    let result = try await AppTransaction.shared
    switch result {
    case .verified(let appTransaction):
        let originalAppVersion = appTransaction.originalAppVersion
        print("Original purchase version: \(originalAppVersion)")
    case .unverified(_, let error):
        throw error
    }
}
```
