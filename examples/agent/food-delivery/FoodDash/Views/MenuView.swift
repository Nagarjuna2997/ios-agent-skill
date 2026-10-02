import SwiftUI

struct MenuView: View {
    @State private var model: MenuViewModel

    init(model: MenuViewModel) {
        _model = State(initialValue: model)
    }

    var body: some View {
        Group {
            switch model.phase {
            case .loading:
                ProgressView("Loading menu…")
            case .failed(let message):
                ContentUnavailableView {
                    Label("Couldn't load the menu", systemImage: "exclamationmark.triangle")
                } description: {
                    Text(message)
                } actions: {
                    Button("Try Again") { Task { await model.load() } }
                }
            case .loaded:
                if model.items.isEmpty {
                    ContentUnavailableView("No dishes yet", systemImage: "menucard", description: Text("This restaurant has not published a menu."))
                } else {
                    menuList
                }
            }
        }
        .navigationTitle(model.restaurant.name)
        .navigationBarTitleDisplayMode(.inline)
        .task { await model.load() }
        .appFeedback(.impact, trigger: model.addCount)
        .overlay(alignment: .bottom) {
            if let name = model.lastAdded {
                Label("Added \(name)", systemImage: "checkmark.circle.fill")
                    .font(.subheadline)
                    .padding()
                    .background(.regularMaterial, in: .capsule)
                    .padding()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .motionAwareAnimation(.spring, value: model.lastAdded)
    }

    private var menuList: some View {
        List {
            Section {
                ForEach(model.items) { item in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.name).font(.headline)
                            if let details = item.details {
                                Text(details).font(.subheadline).foregroundStyle(.secondary)
                            }
                            Text(Money.format(cents: item.priceCents)).font(.subheadline.bold())
                        }
                        Spacer()
                        Button {
                            model.add(item)
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.title)
                                .foregroundStyle(AppColor.primary)
                        }
                        .buttonStyle(.borderless)
                        .minimumTapTarget()
                        .accessibilityLabel("Add \(item.name) to cart")
                    }
                }
            } header: {
                Text(model.restaurant.cuisine)
            }
        }
    }
}

#Preview {
    let deps = AppDependencies.preview()
    return NavigationStack {
        MenuView(model: MenuViewModel(restaurant: SampleData.restaurants[0], service: deps.restaurants, store: deps.store))
    }
    .modelContainer(deps.container)
}
