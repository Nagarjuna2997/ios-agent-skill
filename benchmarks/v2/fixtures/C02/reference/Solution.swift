import Foundation
struct Payload: Sendable { let value: Int; init(_ value: Int) { self.value=value } }
actor Accumulator { private var total=0; func add(_ value: Payload) { total += value.value }; func result() -> Int { total } }
func transfer(_ accumulator: Accumulator, _ n: Int) async { await accumulator.add(Payload(n)) }
