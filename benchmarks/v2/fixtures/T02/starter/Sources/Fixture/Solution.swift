public enum ServiceError:Error,Equatable {case unavailable}
public func fetch(failing:Bool) async throws -> Int {if failing {throw ServiceError.unavailable};return 7}
