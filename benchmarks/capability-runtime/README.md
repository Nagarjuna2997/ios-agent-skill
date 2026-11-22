# Capability runtime contracts

This benchmark builds copies of the repository’s SwiftData controller, StoreKit service and local product configuration inside a small iOS app. It creates and removes a dedicated simulator. The SwiftData UI test writes a unique value, terminates the app, and checks the value after a new launch. The StoreKit test creates a local subscription using `SKTestSession.buyProduct` and requires the transaction’s environment to be Xcode. The shipped paywall model reads the active entitlement, recovers it in a fresh model, and observes its removal after the test session refunds the subscription.

The second build changes only the temporary template copies. It forces the persistent store into memory and makes premium access always return false. Both named tests must fail at their expected assertions. Compilation errors, skipped tests, and a failure in the wrong assertion cannot satisfy that control. A fresh output directory holds separate XCTest bundles, logs, and receipts with template hashes. External provider verification is recorded separately.

From the repository root, with Xcode, XcodeGen and the selected runtime installed:

```sh
python3 benchmarks/capability-runtime/run.py /tmp/new-capability-contracts \
  --runtime com.apple.CoreSimulator.SimRuntime.iOS-27-2 \
  --device-type com.apple.CoreSimulator.SimDeviceType.iPhone-17e
```

Production StoreKit accounts, Apple-hosted transactions, and CloudKit sync are outside this local fixture.

The app’s interactive purchase path (`Product.purchase()`) and user-initiated Restore Purchases button (`AppStore.sync()`) can present Apple Account sign-in. These paths remain unverified. A disposable simulator displayed the sign-in dialog during direct purchase on iOS 27.2. [Apple’s sync documentation](https://developer.apple.com/documentation/storekit/appstore/sync())
