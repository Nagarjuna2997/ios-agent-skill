import XCTest
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launch();let button=app.buttons["save"];XCTAssertTrue(button.isEnabled);XCTAssertTrue(button.label.lowercased().contains("save"));wait(app.staticTexts["status"],"Empty");button.tap();wait(app.staticTexts["status"],"Saved")
 }
}
