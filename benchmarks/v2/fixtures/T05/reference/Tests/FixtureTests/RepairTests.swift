import Testing
@testable import Fixture
@Test(arguments:[-1,0,1,9,10,11,20,21]) func pages(_ n:Int) {let expected=[-1:0,0:0,1:1,9:1,10:1,11:2,20:2,21:3];#expect(pageCount(items:n)==expected[n]!)}
