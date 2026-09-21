import XCTest
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launchEnvironment["FORCE_LEGACY"]="1";app.launch();wait(app.staticTexts["mode"],"Static")
 }
}
