import XCTest
@testable import Fixture
final class RepairTests:XCTestCase {func testBoundaries(){let e=Expiry(deadline:50);for (now,wanted) in [(49,false),(50,true),(51,true)] {XCTAssertEqual(e.expired{now},wanted)}}}
