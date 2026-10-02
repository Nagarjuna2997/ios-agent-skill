# HTTP client (URLSession)

`APIClient` sends `APIRequest<Response>` values and decodes JSON. Keys are converted from snake_case and dates use ISO 8601.

## Use

```swift
struct Restaurant: Decodable, Identifiable, Sendable { let id: String; let name: String }

let restaurants = try await client.send(APIRequest<[Restaurant]>.get("restaurants", query: ["near": "37.33,-122.01"]))
```

## Rules

From [networking](../../docs/frameworks/networking.md) and [REST](../../docs/backend/rest.md):

- Check the HTTP status; a 4xx or 5xx body is not the expected JSON.
- Keep cancellation as `CancellationError` so leaving a screen does not show an error.
- Inject the client; previews use `StubAPIClient` and never touch the network.
