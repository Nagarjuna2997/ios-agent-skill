public enum ServiceError:Error,Equatable {case unavailable}
public func fetch(failing:Bool) async throws -> Int {if failing {return 0};return 7}
