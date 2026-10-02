# Sign in with Apple

The default sign-in for an iOS app: no password to manage, and App Review expects it when other third-party sign-in providers are offered.

## Use

```swift
@State private var auth = AppleSignInModel(store: KeychainStore())

var body: some View {
    Group {
        switch auth.state {
        case .signedIn(let account): HomeView(account: account)
        case .unknown: ProgressView()
        case .signedOut, .failed: AppleSignInView(model: auth)
        }
    }
    .task { await auth.restore() }
}
```

## Rules

From [Authentication Services](../../docs/frameworks/authentication-services.md):

- Apple shares the name and email only on the first authorization; store them then.
- Check `credentialState(forUserID:)` on launch; a revoked user is signed out.
- Keep the account in the Keychain, never in `UserDefaults`.
- The entitlement `com.apple.developer.applesignin` is added to the project. Running it on a device needs your signing team with the Sign in with Apple capability enabled; the simulator needs an Apple Account signed in to Settings.
- Server-side verification of the identity token is your backend's job; this template keeps a local session only.
