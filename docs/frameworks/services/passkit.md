# PassKit & FinanceKit

## PKPaymentRequest Setup

Configure Apple Pay with merchant details and supported networks.

```swift
import PassKit

func makePaymentRequest(amount: Decimal) -> PKPaymentRequest {
    let request = PKPaymentRequest()
    request.merchantIdentifier = "merchant.com.yourapp.pay"
    request.supportedNetworks = [.visa, .masterCard, .amex, .discover]
    request.merchantCapabilities = [.capability3DS, .capabilityDebit, .capabilityCredit]
    request.countryCode = "US"
    request.currencyCode = "USD"

    let item = PKPaymentSummaryItem(
        label: "My App Purchase",
        amount: NSDecimalNumber(decimal: amount)
    )
    let total = PKPaymentSummaryItem(
        label: "Your Company",
        amount: NSDecimalNumber(decimal: amount),
        type: .final
    )
    request.paymentSummaryItems = [item, total]

    // Optional: require shipping
    request.requiredShippingContactFields = [.postalAddress, .emailAddress]
    request.requiredBillingContactFields = [.postalAddress]

    // Shipping methods
    let standard = PKShippingMethod(label: "Standard", amount: NSDecimalNumber(value: 0))
    standard.identifier = "standard"
    standard.detail = "Arrives in 5-7 days"
    let express = PKShippingMethod(label: "Express", amount: NSDecimalNumber(value: 9.99))
    express.identifier = "express"
    express.detail = "Arrives in 1-2 days"
    request.shippingMethods = [standard, express]

    return request
}
```

## Checking Apple Pay Availability

```swift
func canMakePayments() -> Bool {
    PKPaymentAuthorizationViewController.canMakePayments(
        usingNetworks: [.visa, .masterCard, .amex, .discover],
        capabilities: [.capability3DS]
    )
}
```

## SwiftUI PayWithApplePayButton (iOS 16+)

```swift
import SwiftUI
import PassKit

struct CheckoutView: View {
    @State private var paymentStatus: PaymentStatus = .idle

    var body: some View {
        VStack(spacing: 24) {
            OrderSummaryView()

            PayWithApplePayButton(.checkout, action: handlePayment)
                .frame(height: 50)
                .payWithApplePayButtonStyle(.black)
                .padding(.horizontal)
        }
    }

    func handlePayment() {
        let request = makePaymentRequest(amount: 49.99)
        let controller = PKPaymentAuthorizationController(paymentRequest: request)
        controller.delegate = PaymentDelegate.shared
        controller.present()
    }
}
```

## UIKit PKPaymentAuthorizationViewController

```swift
import UIKit
import PassKit

final class PaymentViewController: UIViewController, PKPaymentAuthorizationViewControllerDelegate {

    func startPayment(amount: Decimal) {
        guard PKPaymentAuthorizationViewController.canMakePayments() else {
            showSetupApplePay()
            return
        }

        let request = makePaymentRequest(amount: amount)
        guard let vc = PKPaymentAuthorizationViewController(paymentRequest: request) else { return }
        vc.delegate = self
        present(vc, animated: true)
    }

    func paymentAuthorizationViewController(
        _ controller: PKPaymentAuthorizationViewController,
        didAuthorizePayment payment: PKPayment,
        handler completion: @escaping (PKPaymentAuthorizationResult) -> Void
    ) {
        // Send payment.token.paymentData to your server
        Task {
            do {
                try await PaymentService.processPayment(token: payment.token)
                completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
            } catch {
                let pkError = PKPaymentRequest.paymentShippingAddressUnserviceableError(
                    withLocalizedDescription: "Payment failed. Please try again."
                )
                completion(PKPaymentAuthorizationResult(status: .failure, errors: [pkError]))
            }
        }
    }

    func paymentAuthorizationViewControllerDidFinish(
        _ controller: PKPaymentAuthorizationViewController
    ) {
        controller.dismiss(animated: true)
    }

    private func showSetupApplePay() {
        let setup = PKPassLibrary().openPaymentSetup()
        if !setup {
            // Fallback: show manual card entry
        }
    }
}
```

## Payment Processing Flow

```swift
enum PaymentService {
    static func processPayment(token: PKPaymentToken) async throws {
        // 1. Extract payment data
        let paymentData = token.paymentData  // Encrypted by Apple
        let method = token.paymentMethod
        let network = method.network?.rawValue ?? "unknown"
        let type = method.type  // .debit, .credit, .prepaid, .store

        // 2. Send encrypted token to your payment processor
        var request = URLRequest(url: URL(string: "https://api.yourserver.com/pay")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode([
            "paymentData": paymentData.base64EncodedString(),
            "network": network,
            "transactionId": token.transactionIdentifier
        ])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw PaymentError.serverDeclined
        }
    }
}

enum PaymentError: LocalizedError {
    case serverDeclined, networkUnavailable

    var errorDescription: String? {
        switch self {
        case .serverDeclined: "Payment was declined. Please try another card."
        case .networkUnavailable: "No network connection. Please try again."
        }
    }
}
```

## Wallet Passes (PKPass & PKPassLibrary)

```swift
import PassKit

final class WalletPassManager {
    private let library = PKPassLibrary()

    /// Add a pass from downloaded .pkpass data
    func addPass(data: Data) async throws {
        guard PKPassLibrary.isPassLibraryAvailable() else {
            throw WalletError.notAvailable
        }

        let pass = try PKPass(data: data)

        if library.containsPass(pass) {
            // Pass already in wallet — replace
            library.replacePass(with: pass)
        } else {
            // Show the add-pass UI
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let root = scene.keyWindow?.rootViewController else { return }
            let addController = PKAddPassesViewController(pass: pass)
            root.present(addController!, animated: true)
        }
    }

    /// List all passes of a specific type
    func passes(ofType type: PKPassType = .barcode) -> [PKPass] {
        library.passes(of: type)
    }

    /// Remove a pass
    func removePass(_ pass: PKPass) {
        library.removePass(pass)
    }

    /// Download a .pkpass file from server
    func downloadPass(from url: URL) async throws -> Data {
        var request = URLRequest(url: url)
        request.setValue("application/vnd.apple.pkpass", forHTTPHeaderField: "Accept")
        let (data, _) = try await URLSession.shared.data(for: request)
        return data
    }
}

enum WalletError: LocalizedError {
    case notAvailable
    var errorDescription: String? { "Wallet is not available on this device." }
}
```

## FinanceKit: Apple Card/Cash Transactions (iOS 17+)

```swift
import FinanceKit

@available(iOS 17, *)
final class FinanceManager {

    func requestAuthorization() async -> FinanceKit.AuthorizationStatus {
        await FinanceStore.shared.requestAuthorization()
    }

    func fetchTransactions() async throws -> [FinanceKit.Transaction] {
        let store = FinanceStore.shared

        let status = await store.requestAuthorization()
        guard status == .authorized else {
            throw FinanceError.notAuthorized
        }

        // Query recent Apple Card transactions
        let now = Date()
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: now)!

        let query = TransactionQuery(
            startDate: thirtyDaysAgo,
            endDate: now
        )

        let transactions = try await store.transactions(query: query)
        return transactions
    }

    func fetchAccountBalances() async throws -> [FinanceKit.AccountBalance] {
        let store = FinanceStore.shared
        return try await store.accountBalances()
    }
}

enum FinanceError: LocalizedError {
    case notAuthorized
    var errorDescription: String? { "Finance data access not authorized." }
}
```

## Complete Apple Pay Checkout Example

```swift
import SwiftUI
import PassKit

enum PaymentStatus {
    case idle, processing, success, failed(String)
}

@Observable
final class CheckoutViewModel {
    var items: [CartItem] = []
    var paymentStatus: PaymentStatus = .idle

    var total: Decimal {
        items.reduce(0) { $0 + $1.price * Decimal($1.quantity) }
    }

    var canPay: Bool {
        PKPaymentAuthorizationController.canMakePayments(
            usingNetworks: [.visa, .masterCard, .amex],
            capabilities: [.capability3DS]
        )
    }

    func checkout() async {
        paymentStatus = .processing

        let request = PKPaymentRequest()
        request.merchantIdentifier = "merchant.com.yourapp.pay"
        request.supportedNetworks = [.visa, .masterCard, .amex]
        request.merchantCapabilities = [.capability3DS]
        request.countryCode = "US"
        request.currencyCode = "USD"

        request.paymentSummaryItems = items.map {
            PKPaymentSummaryItem(
                label: $0.name,
                amount: NSDecimalNumber(decimal: $0.price * Decimal($0.quantity))
            )
        } + [
            PKPaymentSummaryItem(label: "Your Store", amount: NSDecimalNumber(decimal: total))
        ]

        let controller = PKPaymentAuthorizationController(paymentRequest: request)
        // Present and handle via delegate pattern
        controller.present()
    }
}

struct CartItem: Identifiable {
    let id = UUID()
    let name: String
    let price: Decimal
    var quantity: Int
}

struct ApplePayCheckoutView: View {
    @State private var viewModel = CheckoutViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.items) { item in
                    HStack {
                        Text(item.name)
                        Spacer()
                        Text("\(item.quantity)x")
                        Text(item.price, format: .currency(code: "USD"))
                    }
                }

                Section {
                    HStack {
                        Text("Total").fontWeight(.bold)
                        Spacer()
                        Text(viewModel.total, format: .currency(code: "USD"))
                            .fontWeight(.bold)
                    }
                }
            }
            .navigationTitle("Checkout")
            .safeAreaInset(edge: .bottom) {
                if viewModel.canPay {
                    PayWithApplePayButton(.checkout) {
                        Task { await viewModel.checkout() }
                    }
                    .frame(height: 50)
                    .padding()
                }
            }
            .overlay {
                if case .processing = viewModel.paymentStatus {
                    ProgressView("Processing...")
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }
}
```
