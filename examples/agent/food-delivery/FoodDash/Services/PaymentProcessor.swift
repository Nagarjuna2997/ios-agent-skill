import Foundation
import StoreKit

protocol PaymentProcessing: Sendable {
    func pay(totalCents: Int) async throws -> PurchaseOutcome
}

enum PaymentError: LocalizedError {
    case productUnavailable

    var errorDescription: String? {
        "Payment is not available right now. Check the StoreKit configuration and try again."
    }
}

/// Pays through a StoreKit 2 consumable product.
struct StoreKitPaymentProcessor: PaymentProcessing {
    static let productID = "com.example.fooddash.order"

    func pay(totalCents: Int) async throws -> PurchaseOutcome {
        guard let product = try await Product.products(for: [Self.productID]).first else {
            throw PaymentError.productUnavailable
        }
        switch try await product.purchase() {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            return .purchased(String(transaction.id))
        case .pending:
            return .pending
        case .userCancelled:
            return .cancelled
        @unknown default:
            return .cancelled
        }
    }
}

/// For previews: succeeds without StoreKit.
struct PreviewPaymentProcessor: PaymentProcessing {
    func pay(totalCents: Int) async throws -> PurchaseOutcome {
        try await Task.sleep(for: .milliseconds(400))
        return .purchased("preview-transaction")
    }
}
