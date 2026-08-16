import SwiftUI

/// The composition root.
///
/// Concrete implementations are named **here and nowhere else**. Every screen
/// below receives what it needs, so no view or view model has to know that a
/// network client exists — which is what lets each of them render in a preview.
struct AppDependencies {
    var itemRepository: any ItemRepository

    /// Replace `StubItemRepository` with your live client when you have one.
    /// It is the single line that switches the whole app over.
    static let live = AppDependencies(itemRepository: StubItemRepository())
}

struct ContentView: View {
    let dependencies: AppDependencies
    @State private var selectedTab: Tab = .home

    init(dependencies: AppDependencies = .live) {
        self.dependencies = dependencies
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(viewModel: HomeViewModel(repository: dependencies.itemRepository))
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(Tab.home)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(Tab.profile)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(Tab.settings)
        }
    }
}

enum Tab: Hashable {
    case home
    case profile
    case settings
}

#Preview {
    ContentView()
}
