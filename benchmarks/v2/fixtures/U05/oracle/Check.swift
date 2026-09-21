import XCTest
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launch();app.buttons["Hide"].tap();app.buttons["Send event"].tap();app.buttons["Inspect"].tap();wait(app.staticTexts["report"],"Events 0, alive false")
 }
}
