import SwiftUI

struct HomeView: View {
    @State private var viewModel = HomeViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading...")
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
            .navigationTitle("Home")
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
            .task {
                await viewModel.loadItems()
            }
        }
    }
}

struct ItemRow: View {
    let item: Item

    var body: some View {
        HStack {
            Image(systemName: item.iconName)
                .foregroundStyle(.tint)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.headline)
                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
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
                    .font(.system(size: 64))
                    .foregroundStyle(.tint)
                    .frame(maxWidth: .infinity)
                    .padding()

                Text(item.title)
                    .font(.title)
                    .fontWeight(.bold)

                Text(item.subtitle)
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .navigationTitle(item.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    HomeView()
}
