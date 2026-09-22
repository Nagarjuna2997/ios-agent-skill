# REST clients with URLSession

Use REST when a stable HTTP contract or existing service fits the app. Do not add GraphQL or a vendor SDK merely to avoid writing status validation. URLSession is part of Foundation; no external SPM dependency is required. Inject the transport and base URL at the composition root; keep endpoint paths and response types explicit.

## Request to domain value

Construct URLs with URLComponents and URLQueryItem. Set the HTTP method, content type, timeout and acceptable payload size deliberately. Obtain bearer credentials from a session owner immediately before dispatch. A request interceptor should add safe headers, not log the complete request or independently refresh every failing request.

Retain HTTPURLResponse and validate the endpoint's success statuses before decoding Codable. Handle 204 without decoding an empty JSON object. Distinguish transport, cancellation, HTTP status, API error and decoding errors; a JSON body alone is not success. Server error payloads are untrusted and may contain personal information. Translate them to a bounded domain error rather than displaying or logging them wholesale.

[BackendPatterns](../../samples/BackendPatterns/README.md) supplies an injected transport, validated response and bounded GET retries. It deliberately does not implement token refresh, multipart encoding or a background transfer service.

## Retry and cancellation contract

Retry only operations whose semantics permit it: GET/HEAD are normally safe; writes need a server-enforced idempotency key and documented replay behavior. Bound attempts and total deadline. Respect Retry-After and rate limiting; use exponential backoff plus jitter in a real transport. Cancellation must escape immediately, including during the delay. Do not retry validation failures, authorization denial or arbitrary decoding errors. A 401 can trigger one coordinated refresh; a 403 is not automatically an expired session.

A feature `.task` should cancel its request when no longer needed. A long-lived sync owner may outlive one view but must still expose cancellation and account-switch handling. URLSession's async APIs do not grant unlimited background execution.

## Paging, cache and files

Use server cursors with stable ordering, preserve the next cursor as opaque data and deduplicate by stable record ID. Avoid fetching all rows to paginate locally. Bind cache entries and ETags to identity and request representation; handle 304 through the existing cached body. Never reuse private cached content after logout.

For multipart uploads follow the server contract for boundaries and disposition fields; use a file-backed request for large payloads. Validate file size/type server-side and clean up partial uploads. Prefer download tasks for large responses rather than accumulating Data. Background URLSession transfers need an app delegate completion handoff and supported task configuration; the server must tolerate resumption and duplicate completion delivery.

## Security, migration and tests

Use HTTPS with ATS intact. Certificate pinning has rotation and outage costs; adopt it only with a reviewed recovery plan, not a blanket disable-trust workaround. Keep production/staging endpoints in explicit configuration. Test URLProtocol or an injected transport for status, malformed JSON, timeout, cancellation, 429, retry limits, pagination and refresh races. Contract tests should include backward-compatible server schema evolution and unknown fields. Run live integration checks separately from offline fixtures.

Review data disclosure, deletion and retention in [privacy](privacy.md). Primary sources: [URLSession](https://developer.apple.com/documentation/foundation/urlsession), [URLProtocol](https://developer.apple.com/documentation/foundation/urlprotocol), [background downloads](https://developer.apple.com/documentation/foundation/downloading-files-in-the-background). Extend the existing [networking guide](../networking/README.md) rather than creating a second global networking manager.
