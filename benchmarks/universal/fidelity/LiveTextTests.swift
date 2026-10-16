import XCTest
@MainActor final class LiveTextUpdateTests: XCTestCase {
    func testLiveTypeAndContentUpdates() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US", "-fidelity-live-text"]
        app.launch()
        let heading = app.staticTexts["live-heading"]
        XCTAssertTrue(heading.waitForExistence(timeout: 15))
        XCTAssertEqual(heading.label, "A native heading")
        XCTAssertEqual(heading.elementType, .staticText)
        let originalHeight = heading.frame.height
        app.buttons["Increase type"].tap()
        let taller = NSPredicate { _, _ in heading.frame.height > originalHeight + 1 }
        expectation(for: taller, evaluatedWith: heading)
        waitForExpectations(timeout: 5)
        XCTAssertEqual(heading.label, "A native heading")
        try app.performAccessibilityAudit(for: .textClipped)
        app.buttons["Restore type"].tap()
        let restored = NSPredicate { _, _ in abs(heading.frame.height - originalHeight) < 1 }
        expectation(for: restored, evaluatedWith: heading)
        waitForExpectations(timeout: 5)
        app.buttons["Change content"].tap()
        let updated = NSPredicate(format: "label == %@", "Updated source content remains editable and native.")
        expectation(for: updated, evaluatedWith: heading)
        waitForExpectations(timeout: 5)
        XCTAssertGreaterThan(heading.frame.height, originalHeight)
        try app.performAccessibilityAudit(for: .textClipped)
        let capture = XCTAttachment(screenshot: app.screenshot())
        capture.name = "live-type-and-content-updated"; capture.lifetime = .keepAlways; add(capture)
    }
}
