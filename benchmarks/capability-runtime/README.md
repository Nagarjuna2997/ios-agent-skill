# Capability runtime contracts

This benchmark builds copies of the repository’s SwiftData controller, StoreKit service and local product configuration inside a small iOS app. It creates and removes a dedicated simulator. The SwiftData UI test writes a unique value, terminates the app, and checks the value after a new launch. The StoreKit unit test uses an Xcode StoreKit test session to buy, restore and refund a subscription through the generated paywall model.

The second build changes only the temporary template copies. It forces the persistent store into memory and makes premium access always return false. Both named tests must fail at their expected assertions. Compilation errors, skipped tests, and a failure in the wrong assertion cannot satisfy that control. A fresh output directory holds separate XCTest bundles, logs, and receipts with template hashes. External provider verification is recorded separately.

From the repository root, with Xcode, XcodeGen and the selected runtime installed:

```sh
python3 benchmarks/capability-runtime/run.py /tmp/new-capability-contracts \
  --runtime com.apple.CoreSimulator.SimRuntime.iOS-27-2 \
  --device-type com.apple.CoreSimulator.SimDeviceType.iPhone-17e
```

Production StoreKit accounts, Apple-hosted transactions, and CloudKit sync are outside this local fixture.

The fresh paywall model restores its entitlement through StoreKit’s current transaction state. The separate user-initiated Restore Purchases button uses `AppStore.sync()`, which displayed an Apple Account sign-in prompt in the disposable simulator. Interactive account authentication is outside the automatic contract. [Apple’s sync documentation](https://developer.apple.com/documentation/storekit/appstore/sync())
