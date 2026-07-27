# Mocking and Debugging Strategy

**Load this when:** writing test doubles, building previews for a screen that
loads data, adding a debug menu, or deciding how an app should behave when the
backend is unavailable.

`checklists/testing.md` covers *what* to test. This document covers *what to
substitute for the real thing*, and it answers one question consistently: at any
given moment, where is this screen's data coming from?

There are three tiers. Each has a different lifetime, a different owner, and a
different failure mode when misused.

| Tier | Name | Lives in | Configured by | Purpose |
|------|------|----------|---------------|---------|
| 1 | Test doubles | Test target | Test code | Deterministic unit and UI tests |
| 2 | Rich debug mocks | App target (DEBUG) | Code / previews | Previews and demo-quality fake data |
| 3 | Environment flags | App target | Launch args / env / debug menu | Steering a running build at runtime |

The tiers compose: a UI test (Tier 1) launches the app with a flag (Tier 3) that
selects a rich mock (Tier 2).

---

## Tier 1 — Test Doubles

**Owner:** the test target. **Lifetime:** one test. **Rule:** deterministic, no
I/O, no clock, no randomness.

### Pick the simplest double that answers the question

| Double | Answers | Shape |
|--------|---------|-------|
| **Stub** | "what does the code do with this value?" | returns canned data |
| **Fake** | "does the flow work end to end?" | working in-memory implementation |
| **Spy** | "was this called, with what?" | records invocations |
| **Mock** | "was this called correctly, in order?" | records + asserts expectations |

Reach for a stub first. Most view-model tests need nothing more.

```swift
// STUB — one canned answer.
struct StubProductService: ProductService {
    var result: Result<[Product], any Error> = .success(.samples)
    func fetch() async throws -> [Product] { try result.get() }
}

// FAKE — a real, working, in-memory implementation.
// Use an actor so it is Sendable without @unchecked.
actor FakeProductStore: ProductStore {
    private var storage: [Product.ID: Product] = [:]

    init(seed: [Product] = []) {
        for product in seed { storage[product.id] = product }
    }

    func save(_ product: Product) async throws { storage[product.id] = product }
    func delete(_ id: Product.ID) async throws { storage[id] = nil }
    func all() async throws -> [Product] { Array(storage.values) }
}

// SPY — records what happened, asserts nothing on its own.
actor AnalyticsSpy: AnalyticsService {
    private(set) var events: [String] = []
    func track(_ event: String) { events.append(event) }
}
```

### Reference type, not struct, for anything reconfigured after injection

This is the mistake that produces tests which pass while asserting nothing:

```swift
// WRONG — struct semantics. `repo` here is a COPY; the view model still holds
// the original with shouldFail == false, so the test passes for the wrong reason.
var repo = StubProductService()
let vm = ProductListViewModel(service: repo)
repo.result = .failure(URLError(.notConnected))   // no effect on vm
await vm.load()
#expect(vm.error != nil)                          // fails, confusingly

// RIGHT — an actor (or final class) shares identity.
let repo = ConfigurableProductService()
let vm = ProductListViewModel(service: repo)
await repo.setResult(.failure(URLError(.notConnected)))
await vm.load()
#expect(vm.error != nil)

actor ConfigurableProductService: ProductService {
    private var result: Result<[Product], any Error> = .success(.samples)
    func setResult(_ new: Result<[Product], any Error>) { result = new }
    func fetch() async throws -> [Product] { try result.get() }
}
```

A struct double is fine when it is configured once at `init` and never changed.

### Doubles must be able to fail, hang, and cancel

Half your production bugs live in these paths, so the double must reach them:

```swift
actor ControllableService: ProductService {
    enum Behavior: Sendable {
        case success([Product])
        case failure(any Error)
        case hang                          // never returns until cancelled
        case delayed([Product], Duration)
    }

    private var behavior: Behavior = .success(.samples)
    func set(_ behavior: Behavior) { self.behavior = behavior }

    func fetch() async throws -> [Product] {
        switch behavior {
        case .success(let products):
            return products
        case .failure(let error):
            throw error
        case .hang:
            // Suspends until the enclosing task is cancelled, which is exactly
            // what a spinner-state or cancellation test needs.
            try await Task.sleep(for: .seconds(3600))
            return []
        case .delayed(let products, let duration):
            try await Task.sleep(for: duration)
            return products
        }
    }
}
```

### Network-level doubles

When the seam must be below your own abstraction — you are testing the
networking layer itself — intercept with `URLProtocol` rather than mocking
`URLSession`:

```swift
final class StubURLProtocol: URLProtocol {
    nonisolated(unsafe) static var handler: (@Sendable (URLRequest) throws -> (HTTPURLResponse, Data))?
    // nonisolated(unsafe): URLProtocol requires static mutable state; tests set
    // it before the session starts and never mutate it concurrently.

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.handler else {
            client?.urlProtocol(self, didFailWithError: URLError(.badServerResponse))
            return
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}

    static func makeSession() -> URLSession {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [StubURLProtocol.self]
        return URLSession(configuration: config)
    }
}
```

`checklists/testing.md` has the full recipe.

### Tier 1 rules

- Live in the **test target only**. A double that ships is a Tier 2 concern.
- No real network, disk, clock, `UUID()` in assertions, or `Date()` comparisons.
  Inject a clock and an ID generator if behaviour depends on them.
- Reset between tests. Swift Testing creates a fresh suite instance per test,
  which does this for you — do not defeat it with `static var` state.
- One double per protocol. If a double implements three protocols, your
  protocols are too big.

---

## Tier 2 — Rich Debug Mocks

**Owner:** the app target, `#if DEBUG`. **Lifetime:** the build. **Rule:** the
data looks real, and every screen state is reachable.

Tier 1 doubles return two products named "Test 1" and "Test 2". That is right for
a test and useless for a preview or a design review. Tier 2 fixtures are what
make previews worth looking at.

### Realistic fixtures

```swift
#if DEBUG
extension Product {
    static let previewCatalog: [Product] = [
        Product(id: UUID(), name: "Aeropress Go", description: "Travel coffee press",
                price: 39.95, category: .home, imageURL: nil, isAvailable: true),
        Product(id: UUID(), name: "Sony WH-1000XM5", description: "Noise-cancelling headphones",
                price: 399.00, category: .electronics, imageURL: nil, isAvailable: true),
        Product(id: UUID(), name: "The Pragmatic Programmer", description: "20th anniversary edition",
                price: 49.99, category: .books, imageURL: nil, isAvailable: false)
    ]

    /// Edge cases that break layouts. Every list preview should include these.
    static let previewEdgeCases: [Product] = [
        Product(id: UUID(), name: String(repeating: "Very long product name ", count: 6),
                description: "", price: 0, category: .home, imageURL: nil, isAvailable: true),
        Product(id: UUID(), name: "Ünïcödé — 日本語 — العربية",
                description: "", price: 1_299_999.99, category: .books, imageURL: nil, isAvailable: true)
    ]
}
#endif
```

Fixtures that only contain happy-path data hide the bugs you most need previews
to reveal: truncation, wrapping at accessibility text sizes, RTL layout,
currency formatting, and zero/huge values.

### A mock service with a scenario switch

```swift
#if DEBUG
actor MockProductService: ProductService {
    enum Scenario: String, CaseIterable, Sendable {
        case populated, empty, slow, offline, partialFailure
    }

    private let scenario: Scenario
    init(_ scenario: Scenario = .populated) { self.scenario = scenario }

    func fetch() async throws -> [Product] {
        switch scenario {
        case .populated:
            try await Task.sleep(for: .milliseconds(300))    // realistic latency
            return Product.previewCatalog
        case .empty:
            return []
        case .slow:
            try await Task.sleep(for: .seconds(5))           // exercise the spinner
            return Product.previewCatalog
        case .offline:
            throw URLError(.notConnectedToInternet)
        case .partialFailure:
            return Product.previewCatalog.filter { $0.isAvailable }
        }
    }
}
#endif
```

### One preview per state — not one per screen

```swift
#if DEBUG
#Preview("Populated") {
    NavigationStack {
        ProductListView(viewModel: .init(service: MockProductService(.populated)))
    }
}

#Preview("Empty") {
    NavigationStack {
        ProductListView(viewModel: .init(service: MockProductService(.empty)))
    }
}

#Preview("Loading") {
    NavigationStack {
        ProductListView(viewModel: .init(service: MockProductService(.slow)))
    }
}

#Preview("Offline") {
    NavigationStack {
        ProductListView(viewModel: .init(service: MockProductService(.offline)))
    }
}

#Preview("Dark + A11y5") {
    NavigationStack {
        ProductListView(viewModel: .init(service: MockProductService(.populated)))
    }
    .preferredColorScheme(.dark)
    .dynamicTypeSize(.accessibility5)
}
#endif
```

A screen with one "it works" preview is under-previewed. Loading, empty, and
error states are where UI bugs live, and they are nearly free to check here.

### Whole-graph mocks

Because the composition root is a protocol
(`patterns/clean-architecture.md`), one line swaps every dependency:

```swift
#if DEBUG
@MainActor
struct MockDependencies: AppDependencies {
    var scenario: MockProductService.Scenario = .populated

    func makeFetchProductsUseCase() -> any FetchProductsUseCaseProtocol {
        FetchProductsUseCase(repository: MockProductRepository(scenario: scenario))
    }
    // …
}

#Preview("Whole app, offline") {
    RootView().environment(\.dependencies, MockDependencies(scenario: .offline))
}
#endif
```

### Tier 2 rules

- Wrapped in `#if DEBUG`. Mock data must not be linkable in a release build.
- Realistic values, realistic latency. A mock that returns instantly hides every
  loading-state bug.
- Include edge cases: empty, one item, very long strings, non-Latin scripts,
  extreme numbers.
- Deterministic. No `Bool.random()` in a mock — a preview that differs each time
  cannot be reviewed.

---

## Tier 3 — Environment Flags

**Owner:** the app target. **Lifetime:** one launch. **Rule:** off by default,
impossible in release.

Tiers 1 and 2 are chosen at compile time. Tier 3 chooses at **launch** time,
which is what lets a UI test, a QA tester, or a demo build steer a real binary.

### A single typed configuration

```swift
struct AppConfiguration: Sendable {
    enum DataSource: String { case live, mock, fixture }

    var dataSource: DataSource
    var isAnimationDisabled: Bool
    var seedScenario: String?
    var forcedLocale: String?

    static func current(
        arguments: [String] = ProcessInfo.processInfo.arguments,
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) -> AppConfiguration {
        #if DEBUG
        return AppConfiguration(
            dataSource: environment["DATA_SOURCE"]
                .flatMap(DataSource.init(rawValue:)) ?? .live,
            isAnimationDisabled: arguments.contains("-UITestDisableAnimations"),
            seedScenario: environment["SEED_SCENARIO"],
            forcedLocale: environment["FORCED_LOCALE"]
        )
        #else
        // Release builds ignore every flag. This is the whole point.
        return AppConfiguration(
            dataSource: .live,
            isAnimationDisabled: false,
            seedScenario: nil,
            forcedLocale: nil
        )
        #endif
    }
}
```

### Selecting the graph at launch

```swift
@main
struct ShopApp: App {
    @State private var dependencies: any AppDependencies

    init() {
        let config = AppConfiguration.current()
        switch config.dataSource {
        case .live:
            _dependencies = State(initialValue: LiveDependencies(baseURL: .production))
        case .mock, .fixture:
            #if DEBUG
            _dependencies = State(initialValue: MockDependencies(
                scenario: .init(rawValue: config.seedScenario ?? "") ?? .populated
            ))
            #else
            _dependencies = State(initialValue: LiveDependencies(baseURL: .production))
            #endif
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView().environment(\.dependencies, dependencies)
        }
    }
}
```

### Driving it from a UI test

This is where the three tiers meet — a Tier 1 test, launching with a Tier 3 flag,
selecting Tier 2 data:

```swift
final class ProductListUITests: XCTestCase {
    func testEmptyStateIsShown() {
        let app = XCUIApplication()
        app.launchEnvironment["DATA_SOURCE"] = "mock"
        app.launchEnvironment["SEED_SCENARIO"] = "empty"
        app.launchArguments += ["-UITestDisableAnimations"]
        app.launch()

        XCTAssertTrue(app.staticTexts["No products yet"].waitForExistence(timeout: 2))
    }

    func testOfflineBannerAppears() {
        let app = XCUIApplication()
        app.launchEnvironment["DATA_SOURCE"] = "mock"
        app.launchEnvironment["SEED_SCENARIO"] = "offline"
        app.launch()

        XCTAssertTrue(app.staticTexts["You're offline"].waitForExistence(timeout: 2))
    }
}
```

Deterministic UI tests without a network are the payoff for every protocol
boundary in the codebase. If a UI test needs a live backend, the seam is missing.

Disable animations in UI tests — they are the leading cause of flaky waits:

```swift
if AppConfiguration.current().isAnimationDisabled {
    UIView.setAnimationsEnabled(false)
}
```

### A debug menu for QA

Flags set at launch cover automation. A debug menu covers exploratory testing on
a device where nobody can set an environment variable.

```swift
#if DEBUG
struct DebugMenu: View {
    @Environment(\.dependencies) private var dependencies
    @AppStorage("debug.scenario") private var scenario = "populated"
    @AppStorage("debug.slowNetwork") private var slowNetwork = false

    var body: some View {
        Form {
            Section("Data") {
                Picker("Scenario", selection: $scenario) {
                    ForEach(MockProductService.Scenario.allCases, id: \.self) {
                        Text($0.rawValue.capitalized).tag($0.rawValue)
                    }
                }
                Toggle("Simulate slow network", isOn: $slowNetwork)
            }
            Section("State") {
                Button("Reset onboarding") { … }
                Button("Clear cache") { … }
                Button("Force token expiry") { … }
            }
            Section("Diagnostics") {
                LabeledContent("Build", value: Bundle.main.buildNumber)
                LabeledContent("API", value: dependencies.baseURL.absoluteString)
                NavigationLink("Recent logs") { LogViewerView() }
            }
        }
        .navigationTitle("Debug")
    }
}

// Reachable only in DEBUG, via a gesture that cannot be hit accidentally.
extension View {
    func debugMenuGesture() -> some View {
        #if DEBUG
        onTapGesture(count: 3) { … }
        #else
        self
        #endif
    }
}
#endif
```

Log-based diagnostics belong in `OSLog`, not `print` — see
`docs/frameworks/oslog.md`. `Logger` output is structured, redacts by default,
and is free in release builds.

### Tier 3 rules

- **Every flag is a no-op in release.** The `#else` branch above is not optional;
  it is the safety property that makes flags acceptable to ship.
- One `AppConfiguration` type. Scattered `ProcessInfo.processInfo.environment[…]`
  lookups become untraceable within a month.
- Never gate a *feature* behind a debug flag and ship it. That is a feature flag,
  and it belongs in a remote-config system with its own kill switch.
- Never let a flag select a live production endpoint from a test path.

---

## Choosing a Tier

| You are… | Tier |
|----------|------|
| Unit-testing a view model | 1 — stub or fake in the test target |
| Verifying an analytics call fired | 1 — spy |
| Testing a networking layer | 1 — `URLProtocol` stub |
| Building a preview for a screen | 2 — rich mock, one preview per state |
| Reviewing a design without a backend | 2 — rich mock |
| Writing a UI test | 3 (launch flag) + 2 (mock data) |
| Demoing on a plane | 3 — mock data source |
| QA exploring on a device | 3 — debug menu |
| Shipping to the App Store | none — Tier 2 and 3 compile out |

---

## Checklist

- [ ] Every dependency is a protocol; nothing constructs a live implementation
      as a default argument.
- [ ] Test doubles that get reconfigured after injection are reference types.
- [ ] Doubles can simulate failure, latency, hang, and cancellation.
- [ ] All mock data and mock services are inside `#if DEBUG`.
- [ ] Every screen has previews for loaded, empty, loading, and error states.
- [ ] At least one preview per screen runs in dark mode at an accessibility size.
- [ ] `AppConfiguration` is the only reader of launch arguments and environment.
- [ ] Every flag has a release branch that ignores it.
- [ ] UI tests launch with mock data and never touch a live backend.
- [ ] No `print` for diagnostics — `Logger` from `OSLog`.
