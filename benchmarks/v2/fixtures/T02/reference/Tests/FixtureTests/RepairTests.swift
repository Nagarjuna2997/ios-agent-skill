import XCTest
@testable import Fixture
final class RepairTests:XCTestCase {func testBoth() async throws {let value=try await fetch(failing:false);XCTAssertEqual(value,7);do {_=try await fetch(failing:true);XCTFail("expected unavailable")}catch {XCTAssertEqual(error as? ServiceError,.unavailable)}}}
