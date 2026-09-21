import Foundation
final class Payload { var value: Int; init(_ value: Int) { self.value = value } }
actor Accumulator { private var total=0; func add(_ value: Payload) { total += value.value }; func result() -> Int { total } }
func transfer(_ accumulator: Accumulator, _ n: Int) async { let p=Payload(n); await accumulator.add(p); p.value=999 }
