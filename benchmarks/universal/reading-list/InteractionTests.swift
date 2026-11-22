import XCTest

@MainActor final class ReadingShelfTests: XCTestCase {
    func testEditingOneOfTwoIdenticalTitlesPreservesTheirIdentities() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        let first = app.buttons["screen-1-node-4-cedar-a"]
        let second = app.buttons["screen-1-node-4-cedar-b"]
        XCTAssertTrue(second.waitForExistence(timeout: 10))
        XCTAssertEqual(first.label, "Cedar")
        XCTAssertEqual(second.label, "Cedar")
        second.tap()
        XCTAssertTrue(app.staticTexts["Jon Lake"].waitForExistence(timeout: 5))
        let title = app.textFields["screen-2-node-5"]
        XCTAssertEqual(title.label, "Book title")
        title.tap()
        title.typeText(" revised")
        XCTAssertEqual(title.value as? String, "Cedar revised")
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(second.waitForExistence(timeout: 5))
        XCTAssertEqual(second.label, "Cedar revised")
        XCTAssertEqual(first.label, "Cedar")
        let attachment = XCTAttachment(data: app.screenshot().pngRepresentation, uniformTypeIdentifier: "public.png")
        attachment.name = "edited-one-record"
        attachment.lifetime = .keepAlways
        add(attachment)
        first.tap()
        XCTAssertTrue(app.staticTexts["Lena West"].waitForExistence(timeout: 5))
        XCTAssertEqual(title.value as? String, "Cedar")
        app.navigationBars.buttons.firstMatch.tap()
        second.tap()
        XCTAssertTrue(app.staticTexts["Jon Lake"].waitForExistence(timeout: 5))
        XCTAssertEqual(title.value as? String, "Cedar revised")
    }
}
