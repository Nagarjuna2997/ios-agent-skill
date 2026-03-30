// watchOS-specific extensions and configurations

import SwiftUI

// MARK: - watchOS-Specific Views

#if os(watchOS)
struct WatchContentView: View {
    var body: some View {
        TabView {
            DashboardWatchView()
            ItemsWatchView()
            SettingsWatchView()
        }
        .tabViewStyle(.verticalPage)
    }
}

struct DashboardWatchView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                Text("Dashboard")
                    .font(.headline)

                HStack {
                    VStack {
                        Text("12")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Active")
                            .font(.caption2)
                    }
                    Spacer()
                    VStack {
                        Text("5")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Done")
                            .font(.caption2)
                    }
                }
                .padding()
                .background(.quaternary)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }
}

struct ItemsWatchView: View {
    let items = ["Item 1", "Item 2", "Item 3"]

    var body: some View {
        List(items, id: \.self) { item in
            Text(item)
        }
        .navigationTitle("Items")
    }
}

struct SettingsWatchView: View {
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true

    var body: some View {
        List {
            Toggle("Notifications", isOn: $notificationsEnabled)
        }
        .navigationTitle("Settings")
    }
}
#endif
