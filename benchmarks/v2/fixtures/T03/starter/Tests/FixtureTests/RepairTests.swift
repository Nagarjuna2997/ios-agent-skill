import XCTest
@testable import Fixture
import Foundation
final class RepairTests:XCTestCase {func testClock(){let now=Int(Date().timeIntervalSince1970);XCTAssertTrue(Expiry(deadline:now-5).expired{Int(Date().timeIntervalSince1970)})}}
