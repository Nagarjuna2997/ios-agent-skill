import XCTest
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launch();app.buttons["Load old"].tap();wait(app.staticTexts["state"],"Loading");app.buttons["Load new"].tap();app.buttons["Finish new"].tap();wait(app.staticTexts["state"],"New");app.buttons["Finish old"].tap();wait(app.staticTexts["state"],"New");app.buttons["Load new"].tap();app.buttons["Finish empty"].tap();wait(app.staticTexts["state"],"Empty");app.buttons["Load new"].tap();app.buttons["Finish error"].tap();wait(app.staticTexts["state"],"Error")
 }
}
