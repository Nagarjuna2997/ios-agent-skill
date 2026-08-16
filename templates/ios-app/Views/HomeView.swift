import SwiftUI

struct HomeView: View {
    /// The view owns its model, but does not construct its dependencies.
    ///
    /// `@State private var viewModel = HomeViewModel()` — the previous version
    /// of this file — is the exact anti-pattern SKILL.md names: the screen
    /// reaches for a live implementation itself, so there is no seam left to
    /// substitute in a test or a preview.
    @State private var viewModel: HomeViewModel

    init(viewModel: HomeViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Home")
                .navigationDestination(for: Item.self) { item in
                    ItemDetailView(item: item)
                }
                .task {
                    await viewModel.loadItems()
                }
        }
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading && viewModel.items.isEmpty {
            ProgressView("Loading…")
        } else if let error = viewModel.error, viewModel.items.isEmpty {
            // Every failure produces a user-visible outcome with a way forward.
            ContentUnavailableView {
                Label("Something went wrong", systemImage: "exclamationmark.triangle")
            } description: {
                Text(error.recoverySuggestion ?? "")
            } actions: {
                Button("Try Again") {
                    Task { await viewModel.refresh() }
                }
                .buttonStyle(.borderedProminent)
            }
        } else if viewModel.items.isEmpty {
            ContentUnavailableView(
                "No Items",
                systemImage: "tray",
                description: Text("Items you add will appear here.")
            )
        } else {
            List(viewModel.items) { item in
                NavigationLink(value: item) {
                    ItemRow(item: item)
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
    }
}

struct ItemRow: View {
    let item: Item

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.iconName)
                .foregroundStyle(.tint)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.headline)
                    .foregroundStyle(Color(.label))
                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(Color(.secondaryLabel))
            }
        }
        .padding(.vertical, 4)
    }
}

struct ItemDetailView: View {
    let item: Item

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Image(systemName: item.iconName)
                    // `.font(.system(size: 64))` was here, and it is one of the
                    // patterns templates/hooks/forbid-antipatterns.sh rejects:
                    // a fixed point size does not scale with Dynamic Type.
                    .font(.largeTitle)
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                    .frame(maxWidth: .infinity)
                    .padding()

                Text(item.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundStyle(Color(.label))

                Text(item.subtitle)
                    .font(.body)
                    .foregroundStyle(Color(.secondaryLabel))
            }
            .padding()
        }
        .navigationTitle(item.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Previews
//
// One per state, all rendering with no network and no disk — which is only
// possible because the repository crosses a protocol boundary.

#Preview("Loaded") {
    HomeView(viewModel: HomeViewModel(repository: StubItemRepository()))
}

#Preview("Empty") {
    HomeView(viewModel: HomeViewModel(repository: StubItemRepository(items: [])))
}

#Preview("Loading") {
    HomeView(viewModel: HomeViewModel(repository: StubItemRepository(delay: .seconds(60))))
}

#Preview("Error") {
    HomeView(viewModel: HomeViewModel(repository: StubItemRepository(failure: HomeError.loadFailed)))
}

#Preview("Dark, accessibility size") {
    HomeView(viewModel: HomeViewModel(repository: StubItemRepository()))
        .preferredColorScheme(.dark)
        .environment(\.dynamicTypeSize, .accessibility3)
}
