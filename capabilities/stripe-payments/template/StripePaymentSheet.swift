import UIKit
import StripePaymentSheet

@MainActor
final class StripeCheckout {
    private let sheet: PaymentSheet
    init(paymentIntentClientSecret: String, merchantName: String, publishableKey: String) {
        STPAPIClient.shared.publishableKey = publishableKey
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = merchantName
        sheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration)
    }
    func present(from controller: UIViewController, completion: @escaping (PaymentSheetResult) -> Void) {
        sheet.present(from: controller, completion: completion)
    }
}
