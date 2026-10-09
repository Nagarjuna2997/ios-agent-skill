import SwiftData
import SwiftUI

/// Tab identifiers match the plan's top-level screen ids so `-ios-agent-screen` can select them.
enum AppTab: String, Hashable {
    case home = "home-feed"
    case search
    case profile
}

/// Reads the model context from the environment and builds the live view models once.
struct RootView: View {
    @Environment(\.modelContext) private var context

    var body: some View {
        RootContent(context: context)
    }
}

private struct RootContent: View {
    @State private var selection: AppTab
    @State private var feed: FeedViewModel
    @State private var profile: ProfileViewModel

    init(context: ModelContext) {
        _selection = State(initialValue: AgentLaunch.requestedScreen.flatMap(AppTab.init(rawValue:)) ?? .home)
        _feed = State(initialValue: FeedViewModel(store: SwiftDataCardStore(context: context)))
        _profile = State(initialValue: ProfileViewModel(store: SwiftDataProfileStore(context: context)))
    }

    var body: some View {
        TabView(selection: $selection) {
            HomeView(feed: feed)
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(AppTab.home)
            SearchView(feed: feed)
                .tabItem { Label("Search", systemImage: "magnifyingglass") }
                .tag(AppTab.search)
            ProfileView(model: profile)
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                .tag(AppTab.profile)
        }
        .fontDesign(AppTheme.fontDesign)
    }
}

#Preview {
    RootView()
        .modelContainer(PreviewSupport.seededContainer())
}
