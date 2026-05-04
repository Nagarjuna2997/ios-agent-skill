//
// AppXCTests.swift -- XCTest examples (works back to iOS 13)
//
// Use XCTest when:
//   * You're targeting iOS < 18 / Xcode < 16
//   * You're writing UI tests (XCUITest -- Swift Testing does not replace it)
//   * You're maintaining an existing XCTest suite
//
// For new unit tests on iOS 18+ projects, prefer AppTests.swift (Swift Testing).
//
// Run with: Cmd + U in Xcode, or `xcodebuild test -scheme YourApp`.

import XCTest
@testable import YourApp   // <-- replace with your app module name

// MARK: - Model tests

final class ItemXCTests: XCTestCase {

    func testDefaultInitializerFillsIdAndCreatedAt() {
        let item = Item(title: "Hello", subtitle: "World")

        XCTAssertEqual(item.title, "Hello")
        XCTAssertEqual(item.subtitle, "World")
        XCTAssertEqual(item.iconName, "star.fill")
        XCTAssertLessThan(item.createdAt.timeIntervalSinceNow, 1)
    }

    func testSamplesAreNonEmptyAndUnique() {
        let ids = Set(Item.samples.map(\.id))
        XCTAssertGreaterThan(Item.samples.count, 0)
        XCTAssertEqual(ids.count, Item.samples.count)
    }
}

// MARK: - View model tests

@MainActor
final class HomeViewModelXCTests: XCTestCase {

    func testLoadItemsPopulates() async throws {
        let viewModel = HomeViewModel()
        XCTAssertTrue(viewModel.items.isEmpty)

        await viewModel.loadItems()

        XCTAssertFalse(viewModel.items.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    func testLoadItemsIsIdempotent() async {
        let viewModel = HomeViewModel()
        await viewModel.loadItems()
        let firstSnapshot = viewModel.items

        await viewModel.loadItems()
        XCTAssertEqual(viewModel.items, firstSnapshot)
    }

    func testRefreshReloads() async {
        let viewModel = HomeViewModel()
        await viewModel.loadItems()
        let before = viewModel.items.count

        await viewModel.refresh()
        XCTAssertEqual(viewModel.items.count, before)
        XCTAssertFalse(viewModel.isLoading)
    }
}

// MARK: - Performance test

final class PerformanceXCTests: XCTestCase {

    func testItemSamplesPerformance() {
        measure {
            for _ in 0..<1000 {
                _ = Item.samples.map(\.title)
            }
        }
    }
}

// MARK: - UI test starter
//
// Move this class into a UI Test target (NOT a unit test target). Swift Testing
// does not replace XCUITest, so UI tests stay on XCTest indefinitely.

#if canImport(XCTest) && !os(watchOS)
final class AppUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testAppLaunches() throws {
        let app = XCUIApplication()
        app.launch()

        // Replace with assertions about your app's first screen
        XCTAssertTrue(app.state == .runningForeground)
    }

    @MainActor
    func testTabBarHasThreeTabs() throws {
        let app = XCUIApplication()
        app.launch()

        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 2))
        XCTAssertEqual(tabBar.buttons.count, 3) // Home, Profile, Settings
    }
}
#endif
