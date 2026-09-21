import XCTest
@available(iOS 16.4, *)
@MainActor final class Acceptance:XCTestCase {
 func wait(_ element:XCUIElement,_ label:String,file:StaticString=#filePath,line:UInt=#line){XCTAssertTrue(element.waitForExistence(timeout:10),file:file,line:line);XCTAssertEqual(element.label,label,file:file,line:line)}
 func testContract() throws {
 let app=XCUIApplication();app.launchArguments=["--reset"]
app.launch();app.open(URL(string:"fixture://item/42")!);wait(app.staticTexts["route"],"Item 42");app.terminate();app.launchArguments=[];app.launch();wait(app.staticTexts["route"],"Item 42")
 }
}
