# Authentication and session boundaries

Model authentication as restoring, signed out, authenticating, signed in, refreshing and revoked states. The first screen must wait for restoration or show a deliberate loading state; an SDK client existing is not evidence of a valid session.

## OAuth callback ownership

Use the provider's documented ASWebAuthenticationSession or native SDK flow. PKCE binds an authorization code to the initiating client; state binds the callback to the initiating attempt; an OIDC nonce binds an ID token to that attempt. They are different protections. Prefer the SDK's implementation instead of manually concatenating an authorization URL or decoding a JWT as proof of identity.

Register a custom URL scheme or an associated-domain universal link, configure the exact redirect allowlist on the server, and route scene/openURL callbacks to one coordinator. Match scheme, host and path exactly, reject unexpected ports/userinfo, and let the SDK validate the transaction's state and exchange the code. Never use `url.absoluteString.contains("callback")` as authorization. Universal links also require a valid association file and entitlements. A syntactically matching URL alone does not authenticate anybody.

[BackendPatterns](../../samples/BackendPatterns/README.md) demonstrates exact callback-route validation. It intentionally does not implement OAuth state, PKCE or token exchange. Test cancelled browser sessions, duplicate callbacks, cold launch, expired links, alternate schemes and malicious suffix hosts. Do not log callback URLs: they can carry credentials.

## Secure persistence and refresh

Inspect the pinned SDK's storage implementation. If you supply sensitive persistence, use Keychain with a deliberate accessibility class, access group and synchronizability policy. `WhenUnlockedThisDeviceOnly` may be inappropriate for a legitimate background operation; select the policy from the actual access requirement. Do not put tokens in UserDefaults, app-group preferences, analytics properties or source control. Do not replace SDK session storage with an incomplete homemade token store.

Use one refresh owner. Concurrent 401s must join one refresh attempt, not race and overwrite rotated refresh tokens. Retry the original operation only if safe; do not turn every 403 into refresh. Clear identity-scoped local records, image caches and pending work on account changes. Stop listeners before presenting another user's data. Account deletion is a server-authorized operation; signing out is not deletion.

## Native identity versus browser OAuth

Apple and Google can provide native ID-token credentials for supported SDK exchange. Native Apple uses a fresh nonce and its documented digest/exchange contract; an authorization code is not an ID token. Other social providers generally use browser OAuth. Do not reuse the native Apple example for GitHub, Slack or X. Verify the provider name and credential type in the exact Swift SDK version.

[Supabase](supabase.md) and [Firebase](firebase.md) contain SDK-specific snippets. [App Review 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services) defines conditions and exceptions for an equivalent login option; social login is a reason to review the policy, not an automatic scanner error. [Privacy](privacy.md) covers deletion and data disclosures.

## Production verification

Test relaunch, refresh-token rotation, server revocation, offline restoration, clock skew, reauthentication before destructive actions and cancellation before callback delivery. Use synthetic accounts in isolated environments. Never paste provider secrets into agent context. Official references: [ASWebAuthenticationSession](https://developer.apple.com/documentation/authenticationservices/aswebauthenticationsession), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), [native mobile deep links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
