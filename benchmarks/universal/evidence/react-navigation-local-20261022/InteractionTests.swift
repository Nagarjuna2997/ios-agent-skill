import XCTest

@MainActor final class RouteTests: XCTestCase {
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(app.staticTexts["Trail journal"].waitForExistence(timeout: 15))
        return app
    }
    private func tap(_ label: String, in app: XCUIApplication) {
        let control = app.buttons[label]
        for _ in 0..<4 where !control.isHittable { app.swipeUp() }
        XCTAssertTrue(control.isHittable, label)
        control.tap()
    }
    private func back(_ app: XCUIApplication) {
        let control = app.navigationBars.buttons["Back"]
        XCTAssertTrue(control.waitForExistence(timeout: 5))
        XCTAssertTrue(control.isHittable)
        control.tap()
    }
    private func capture(_ app: XCUIApplication, _ name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
    }
    func testPushPopAndEntryStateRetention() {
        let app = launch()
        XCTAssertFalse(app.navigationBars.buttons["Back"].exists)
        tap("Toggle saved walk", in: app)
        XCTAssertTrue(app.staticTexts["Walk saved"].exists)
        capture(app,"home-saved")
        tap("Open Cedar Loop", in: app)
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.staticTexts["Trail journal"].isHittable)
        capture(app,"walk")
        tap("Read field notes", in: app)
        XCTAssertTrue(app.staticTexts["Field notes"].waitForExistence(timeout: 5))
        capture(app,"notes")
        back(app)
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 5))
        back(app)
        XCTAssertTrue(app.staticTexts["Walk saved"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.navigationBars.buttons["Back"].exists)
        tap("Open Cedar Loop", in: app); back(app)
        XCTAssertTrue(app.staticTexts["Walk saved"].exists)
    }
    func testNativeSemanticsAndAccessibilityOnEveryScreen() throws {
        let app = launch()
        XCTAssertEqual(app.buttons["Open Cedar Loop"].elementType, .button)
        XCTAssertGreaterThanOrEqual(app.buttons["Open Cedar Loop"].frame.height,44)
        try app.performAccessibilityAudit(for: [.textClipped,.contrast,.elementDetection])
        tap("Open Cedar Loop",in:app)
        XCTAssertEqual(app.staticTexts["Cedar Loop"].elementType,.staticText)
        try app.performAccessibilityAudit(for: [.textClipped,.contrast,.elementDetection])
        tap("Read field notes",in:app)
        try app.performAccessibilityAudit(for: [.textClipped,.contrast,.elementDetection])
        capture(app,"audited-notes")
    }
    func testRelaunchResetsStackAndState() {
        let app = launch()
        tap("Toggle saved walk",in:app)
        tap("Open Cedar Loop",in:app)
        tap("Read field notes",in:app)
        app.terminate();app.launch()
        XCTAssertTrue(app.staticTexts["Trail journal"].waitForExistence(timeout: 15))
        XCTAssertTrue(app.staticTexts["No saved walk"].exists)
        XCTAssertFalse(app.staticTexts["Field notes"].exists)
        XCTAssertFalse(app.navigationBars.buttons["Back"].exists)
    }
}
