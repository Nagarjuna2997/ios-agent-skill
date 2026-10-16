import XCTest

@MainActor final class InteractionTests: XCTestCase {
    func testDisclosureAndContent() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
        let label = app.buttons["Before you go"]
        XCTAssertTrue(label.exists)
        let content = app.staticTexts["Bring water, comfortable shoes, and a light jacket."]
        XCTAssertFalse(content.exists)
        label.tap()
        XCTAssertTrue(content.waitForExistence(timeout: 3))
        let expanded = XCTAttachment(screenshot: app.screenshot())
        expanded.name = "expanded-disclosure"
        expanded.lifetime = .keepAlways
        add(expanded)
        label.tap()
        XCTAssertFalse(content.exists)
    }
}
