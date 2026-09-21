import XCTest
@testable import Fixture
final class Hidden:XCTestCase {func testDependency(){for n in [-7,0,6,103] {XCTAssertEqual(doubled(n),n*2)}}}
