import XCTest

final class NoteInteractionUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    override func tearDownWithError() throws {
        XCUIDevice.shared.orientation = .portrait
        try super.tearDownWithError()
    }

    @MainActor
    func testCancelDiscardsDraftInPortrait() {
        XCUIDevice.shared.orientation = .portrait
        let app = launch(screen: "new-note")
        let saveButton = app.buttons["Save"]
        XCTAssertTrue(saveButton.waitForExistence(timeout: 5))
        XCTAssertFalse(saveButton.isEnabled)

        let title = titleInput(in: app)
        XCTAssertTrue(title.waitForExistence(timeout: 5))
        title.tap()
        let draftTitle = "Discard this draft"
        title.typeText(draftTitle)
        XCTAssertTrue(saveButton.isEnabled)

        app.buttons["Cancel"].tap()
        assertScreen("notes", in: app)
        XCTAssertTrue(app.staticTexts["3 notes"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label CONTAINS %@", draftTitle)).firstMatch.exists)

        app.buttons["Add Note"].tap()
        assertScreen("new-note", in: app)
        XCTAssertTrue(saveButton.waitForExistence(timeout: 5))
        XCTAssertFalse(saveButton.isEnabled)
    }

    @MainActor
    func testSaveAddsATitleOnlyNoteInPortrait() {
        XCUIDevice.shared.orientation = .portrait
        let app = launch(screen: "new-note")
        let title = titleInput(in: app)
        XCTAssertTrue(title.waitForExistence(timeout: 5))
        title.tap()
        let newTitle = "Return library books"
        title.typeText(newTitle)

        let saveButton = app.buttons["Save"]
        XCTAssertTrue(saveButton.isEnabled)
        saveButton.tap()

        assertScreen("notes", in: app)
        XCTAssertTrue(app.staticTexts["4 notes"].waitForExistence(timeout: 5))
        let savedNote = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", newTitle)).firstMatch
        XCTAssertTrue(savedNote.waitForExistence(timeout: 5))
        savedNote.tap()
        assertScreen("note-detail", in: app)
        let heading = app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", newTitle)).firstMatch
        XCTAssertTrue(heading.waitForExistence(timeout: 5))
    }

    @MainActor
    func testSampleDetailShowsFullMultilineBodyInLandscape() {
        XCUIDevice.shared.orientation = .landscapeLeft
        let app = launch(screen: "note-detail")

        let heading = app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "Pantry restock")).firstMatch
        XCTAssertTrue(heading.waitForExistence(timeout: 5))
        let body = app.staticTexts.matching(NSPredicate(
            format: "label CONTAINS %@ AND label CONTAINS %@ AND label CONTAINS %@",
            "Rolled oats", "Canned tomatoes", "Brown rice"
        )).firstMatch
        XCTAssertTrue(body.waitForExistence(timeout: 5))
    }

    @MainActor
    private func launch(screen id: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", id]
        app.launch()
        assertScreen(id, in: app)
        return app
    }

    @MainActor
    private func assertScreen(_ id: String, in app: XCUIApplication, file: StaticString = #filePath, line: UInt = #line) {
        let screen = app.descendants(matching: .any).matching(identifier: "screen-\(id)").firstMatch
        XCTAssertTrue(screen.waitForExistence(timeout: 5), "Expected screen-\(id) to exist", file: file, line: line)
    }

    @MainActor
    private func titleInput(in app: XCUIApplication) -> XCUIElement {
        let label = NSPredicate(format: "label == %@", "Title")
        let textField = app.textFields.matching(label).firstMatch
        if textField.exists {
            return textField
        }
        return app.textViews.matching(label).firstMatch
    }
}
