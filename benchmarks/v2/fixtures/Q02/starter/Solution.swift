import Foundation
final class Owner {var action:(()->Int)?;init(){ action={self.value} };var value=17;func run()->Int {action?() ?? 0}}
