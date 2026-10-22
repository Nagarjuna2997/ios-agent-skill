import XCTest

@MainActor final class BooleanStateTests: XCTestCase {
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Trip checklist"].waitForExistence(timeout: 15))
        return app
    }
    private func expect(_ label: String, in app: XCUIApplication) {
        XCTAssertTrue(app.staticTexts[label].waitForExistence(timeout: 5), label)
        let opposite = ["Pack ready":"Packing incomplete", "Packing incomplete":"Pack ready",
                        "Reminder on":"Reminder off", "Reminder off":"Reminder on"]
        if let stale = opposite[label] { XCTAssertFalse(app.staticTexts[stale].exists, "Stale branch: \(stale)") }
    }
    private func tap(_ label: String, in app: XCUIApplication) {
        let button = app.buttons[label]
        for _ in 0..<4 where !button.isHittable { app.swipeUp() }
        XCTAssertTrue(button.isHittable, label)
        button.tap()
    }
    private func capture(_ app: XCUIApplication, _ name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
    }
    func testBooleanTransitionsAndIndependentState() {
        let app = launch()
        expect("Packing incomplete", in: app); expect("Reminder on", in: app)
        capture(app, "initial-state")
        tap("Toggle pack", in: app); expect("Pack ready", in: app)
        tap("Toggle pack", in: app); expect("Packing incomplete", in: app)
        tap("Mark packed", in: app); expect("Pack ready", in: app)
        tap("Mark packed", in: app); expect("Pack ready", in: app)
        expect("Reminder on", in: app)
        tap("Toggle reminder", in: app); expect("Reminder off", in: app)
        expect("Pack ready", in: app)
        capture(app, "changed-state")
        app.swipeDown()
        tap("Reset pack", in: app); expect("Packing incomplete", in: app)
        expect("Reminder off", in: app)
    }
    func testNativeAccessibilityAndClipping() throws {
        let app = launch()
        XCTAssertEqual(app.buttons["Toggle pack"].elementType, .button)
        XCTAssertEqual(app.staticTexts["Packing incomplete"].elementType, .staticText)
        try app.performAccessibilityAudit(for: [.textClipped, .contrast, .elementDetection])
        capture(app, "accessibility-initial")
        tap("Toggle reminder", in: app)
        try app.performAccessibilityAudit(for: [.textClipped, .contrast, .elementDetection])
        capture(app, "accessibility-changed")
    }
    func testRelaunchRestoresInitialState() {
        let app = launch()
        tap("Mark packed", in: app); expect("Pack ready", in: app)
        tap("Toggle reminder", in: app); expect("Reminder off", in: app)
        app.terminate(); app.launch()
        expect("Packing incomplete", in: app); expect("Reminder on", in: app)
    }
}
