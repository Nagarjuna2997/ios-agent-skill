# RevenueCat subscriptions

Adds the `RevenueCat` product from `purchases-ios-spm` and `RevenueCatStore`, an observable wrapper for offerings, purchases and entitlements.

## Use

```swift
RevenueCatStore.shared.configure()
await RevenueCatStore.shared.loadOfferings()
if let package = RevenueCatStore.shared.packages.first {
    await RevenueCatStore.shared.purchase(package)
}
let premium = RevenueCatStore.shared.isEntitled("premium")
```

## Rules

From [StoreKit](../../docs/frameworks/storekit.md):

- RevenueCat sits on StoreKit; App Store rules for digital goods still apply.
- Configure once, early, with the public Apple API key only.
- Offer restore purchases.
