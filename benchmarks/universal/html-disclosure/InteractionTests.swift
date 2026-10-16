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

    func testMeasuredGeometry() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
        let frame = app.frame
        let elements = app.staticTexts.allElementsBoundByIndex.filter { $0.frame.width > 0 && $0.frame.height > 0 }.map { element -> [String: Any] in
            let f = element.frame
            return ["id": element.label, "frame": ["x": f.minX, "y": f.minY, "width": f.width, "height": f.height]]
        }
        // The independent audit checks clipped text within elements, not just viewport bounds.
        try app.performAccessibilityAudit(for: .textClipped)
        let result: [String: Any] = ["version": 1, "viewport": ["x": frame.minX, "y": frame.minY, "width": frame.width, "height": frame.height], "textClippingAudit": "passed", "elements": elements]
        let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
        print("IOS_AGENT_GEOMETRY:" + String(decoding: data, as: UTF8.self))
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
