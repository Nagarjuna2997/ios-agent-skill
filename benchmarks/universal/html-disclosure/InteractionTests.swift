import XCTest

@MainActor final class InteractionTests: XCTestCase {
    func testAccessibilityCollapsedAndExpanded() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
        let button = app.buttons["Before you go"]
        XCTAssertEqual(button.label, "Before you go")
        XCTAssertEqual(button.elementType, .button)
        try app.performAccessibilityAudit()
        button.tap()
        XCTAssertTrue(app.staticTexts["Bring water, comfortable shoes, and a light jacket."].waitForExistence(timeout: 3))
        try app.performAccessibilityAudit()
    }

    func testDisclosureAndContent() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
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
