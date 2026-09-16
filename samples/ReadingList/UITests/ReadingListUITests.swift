import XCTest
@MainActor final class ReadingListUITests: XCTestCase {
    func capture(_ name: String) { let attachment = XCTAttachment(screenshot: XCUIApplication().screenshot()); attachment.name = name; attachment.lifetime = .keepAlways; add(attachment) }
    func testReadingJourney() throws {
        let app = XCUIApplication(); app.launchArguments = ["--ui-testing", "--reset-test-data"]; app.launch()
        XCTAssertTrue(app.staticTexts["Your next chapter starts here"].waitForExistence(timeout: 10)); capture("empty")
        app.buttons["add-book"].tap()
        XCTAssertTrue(app.textFields["book-title"].waitForExistence(timeout: 5))
        app.textFields["book-title"].tap(); app.textFields["book-title"].typeText("The Hobbit")
        app.textFields["book-author"].tap(); app.textFields["book-author"].typeText("Tolkien"); capture("add")
        app.buttons["save-book"].tap()
        XCTAssertTrue(app.buttons["book-The Hobbit"].waitForExistence(timeout: 5)); capture("library")
        app.buttons["book-The Hobbit"].tap()
        XCTAssertTrue(app.buttons["toggle-finished"].waitForExistence(timeout: 5)); app.buttons["toggle-finished"].tap()
        XCTAssertTrue(app.buttons["Mark as unread"].exists); capture("detail")
        app.terminate(); app.launchArguments = ["--ui-testing"]; app.launch()
        XCTAssertTrue(app.buttons["book-The Hobbit"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["Finished"].exists)
        let search = app.searchFields.firstMatch; search.tap(); search.typeText("missing")
        XCTAssertFalse(app.buttons["book-The Hobbit"].exists); capture("search-empty")
        search.buttons["Clear text"].tap(); search.typeText("tolkien")
        XCTAssertTrue(app.buttons["book-The Hobbit"].waitForExistence(timeout: 5))
    }
    func testAccessibleErrorState() {
        let app = XCUIApplication(); app.launchArguments = ["--ui-testing", "--test-error"]; app.launch()
        XCTAssertTrue(app.staticTexts["Library unavailable"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["retry"].exists); capture("error")
    }
}
