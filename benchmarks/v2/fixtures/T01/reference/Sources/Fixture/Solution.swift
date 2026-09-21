public func fetch() async -> Int {for _ in 0..<100 {await Task.yield()};return 42}
