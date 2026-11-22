import StoreKit
import UIKit

/// Seat management for Apple-hosted group subscriptions. Obtain the entitlement
/// from Transaction.currentEntitlements. The invitation action requires the
/// purchaser's own subscription and its original Apple-hosted invitation model.
@MainActor
enum GroupSubscription {
    enum Failure: Error {
        case newerSDKRequired, invalidEntitlement
    }

    static func canOfferSeatPurchase(for product: Product) -> Bool {
        #if IOS_AGENT_STOREKIT_MULTISEAT
        if #available(iOS 27.3, *) {
            return product.type == .autoRenewable && product.supportsMultiSeatPurchase
        }
        #endif
        return false
    }

    static func invite(from presenter: UIViewController, productID: String,
                       entitlement: VerificationResult<Transaction>) async throws {
        #if IOS_AGENT_STOREKIT_MULTISEAT
        if #available(iOS 27.3, *) {
            guard case let .verified(transaction) = entitlement,
                  transaction.productID == productID,
                  transaction.ownershipType == .purchased,
                  transaction.multiSeatInfo?.invitationManagement == .apple,
                  transaction.revocationDate == nil, !transaction.isUpgraded else {
                throw Failure.invalidEntitlement
            }
            try await AppStore.presentMultiSeatInvitationSheet(
                from: presenter, originalTransactionID: transaction.originalID)
            return
        }
        #endif
        throw Failure.newerSDKRequired
    }
}
