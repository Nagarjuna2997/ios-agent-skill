# Network.framework

**Load this when:** you need a socket rather than an HTTP request — a custom
protocol, a persistent TCP or UDP connection, a local peer-to-peer listener, TLS
you must configure yourself — or when you need to observe connectivity changes
with `NWPathMonitor`.

**Do not load this for HTTP.** `URLSession` already sits on Network.framework
and gives you caching, cookies, redirects, retries, background transfers, and
ATS compliance for free. Reimplementing HTTP over `NWConnection` is a large
amount of work to arrive somewhere worse. See `docs/frameworks/networking.md`.

**Availability:** Network.framework iOS 12+; `NWBrowser` iOS 13+; the types are
**not** `Sendable`, and their callbacks arrive on a queue you supply.

---

## 1. The three facts that shape every design here

**1. `NWConnection` is not `Sendable` and its handlers run on your queue.**
Every state and receive callback lands on the `DispatchQueue` passed to
`start(queue:)`. Touching `@MainActor` state from inside one is a data race and
a Swift 6 error. The fix is not to hop with `DispatchQueue.main.async` — it is to
own the connection inside an **actor** and expose an `AsyncStream` outward.

**2. TCP is a byte stream, not a message stream.** `receive` gives you whatever
bytes have arrived. One `send` of 100 bytes may arrive as four callbacks; three
sends may arrive as one. Any code that treats one receive as one message works
perfectly on localhost and fails on a real network. You must frame — length
prefix, delimiter, or `NWProtocolFramer`.

**3. `.ready` is not "connected forever".** Connections go `.waiting` when the
path is unsatisfied and can return to `.ready` on their own. Tearing down on
`.waiting` throws away the recovery the framework is doing for you; treating
`.failed` as recoverable leaks a dead connection. They are different states and
need different handling.

---

## 2. Path monitoring

The simplest correct thing in the framework, and the most commonly misused.

```swift
import Network

public enum Connectivity: Equatable, Sendable {
    case satisfied(isExpensive: Bool, isConstrained: Bool)
    case unsatisfied
}

/// An actor, because NWPathMonitor's handler fires on a background queue and
/// the value it produces is read from the main actor.
public actor NetworkMonitor {
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    private var continuations: [UUID: AsyncStream<Connectivity>.Continuation] = [:]
    private var current: Connectivity = .unsatisfied
    private var isStarted = false

    public init() {}

    /// A fresh stream per caller. One shared stream means the second observer
    /// steals elements from the first.
    public func updates() -> AsyncStream<Connectivity> {
        let id = UUID()
        return AsyncStream { continuation in
            continuations[id] = continuation
            continuation.yield(current)          // current value, not just changes
            continuation.onTermination = { [weak self] _ in
                Task { await self?.remove(id) }
            }
            start()
        }
    }

    private func remove(_ id: UUID) {
        continuations[id] = nil
    }

    private func start() {
        guard !isStarted else { return }
        isStarted = true

        monitor.pathUpdateHandler = { [weak self] path in
            // Fires on `queue`. Hop back onto the actor rather than touching
            // state from here.
            let value: Connectivity = path.status == .satisfied
                ? .satisfied(isExpensive: path.isExpensive, isConstrained: path.isConstrained)
                : .unsatisfied
            Task { await self?.publish(value) }
        }
        monitor.start(queue: queue)
    }

    private func publish(_ value: Connectivity) {
        current = value
        for continuation in continuations.values {
            continuation.yield(value)
        }
    }

    deinit {
        monitor.cancel()
    }
}
```

**`isExpensive` and `isConstrained` are not decoration.** `isExpensive` means
cellular or a personal hotspot; `isConstrained` means the user turned on Low
Data Mode and explicitly asked you to use less. Ignoring the second is ignoring a
direct instruction from the user, and App Review does notice.

**Never use path status as a precondition.** `.satisfied` means a route exists,
not that your server is reachable. Code that refuses to try because the monitor
says unsatisfied fails on captive portals and VPN transitions where the request
would have worked. Make the request; handle the failure.

---

## 3. A framed TCP connection

```swift
import Foundation
import Network

public enum ConnectionError: LocalizedError {
    case failed(NWError)
    case closedByPeer
    case messageTooLarge(Int)
    case malformedFrame

    public var errorDescription: String? {
        switch self {
        case .failed: String(localized: "Lost the connection. Trying again.")
        case .closedByPeer: String(localized: "The other side disconnected.")
        case .messageTooLarge, .malformedFrame:
            String(localized: "Received unreadable data.")
        }
    }
}

/// Owns the connection. Nothing outside this actor touches NWConnection, which
/// is what makes the non-Sendable type safe to use.
public actor MessageConnection {
    private let connection: NWConnection
    private let queue = DispatchQueue(label: "MessageConnection")

    /// Bytes received but not yet forming a complete frame.
    private var buffer = Data()

    private var messages: AsyncStream<Data>.Continuation?
    private var readyContinuation: CheckedContinuation<Void, any Error>?
    private var hasResumedReady = false

    /// A ceiling on any single frame. Without it, a hostile or buggy peer
    /// sending a 4 GB length prefix makes the app allocate until it is killed.
    private let maximumFrameSize: Int

    public init(host: String, port: UInt16, useTLS: Bool = true, maximumFrameSize: Int = 4 << 20) {
        let parameters: NWParameters = useTLS ? .tls : .tcp

        // Disable Nagle for latency-sensitive small messages. Leave it on for
        // throughput-oriented traffic — turning it off there costs bandwidth.
        if let tcp = parameters.defaultProtocolStack.internetProtocol as? NWProtocolTCP.Options {
            tcp.noDelay = true
            tcp.connectionTimeout = 10
        }

        self.connection = NWConnection(
            host: NWEndpoint.Host(host),
            port: NWEndpoint.Port(rawValue: port)!,
            using: parameters
        )
        self.maximumFrameSize = maximumFrameSize
    }

    // MARK: Lifecycle

    public func connect() async throws {
        connection.stateUpdateHandler = { [weak self] state in
            Task { await self?.handle(state) }
        }
        connection.start(queue: queue)

        try await withCheckedThrowingContinuation { continuation in
            readyContinuation = continuation
        }

        receiveLoop()
    }

    private func handle(_ state: NWConnection.State) {
        switch state {
        case .ready:
            resumeReady(with: .success(()))

        case .waiting(let error):
            // NOT a failure. The path is temporarily unsatisfied and the
            // framework is already retrying. Tearing down here throws away the
            // recovery it is doing for you.
            log("waiting: \(error)")

        case .failed(let error):
            // Terminal. This one does need a new connection.
            resumeReady(with: .failure(ConnectionError.failed(error)))
            messages?.finish()

        case .cancelled:
            messages?.finish()

        case .setup, .preparing:
            break

        @unknown default:
            break
        }
    }

    /// A continuation must be resumed exactly once. `.waiting` -> `.ready` ->
    /// `.failed` is a normal sequence, so without this guard a flaky network
    /// crashes the app with "resumed more than once".
    private func resumeReady(with result: Result<Void, any Error>) {
        guard !hasResumedReady, let continuation = readyContinuation else { return }
        hasResumedReady = true
        readyContinuation = nil
        continuation.resume(with: result)
    }

    public func cancel() {
        connection.cancel()
        messages?.finish()
    }

    // MARK: Sending

    /// Length-prefixed framing: 4-byte big-endian count, then the payload.
    public func send(_ payload: Data) async throws {
        guard payload.count <= maximumFrameSize else {
            throw ConnectionError.messageTooLarge(payload.count)
        }

        var frame = Data()
        withUnsafeBytes(of: UInt32(payload.count).bigEndian) { frame.append(contentsOf: $0) }
        frame.append(payload)

        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, any Error>) in
            connection.send(content: frame, completion: .contentProcessed { error in
                if let error {
                    continuation.resume(throwing: ConnectionError.failed(error))
                } else {
                    continuation.resume()
                }
            })
        }
    }

    // MARK: Receiving

    public func incomingMessages() -> AsyncStream<Data> {
        AsyncStream { continuation in
            messages = continuation
        }
    }

    private func receiveLoop() {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 65_536) {
            [weak self] content, _, isComplete, error in
            Task { await self?.handleReceive(content, isComplete: isComplete, error: error) }
        }
    }

    private func handleReceive(_ content: Data?, isComplete: Bool, error: NWError?) {
        if let error {
            log("receive failed: \(error)")
            messages?.finish()
            return
        }

        if let content, !content.isEmpty {
            buffer.append(content)
            drainFrames()
        }

        if isComplete {
            messages?.finish()
            return
        }

        receiveLoop()   // re-arm; `receive` delivers once per call
    }

    /// TCP is a byte stream. One receive is not one message — this is where
    /// code that assumes otherwise breaks the moment it leaves localhost.
    private func drainFrames() {
        while buffer.count >= 4 {
            let length = buffer.prefix(4).withUnsafeBytes {
                Int($0.load(as: UInt32.self).bigEndian)
            }

            guard length <= maximumFrameSize else {
                log("frame of \(length) exceeds the ceiling; closing")
                connection.cancel()
                messages?.finish()
                return
            }

            guard buffer.count >= 4 + length else { return }   // partial frame; wait

            let payload = buffer.subdata(in: 4..<(4 + length))
            buffer.removeSubrange(0..<(4 + length))
            messages?.yield(payload)
        }
    }

    private func log(_ message: String) {
        // OSLog in production — see docs/frameworks/oslog.md.
    }
}
```

---

## 4. TLS

`NWParameters.tls` gives you the system defaults, which are correct. Only reach
for `sec_protocol_options` when you have a specific requirement — a pinned
certificate, or a private CA.

```swift
import CryptoKit
import Network

func pinnedParameters(expectedSPKISHA256: Data) -> NWParameters {
    let options = NWProtocolTLS.Options()

    sec_protocol_options_set_verify_block(
        options.securityProtocolOptions,
        { _, trustRef, complete in
            let trust = sec_trust_copy_ref(trustRef).takeRetainedValue()

            // Evaluate the chain normally FIRST. Pinning replaces nothing —
            // it is an additional constraint on top of a valid chain.
            var error: CFError?
            guard SecTrustEvaluateWithError(trust, &error) else {
                return complete(false)
            }

            guard let chain = SecTrustCopyCertificateChain(trust) as? [SecCertificate],
                  let leaf = chain.first,
                  let publicKey = SecCertificateCopyKey(leaf),
                  let spki = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?
            else {
                return complete(false)
            }

            // Pin the public key, not the certificate: the key survives
            // certificate renewal, so routine rotation does not brick the app.
            let digest = Data(SHA256.hash(data: spki))
            complete(digest == expectedSPKISHA256)
        },
        DispatchQueue(label: "TLSVerify")
    )

    return NWParameters(tls: options)
}
```

**Pin at least two keys — the current one and a backup you control.** A single
pin turns a lost private key into an app that cannot reach its own server until
every user installs an update. Ship an expiry date for the pin set, after which
the app falls back to standard validation rather than becoming a brick.

---

## 5. Listening (local peer-to-peer)

```swift
public actor MessageListener {
    private let listener: NWListener
    private let queue = DispatchQueue(label: "MessageListener")
    private var connections: [ObjectIdentifier: NWConnection] = [:]

    public init(port: UInt16, service: String) throws {
        let parameters = NWParameters.tls
        parameters.includePeerToPeer = true          // AWDL, for local discovery

        listener = try NWListener(
            using: parameters,
            on: NWEndpoint.Port(rawValue: port) ?? .any
        )
        // Bonjour advertisement. The type must also appear in
        // NSBonjourServices in Info.plist or discovery silently fails.
        listener.service = NWListener.Service(type: service)
    }

    public func start() {
        listener.newConnectionHandler = { [weak self] connection in
            Task { await self?.accept(connection) }
        }
        listener.stateUpdateHandler = { state in
            // .failed here is usually a port already in use.
        }
        listener.start(queue: queue)
    }

    private func accept(_ connection: NWConnection) {
        // Retain it. A connection that goes out of scope is cancelled
        // immediately, and the symptom is peers that connect then vanish.
        connections[ObjectIdentifier(connection)] = connection

        connection.stateUpdateHandler = { [weak self] state in
            switch state {
            case .cancelled, .failed:
                Task { await self?.drop(connection) }
            default:
                break
            }
        }
        connection.start(queue: queue)
    }

    private func drop(_ connection: NWConnection) {
        connections[ObjectIdentifier(connection)] = nil
    }
}
```

Local networking needs **both** Info.plist keys since iOS 14, or the first
connection attempt fails with no useful diagnostic:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>Find and connect to nearby devices running this app.</string>
<key>NSBonjourServices</key>
<array>
    <string>_myapp._tcp</string>
</array>
```

---

## Anti-Patterns

```swift
// WRONG — one receive treated as one message.
// Works on localhost, fails on a real network: TCP is a byte stream, so a
// 100-byte send may arrive as four callbacks and three sends as one.
connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { data, _, _, _ in
    let message = try? JSONDecoder().decode(Message.self, from: data!)
}

// RIGHT — buffer, then extract complete frames.
buffer.append(data); drainFrames()
```

```swift
// WRONG — an unbounded length prefix.
// A peer sending 0xFFFFFFFF makes the app allocate 4 GB and get killed.
guard buffer.count >= 4 + length else { return }

// RIGHT — a ceiling, checked before trusting the length.
guard length <= maximumFrameSize else { connection.cancel(); return }
```

```swift
// WRONG — .waiting treated as a failure.
// The path is temporarily unsatisfied and the framework is already retrying.
// Tearing down discards that recovery and usually starts a reconnect storm.
case .waiting: reconnect()

// RIGHT — log it and let the framework recover; act on .failed.
case .waiting(let error): log(error)
case .failed(let error): reconnect()
```

```swift
// WRONG — a continuation resumed from a state handler with no guard.
// .waiting -> .ready -> .failed is a normal sequence on a flaky network, and
// resuming twice is a hard crash.
case .ready: continuation.resume()
case .failed(let e): continuation.resume(throwing: e)

// RIGHT — resume exactly once.
private func resumeReady(with result: Result<Void, any Error>) { guard !hasResumedReady … }
```

```swift
// WRONG — receive called once.
// `receive` delivers a single callback. Without re-arming, exactly one chunk
// ever arrives and the connection appears to hang.
connection.receive(…) { data, _, _, _ in self.handle(data) }

// RIGHT — call receive again at the end of every callback.
```

```swift
// WRONG — NWConnection state mutated from its own handler on a @MainActor type.
// The handler runs on the connection's queue. This is a data race and a Swift 6
// error, and DispatchQueue.main.async is not the fix.
@MainActor final class Client { var isConnected = false
    func start() { c.stateUpdateHandler = { s in self.isConnected = (s == .ready) } } }

// RIGHT — the connection lives in an actor; the outside world gets an AsyncStream.
```

```swift
// WRONG — an accepted connection not retained.
// It deallocates at the end of the handler and is cancelled immediately. The
// symptom is peers that connect and instantly vanish.
listener.newConnectionHandler = { connection in connection.start(queue: q) }

// RIGHT — hold it until it is cancelled or fails.
connections[ObjectIdentifier(connection)] = connection
```

```swift
// WRONG — path status as a precondition.
// .satisfied means a route exists, not that your server is reachable. This
// refuses to try on captive portals and VPN transitions where it would work.
guard monitor.currentPath.status == .satisfied else { throw .offline }

// RIGHT — attempt the request; handle the failure.
```

```swift
// WRONG — ignoring isConstrained.
// Low Data Mode is the user explicitly asking you to use less. Prefetching
// through it ignores a direct instruction.
await prefetchEverything()

// RIGHT
if case .satisfied(_, let isConstrained) = connectivity, !isConstrained { await prefetch() }
```

```swift
// WRONG — TLS verification disabled to "make it work in dev".
// This ships. It always ships.
sec_protocol_options_set_verify_block(opts, { _, _, complete in complete(true) }, q)

// RIGHT — a real certificate in dev, or a pin scoped to a DEBUG build with a
// release branch that ignores the flag entirely.
```

```swift
// WRONG — a single pinned certificate.
// Routine certificate renewal bricks every installed copy of the app.
let pinned = [productionCertificateHash]

// RIGHT — pin public keys (which survive renewal), at least two, with an expiry.
let pinned = [currentSPKIHash, backupSPKIHash]
```

```swift
// WRONG — Network.framework for HTTP.
// Reimplements caching, redirects, cookies, retries, and ATS, worse.
let connection = NWConnection(host: "api.example.com", port: 443, using: .tls)

// RIGHT
let (data, response) = try await URLSession.shared.data(for: request)
```

---

## Checklist

- [ ] `URLSession` ruled out for a stated reason before reaching for this
- [ ] `NWConnection` owned by an actor; nothing outside it touches the connection
- [ ] Messages framed; a receive is never assumed to be one message
- [ ] A maximum frame size, checked before allocating
- [ ] `receive` re-armed at the end of every callback
- [ ] `.waiting` and `.failed` handled differently
- [ ] Every continuation resumed exactly once, guarded
- [ ] Accepted connections retained until cancelled
- [ ] Path status used as a hint, never as a precondition
- [ ] `isConstrained` respected — Low Data Mode is an instruction
- [ ] TLS verification never disabled, in any build that can ship
- [ ] Pins on public keys, at least two, with an expiry fallback
- [ ] `NSLocalNetworkUsageDescription` and `NSBonjourServices` present for local discovery
- [ ] Connections cancelled on `scenePhase` background — a live socket drains battery
