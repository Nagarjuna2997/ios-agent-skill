import PassKit
import SwiftUI

struct PaymentLine: Hashable, Sendable {
    let label: String
    let amount: Decimal
}

enum ApplePayConfiguration {
    static let networks: [PKPaymentNetwork] = [.visa, .masterCard, .amex, .discover]

    /// nil until APPLE_PAY_MERCHANT_ID replaces the placeholder.
    static var merchantID: String? {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "APPLE_PAY_MERCHANT_ID") as? String,
              value.hasPrefix("merchant.") else { return nil }
        return value
    }

    static var canPay: Bool {
        PKPaymentAuthorizationController.canMakePayments(usingNetworks: networks)
    }

    static func request(lines: [PaymentLine], merchantID: String, currencyCode: String, countryCode: String) -> PKPaymentRequest {
        let request = PKPaymentRequest()
        request.merchantIdentifier = merchantID
        request.merchantCapabilities = .threeDSecure
        request.supportedNetworks = networks
        request.currencyCode = currencyCode
        request.countryCode = countryCode
        request.paymentSummaryItems = lines.map { PKPaymentSummaryItem(label: $0.label, amount: NSDecimalNumber(decimal: $0.amount)) }
        return request
    }
}

struct ApplePayCheckoutButton: View {
    let lines: [PaymentLine]
    let merchantName: String
    var currencyCode = "USD"
    var countryCode = "US"
    /// Forward `payment.token.paymentData` to your server, then report the outcome.
    let onAuthorize: (PKPayment, @escaping (Bool) -> Void) -> Void

    var body: some View {
        if let merchantID = ApplePayConfiguration.merchantID, ApplePayConfiguration.canPay {
            PayWithApplePayButton(.checkout, request: ApplePayConfiguration.request(lines: lines, merchantID: merchantID, currencyCode: currencyCode, countryCode: countryCode)) { phase in
                switch phase {
                case .didAuthorize(let payment, let resultHandler):
                    onAuthorize(payment) { success in
                        resultHandler(PKPaymentAuthorizationResult(status: success ? .success : .failure, errors: nil))
                    }
                default:
                    break
                }
            }
            .frame(height: 50)
        } else {
            Label("Apple Pay is not set up yet. Add APPLE_PAY_MERCHANT_ID to .env and rebuild.", systemImage: "creditcard")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    ApplePayCheckoutButton(lines: [PaymentLine(label: "Sample", amount: 9.99)], merchantName: "Sample") { _, complete in
        complete(true)
    }
    .padding()
}
