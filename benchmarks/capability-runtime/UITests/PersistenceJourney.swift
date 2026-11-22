import XCTest

@MainActor final class PersistenceJourney: XCTestCase {
    func testSavedRecordSurvivesProcessRelaunch() throws {
        continueAfterFailure = false
        let marker = UUID().uuidString
        let app = XCUIApplication()
        app.launchEnvironment["RUNTIME_TEST_MARKER"] = marker
        app.launch()
        let stored = app.staticTexts["stored-marker"]
        XCTAssertFalse(stored.exists)
        app.buttons["Save marker"].tap()
        XCTAssertTrue(stored.waitForExistence(timeout: 5))
        XCTAssertEqual(stored.label, marker)
        app.terminate()
        app.launch()
        XCTAssertTrue(stored.waitForExistence(timeout: 5), "Saved record missing after relaunch")
        XCTAssertEqual(stored.label, marker)
    }
}
