# Offline backend patterns

Run `swift test --package-path samples/BackendPatterns` from the repository root. No package downloads, account, credentials or network calls are needed. Tests inject synthetic HTTP responses at an actor-isolated transport boundary.

## Included source

- `HTTPClient.swift`: injected transport, HTTPS-only JSON GET, HTTP status validation, bounded transient-status retries and cancellation. It does not retry mutations or decode error bodies as successful data.
- `CallbackRoute.swift`: exact registered scheme/host/path selection, rejecting suffix hosts, userinfo and unexpected ports. This is not OAuth authentication; state/PKCE/nonce validation and token exchange remain SDK responsibilities.
- `AppleAdapters.swift`: injected CloudKit container/account-status reader and foreground-only device-local Keychain storage with explicit error handling. These compile against Apple SDKs but are not executed by tests.

## Deliberate boundaries

The response byte check limits decoding, not network allocation. Use streaming/download budgets for large responses. The retry example has deterministic delays for testing; a production retry policy must add jitter, a total deadline and Retry-After handling appropriate to the API. Token refresh, multipart uploads, durable offline sync and provider SDKs are not implemented in this sample. No secrets or maintainer identity are generated in app code.

See [backend overview](../../docs/backend/overview.md), [Supabase auth snippets](../../docs/backend/supabase.md) and [Firebase auth snippets](../../docs/backend/firebase.md). Those snippets are documentation-verified, not compiled against downloaded external SDKs here.
