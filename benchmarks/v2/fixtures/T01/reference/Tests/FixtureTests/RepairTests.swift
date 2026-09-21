import XCTest
@testable import Fixture
final class RepairTests:XCTestCase {func testFetch() async {let value=await fetch();XCTAssertEqual(value,42)}}
