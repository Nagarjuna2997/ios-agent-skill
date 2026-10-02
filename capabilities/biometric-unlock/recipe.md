# Face ID / Touch ID lock

`.biometricLock(isEnabled:)` covers content until `LocalAuthentication` succeeds. It falls back to the device passcode (`.deviceOwnerAuthentication`), so people without biometrics are not locked out.

## Use

```swift
OrdersView()
    .biometricLock(isEnabled: lockEnabled)
```

## Rules

From [LocalAuthentication](../../docs/frameworks/local-authentication.md):

- Biometrics unlock local content; they do not identify a user to a server.
- Always allow the passcode fallback.
- Re-lock when the app moves to the background.
