# Keychain storage

`KeychainStore` saves small secrets (session tokens, refresh tokens) as generic-password items for this app, readable after first unlock and never migrated to another device. Inject it through the `SecureStore` protocol so previews and tests use `InMemorySecureStore`.

## Use

```swift
let store: any SecureStore = KeychainStore()
try store.setString(token, for: "accessToken")
let saved = try store.string(for: "accessToken")
try store.remove("accessToken")
```

## Rules

- Tokens and credentials go in the Keychain, never in `UserDefaults` ([backend security](../../docs/backend/security.md)).
- Errors keep their `OSStatus`; do not swallow them silently.
- Encrypting your own data at rest is a separate concern ([CryptoKit](../../docs/frameworks/cryptokit.md)).
