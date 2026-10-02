# StoreKit 2 subscriptions and paywall

`StoreModel` loads products, buys, restores and keeps `isPremium` current from verified transactions. `PaywallView` presents the products. A `Products.storekit` configuration with two placeholder subscriptions is set as the Run scheme's StoreKit configuration, so purchases work in the simulator from Xcode without App Store Connect.

## Use

```swift
@State private var store = StoreModel(productIDs: StoreProducts.all, service: StoreKitPurchaseService())

RootView()
    .environment(store)
    .task { await store.load() }
    .task { await store.listenForTransactions() }

.sheet(isPresented: $showPaywall) {
    PaywallView(model: store, features: ["Unlimited orders", "Priority support"])
}
```

## Rules

From [StoreKit](../../docs/frameworks/storekit.md):

- Digital content and subscriptions use in-app purchase; physical goods use Apple Pay or a payment processor.
- Only verified transactions unlock features; finish every transaction.
- Listen to `Transaction.updates` for purchases made elsewhere, renewals and refunds.
- Offer restore. Show price, period and terms clearly.
- Product ids and prices in `Products.storekit` are placeholders. Create real products in App Store Connect with the same ids before release ([StoreKit testing](../../docs/apple/technologies/storekittest.md)).
