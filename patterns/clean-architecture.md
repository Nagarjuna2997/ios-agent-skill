# Clean Architecture

## Layer Separation

```
┌──────────────────────────────────────────────────────────┐
│                   Presentation Layer                      │
│  Views (SwiftUI) ←→ ViewModels (@MainActor @Observable)   │
│  Depends on: Domain BOUNDARY PROTOCOLS only               │
│  (never on concrete use cases, repositories, or clients)  │
└────────────────────────────┬─────────────────────────────┘
                             │ depends on abstractions
┌────────────────────────────▼─────────────────────────────┐
│                     Domain Layer                          │
│  Entities                                                 │
│  Inbound boundary:  use-case protocols  (driving ports)   │
│  Outbound boundary: repository protocols (driven ports)   │
│  Concrete use-case implementations                        │
│  Depends on: Nothing (pure Swift, no UIKit/SwiftUI)       │
└────────────────────────────┬─────────────────────────────┘
                             │ implements outbound ports
┌────────────────────────────▼─────────────────────────────┐
│                      Data Layer                           │
│  Repository Implementations, API Client, Local Storage    │
│  Depends on: Domain (implements protocols)                 │
└──────────────────────────────────────────────────────────┘
```

### The two rules that make this Clean Architecture

1. **Dependencies point inward.** The Domain layer knows nothing about Data or
   Presentation. It imports `Foundation` and nothing else.
2. **Every layer crossing goes through a protocol (Inversion of Control).** A
   layer never names a concrete type from an adjacent layer. The Presentation
   layer is compiled against `any FetchProductsUseCaseProtocol`, not
   `FetchProductsUseCase`; the Domain layer is compiled against
   `any ProductRepositoryProtocol`, not `ProductRepository`.

Rule 1 without rule 2 is the most common failure: a view model that stores a
concrete `FetchProductsUseCase` struct still technically "depends inward," but
it cannot be unit tested or previewed without dragging in the real repository,
the real `APIClient`, and a live network. **The seam is the protocol, not the
folder.**

| Boundary | Declared in | Implemented in | Consumed by |
|----------|-------------|----------------|-------------|
| Use-case protocol (inbound / driving port) | Domain | Domain | Presentation |
| Repository protocol (outbound / driven port) | Domain | Data | Domain |

---

## Domain Layer

### Entities

```swift
// Domain/Entities/Product.swift
struct Product: Identifiable, Hashable, Sendable {
    let id: UUID
    var name: String
    var description: String
    var price: Decimal
    var category: Category
    var imageURL: URL?
    var isAvailable: Bool

    enum Category: String, CaseIterable, Sendable {
        case electronics, clothing, books, home
    }
}

// Domain/Entities/CartItem.swift
struct CartItem: Identifiable, Sendable {
    let id: UUID
    let product: Product
    var quantity: Int

    var subtotal: Decimal { product.price * Decimal(quantity) }
}

// Domain/Entities/Order.swift
struct Order: Identifiable, Sendable {
    let id: UUID
    let items: [CartItem]
    let shippingAddress: Address
    let createdAt: Date
    var status: Status

    var total: Decimal { items.reduce(0) { $0 + $1.subtotal } }

    enum Status: String, Sendable {
        case pending, processing, shipped, delivered, cancelled
    }
}
```

### Repository Protocols (defined in Domain)

```swift
// Domain/Repositories/ProductRepositoryProtocol.swift
protocol ProductRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [Product]
    func fetchByCategory(_ category: Product.Category) async throws -> [Product]
    func fetch(id: UUID) async throws -> Product
    func search(query: String) async throws -> [Product]
}

// Domain/Repositories/OrderRepositoryProtocol.swift
protocol OrderRepositoryProtocol: Sendable {
    func placeOrder(_ order: Order) async throws -> Order
    func fetchOrders() async throws -> [Order]
    func cancelOrder(id: UUID) async throws
}
```

### Use-Case Protocols (the inbound boundary)

Every use case ships as a **protocol plus an implementation**. The protocol is
the only thing the Presentation layer is allowed to name. Keep the protocols
tiny — one method, `execute`, per business operation — so a test double is three
lines instead of thirty.

```swift
// Domain/UseCases/Boundaries.swift
protocol FetchProductsUseCaseProtocol: Sendable {
    func execute(category: Product.Category?) async throws -> [Product]
}

protocol SearchProductsUseCaseProtocol: Sendable {
    func execute(query: String) async throws -> [Product]
}

protocol PlaceOrderUseCaseProtocol: Sendable {
    func execute(items: [CartItem], address: Address) async throws -> Order
}
```

Note there is **no default argument** in the protocol requirement — protocols
cannot declare them. Put the ergonomic overload in an extension so every
conformer inherits it:

```swift
extension FetchProductsUseCaseProtocol {
    func execute() async throws -> [Product] {
        try await execute(category: nil)
    }
}
```

### Use Cases / Interactors

Each use case encapsulates a single business operation and conforms to its
boundary protocol.

```swift
// Domain/UseCases/FetchProductsUseCase.swift
struct FetchProductsUseCase: FetchProductsUseCaseProtocol {
    private let repository: any ProductRepositoryProtocol

    init(repository: any ProductRepositoryProtocol) {
        self.repository = repository
    }

    func execute(category: Product.Category?) async throws -> [Product] {
        if let category {
            return try await repository.fetchByCategory(category)
        }
        return try await repository.fetchAll()
    }
}

// Domain/UseCases/SearchProductsUseCase.swift
struct SearchProductsUseCase: SearchProductsUseCaseProtocol {
    private let repository: any ProductRepositoryProtocol

    init(repository: any ProductRepositoryProtocol) {
        self.repository = repository
    }

    func execute(query: String) async throws -> [Product] {
        guard query.count >= 2 else { return [] }
        return try await repository.search(query: query)
    }
}

// Domain/UseCases/PlaceOrderUseCase.swift
struct PlaceOrderUseCase: PlaceOrderUseCaseProtocol {
    private let orderRepository: any OrderRepositoryProtocol
    private let productRepository: any ProductRepositoryProtocol

    init(orderRepository: any OrderRepositoryProtocol, productRepository: any ProductRepositoryProtocol) {
        self.orderRepository = orderRepository
        self.productRepository = productRepository
    }

    func execute(items: [CartItem], address: Address) async throws -> Order {
        // Business rule: validate all items are still available
        for item in items {
            let product = try await productRepository.fetch(id: item.product.id)
            guard product.isAvailable else {
                throw DomainError.productUnavailable(product.name)
            }
        }

        // Business rule: minimum order amount
        let total = items.reduce(Decimal.zero) { $0 + $1.subtotal }
        guard total >= 10.00 else {
            throw DomainError.minimumOrderNotMet(minimum: 10.00)
        }

        let order = Order(
            id: UUID(), items: items,
            shippingAddress: address,
            createdAt: .now, status: .pending
        )
        return try await orderRepository.placeOrder(order)
    }
}

enum DomainError: LocalizedError {
    case productUnavailable(String)
    case minimumOrderNotMet(minimum: Decimal)

    var errorDescription: String? {
        switch self {
        case .productUnavailable(let name): "'\(name)' is no longer available."
        case .minimumOrderNotMet(let min): "Minimum order is \(min). Please add more items."
        }
    }
}
```

---

## Data Layer

### DTOs (Data Transfer Objects)

```swift
// Data/DTOs/ProductDTO.swift
struct ProductDTO: Decodable {
    let id: String
    let name: String
    let description: String
    let price: Double
    let category: String
    let image_url: String?
    let in_stock: Bool

    func toDomain() -> Product {
        Product(
            id: UUID(uuidString: id) ?? UUID(),
            name: name,
            description: description,
            price: Decimal(price),
            category: Product.Category(rawValue: category) ?? .electronics,
            imageURL: image_url.flatMap(URL.init(string:)),
            isAvailable: in_stock
        )
    }
}

// Data/DTOs/OrderDTO.swift
struct OrderRequestDTO: Encodable {
    let items: [ItemDTO]
    let shipping_address: AddressDTO

    struct ItemDTO: Encodable {
        let product_id: String
        let quantity: Int
    }

    struct AddressDTO: Encodable {
        let street: String
        let city: String
        let state: String
        let zip: String
    }

    static func fromDomain(items: [CartItem], address: Address) -> Self {
        OrderRequestDTO(
            items: items.map { .init(product_id: $0.product.id.uuidString, quantity: $0.quantity) },
            shipping_address: .init(street: address.street, city: address.city, state: address.state, zip: address.zip)
        )
    }
}
```

### Repository Implementation

```swift
// Data/Repositories/ProductRepository.swift
struct ProductRepository: ProductRepositoryProtocol {
    private let apiClient: APIClient
    private let cache: CacheService

    init(apiClient: APIClient, cache: CacheService) {
        self.apiClient = apiClient
        self.cache = cache
    }

    func fetchAll() async throws -> [Product] {
        // Check cache first
        if let cached: [ProductDTO] = await cache.get(key: "products") {
            return cached.map { $0.toDomain() }
        }

        let dtos: [ProductDTO] = try await apiClient.get("/products")
        await cache.set(key: "products", value: dtos, ttl: 300)
        return dtos.map { $0.toDomain() }
    }

    func fetchByCategory(_ category: Product.Category) async throws -> [Product] {
        let dtos: [ProductDTO] = try await apiClient.get("/products?category=\(category.rawValue)")
        return dtos.map { $0.toDomain() }
    }

    func fetch(id: UUID) async throws -> Product {
        let dto: ProductDTO = try await apiClient.get("/products/\(id)")
        return dto.toDomain()
    }

    func search(query: String) async throws -> [Product] {
        let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        let dtos: [ProductDTO] = try await apiClient.get("/products/search?q=\(encoded)")
        return dtos.map { $0.toDomain() }
    }
}
```

### API Client

```swift
// Data/Network/APIClient.swift
actor APIClient {
    // No `static let shared`. The composition root owns exactly one instance
    // and hands it to the repositories that need it — see Composition Root below.
    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func get<T: Decodable>(_ path: String) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await session.data(for: request)
        try validate(response)
        return try decoder.decode(T.self, from: data)
    }

    func post<Body: Encodable, Response: Decodable>(_ path: String, body: Body) async throws -> Response {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)
        try validate(response)
        return try decoder.decode(Response.self, from: data)
    }

    private func validate(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            throw NetworkError.httpError(statusCode: http.statusCode)
        }
    }
}
```

---

## Presentation Layer

The view model is `@MainActor`-isolated and holds **existentials of the boundary
protocols**. It never mentions `FetchProductsUseCase`, `ProductRepository`, or
`APIClient` — those names do not appear anywhere in the Presentation layer.

```swift
// Presentation/Products/ProductListViewModel.swift
@MainActor
@Observable
final class ProductListViewModel {
    // MARK: State
    private(set) var products: [Product] = []
    private(set) var searchResults: [Product] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var selectedCategory: Product.Category?

    // MARK: Dependencies — protocols only
    private let fetchProducts: any FetchProductsUseCaseProtocol
    private let searchProducts: any SearchProductsUseCaseProtocol

    init(
        fetchProducts: any FetchProductsUseCaseProtocol,
        searchProducts: any SearchProductsUseCaseProtocol
    ) {
        self.fetchProducts = fetchProducts
        self.searchProducts = searchProducts
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            products = try await fetchProducts.execute(category: selectedCategory)
            errorMessage = nil
        } catch is CancellationError {
            // Task was cancelled (view disappeared) — not a user-facing failure.
        } catch {
            // Never swallow an error into `nil`. Every failure surfaces.
            errorMessage = (error as? LocalizedError)?.errorDescription
                ?? String(localized: "Couldn't load products. Pull to refresh.")
        }
    }

    func search(query: String) async {
        do {
            searchResults = try await searchProducts.execute(query: query)
        } catch is CancellationError {
            // Superseded by a newer keystroke — leave the previous results up.
        } catch {
            searchResults = []
            errorMessage = (error as? LocalizedError)?.errorDescription
                ?? String(localized: "Search failed. Try again.")
        }
    }
}
```

Because `load()` is `@MainActor`, the assignments to `products` and `isLoading`
are guaranteed to happen on the main actor even though `execute` suspends and
runs its network work elsewhere. There is no `MainActor.run` and no
`DispatchQueue.main.async` anywhere in the file — see
`docs/swift/swift-concurrency.md` for why re-entrancy across that `await` still
needs care.

```swift
// Presentation/Products/ProductListView.swift
struct ProductListView: View {
    @State private var viewModel: ProductListViewModel
    @State private var searchText = ""

    init(viewModel: ProductListViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        List(displayedProducts) { product in
            NavigationLink(value: product) {
                ProductRow(product: product)
            }
        }
        .navigationTitle("Products")
        .searchable(text: $searchText)
        .task(id: searchText) {
            // .task(id:) cancels the in-flight search when searchText changes,
            // which is why `search` treats CancellationError as a no-op.
            await viewModel.search(query: searchText)
        }
        .task { await viewModel.load() }
        .alert(
            "Something went wrong",
            isPresented: Binding(
                get: { viewModel.errorMessage != nil },
                set: { if !$0 { viewModel.errorMessage = nil } }
            )
        ) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }

    private var displayedProducts: [Product] {
        searchText.isEmpty ? viewModel.products : viewModel.searchResults
    }
}
```

Note the view owns no `NavigationStack` — the container that presents it does.
A screen that hard-codes its own stack cannot be pushed onto another one.

### Previewing without the Data layer

This is the payoff of the IoC boundary. The preview compiles and runs with no
`APIClient`, no URL, and no network:

```swift
// Presentation/Products/Previews/PreviewUseCases.swift
extension Array where Element == Product {
    static var samples: [Product] {
        [
            Product(id: UUID(), name: "Desk Lamp", description: "Warm LED",
                    price: 49, category: .home, imageURL: nil, isAvailable: true),
            Product(id: UUID(), name: "Headphones", description: "Over-ear",
                    price: 199, category: .electronics, imageURL: nil, isAvailable: true)
        ]
    }
}

struct StubFetchProducts: FetchProductsUseCaseProtocol {
    var products: [Product] = .samples
    var error: (any Error)?
    var delay: Duration = .zero

    func execute(category: Product.Category?) async throws -> [Product] {
        if delay > .zero { try await Task.sleep(for: delay) }
        if let error { throw error }
        guard let category else { return products }
        return products.filter { $0.category == category }
    }
}

struct StubSearchProducts: SearchProductsUseCaseProtocol {
    var products: [Product] = .samples

    func execute(query: String) async throws -> [Product] {
        products.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
}

struct StubPlaceOrder: PlaceOrderUseCaseProtocol {
    var error: (any Error)?

    func execute(items: [CartItem], address: Address) async throws -> Order {
        if let error { throw error }
        return Order(id: UUID(), items: items, shippingAddress: address,
                     createdAt: .now, status: .pending)
    }
}

#Preview("Loaded") {
    NavigationStack {
        ProductListView(viewModel: ProductListViewModel(
            fetchProducts: StubFetchProducts(),
            searchProducts: StubSearchProducts()
        ))
    }
}

#Preview("Empty") {
    NavigationStack {
        ProductListView(viewModel: ProductListViewModel(
            fetchProducts: StubFetchProducts(products: []),
            searchProducts: StubSearchProducts(products: [])
        ))
    }
}

#Preview("Failure") {
    NavigationStack {
        ProductListView(viewModel: ProductListViewModel(
            fetchProducts: StubFetchProducts(error: DomainError.productUnavailable("Widget")),
            searchProducts: StubSearchProducts()
        ))
    }
}
```

See `docs/testing/mocking-strategy.md` for when a stub like this should graduate
to a full recording mock.

### Anti-patterns

```swift
// WRONG — Presentation names a concrete Domain type.
@Observable
final class ProductListViewModel {
    private let fetchProducts: FetchProductsUseCase   // concrete struct
}
// Every preview and unit test now needs a real ProductRepository,
// which needs a real APIClient, which needs a real URLSession.

// WRONG — Presentation reaches past the boundary into a repository.
@Observable
final class ProductListViewModel {
    private let repository: any ProductRepositoryProtocol   // skips the use case
    func load() async {
        // Business rules (minimum order, availability checks) now live in the
        // view model, where they cannot be reused or tested in isolation.
    }
}

// WRONG — Presentation pulls its own dependencies out of a global singleton.
@Observable
final class ProductListViewModel {
    private let fetchProducts = DependencyContainer.shared.makeFetchProductsUseCase()
    // Not injectable, not overridable in previews, not parallel-test-safe.
}

// RIGHT — the only concrete thing the view model knows is its own state.
@MainActor @Observable
final class ProductListViewModel {
    private let fetchProducts: any FetchProductsUseCaseProtocol
    init(fetchProducts: any FetchProductsUseCaseProtocol) { … }
}
```

---

## Composition Root (Dependency Container)

The container is the **one place in the app that is allowed to name concrete
types from every layer**. It is itself declared as a protocol so tests, previews,
and App Clips can substitute a whole graph at once.

```swift
// App/Composition/AppDependencies.swift
@MainActor
protocol AppDependencies {
    func makeFetchProductsUseCase() -> any FetchProductsUseCaseProtocol
    func makeSearchProductsUseCase() -> any SearchProductsUseCaseProtocol
    func makePlaceOrderUseCase() -> any PlaceOrderUseCaseProtocol
}

// Factories for whole screens live alongside the graph, so no View ever
// assembles its own dependencies.
extension AppDependencies {
    func makeProductListViewModel() -> ProductListViewModel {
        ProductListViewModel(
            fetchProducts: makeFetchProductsUseCase(),
            searchProducts: makeSearchProductsUseCase()
        )
    }
}

// App/Composition/LiveDependencies.swift — the only file that imports the Data layer
@MainActor
final class LiveDependencies: AppDependencies {
    private let apiClient: APIClient
    private let cacheService: CacheService
    private let productRepository: any ProductRepositoryProtocol
    private let orderRepository: any OrderRepositoryProtocol

    init(baseURL: URL) {
        self.apiClient = APIClient(baseURL: baseURL)
        self.cacheService = CacheService()
        self.productRepository = ProductRepository(apiClient: apiClient, cache: cacheService)
        self.orderRepository = OrderRepository(apiClient: apiClient)
    }

    func makeFetchProductsUseCase() -> any FetchProductsUseCaseProtocol {
        FetchProductsUseCase(repository: productRepository)
    }

    func makeSearchProductsUseCase() -> any SearchProductsUseCaseProtocol {
        SearchProductsUseCase(repository: productRepository)
    }

    func makePlaceOrderUseCase() -> any PlaceOrderUseCaseProtocol {
        PlaceOrderUseCase(orderRepository: orderRepository, productRepository: productRepository)
    }
}
```

### Injecting the graph through the environment

Prefer `@Environment` over a global `shared` singleton: a singleton is
unswappable per-test, leaks state between parallel tests, and makes previews
depend on app launch order.

```swift
// App/Composition/DependenciesKey.swift
private struct DependenciesKey: @preconcurrency EnvironmentKey {
    @MainActor static let defaultValue: any AppDependencies = PreviewDependencies()
}

extension EnvironmentValues {
    var dependencies: any AppDependencies {
        get { self[DependenciesKey.self] }
        set { self[DependenciesKey.self] = newValue }
    }
}

@main
struct ShopApp: App {
    @State private var dependencies = LiveDependencies(
        baseURL: URL(string: "https://api.example.com/v1")!
    )

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(\.dependencies, dependencies)
        }
    }
}

// A screen builds its view model from the injected graph — never from a global.
struct ProductListScreen: View {
    @Environment(\.dependencies) private var dependencies
    @State private var viewModel: ProductListViewModel?

    var body: some View {
        Group {
            if let viewModel {
                ProductListView(viewModel: viewModel)
            } else {
                ProgressView()
            }
        }
        .onAppear {
            // @Environment is not readable in init, so build once on first appear.
            if viewModel == nil { viewModel = dependencies.makeProductListViewModel() }
        }
    }
}
```

If you would rather keep view-model construction out of `onAppear`, pass the
container down explicitly from the composition root instead:

```swift
struct RootView: View {
    @Environment(\.dependencies) private var dependencies

    var body: some View {
        NavigationStack {
            ProductListView(viewModel: dependencies.makeProductListViewModel())
        }
    }
}
```

Both are fine. What is **not** fine is a view model that constructs its own use
cases, or a view that constructs an `APIClient`.

---

## Testing

Each boundary is tested against the layer below it through its protocol, so a
test never reaches more than one layer deep.

### Domain: use case against a fake repository

```swift
import Testing

struct FakeProductRepository: ProductRepositoryProtocol {
    var stubbedProduct: Product
    func fetchAll() async throws -> [Product] { [stubbedProduct] }
    func fetchByCategory(_ category: Product.Category) async throws -> [Product] { [stubbedProduct] }
    func fetch(id: UUID) async throws -> Product { stubbedProduct }
    func search(query: String) async throws -> [Product] { [stubbedProduct] }
}

struct FakeOrderRepository: OrderRepositoryProtocol {
    func placeOrder(_ order: Order) async throws -> Order { order }
    func fetchOrders() async throws -> [Order] { [] }
    func cancelOrder(id: UUID) async throws {}
}

@Suite("PlaceOrderUseCase")
struct PlaceOrderUseCaseTests {

    @Test("rejects order with unavailable product")
    func unavailableProduct() async {
        let product = Product(
            id: UUID(), name: "Widget", description: "", price: 20,
            category: .electronics, imageURL: nil, isAvailable: false
        )
        let useCase = PlaceOrderUseCase(
            orderRepository: FakeOrderRepository(),
            productRepository: FakeProductRepository(stubbedProduct: product)
        )
        let item = CartItem(id: UUID(), product: product, quantity: 1)

        await #expect(throws: DomainError.self) {
            try await useCase.execute(items: [item], address: .sample)
        }
    }

    @Test("rejects order below minimum amount")
    func belowMinimum() async {
        let product = Product(
            id: UUID(), name: "Sticker", description: "", price: 1,
            category: .home, imageURL: nil, isAvailable: true
        )
        let useCase = PlaceOrderUseCase(
            orderRepository: FakeOrderRepository(),
            productRepository: FakeProductRepository(stubbedProduct: product)
        )
        let item = CartItem(id: UUID(), product: product, quantity: 1)

        await #expect(throws: DomainError.self) {
            try await useCase.execute(items: [item], address: .sample)
        }
    }
}
```

### Presentation: view model against fake use cases

The view model is `@MainActor`, so the suite must be too.

```swift
@MainActor
@Suite("ProductListViewModel")
struct ProductListViewModelTests {

    @Test("surfaces a message when loading fails")
    func loadFailure() async {
        let viewModel = ProductListViewModel(
            fetchProducts: StubFetchProducts(error: DomainError.productUnavailable("Widget")),
            searchProducts: StubSearchProducts()
        )

        await viewModel.load()

        #expect(viewModel.products.isEmpty)
        #expect(viewModel.errorMessage != nil)   // never silently nil
        #expect(viewModel.isLoading == false)
    }

    @Test("cancellation does not surface as an error")
    func cancellationIsSilent() async {
        let viewModel = ProductListViewModel(
            fetchProducts: StubFetchProducts(error: CancellationError()),
            searchProducts: StubSearchProducts()
        )

        await viewModel.load()

        #expect(viewModel.errorMessage == nil)
    }
}
```

### Swapping the whole graph

Because `AppDependencies` is a protocol, a UI test target or a preview can
replace every use case at once:

```swift
@MainActor
struct PreviewDependencies: AppDependencies {
    var products: [Product] = .samples
    var loadError: (any Error)?

    func makeFetchProductsUseCase() -> any FetchProductsUseCaseProtocol {
        StubFetchProducts(products: products, error: loadError)
    }
    func makeSearchProductsUseCase() -> any SearchProductsUseCaseProtocol {
        StubSearchProducts(products: products)
    }
    func makePlaceOrderUseCase() -> any PlaceOrderUseCaseProtocol {
        StubPlaceOrder()
    }
}

#Preview("Whole app, no network") {
    RootView()
        .environment(\.dependencies, PreviewDependencies())
}
```

---

## When to Use Clean Architecture

| Project Size | Recommendation |
|-------------|---------------|
| Small / prototype | MVVM is sufficient; Clean Architecture adds overhead |
| Medium (5-15 screens) | Introduce use cases for complex business logic |
| Large / team project | Full Clean Architecture with strict layer boundaries |
| SDK / framework | Domain layer becomes the public API |

---

## IoC Review Checklist

Run this against any Clean Architecture code you generate or review. Every
answer must be yes.

- [ ] Does every use case have a protocol, and does the Presentation layer name
      only the protocol?
- [ ] Are all view-model dependencies `any SomeProtocol`, injected through
      `init`, with no default value that constructs a live implementation?
- [ ] Can every screen be rendered in `#Preview` with zero network, zero disk,
      and zero `URL`s?
- [ ] Is the Domain layer free of `import SwiftUI`, `import UIKit`, and
      `import SwiftData`?
- [ ] Do concrete Data-layer type names (`APIClient`, `ProductRepository`,
      `URLSession`) appear **only** in the Data layer and the composition root?
- [ ] Is there exactly one composition root, injected via `@Environment`, rather
      than a `.shared` singleton read from inside view models?
- [ ] Is every view model `@MainActor @Observable final class`?
- [ ] Does every `catch` produce either a user-visible message or a documented
      deliberate no-op (like `CancellationError`)? No `catch { }` and no
      `error = nil`.

### Quick grep

```bash
# Presentation must not name concrete Data-layer types.
grep -rn "APIClient\|URLSession\|ModelContext" Sources/Presentation/

# Domain must not import UI frameworks.
grep -rn "import SwiftUI\|import UIKit" Sources/Domain/

# View models must not resolve their own dependencies.
grep -rn "\.shared" Sources/Presentation/
```

All three should return nothing.
