# Email and password sign-in

Uses Supabase Auth's REST endpoints with `URLSession`, so no SDK is added. The anon key is a client key: it ships in the app and is safe only with row-level security on every table.

## Configure

Add to the project's `.env` (gitignored) and rebuild:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Until then the form shows a configuration message and makes no network calls.

## Use

```swift
@State private var auth = EmailAuthModel(service: SupabaseEmailAuth.fromBundle(), store: KeychainStore())

var body: some View {
    switch auth.state {
    case .signedIn(let session): HomeView(userID: session.userID)
    default: EmailAuthForm(model: auth)
    }
}
```

## Rules

From [authentication](../../docs/backend/authentication.md) and [Supabase](../../docs/backend/supabase.md):

- Never ship a service-role key. Enforce access with row-level security.
- Sign-up may require email confirmation; the form reports it instead of pretending the user is signed in.
- Sessions live in the Keychain. Access tokens expire; refresh before calling your API (not included in this template).
- Offer Sign in with Apple alongside other sign-in methods for App Store apps.
