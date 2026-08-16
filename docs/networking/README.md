# Networking and Connectivity

## Context

Use this hub for URLSession, Network framework, WebSocket, streaming, retries, caching, certificate trust, Bluetooth, Nearby Interaction, accessories, offline networking, and network-driven architecture.

## Decision Matrix

| Need | Prefer |
|---|---|
| HTTP REST/JSON APIs | URLSession with typed clients |
| Bidirectional custom protocol | Network framework |
| Server push over HTTP | streaming response or server-sent events |
| WebSocket | URLSessionWebSocketTask or Network framework |
| Bluetooth LE | Core Bluetooth |
| Local peer discovery | Bonjour / Network framework / Multipeer Connectivity |
| Accessory pairing | AccessorySetupKit or ExternalAccessory |

## Architecture Rules

- API clients implement protocols and are injected.
- Request/response DTOs do not leak into domain models.
- Retries use bounded backoff and idempotency rules.
- Caches declare freshness and invalidation policy.
- Offline states are designed UI states, not only thrown errors.
- Certificate pinning is a deliberate security decision with rotation handling.

## Example

```swift
protocol FeedServicing: Sendable {
    func loadFeed() async throws -> [FeedItem]
}
```

## Common Mistakes

- Retrying non-idempotent writes automatically.
- Treating `NWPathMonitor` as permission to start expensive work.
- Updating UI from networking callbacks outside the main actor.
- Logging Authorization headers or request bodies.
- No timeout, cancellation, or in-flight request coalescing.

## Related Guides

- `../frameworks/networking.md`
- `../frameworks/network-framework.md`
- `../frameworks/hardware/core-bluetooth.md`
- `../frameworks/cryptokit.md`
- `../frameworks/authentication-services.md`
- `../security/README.md`
