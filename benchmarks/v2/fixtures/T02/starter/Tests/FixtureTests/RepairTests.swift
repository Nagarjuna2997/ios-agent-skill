import XCTest
@testable import Fixture
final class RepairTests:XCTestCase {func testSuccess() async throws {let value=try await fetch(failing:false);XCTAssertEqual(value,7)}}
