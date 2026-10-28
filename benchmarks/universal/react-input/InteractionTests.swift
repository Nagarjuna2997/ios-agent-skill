import XCTest

@MainActor final class InputTests: XCTestCase {
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Plan your walk"].waitForExistence(timeout: 15))
        return app
    }
    private func reveal(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<5 where !element.isHittable { app.swipeUp() }
        XCTAssertTrue(element.isHittable)
    }
    private func capture(_ app: XCUIApplication, _ name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    func testTypingUpdatesIndependentStateAndRetainsHiddenValue() {
        let app = launch()
        let name = app.textFields["Your name"]
        reveal(name, in: app)
        name.tap(); name.typeText("Maya")
        XCTAssertTrue(app.staticTexts["Maya"].waitForExistence(timeout: 5))
        let destination = app.textFields["Destination"]
        reveal(destination, in: app)
        destination.tap(); destination.typeText(" trail")
        XCTAssertEqual(destination.value as? String, "River walk trail")
        XCTAssertTrue(app.staticTexts["River walk trail"].exists)
        XCTAssertEqual(name.value as? String, "Maya")
        let toggle = app.buttons["Show or hide destination"]
        reveal(toggle, in: app); toggle.tap()
        XCTAssertFalse(destination.exists)
        toggle.tap()
        XCTAssertTrue(destination.waitForExistence(timeout: 5))
        XCTAssertEqual(destination.value as? String, "River walk trail")
        capture(app, "typed-and-restored")
    }
    func testAccessibleNativeFieldsAtConfiguredTextSize() throws {
        let app = launch()
        for label in ["Your name", "Destination"] {
            let field = app.textFields[label]
            reveal(field, in: app)
            XCTAssertEqual(field.label, label)
            XCTAssertEqual(field.elementType, .textField)
            XCTAssertGreaterThanOrEqual(field.frame.height, 44)
        }
        try app.performAccessibilityAudit(for: [.textClipped, .contrast, .elementDetection])
        capture(app, "accessible-fields")
    }
    func testRelaunchResetsInputState() {
        let app = launch()
        let name = app.textFields["Your name"]
        name.tap(); name.typeText("Maya")
        XCTAssertTrue(app.staticTexts["Maya"].waitForExistence(timeout: 5))
        app.terminate(); app.launch()
        XCTAssertTrue(app.textFields["Your name"].waitForExistence(timeout: 15))
        XCTAssertFalse(app.staticTexts["Maya"].exists)
        XCTAssertEqual(app.textFields["Destination"].value as? String, "River walk")
        capture(app, "reset")
    }
}
