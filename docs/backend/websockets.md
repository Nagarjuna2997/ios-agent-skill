# Realtime connections on iOS

Use a WebSocket for foreground bidirectional events when polling or push notification delivery is insufficient. A socket is not a durable offline sync engine and cannot guarantee continuous background execution on iOS.

## Connection owner

URLSessionWebSocketTask is provided by Foundation; no external package is required. Wrap connect, receive, send, ping and close in one injected connection interface. Model disconnected, connecting, connected, backing off and stopped states. One owner serializes transitions so two views do not create duplicate subscriptions. Separate transport connectivity from authenticated readiness.

A receive loop handles one message at a time, bounds message sizes and validates event schemas. A ping timeout should transition to reconnect once, not start another independent loop. On cancellation, close the task and stop timers. Preserve cancellation errors rather than swallowing them.

## Recovery protocol

Use bounded exponential backoff with jitter and a retry budget. Treat authentication rejection differently from transient loss. Refresh credentials through the shared session owner, then resubscribe deliberately. Supply a last-seen cursor or perform a catch-up fetch. Dedupe by stable event ID and resolve ordering/version conflicts; receipt order across reconnects is not necessarily commit order.

Persist accepted domain state in a local store. An outgoing queue needs durable IDs, acknowledgement and replay rules. Never resend a purchase or other non-idempotent action merely because an acknowledgement was lost. For uploads use authorized HTTP/file transfer, not an unbounded socket payload.

## App lifecycle

Stop or suspend foreground subscriptions when appropriate and revalidate on activation. APNs can signal that a fetch is needed, but silent pushes are not guaranteed delivery. Deep links may open a conversation before reconnect completes: show cached/loading states and authorize the target. Restrict heartbeat frequency to avoid battery and mobile-data waste.

## Verification

Use a fake clock and scripted transport to exercise duplicate events, out-of-order versions, expired credentials, delayed pong, repeated disconnect, cancellation during backoff and resubscription exactly once. Test foreground/background and network transitions on a physical device separately. Log event classes and counters only, not token-bearing connection URLs or message bodies. Follow [privacy](privacy.md) for messages and retention.

The analyzer flags only an immediate unbounded reconnect shape; it cannot prove arbitrary wrappers have correct cancellation or ordering. Primary source: [URLSessionWebSocketTask](https://developer.apple.com/documentation/foundation/urlsessionwebsockettask).
