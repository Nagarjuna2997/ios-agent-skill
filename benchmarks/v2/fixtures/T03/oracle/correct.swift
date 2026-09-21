public struct Expiry {public let deadline:Int;public init(deadline:Int){self.deadline=deadline};public func expired(now:()->Int)->Bool {now() >= deadline}}
