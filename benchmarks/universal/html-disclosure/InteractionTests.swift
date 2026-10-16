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
        XCTAssertEqual(app.state, .runningForeground)
        XCTAssertFalse(app.staticTexts["Bring water, comfortable shoes, and a light jacket."].exists)
        let collapsed = XCTAttachment(screenshot: app.screenshot())
        collapsed.name = "verified-collapsed"
        collapsed.lifetime = .keepAlways
        add(collapsed)
        let frame = app.frame
        let elements = app.staticTexts.allElementsBoundByIndex.filter { $0.frame.width > 0 && $0.frame.height > 0 }.map { element -> [String: Any] in
            let f = element.frame
            return ["id": element.identifier.isEmpty ? element.label : element.identifier, "frame": ["x": f.minX, "y": f.minY, "width": f.width, "height": f.height]]
        }
        // The independent audit checks clipped text within elements, not just viewport bounds.
        try app.performAccessibilityAudit(for: .textClipped)
        let result: [String: Any] = ["version": 1, "viewport": ["x": frame.minX, "y": frame.minY, "width": frame.width, "height": frame.height], "textClippingAudit": "passed", "elements": elements]
        let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
        print("IOS_AGENT_GEOMETRY:" + String(decoding: data, as: UTF8.self))
        app.terminate()
        app.launchArguments.append("-ios-agent-typography")
        app.launch()
        XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
        XCTAssertEqual(app.state, .runningForeground)
        var regions: [[String: Any]] = []
        for element in app.staticTexts.allElementsBoundByIndex where element.identifier.hasPrefix("node-") {
            let ready = NSPredicate { object, _ in
                guard let e = object as? XCUIElement, let v = e.value as? String else { return false }
                return v.hasPrefix("{")
            }
            _ = expectation(for: ready, evaluatedWith: element)
        }
        waitForExpectations(timeout: 10)
        for element in app.staticTexts.allElementsBoundByIndex where element.identifier.hasPrefix("node-") {
            let raw = try XCTUnwrap((element.value as? String)?.data(using: .utf8))
            let layout = try XCTUnwrap(JSONSerialization.jsonObject(with: raw) as? [String: Any])
            regions.append(["id": element.identifier, "text": element.label, "lines": layout["lines"]!, "truncated": layout["truncated"]!])
        }
        let probe = XCTAttachment(screenshot: app.screenshot())
        probe.name = "verified-typography"
        probe.lifetime = .keepAlways
        add(probe)
        let typography = try JSONSerialization.data(withJSONObject: ["version": 1, "regions": regions], options: [.sortedKeys])
        print("IOS_AGENT_TYPOGRAPHY:" + String(decoding: typography, as: UTF8.self))
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
