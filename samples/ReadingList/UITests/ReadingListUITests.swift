import XCTest

@MainActor final class ReadingListUITests: XCTestCase {
    func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIApplication().screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    /// Waits until the predicate holds for the element, instead of reading `exists` once.
    /// A single read races SwiftUI's animations and search filtering on slower CI simulators.
    @discardableResult
    func waitUntil(_ element: XCUIElement, until format: String, timeout: TimeInterval = 10) -> Bool {
        let expectation = XCTNSPredicateExpectation(predicate: NSPredicate(format: format), object: element)
        return XCTWaiter().wait(for: [expectation], timeout: timeout) == .completed
    }

    /// Taps a text field and types only once it has keyboard focus. Typing straight after the
    /// tap failed on CI while the add-book sheet was still presenting.
    func type(_ text: String, into field: XCUIElement) {
        XCTAssertTrue(field.waitForExistence(timeout: 10), "\(field) did not appear")
        XCTAssertTrue(waitUntil(field, until: "isHittable == true"), "\(field) is not hittable")
        field.tap()
        if !waitUntil(field, until: "hasKeyboardFocus == true", timeout: 5) {
            field.tap()
            XCTAssertTrue(waitUntil(field, until: "hasKeyboardFocus == true", timeout: 5), "\(field) did not take keyboard focus")
        }
        field.typeText(text)
    }

    func testReadingJourney() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["--ui-testing", "--reset-test-data"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Your next chapter starts here"].waitForExistence(timeout: 15))
        capture("empty")

        app.buttons["add-book"].tap()
        type("The Hobbit", into: app.textFields["book-title"])
        type("Tolkien", into: app.textFields["book-author"])
        capture("add")
        app.buttons["save-book"].tap()

        let book = app.buttons["book-The Hobbit"]
        XCTAssertTrue(book.waitForExistence(timeout: 10))
        capture("library")
        book.tap()

        let toggle = app.buttons["toggle-finished"]
        XCTAssertTrue(toggle.waitForExistence(timeout: 10))
        toggle.tap()
        XCTAssertTrue(app.buttons["Mark as unread"].waitForExistence(timeout: 10))
        capture("detail")

        app.terminate()
        app.launchArguments = ["--ui-testing"]
        app.launch()
        XCTAssertTrue(book.waitForExistence(timeout: 15))
        XCTAssertTrue(app.staticTexts["Finished"].waitForExistence(timeout: 10))

        let search = app.searchFields.firstMatch
        type("missing", into: search)
        XCTAssertTrue(waitUntil(book, until: "exists == false"), "search did not hide the book")
        capture("search-empty")

        // Delete the query with the keyboard: the clear button's label differs between iOS versions.
        search.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: "missing".count))
        search.typeText("tolkien")
        XCTAssertTrue(book.waitForExistence(timeout: 10))
    }

    func testAccessibleErrorState() {
        let app = XCUIApplication()
        app.launchArguments = ["--ui-testing", "--test-error"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Library unavailable"].waitForExistence(timeout: 15))
        XCTAssertTrue(app.buttons["retry"].waitForExistence(timeout: 5))
        capture("error")
    }
}
