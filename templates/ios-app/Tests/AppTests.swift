//
// AppTests.swift -- Swift Testing examples (Xcode 16+, iOS 18+ / macOS 15+)
//
// Add this file to a Test target in Xcode. Swift Testing is the modern, default
// framework for new projects. For older projects or UI tests, see AppXCTests.swift.
//
// Run with: Cmd + U in Xcode, or `xcodebuild test -scheme YourApp`.

import Testing
import Foundation
@testable import YourApp   // <-- replace with your app module name

// MARK: - Model tests

@Suite("Item model")
struct ItemTests {

    @Test("default initializer fills id and createdAt")
    func defaultInitializer() {
        let item = Item(title: "Hello", subtitle: "World")

        #expect(item.title == "Hello")
        #expect(item.subtitle == "World")
        #expect(item.iconName == "star.fill")
        #expect(item.createdAt.timeIntervalSinceNow < 1)
    }

    @Test("samples are non-empty and unique by id")
    func samplesAreUnique() {
        let ids = Set(Item.samples.map(\.id))
        #expect(Item.samples.count > 0)
        #expect(ids.count == Item.samples.count)
    }

    @Test(
        "title is preserved verbatim",
        arguments: ["", "A", "Hello, world!", "🍎 emoji", String(repeating: "x", count: 1000)]
    )
    func titlePreserved(_ title: String) {
        let item = Item(title: title, subtitle: "")
        #expect(item.title == title)
    }
}

// MARK: - View model tests

@Suite("HomeViewModel")
@MainActor
struct HomeViewModelTests {

    @Test("loadItems populates items on first call")
    func loadItemsPopulates() async {
        let viewModel = HomeViewModel()
        #expect(viewModel.items.isEmpty)

        await viewModel.loadItems()

        #expect(!viewModel.items.isEmpty)
        #expect(viewModel.isLoading == false)
        #expect(viewModel.error == nil)
    }

    @Test("loadItems is a no-op when items already exist")
    func loadItemsIdempotent() async {
        let viewModel = HomeViewModel()
        await viewModel.loadItems()
        let firstSnapshot = viewModel.items

        await viewModel.loadItems()
        #expect(viewModel.items == firstSnapshot)
    }

    @Test("refresh always reloads")
    func refreshAlwaysReloads() async {
        let viewModel = HomeViewModel()
        await viewModel.loadItems()
        let before = viewModel.items.count

        await viewModel.refresh()
        #expect(viewModel.items.count == before)
        #expect(viewModel.isLoading == false)
    }
}

// MARK: - Async helpers

@Suite("Async behavior")
struct AsyncTests {

    @Test("withCheckedContinuation completes")
    func continuationCompletes() async {
        let value: Int = await withCheckedContinuation { continuation in
            DispatchQueue.global().async {
                continuation.resume(returning: 42)
            }
        }
        #expect(value == 42)
    }

    @Test("Task cancellation is observed")
    func cancellationObserved() async {
        let task = Task {
            try await Task.sleep(for: .seconds(5))
            return "should not complete"
        }
        task.cancel()

        do {
            _ = try await task.value
            Issue.record("Expected CancellationError")
        } catch is CancellationError {
            // expected
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }
}

// MARK: - Tags (filter with `swift test --filter`)

extension Tag {
    @Tag static var smoke: Self
    @Tag static var slow: Self
}

@Test(.tags(.smoke))
func smokeTest() {
    #expect(1 + 1 == 2)
}
