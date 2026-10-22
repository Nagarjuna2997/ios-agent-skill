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
   let attachment = XCTAttachment(screenshot: app.screenshot());attachment.name = name;attachment.lifetime = .keepAlways;add(attachment)
   app.terminate()
  }
 }
}
