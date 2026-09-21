import Foundation
func recordLogin(user:String, credential:String, emit:(String)->Void) { emit("login user=\(user) credential=\(credential)") }
