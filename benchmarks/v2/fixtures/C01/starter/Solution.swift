import Foundation
@MainActor final class ScreenModel { var count = 0 }
func increment(_ model: ScreenModel) async { model.count += 1 }
