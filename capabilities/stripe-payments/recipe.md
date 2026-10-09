# Stripe PaymentSheet

Create the PaymentIntent on your authenticated server with server-calculated amount/currency and idempotency. Inject only its client secret and the publishable key into StripeCheckout. Handle completed/canceled/failed separately; fulfill only after verified server webhooks. Never embed sk_ keys. Use for eligible payments; StoreKit requirements depend on product and storefront.

Verification compiles a minimal app; it does not test a production account, payment, database rules or OAuth configuration.
