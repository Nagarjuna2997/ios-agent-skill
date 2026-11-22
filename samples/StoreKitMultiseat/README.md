# StoreKit multiseat management

This optional iOS sample accompanies the StoreKit 2 paywall. Use `canOfferSeatPurchase(for:)` to decide whether to show a group-purchase entry point. Customers on earlier OS versions keep the regular paywall. The sample demonstrates the product check and invitation API. It does not implement checkout, member assignment, or backend consent storage.

Build with Xcode 27.3 beta 2 or newer and define `IOS_AGENT_STOREKIT_MULTISEAT` in Swift Active Compilation Conditions to include group management. An OS availability guard alone cannot make a new symbol compile with an older SDK. Omit the definition when compiling against earlier SDKs.

After the customer selects **Invite members**, pass the current, verified purchaser entitlement for the product and a presenting view controller to `GroupSubscription.invite`. The sample checks ownership type `.purchased` and the transaction's invitation model `.apple` because existing groups can differ from today's App Store Connect setting. Assigned and family-shared recipients cannot open the purchaser's sheet. Handle thrown errors in the calling view. The sheet expects the original transaction ID, including on renewal. The subscription group ID identifies a different object. The same distinction applies to data-sharing consent.

Run from the repository root:

```sh
python3 samples/StoreKitMultiseat/verify.py
```

Use `--require-multiseat` in a CI lane with the newer SDK. The script typechecks both compilation modes when supported. Use an eligible configured product and purchaser in Apple's sandbox to verify invitations and consent on a device. Compilation alone does not exercise purchases or invitations.

- [iOS 27.3 beta 2 migration notes](https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-27_3-release-notes)
- [Product.supportsMultiSeatPurchase](https://developer.apple.com/documentation/storekit/product/supportsmultiseatpurchase)
- [StoreKit invitation management](https://developer.apple.com/documentation/storekit/transaction/multiseatinfo-swift.struct/invitationmanagement-swift.struct)
- [StoreKit group purchase configuration](https://developer.apple.com/documentation/storekit/supporting-multiseat-purchases-in-your-app)
