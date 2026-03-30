# Clean Architecture

## Layer Separation

```
┌──────────────────────────────────────────────────────────┐
│                   Presentation Layer                      │
│  Views (SwiftUI) ←→ ViewModels (@Observable)              │
│  Depends on: Domain                                       │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                     Domain Layer                          │
│  Entities, Use Cases, Repository Protocols                │
│  Depends on: Nothing (pure Swift)                         │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                      Data Layer                           │
│  Repository Implementations, API Client, Local Storage    │
│  Depends on: Domain (implements protocols)                 │
└──────────────────────────────────────────────────────────┘
```

Key rule: dependencies point inward. The Domain layer knows nothing about Data or Presentation.

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

### Use Cases / Interactors

Each use case encapsulates a single business operation.

```swift
// Domain/UseCases/FetchProductsUseCase.swift
struct FetchProductsUseCase: Sendable {
    private let repository: ProductRepositoryProtocol

    init(repository: ProductRepositoryProtocol) {
        self.repository = repository
    }

    func execute(category: Product.Category? = nil) async throws -> [Product] {
        if let category {
            return try await repository.fetchByCategory(category)
        }
        return try await repository.fetchAll()
    }
}

// Domain/UseCases/SearchProductsUseCase.swift
struct SearchProductsUseCase: Sendable {
    private let repository: ProductRepositoryProtocol

    init(repository: ProductRepositoryProtocol) {
        self.repository = repository
    }

    func execute(query: String) async throws -> [Product] {
        guard query.count >= 2 else { return [] }
        return try await repository.search(query: query)
    }
}

// Domain/UseCases/PlaceOrderUseCase.swift
struct PlaceOrderUseCase: Sendable {
    private let orderRepository: OrderRepositoryProtocol
    private let productRepository: ProductRepositoryProtocol

    init(orderRepository: OrderRepositoryProtocol, productRepository: ProductRepositoryProtocol) {
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
    static let shared = APIClient()

    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder

    init(baseURL: URL = URL(string: "https://api.example.com/v1")!,
         session: URLSession = .shared) {
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

```swift
// Presentation/Products/ProductListViewModel.swift
@Observable
class ProductListViewModel {
    var products: [Product] = []
    var searchResults: [Product] = []
    var isLoading = false
    var error: DomainError?
    var selectedCategory: Product.Category?

    private let fetchProducts: FetchProductsUseCase
    private let searchProducts: SearchProductsUseCase

    init(fetchProducts: FetchProductsUseCase, searchProducts: SearchProductsUseCase) {
        self.fetchProducts = fetchProducts
        self.searchProducts = searchProducts
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            products = try await fetchProducts.execute(category: selectedCategory)
        } catch let error as DomainError {
            self.error = error
        } catch {
            self.error = nil // Handle generically
        }
    }

    func search(query: String) async {
        do {
            searchResults = try await searchProducts.execute(query: query)
        } catch {
            searchResults = []
        }
    }
}

// Presentation/Products/ProductListView.swift
struct ProductListView: View {
    @State private var viewModel: ProductListViewModel
    @State private var searchText = ""

    init(viewModel: ProductListViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        NavigationStack {
            List(displayedProducts) { product in
                NavigationLink(value: product) {
                    ProductRow(product: product)
                }
            }
            .navigationTitle("Products")
            .searchable(text: $searchText)
            .onChange(of: searchText) { _, query in
                Task { await viewModel.search(query: query) }
            }
            .task { await viewModel.load() }
        }
    }

    private var displayedProducts: [Product] {
        searchText.isEmpty ? viewModel.products : viewModel.searchResults
    }
}
```

---

## Dependency Container

```swift
@MainActor
final class DependencyContainer {
    static let shared = DependencyContainer()

    // Data layer
    lazy var apiClient = APIClient.shared
    lazy var cacheService = CacheService()

    // Repositories
    lazy var productRepository: ProductRepositoryProtocol = ProductRepository(apiClient: apiClient, cache: cacheService)
    lazy var orderRepository: OrderRepositoryProtocol = OrderRepository(apiClient: apiClient)

    // Use cases
    func makeFetchProductsUseCase() -> FetchProductsUseCase {
        FetchProductsUseCase(repository: productRepository)
    }

    func makeSearchProductsUseCase() -> SearchProductsUseCase {
        SearchProductsUseCase(repository: productRepository)
    }

    func makePlaceOrderUseCase() -> PlaceOrderUseCase {
        PlaceOrderUseCase(orderRepository: orderRepository, productRepository: productRepository)
    }

    // ViewModels
    func makeProductListViewModel() -> ProductListViewModel {
        ProductListViewModel(
            fetchProducts: makeFetchProductsUseCase(),
            searchProducts: makeSearchProductsUseCase()
        )
    }
}

// Usage in App
@main
struct ShopApp: App {
    let container = DependencyContainer.shared

    var body: some Scene {
        WindowGroup {
            ProductListView(viewModel: container.makeProductListViewModel())
        }
    }
}
```

---

## Testing

```swift
import Testing

@Suite("PlaceOrderUseCase")
struct PlaceOrderUseCaseTests {
    let productRepo = MockProductRepository()
    let orderRepo = MockOrderRepository()

    @Test("rejects order with unavailable product")
    func unavailableProduct() async {
        productRepo.stubbedProduct = Product(
            id: UUID(), name: "Widget", description: "", price: 20,
            category: .electronics, imageURL: nil, isAvailable: false
        )
        let useCase = PlaceOrderUseCase(orderRepository: orderRepo, productRepository: productRepo)
        let item = CartItem(id: UUID(), product: productRepo.stubbedProduct!, quantity: 1)

        await #expect(throws: DomainError.self) {
            try await useCase.execute(items: [item], address: .sample)
        }
    }

    @Test("rejects order below minimum amount")
    func belowMinimum() async {
        productRepo.stubbedProduct = Product(
            id: UUID(), name: "Sticker", description: "", price: 1,
            category: .home, imageURL: nil, isAvailable: true
        )
        let useCase = PlaceOrderUseCase(orderRepository: orderRepo, productRepository: productRepo)
        let item = CartItem(id: UUID(), product: productRepo.stubbedProduct!, quantity: 1)

        await #expect(throws: DomainError.self) {
            try await useCase.execute(items: [item], address: .sample)
        }
    }
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
