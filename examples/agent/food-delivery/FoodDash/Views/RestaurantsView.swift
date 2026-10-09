import MapKit
import SwiftUI

struct RestaurantsView: View {
    @Bindable var model: RestaurantsViewModel
    let dependencies: AppDependencies
    @State private var path: [Restaurant] = []

    var body: some View {
        NavigationStack(path: $path) {
            VStack(spacing: 0) {
                HeroHeader(title: "Good food, nearby", subtitle: "Seasonal favorites, picked for today.", symbol: "fork.knife")
                    .padding(.horizontal)
                    .padding(.top, AppTheme.Space.medium)
                Picker("Display", selection: $model.mode) {
                    ForEach(RestaurantsViewModel.Mode.allCases) { mode in
                        Text(mode.title).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                content
            }
            .navigationTitle("Restaurants")
            .searchable(text: $model.searchText, prompt: "Search restaurants")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await model.useMyLocation() }
                    } label: {
                        Label("Sort by distance from my location", systemImage: model.userLocation == nil ? "location" : "location.fill")
                    }
                    .labelStyle(.iconOnly)
                    .minimumTapTarget()
                    .disabled(model.isLocating)
                }
            }
            .navigationDestination(for: Restaurant.self) { restaurant in
                MenuView(model: MenuViewModel(restaurant: restaurant, service: dependencies.restaurants, store: dependencies.store))
            }
            .sheet(isPresented: $model.locationDenied) {
                LocationDeniedView()
                    .presentationDetents([.medium])
            }
            .task { await model.load() }
            .fontDesign(AppTheme.fontDesign)
        }
    }

    @ViewBuilder private var content: some View {
        switch model.phase {
        case .loading:
            ProgressView("Loading restaurants…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .failed(let message):
            ContentUnavailableView {
                Label("Couldn't load restaurants", systemImage: "exclamationmark.triangle")
            } description: {
                Text(message)
            } actions: {
                Button("Try Again") { Task { await model.load(force: true) } }
            }
        case .loaded:
            if model.visible.isEmpty {
                ContentUnavailableView("No restaurants", systemImage: "fork.knife", description: Text("Nothing matches right now. Try a different search."))
            } else if model.mode == .list {
                list
            } else {
                map
            }
        }
    }

    private var list: some View {
        List(model.visible) { restaurant in
            NavigationLink(value: restaurant) {
                RestaurantRow(restaurant: restaurant, distance: model.distanceText(for: restaurant))
            }
        }
        .listStyle(.plain)
        .refreshable { await model.load(force: true) }
    }

    private var map: some View {
        ZStack(alignment: .bottom) {
            PlacesMap(places: model.mapPlaces, selection: $model.selectedID)
            if let restaurant = model.selectedRestaurant {
                VStack(alignment: .leading, spacing: 8) {
                    Text(restaurant.name).font(.headline)
                    Text(restaurant.cuisine).font(.subheadline).foregroundStyle(.secondary)
                    Button("View Menu") { path.append(restaurant) }
                        .buttonStyle(.borderedProminent)
                        .minimumTapTarget()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(AppColor.surface, in: .rect(cornerRadius: 16))
                .padding()
            }
        }
    }
}

struct RestaurantRow: View {
    let restaurant: Restaurant
    let distance: String?

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: restaurant.imageURL) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                AppIconTile(symbol: "fork.knife", accessibilityLabel: "Restaurant")
            }
            .frame(width: 56, height: 56)
            .clipShape(.rect(cornerRadius: 12))
            .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(restaurant.name).font(.headline)
                Text(restaurant.cuisine).font(.subheadline).foregroundStyle(.secondary)
                HStack(spacing: 12) {
                    if let rating = restaurant.rating {
                        Label(rating.formatted(.number.precision(.fractionLength(1))), systemImage: "star.fill")
                    }
                    if let distance {
                        Label(distance, systemImage: "location")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let deps = AppDependencies.preview()
    return RestaurantsView(model: RestaurantsViewModel(service: deps.restaurants, location: deps.location), dependencies: deps)
}
