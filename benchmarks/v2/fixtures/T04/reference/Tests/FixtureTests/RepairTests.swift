import Testing
@testable import Fixture
@Test(arguments:[0,1,2,3]) func independent(_ _:Int) async {let local=Counter();#expect(await local.next() == 1);#expect(await local.next() == 2)}
