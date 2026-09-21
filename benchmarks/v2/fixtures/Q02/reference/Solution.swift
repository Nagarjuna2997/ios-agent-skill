import Foundation
final class Owner {var action:(()->Int)?;init(){ action={[weak self] in self?.value ?? 0} };var value=17;func run()->Int {action?() ?? 0}}
