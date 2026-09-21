import Testing
@testable import Fixture
@Test(arguments:[1,2,3]) func pages(_ n:Int) {#expect(pageCount(items:n)==1)}
