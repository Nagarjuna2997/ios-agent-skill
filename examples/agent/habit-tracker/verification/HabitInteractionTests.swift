import XCTest

final class HabitInteractionTests: XCTestCase {
    @MainActor func testSampleHabitNavigationAndToggle() throws {
        let app = XCUIApplication()
        app.launchArguments += ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "habit-list"]
        app.launch()
        let habit = app.staticTexts["Read 20 minutes"].firstMatch
        XCTAssertTrue(habit.waitForExistence(timeout: 20), "Seeded habit did not appear")
        habit.tap()
        let toggleOff = app.buttons["Mark Not Done"].firstMatch
        XCTAssertTrue(toggleOff.waitForExistence(timeout: 10), "Habit detail did not open")
        toggleOff.tap()
        XCTAssertTrue(app.buttons["Mark Done Today"].firstMatch.waitForExistence(timeout: 10), "Habit did not update")
        app.swipeUp()
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "Habit detail after tap and scroll"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }
}
