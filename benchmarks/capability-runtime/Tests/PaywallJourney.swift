import XCTest
import StoreKit
import StoreKitTest
@testable import CapabilityRuntime

@MainActor final class PaywallJourney: XCTestCase {
    func testLocalPurchaseRestoreAndRefund() async throws {
        continueAfterFailure = false
        let file = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Products", withExtension: "storekit"))
        let session = try SKTestSession(contentsOf: file)
        session.resetToDefaultState()
        session.disableDialogs = true
        session.clearTransactions()
        defer { session.clearTransactions() }
        let store = StoreModel(productIDs: StoreProducts.all, service: StoreKitPurchaseService())
        let updates = Task { await store.listenForTransactions() }
        defer { updates.cancel() }
        await store.load()
        XCTAssertFalse(store.isPremium)
        let monthly = try XCTUnwrap(store.products.first { $0.id == StoreProducts.monthly })
        print("RUNTIME_CONTRACT buying configured local product")
        await store.buy(monthly)
        print("RUNTIME_CONTRACT purchase completed")
        XCTAssertTrue(store.isPremium, "Purchase must grant premium")
        XCTAssertTrue(store.entitled.contains(monthly.id))
        let restored = StoreModel(productIDs: StoreProducts.all, service: StoreKitPurchaseService())
        // StoreKit automatically restores currentEntitlements for a newly created
        // model. AppStore.sync() is the separately authenticated UI path.
        await restored.load()
        print("RUNTIME_CONTRACT fresh model loaded current entitlements")
        XCTAssertEqual(restored.state, .idle)
        XCTAssertTrue(restored.entitled.contains(monthly.id))
        let transaction = try XCTUnwrap(session.allTransactions().first { $0.productIdentifier == monthly.id })
        print("RUNTIME_CONTRACT refunding local transaction")
        try session.refundTransaction(identifier: transaction.identifier)
        for _ in 0..<30 {
            await restored.load()
            if !restored.isPremium { break }
            try await Task.sleep(for: .milliseconds(200))
        }
        XCTAssertEqual(restored.state, .idle)
        XCTAssertFalse(restored.entitled.contains(monthly.id), "Refund must remove entitlement")
        XCTAssertFalse(restored.isPremium)
    }
}
