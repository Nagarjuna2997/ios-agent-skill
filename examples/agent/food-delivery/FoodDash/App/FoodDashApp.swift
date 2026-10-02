import SwiftUI

@main
struct FoodDashApp: App {
    @State private var dependencies = AppDependencies.live()
    @State private var presenter = NotificationPresenter()

    var body: some Scene {
        WindowGroup {
            SplashContainer {
                RootView(dependencies: dependencies)
            }
            .appAppearance()
            .tint(AppColor.primary)
            .modelContainer(dependencies.container)
            .onAppear { presenter.install() }
        }
    }
}
