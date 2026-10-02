# Apple Pay checkout

`ApplePayCheckoutButton` builds a `PKPaymentRequest` from `PaymentLine` items and shows SwiftUI's `PayWithApplePayButton`. The app never sees card numbers: it forwards the encrypted payment token to your server, which charges it through a payment processor.

## Use

```swift
ApplePayCheckoutButton(
    lines: [PaymentLine(label: "Subtotal", amount: 27.98), PaymentLine(label: "Delivery", amount: 2.99), PaymentLine(label: "FoodDash", amount: 30.97)],
    merchantName: "FoodDash"
) { payment, complete in
    Task { complete(await orders.submit(token: payment.token.paymentData)) }
}
```

## Rules

From [PassKit](../../docs/frameworks/services/passkit.md):

- Apple Pay is for physical goods and services. Digital content and subscriptions use StoreKit.
- The last summary item is the total and carries the business name.
- Check `PKPaymentAuthorizationController.canMakePayments` and offer another way to pay.
- Apple Pay in the simulator uses test cards; real charges need a merchant ID, a processor and a device.
