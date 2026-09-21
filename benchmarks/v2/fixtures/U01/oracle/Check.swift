import XCTest
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launch();app.buttons["Increment"].tap();app.buttons["Increment"].tap();wait(app.staticTexts["count"],"Count 2");app.buttons["Detail"].tap();app.navigationBars.buttons.element(boundBy:0).tap();app.buttons["Refresh parent"].tap();wait(app.staticTexts["count"],"Count 2")
 }
}
