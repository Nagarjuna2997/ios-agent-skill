import Testing
@testable import Fixture
let shared=Counter()
@Test func first() async {#expect(await shared.next() == 1)}
@Test func second() async {#expect(await shared.next() == 1)}
