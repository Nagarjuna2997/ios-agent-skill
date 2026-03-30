# Testing Checklist

A comprehensive checklist covering unit, integration, UI, and snapshot testing for iOS apps. Includes setup for both XCTest and the Swift Testing framework, async testing patterns, and CI/CD integration.

---

## XCTest Setup and Conventions

- [ ] Test target added to the project (File > New > Target > Unit Testing Bundle)
- [ ] Test target has access to app module via `@testable import YourApp`
- [ ] Test files named `[ClassUnderTest]Tests.swift`
- [ ] Test methods named `test_[scenario]_[expectedBehavior]`
- [ ] Each test follows Arrange/Act/Assert (Given/When/Then) structure
- [ ] Tests are independent -- no shared mutable state between tests
- [ ] `setUp()` creates fresh instances; `tearDown()` cleans up resources
- [ ] Tests run in under 1 second each (slow tests belong in integration suite)

```swift
import XCTest
@testable import YourApp

final class ArticleViewModelTests: XCTestCase {

    private var sut: ArticleViewModel!
    private var mockRepository: MockArticleRepository!

    override func setUp() {
        super.setUp()
        mockRepository = MockArticleRepository()
        sut = ArticleViewModel(repository: mockRepository)
    }

    override func tearDown() {
        sut = nil
        mockRepository = nil
        super.tearDown()
    }

    func test_loadArticles_success_updatesArticlesList() async {
        // Arrange
        mockRepository.stubbedArticles = [
            Article(id: "1", title: "Test", body: "Body", authorId: "a1",
                    publishedAt: nil, updatedAt: Date(), tags: [])
        ]

        // Act
        await sut.loadArticles()

        // Assert
        XCTAssertEqual(sut.articles.count, 1)
        XCTAssertEqual(sut.articles.first?.title, "Test")
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.error)
    }

    func test_loadArticles_failure_setsError() async {
        // Arrange
        mockRepository.shouldFail = true

        // Act
        await sut.loadArticles()

        // Assert
        XCTAssertTrue(sut.articles.isEmpty)
        XCTAssertNotNil(sut.error)
    }
}
```

---

## Swift Testing Framework

The Swift Testing framework (available from Xcode 16+) uses `@Test`, `@Suite`, `#expect`, and `#require` macros for a more expressive testing API.

- [ ] Use `@Test` for test functions (replaces `func test_...` naming convention)
- [ ] Use `@Suite` for grouping related tests (replaces `XCTestCase` subclass)
- [ ] Use `#expect(condition)` for assertions (replaces `XCTAssert...`)
- [ ] Use `#require(condition)` for preconditions that must pass for the test to continue
- [ ] Use `@Test(arguments:)` for parameterized tests
- [ ] Use `@Test(.tags(...))` to categorize tests
- [ ] Use traits like `@Test(.timeLimit(.minutes(1)))` for timeout control

```swift
import Testing
@testable import YourApp

@Suite("Article ViewModel")
struct ArticleViewModelTests {

    let mockRepository = MockArticleRepository()

    @Test("loads articles successfully")
    func loadArticlesSuccess() async {
        mockRepository.stubbedArticles = [.sample]
        let viewModel = ArticleViewModel(repository: mockRepository)

        await viewModel.loadArticles()

        #expect(viewModel.articles.count == 1)
        #expect(viewModel.articles.first?.title == "Sample")
        #expect(!viewModel.isLoading)
        #expect(viewModel.error == nil)
    }

    @Test("handles load failure")
    func loadArticlesFailure() async {
        mockRepository.shouldFail = true
        let viewModel = ArticleViewModel(repository: mockRepository)

        await viewModel.loadArticles()

        #expect(viewModel.articles.isEmpty)
        #expect(viewModel.error != nil)
    }

    @Test("validates email formats", arguments: [
        ("user@example.com", true),
        ("invalid", false),
        ("", false),
        ("user@.com", false),
        ("user@example.co.uk", true),
    ])
    func emailValidation(email: String, isValid: Bool) {
        let validator = EmailValidator()
        #expect(validator.isValid(email) == isValid)
    }

    @Test("require non-nil user before profile load")
    func loadProfile() async throws {
        let user = try #require(await authService.currentUser())
        // Test continues only if user is non-nil
        let profile = await profileService.load(for: user.id)
        #expect(profile.name.isEmpty == false)
    }
}
```

---

## Unit Testing ViewModels with Mocks

- [ ] Define protocols for all dependencies (repository, service, API client)
- [ ] Create mock implementations that allow stubbing return values and tracking calls
- [ ] Test each ViewModel method in isolation
- [ ] Verify state changes (loading, error, data) after each action
- [ ] Test edge cases: empty data, nil values, concurrent calls

```swift
// MARK: - Mock Repository

final class MockArticleRepository: ArticleRepositoryProtocol, @unchecked Sendable {
    var stubbedArticles: [Article] = []
    var shouldFail = false
    var createCallCount = 0
    var lastCreatedArticle: Article?

    func getAll() async throws -> [Article] {
        if shouldFail { throw RepositoryError.offline }
        return stubbedArticles
    }

    func getById(_ id: String) async throws -> Article? {
        if shouldFail { throw RepositoryError.notFound }
        return stubbedArticles.first { $0.id == id }
    }

    func create(_ entity: Article) async throws -> Article {
        if shouldFail { throw RepositoryError.invalidResponse }
        createCallCount += 1
        lastCreatedArticle = entity
        stubbedArticles.append(entity)
        return entity
    }

    func update(_ entity: Article) async throws -> Article {
        if shouldFail { throw RepositoryError.invalidResponse }
        if let index = stubbedArticles.firstIndex(where: { $0.id == entity.id }) {
            stubbedArticles[index] = entity
        }
        return entity
    }

    func delete(_ id: String) async throws {
        if shouldFail { throw RepositoryError.notFound }
        stubbedArticles.removeAll { $0.id == id }
    }
}

// MARK: - ViewModel Tests

@Suite("Create Article Flow")
struct CreateArticleViewModelTests {

    @Test("creates article and resets form")
    func createSuccess() async {
        let mock = MockArticleRepository()
        let vm = CreateArticleViewModel(repository: mock)
        vm.title = "New Article"
        vm.body = "Content here"

        await vm.save()

        #expect(mock.createCallCount == 1)
        #expect(mock.lastCreatedArticle?.title == "New Article")
        #expect(vm.title.isEmpty) // form reset
        #expect(vm.isSaved)
    }

    @Test("shows validation error when title is empty")
    func validationError() async {
        let mock = MockArticleRepository()
        let vm = CreateArticleViewModel(repository: mock)
        vm.title = ""
        vm.body = "Content"

        await vm.save()

        #expect(mock.createCallCount == 0)
        #expect(vm.titleError == .emptyField(fieldName: "Title"))
    }
}
```

---

## Integration Testing

- [ ] Create a separate test plan or scheme for integration tests
- [ ] Test real database operations with an in-memory SwiftData `ModelContainer`
- [ ] Test repository layer with real local data source and mock API client
- [ ] Verify data persistence across operations (create, read, update, delete)
- [ ] Test sync queue behavior (enqueue offline, sync when connected)

```swift
@Suite("Article Repository Integration")
struct ArticleRepositoryIntegrationTests {

    @Test("full CRUD cycle with SwiftData")
    @MainActor
    func crudCycle() async throws {
        // Set up in-memory SwiftData container
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try ModelContainer(
            for: ArticleRecord.self, configurations: config
        )
        let context = container.mainContext

        let localDataSource = ArticleLocalDataSource(modelContext: context)
        let mockAPI = MockAPIClient()
        let connectivity = MockConnectivityMonitor(isConnected: false)

        let repository = ArticleRepository(
            apiClient: mockAPI,
            localDataSource: localDataSource,
            connectivity: connectivity
        )

        // Create
        let article = Article(
            id: UUID().uuidString, title: "Test", body: "Body",
            authorId: "a1", publishedAt: nil, updatedAt: Date(), tags: ["swift"]
        )
        let created = try await repository.create(article)
        #expect(created.id == article.id)

        // Read
        let fetched = try await repository.getById(article.id)
        #expect(fetched?.title == "Test")

        // Update
        var updated = article
        updated.title = "Updated"
        let result = try await repository.update(updated)
        #expect(result.title == "Updated")

        // Delete
        try await repository.delete(article.id)
        let deleted = try await repository.getById(article.id)
        #expect(deleted == nil)
    }
}
```

---

## UI Testing (XCUITest)

- [ ] UI test target added (File > New > Target > UI Testing Bundle)
- [ ] Set accessibility identifiers on all testable elements
- [ ] Use `XCUIApplication().launch()` in setUp
- [ ] Use launch arguments/environment to set test state (e.g., logged in, specific data)
- [ ] Query elements by accessibility identifier, not text (text may be localized)
- [ ] Wait for elements with `waitForExistence(timeout:)` -- do not use `sleep`
- [ ] Test complete user flows (sign in, create content, navigate, sign out)
- [ ] Test error states by injecting error conditions via launch arguments

```swift
import XCTest

final class LoginUITests: XCTestCase {

    let app = XCUIApplication()

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app.launchArguments = ["--uitesting", "--reset-state"]
        app.launch()
    }

    func test_loginFlow_validCredentials_navigatesToHome() {
        // Elements by accessibility identifier
        let emailField = app.textFields["login_email_field"]
        let passwordField = app.secureTextFields["login_password_field"]
        let loginButton = app.buttons["login_submit_button"]

        // Type credentials
        emailField.tap()
        emailField.typeText("test@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        // Submit
        loginButton.tap()

        // Verify navigation to home
        let homeTitle = app.staticTexts["home_title"]
        XCTAssertTrue(homeTitle.waitForExistence(timeout: 5))
    }

    func test_loginFlow_invalidCredentials_showsError() {
        let emailField = app.textFields["login_email_field"]
        let passwordField = app.secureTextFields["login_password_field"]
        let loginButton = app.buttons["login_submit_button"]

        emailField.tap()
        emailField.typeText("wrong@example.com")

        passwordField.tap()
        passwordField.typeText("wrongpassword")

        loginButton.tap()

        let errorAlert = app.alerts.firstMatch
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 5))
        XCTAssertTrue(errorAlert.staticTexts["Invalid email or password."].exists)
    }
}
```

Setting accessibility identifiers in your views:

```swift
TextField("Email", text: $email)
    .accessibilityIdentifier("login_email_field")

SecureField("Password", text: $password)
    .accessibilityIdentifier("login_password_field")

Button("Sign In") { /* ... */ }
    .accessibilityIdentifier("login_submit_button")
```

---

## Snapshot Testing

- [ ] Consider a snapshot testing library (e.g., swift-snapshot-testing by Point-Free)
- [ ] Create snapshots for key screens in both light and dark mode
- [ ] Create snapshots for multiple device sizes (iPhone SE, iPhone 15, iPad)
- [ ] Create snapshots for Dynamic Type sizes (accessibility large, extra small)
- [ ] Record reference snapshots on CI to avoid cross-machine rendering differences
- [ ] Review snapshot diffs in pull requests

```swift
import SnapshotTesting
import SwiftUI
import XCTest
@testable import YourApp

final class ProfileViewSnapshotTests: XCTestCase {

    func test_profileView_lightMode() {
        let view = ProfileView(user: .sample)
            .environment(\.colorScheme, .light)

        let controller = UIHostingController(rootView: view)
        controller.view.frame = UIScreen.main.bounds

        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }

    func test_profileView_darkMode() {
        let view = ProfileView(user: .sample)
            .environment(\.colorScheme, .dark)

        let controller = UIHostingController(rootView: view)
        controller.view.frame = UIScreen.main.bounds

        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }

    func test_profileView_accessibilityLargeText() {
        let view = ProfileView(user: .sample)
            .environment(\.sizeCategory, .accessibilityExtraLarge)

        let controller = UIHostingController(rootView: view)
        controller.view.frame = UIScreen.main.bounds

        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }
}
```

---

## Network Mocking with URLProtocol

- [ ] Create a custom `URLProtocol` subclass for intercepting network requests
- [ ] Register mock responses keyed by URL path or request
- [ ] Use a dedicated `URLSession` with the mock protocol in tests
- [ ] Test success responses, error responses, and timeouts
- [ ] Remove mock protocol in tearDown to avoid cross-test contamination

```swift
// MARK: - Mock URL Protocol

final class MockURLProtocol: URLProtocol {

    /// Map of URL path to (response data, status code, error)
    nonisolated(unsafe) static var mockResponses: [String: MockResponse] = [:]

    struct MockResponse {
        let data: Data
        let statusCode: Int
        let error: Error?
    }

    override class func canInit(with request: URLRequest) -> Bool {
        true // Intercept all requests
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        guard let url = request.url,
              let mock = Self.mockResponses[url.path] else {
            client?.urlProtocol(self, didFailWithError: URLError(.fileDoesNotExist))
            return
        }

        if let error = mock.error {
            client?.urlProtocol(self, didFailWithError: error)
            return
        }

        let response = HTTPURLResponse(
            url: url, statusCode: mock.statusCode,
            httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "application/json"]
        )!

        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: mock.data)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

// MARK: - Usage in Tests

@Suite("API Client with Mock Network")
struct APIClientNetworkTests {

    @Test("fetches articles successfully")
    func fetchArticles() async throws {
        // Register mock response
        let articles = [Article.sample]
        let data = try JSONEncoder().encode(articles)
        MockURLProtocol.mockResponses["/articles"] = .init(
            data: data, statusCode: 200, error: nil
        )

        // Create session with mock protocol
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)

        let client = URLSessionAPIClient(
            baseURL: URL(string: "https://api.example.com")!,
            session: session
        )

        let result: [Article] = try await client.request(
            Endpoint(path: "/articles", method: .GET, body: nil, queryItems: [])
        )

        #expect(result.count == 1)
        #expect(result.first?.title == "Sample")

        // Clean up
        MockURLProtocol.mockResponses.removeAll()
    }

    @Test("handles server error")
    func serverError() async {
        MockURLProtocol.mockResponses["/articles"] = .init(
            data: Data(), statusCode: 500, error: nil
        )

        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)

        let client = URLSessionAPIClient(
            baseURL: URL(string: "https://api.example.com")!,
            session: session
        )

        do {
            let _: [Article] = try await client.request(
                Endpoint(path: "/articles", method: .GET, body: nil, queryItems: [])
            )
            Issue.record("Expected error to be thrown")
        } catch {
            // Expected
        }

        MockURLProtocol.mockResponses.removeAll()
    }
}
```

---

## Code Coverage

- [ ] Enable code coverage in test scheme (Edit Scheme > Test > Options > Code Coverage)
- [ ] Target minimum 70% coverage for business logic (ViewModels, services, repositories)
- [ ] Target 90%+ coverage for critical paths (authentication, payments)
- [ ] Do not chase 100% coverage on views or trivial code
- [ ] Review coverage report in Xcode (Editor > Show Code Coverage)
- [ ] Add coverage reporting to CI (use `xcodebuild` with `-resultBundlePath` and `xcresulttool`)

```bash
# Generate coverage report in CI
xcodebuild test \
  -scheme YourApp \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -enableCodeCoverage YES \
  -resultBundlePath TestResults.xcresult

# Extract coverage percentage
xcrun xcresulttool get --path TestResults.xcresult --format json \
  | jq '.metrics.lineCoverage'
```

---

## CI/CD Integration

### Xcode Cloud
- [ ] Create workflow in App Store Connect > Xcode Cloud
- [ ] Configure start conditions (push to main, PR opened)
- [ ] Add test action that runs unit and UI tests
- [ ] Add archive action for release builds
- [ ] Configure post-actions (TestFlight upload, Slack notification)
- [ ] Add `ci_scripts/ci_post_clone.sh` for dependency installation if needed

### GitHub Actions
- [ ] Create `.github/workflows/test.yml`
- [ ] Use `macos-latest` or pinned macOS runner with Xcode
- [ ] Select Xcode version with `sudo xcode-select -s`
- [ ] Cache Swift Package Manager dependencies
- [ ] Run tests with `xcodebuild test`
- [ ] Upload test results as artifacts
- [ ] Fail the workflow if tests fail

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.2.app

      - name: Cache SPM
        uses: actions/cache@v4
        with:
          path: |
            ~/Library/Caches/org.swift.swiftpm
            .build
          key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}

      - name: Run Tests
        run: |
          xcodebuild test \
            -scheme YourApp \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.2' \
            -enableCodeCoverage YES \
            -resultBundlePath TestResults.xcresult \
            | xcbeautify

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: TestResults.xcresult
```

---

## Testing Async Code and MainActor

- [ ] Use `async` test methods for testing async functions
- [ ] Use `await fulfillment(of:)` (XCTest) for callback-based APIs
- [ ] Test `@MainActor`-isolated ViewModels from `@MainActor` test context
- [ ] Use `Task` and `await` to test concurrent operations
- [ ] Test cancellation behavior by cancelling tasks mid-flight
- [ ] Set timeouts on async expectations to catch hangs

```swift
// Testing @MainActor ViewModel
@Suite("Search ViewModel")
@MainActor
struct SearchViewModelTests {

    @Test("debounces search input")
    func debounce() async throws {
        let mock = MockSearchService()
        let vm = SearchViewModel(service: mock)

        // Type multiple characters quickly
        vm.query = "s"
        vm.query = "sw"
        vm.query = "swi"
        vm.query = "swift"

        // Wait for debounce (300ms + buffer)
        try await Task.sleep(for: .milliseconds(500))

        // Should only have made one API call (debounced)
        #expect(mock.searchCallCount == 1)
        #expect(mock.lastQuery == "swift")
    }

    @Test("cancels previous search on new input")
    func cancellation() async throws {
        let mock = MockSearchService()
        mock.artificialDelay = .milliseconds(200)
        let vm = SearchViewModel(service: mock)

        vm.query = "first"
        try await Task.sleep(for: .milliseconds(100))
        vm.query = "second" // Should cancel "first"

        try await Task.sleep(for: .milliseconds(500))

        #expect(vm.results.isEmpty == false)
        // Only "second" results should be displayed
    }
}

// XCTest: testing callback-based APIs with expectations
final class NotificationTests: XCTestCase {

    func test_notificationPosted() async {
        let expectation = expectation(
            forNotification: .init("DataDidUpdate"),
            object: nil
        )

        // Trigger the notification
        NotificationCenter.default.post(
            name: .init("DataDidUpdate"), object: nil
        )

        await fulfillment(of: [expectation], timeout: 2.0)
    }
}
```

---

## Test Organization Summary

| Test Type | Location | Runs On | Speed Target |
|-----------|----------|---------|-------------|
| Unit tests | `YourAppTests/` | Every commit, every PR | < 1s each |
| Integration tests | `YourAppIntegrationTests/` | Every PR, nightly | < 5s each |
| UI tests | `YourAppUITests/` | Every PR (can be nightly for large suites) | < 30s each |
| Snapshot tests | `YourAppSnapshotTests/` | Every PR | < 2s each |
| Performance tests | `YourAppPerfTests/` | Nightly or weekly | Varies |

Use Xcode Test Plans to organize these into separate configurations, each with its own scheme and CI trigger.
