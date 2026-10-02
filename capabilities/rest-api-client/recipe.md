# Your REST API

Reads `API_BASE_URL` (from `.env`, through the gitignored `Config/Secrets.xcconfig` and Info.plist) and builds a `URLSessionAPIClient` from the url-session-networking capability.

## Use

```swift
if let client = APIConfiguration.makeClient() {
    RootView(model: AppModel(client: client))
} else {
    APINotConfiguredView()
}
```

## Rules

From [REST](../../docs/backend/rest.md):

- Only https base URLs are accepted.
- The base URL is configuration, not a secret; server credentials never ship in the app.
