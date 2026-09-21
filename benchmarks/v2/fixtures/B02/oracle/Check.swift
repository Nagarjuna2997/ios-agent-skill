import XCTest
@testable import Fixture
final class Hidden:XCTestCase {func testResource() throws {XCTAssertEqual(try catalog(),["Cedar","Maple","Elm"])}}
