import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
@main struct Check { static func main() { weak var weakOwner:Owner?;var callback:(()->Int)?;do {let owner=Owner();weakOwner=owner;owner.value=23;require(owner.run() == 23,"callback behavior");callback=owner.action};require(weakOwner == nil,"owner retained by callback");_ = callback?() } }
