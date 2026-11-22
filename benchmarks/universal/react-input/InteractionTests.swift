import XCTest
import Vision

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
    func testClearAndResetButtonsUpdateTheNativeBinding() {
        let app = launch()
        let field = app.textFields["Your name"]
        field.tap(); field.typeText("Maya")
        XCTAssertTrue(app.staticTexts["Maya"].waitForExistence(timeout: 5))
        let clear = app.buttons["Clear name"]
        reveal(clear, in: app); clear.tap()
        XCTAssertFalse(app.staticTexts["Maya"].exists)
        let reset = app.buttons["Reset name"]
        reveal(reset, in: app); reset.tap()
        XCTAssertTrue(app.staticTexts["Explorer"].waitForExistence(timeout: 5))
        XCTAssertEqual(field.value as? String, "Explorer")
        XCTAssertEqual(app.textFields["Destination"].value as? String, "River walk")
        capture(app, "reset-by-button")
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
        // Check the actual visible prompt within the native field. The accessibility
        // audit alone cannot verify text supplied as a decorative rendering of a hint.
        let name = app.textFields["Your name"]
        for _ in 0..<5 where !name.isHittable { app.swipeDown() }
        XCTAssertTrue(name.isHittable)
        let image = try XCTUnwrap(name.screenshot().image.cgImage)
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US"]
        try VNImageRequestHandler(cgImage: image).perform([request])
        let visiblePrompt = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: " ")
        XCTAssertEqual(visiblePrompt, "Enter your name")
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
