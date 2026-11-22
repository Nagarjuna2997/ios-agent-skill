import XCTest

@MainActor final class WrappingRowTests: XCTestCase {
    private let labels = ["Snowshoeing", "Wildflower walks", "Birdwatching", "Trail running", "Forest trails"]

    private func rows(in app: XCUIApplication) -> Int {
        let frames = labels.map { label in
            let chip = app.staticTexts[label]
            XCTAssertTrue(chip.exists)
            let frame = chip.frame
            XCTAssertGreaterThan(frame.width, 0)
            XCTAssertGreaterThanOrEqual(frame.minX, app.frame.minX)
            XCTAssertLessThanOrEqual(frame.maxX, app.frame.maxX)
            return frame
        }
        let readingOrder = app.staticTexts.allElementsBoundByAccessibilityElement.map(\.label)
        XCTAssertEqual(readingOrder.filter { labels.contains($0) }, labels)
        var lines = 1
        for (previous, next) in zip(frames, frames.dropFirst()) {
            if abs(next.midY - previous.midY) < 1 {
                XCTAssertGreaterThanOrEqual(next.minX, previous.maxX)
            } else {
                XCTAssertGreaterThanOrEqual(next.minY, previous.maxY)
                lines += 1
            }
        }
        return lines
    }

    func testRowsReflowAndPreserveReadingOrder() throws {
        let app = XCUIApplication()
        XCUIDevice.shared.orientation = .portrait
        defer { XCUIDevice.shared.orientation = .portrait }
        app.launch()
        XCTAssertTrue(app.staticTexts["Forest trails"].waitForExistence(timeout: 15))
        let narrow = rows(in: app)
        XCTAssertGreaterThan(narrow, 1)
        try app.performAccessibilityAudit(for: [.textClipped])
        capture(app, "portrait-tags")

        XCUIDevice.shared.orientation = .landscapeLeft
        let rotated = NSPredicate { _, _ in app.frame.width > app.frame.height }
        XCTAssertEqual(XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: rotated, object: nil)], timeout: 10), .completed)
        XCTAssertLessThan(rows(in: app), narrow)
        capture(app, "landscape-tags")
    }

    private func capture(_ app: XCUIApplication, _ name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
