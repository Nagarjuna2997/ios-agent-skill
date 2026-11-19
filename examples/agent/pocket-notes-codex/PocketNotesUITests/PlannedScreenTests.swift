import XCTest
import UIKit

@MainActor final class PlannedScreenTests: XCTestCase {
    override func tearDown() { XCUIDevice.shared.orientation = .portrait; super.tearDown() }
    func test_notes() throws {
        for orientation in [UIDeviceOrientation.portrait, .landscapeLeft] {
            XCUIDevice.shared.orientation = orientation
            let app = XCUIApplication()
            app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "notes"]
            app.launch()
            XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "screen-notes").firstMatch.waitForExistence(timeout: 15), "Planned screen must be visible")
            app.terminate()
        }
    }
    func test_note_detail() throws {
        for orientation in [UIDeviceOrientation.portrait, .landscapeLeft] {
            XCUIDevice.shared.orientation = orientation
            let app = XCUIApplication()
            app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "note-detail"]
            app.launch()
            XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "screen-note-detail").firstMatch.waitForExistence(timeout: 15), "Planned screen must be visible")
            app.terminate()
        }
    }
    func test_new_note() throws {
        for orientation in [UIDeviceOrientation.portrait, .landscapeLeft] {
            XCUIDevice.shared.orientation = orientation
            let app = XCUIApplication()
            app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "new-note"]
            app.launch()
            XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "screen-new-note").firstMatch.waitForExistence(timeout: 15), "Planned screen must be visible")
            app.terminate()
        }
    }
}
