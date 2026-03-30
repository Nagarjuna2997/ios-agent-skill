# Testing Checklist

## XCTest Setup and Patterns

### Test Target Configuration
- [ ] Test target added to project (`File > New > Target > Unit Testing Bundle`)
- [ ] `@testable import MyApp` in test files
- [ ] Test host set to app target (for integration tests) or None (for pure unit tests)
- [ ] Parallel testing enabled for speed (`Edit Scheme > Test > Options`)

### XCTest Basics

```swift
import XCTest
@testable import MyApp

final class UserServiceTests: XCTestCase {
    var sut: UserService!  // System Under Test
    var mockRepository: MockUserRepository!

    override func setUp() {
        super.setUp()
        mockRepository = MockUserRepository()
        sut = UserService(repository: mockRepository)
    }

    override func tearDown() {
        sut = nil
        mockRepository = nil
        super.tearDown()
    }

    func testFetchUser_withValidID_returnsUser() async throws {
        // Given
        let expectedUser = User(id: "1", name: "Alice")
        mockRepository.stubbedUser = expectedUser

        // When
        let user = try await sut.fetchUser(id: "1")

        // Then
        XCTAssertEqual(user.name, "Alice")
        XCTAssertEqual(mockRepository.fetchCallCount, 1)
    }

    func testFetchUser_withInvalidID_throwsNotFound() async {
        // Given
        mockRepository.error = .notFound

        // When/Then
        do {
            _ = try await sut.fetchUser(id: "invalid")
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertEqual(error as? ServiceError, .notFound)
        }
    }
}
```

---

## Swift Testing Framework (@Test, #expect)

Swift Testing (available in Xcode 16+) provides a modern, expressive syntax.

```swift
import Testing
@testable import MyApp

@Suite("CartViewModel Tests")
struct CartViewModelTests {

    @Test("adds item to cart")
    func addItem() async {
        let vm = CartViewModel(repository: MockCartRepository())
        let product = Product.sample

        await vm.addToCart(product, quantity: 2)

        #expect(vm.items.count == 1)
        #expect(vm.items.first?.quantity == 2)
    }

    @Test("calculates total correctly")
    func total() {
        let vm = CartViewModel(repository: MockCartRepository())
        vm.items = [
            CartItem(product: .init(id: UUID(), name: "A", price: 10.00), quantity: 2),
            CartItem(product: .init(id: UUID(), name: "B", price: 5.50), quantity: 1),
        ]

        #expect(vm.total == 25.50)
    }

    @Test("removes item from cart")
    func removeItem() async {
        let vm = CartViewModel(repository: MockCartRepository())
        let product = Product.sample
        await vm.addToCart(product, quantity: 1)

        await vm.removeFromCart(product.id)

        #expect(vm.items.isEmpty)
    }

    @Test("empty cart has zero total")
    func emptyTotal() {
        let vm = CartViewModel(repository: MockCartRepository())
        #expect(vm.total == 0)
    }

    // Parameterized tests
    @Test("validates quantity limits", arguments: [0, -1, 101])
    func invalidQuantity(quantity: Int) async {
        let vm = CartViewModel(repository: MockCartRepository())
        await vm.addToCart(.sample, quantity: quantity)
        #expect(vm.items.isEmpty)
    }

    // Tags for organizing
    @Test("applies discount code", .tags(.checkout))
    func discount() async {
        let vm = CartViewModel(repository: MockCartRepository())
        vm.items = [CartItem(product: .init(id: UUID(), name: "A", price: 100), quantity: 1)]

        await vm.applyDiscount(code: "SAVE20")

        #expect(vm.discount == 20.00)
        #expect(vm.total == 80.00)
    }
}

extension Tag {
    @Tag static var checkout: Self
}
```

---

## Unit Testing ViewModels

### Pattern: Test State Transitions

```swift
@Suite("LoginViewModel")
struct LoginViewModelTests {
    let mockAuth = MockAuthService()

    @Test("initial state is idle")
    func initialState() {
        let vm = LoginViewModel(authService: mockAuth)
        #expect(vm.state == .idle)
        #expect(vm.email == "")
        #expect(vm.password == "")
    }

    @Test("login with valid credentials succeeds")
    func successfulLogin() async {
        mockAuth.shouldSucceed = true
        let vm = LoginViewModel(authService: mockAuth)
        vm.email = "user@example.com"
        vm.password = "password123"

        await vm.login()

        #expect(vm.state == .authenticated)
        #expect(vm.error == nil)
    }

    @Test("login with empty email shows validation error")
    func emptyEmail() async {
        let vm = LoginViewModel(authService: mockAuth)
        vm.email = ""
        vm.password = "password123"

        await vm.login()

        #expect(vm.state == .idle)
        #expect(vm.error?.localizedDescription.contains("email") == true)
    }

    @Test("login failure shows error")
    func loginFailure() async {
        mockAuth.shouldSucceed = false
        mockAuth.errorToThrow = AuthError.invalidCredentials
        let vm = LoginViewModel(authService: mockAuth)
        vm.email = "user@example.com"
        vm.password = "wrong"

        await vm.login()

        #expect(vm.state == .idle)
        #expect(vm.error != nil)
    }

    @Test("loading state set during login")
    func loadingState() async {
        mockAuth.delay = 0.1
        mockAuth.shouldSucceed = true
        let vm = LoginViewModel(authService: mockAuth)
        vm.email = "user@example.com"
        vm.password = "pass"

        let task = Task { await vm.login() }
        try? await Task.sleep(for: .milliseconds(50))
        #expect(vm.state == .loading)
        await task.value
        #expect(vm.state == .authenticated)
    }
}
```

---

## UI Testing with XCUITest

```swift
import XCTest

final class LoginUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launchArguments = ["--uitesting"]  // Flag to use mock data
        app.launchEnvironment = ["DISABLE_ANIMATIONS": "1"]
        app.launch()
    }

    func testSuccessfulLogin() {
        let emailField = app.textFields["email-field"]
        let passwordField = app.secureTextFields["password-field"]
        let loginButton = app.buttons["login-button"]

        emailField.tap()
        emailField.typeText("test@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Wait for navigation
        let dashboard = app.staticTexts["Welcome"]
        XCTAssertTrue(dashboard.waitForExistence(timeout: 5))
    }

    func testEmptyFieldsShowError() {
        let loginButton = app.buttons["login-button"]
        loginButton.tap()

        let errorMessage = app.staticTexts["error-message"]
        XCTAssertTrue(errorMessage.waitForExistence(timeout: 2))
        XCTAssertTrue(errorMessage.label.contains("required"))
    }

    func testNavigationToSignUp() {
        app.buttons["sign-up-link"].tap()
        XCTAssertTrue(app.navigationBars["Create Account"].waitForExistence(timeout: 2))
    }
}

// Make views testable with accessibility identifiers
struct LoginView: View {
    var body: some View {
        TextField("Email", text: $email)
            .accessibilityIdentifier("email-field")
        SecureField("Password", text: $password)
            .accessibilityIdentifier("password-field")
        Button("Log In") { /* ... */ }
            .accessibilityIdentifier("login-button")
    }
}
```

---

## Snapshot Testing

Using Swift Snapshot Testing (pointfreeco/swift-snapshot-testing):

```swift
import SnapshotTesting
import SwiftUI
import XCTest
@testable import MyApp

final class ComponentSnapshotTests: XCTestCase {

    func testProfileCard_light() {
        let view = ProfileCardView(user: .sample)
            .frame(width: 375)
            .environment(\.colorScheme, .light)

        let controller = UIHostingController(rootView: view)
        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }

    func testProfileCard_dark() {
        let view = ProfileCardView(user: .sample)
            .frame(width: 375)
            .environment(\.colorScheme, .dark)

        let controller = UIHostingController(rootView: view)
        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }

    func testProfileCard_dynamicType() {
        let view = ProfileCardView(user: .sample)
            .frame(width: 375)
            .environment(\.sizeCategory, .accessibilityExtraExtraLarge)

        let controller = UIHostingController(rootView: view)
        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }

    // Record new snapshots when UI changes intentionally
    func testProfileCard_record() {
        let view = ProfileCardView(user: .sample).frame(width: 375)
        let controller = UIHostingController(rootView: view)
        // Set record = true to update reference images
        assertSnapshot(of: controller, as: .image(on: .iPhone13), record: false)
    }
}
```

---

## Network Mocking

### URLProtocol-Based Mocking

```swift
class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.requestHandler else {
            client?.urlProtocolDidFinishLoading(self)
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
}

// Usage in tests
@Suite("APIClient")
struct APIClientTests {
    @Test("fetches products successfully")
    func fetchProducts() async throws {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)
        let client = APIClient(session: session)

        let responseData = try JSONEncoder().encode([ProductDTO.sample])
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, responseData)
        }

        let products: [ProductDTO] = try await client.get("/products")
        #expect(products.count == 1)
    }

    @Test("handles 404 error")
    func notFound() async {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)
        let client = APIClient(session: session)

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 404, httpVersion: nil, headerFields: nil)!
            return (response, Data())
        }

        await #expect(throws: NetworkError.self) {
            let _: ProductDTO = try await client.get("/products/unknown")
        }
    }
}
```

---

## Code Coverage

### Configuration
- [ ] Enable code coverage in Test scheme: `Edit Scheme > Test > Options > Code Coverage`
- [ ] Set minimum coverage targets per module

### Coverage Targets

| Layer | Minimum | Ideal |
|-------|---------|-------|
| ViewModels / Use Cases | 80% | 95% |
| Repository / Network | 70% | 85% |
| Models / Utilities | 90% | 100% |
| Views | 30% | 50% |
| Overall | 60% | 80% |

```bash
# Generate coverage report from CLI
xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16' \
  -enableCodeCoverage YES \
  -resultBundlePath TestResults.xcresult

# Extract coverage data
xcrun xccov view --report TestResults.xcresult
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.app

      - name: Run Tests
        run: |
          xcodebuild test \
            -scheme MyApp \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0' \
            -enableCodeCoverage YES \
            -resultBundlePath TestResults.xcresult \
            | xcbeautify

      - name: Upload Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: TestResults.xcresult
```

### Testing Best Practices
- [ ] Tests run in CI on every PR
- [ ] Test suite completes in under 5 minutes
- [ ] Flaky tests identified and fixed (not skipped)
- [ ] UI tests run on multiple device sizes
- [ ] Tests do not depend on network or external services
- [ ] Each test is independent (no shared mutable state between tests)
- [ ] Test names describe the scenario, not the implementation
