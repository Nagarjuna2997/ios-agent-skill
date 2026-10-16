import XCTest
@MainActor final class InteractionTests: XCTestCase {
 func testAblation() throws {
  for (name, flag) in [("normal-1", ""), ("normal-2", ""), ("attributes", "-attributes-only"), ("renderer", "-renderer-only"), ("probe", "-ios-agent-typography")] {
   let app = XCUIApplication()
   app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"] + (flag.isEmpty ? [] : [flag])
   app.launch()
   XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
   XCTAssertEqual(app.state, .runningForeground)
   XCTAssertFalse(app.staticTexts["Bring water, comfortable shoes, and a light jacket."].exists)
   if name == "probe" {
    let texts = app.staticTexts.allElementsBoundByIndex.filter { $0.identifier.hasPrefix("node-") }
    XCTAssertEqual(texts.count, 9)
    for text in texts {
     let predicate = NSPredicate { object, _ in ((object as? XCUIElement)?.value as? String)?.hasPrefix("{") == true }
     _ = expectation(for: predicate, evaluatedWith: text)
    }
    waitForExpectations(timeout: 10)
    for text in texts { print("PASSIVE_REGION " + text.identifier + " " + (text.value as? String ?? "missing")) }
   }
   let attachment = XCTAttachment(screenshot: app.screenshot());attachment.name = name;attachment.lifetime = .keepAlways;add(attachment)
   app.terminate()
  }
 }
}
