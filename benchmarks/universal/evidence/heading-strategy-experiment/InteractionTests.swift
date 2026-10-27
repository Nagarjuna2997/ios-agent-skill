import XCTest
@MainActor final class InteractionTests: XCTestCase {
 func testStrategies() throws {
  for (name, flags) in [("normal", [String]()), ("proposal", ["-proposal", "-ios-agent-typography"]), ("trailing", ["-trailing-space", "-ios-agent-typography"]), ("greedy", ["-native-greedy"]), ("greedy-measured", ["-native-greedy", "-native-measure"])] {
   let app = XCUIApplication()
   app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"] + flags
   app.launch()
   XCTAssertTrue(app.staticTexts["Cedar Loop"].waitForExistence(timeout: 15))
   XCTAssertEqual(app.state, .runningForeground)
   if flags.contains("-ios-agent-typography") {
      let heading = app.staticTexts["node-5"]
      let predicate = NSPredicate { object, _ in ((object as? XCUIElement)?.value as? String)?.hasPrefix("{") == true }
      expectation(for: predicate, evaluatedWith: heading); waitForExpectations(timeout: 10)
      print("STRATEGY", name, heading.value ?? "missing")
   }
   let attachment = XCTAttachment(screenshot: app.screenshot());attachment.name = name;attachment.lifetime = .keepAlways;add(attachment)
   app.terminate()
  }
 }
}
