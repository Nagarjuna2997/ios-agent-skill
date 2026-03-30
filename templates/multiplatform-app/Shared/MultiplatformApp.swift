import SwiftUI

@main
struct MultiplatformApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        #if os(macOS)
        Settings {
            SettingsView()
        }
        #endif
    }
}

struct ContentView: View {
    var body: some View {
        NavigationSplitView {
            SidebarView()
        } detail: {
            Text("Select an item")
                .font(.title3)
                .foregroundStyle(.secondary)
        }
    }
}

struct SidebarView: View {
    var body: some View {
        List {
            NavigationLink {
                Text("Dashboard")
            } label: {
                Label("Dashboard", systemImage: "chart.bar")
            }
            NavigationLink {
                Text("Items")
            } label: {
                Label("Items", systemImage: "list.bullet")
            }
            NavigationLink {
                Text("Favorites")
            } label: {
                Label("Favorites", systemImage: "star")
            }
        }
        .navigationTitle("My App")
        #if os(macOS)
        .navigationSplitViewColumnWidth(min: 180, ideal: 200)
        #endif
    }
}

struct SettingsView: View {
    @AppStorage("refreshInterval") private var refreshInterval = 15.0

    var body: some View {
        Form {
            Slider(value: $refreshInterval, in: 5...60, step: 5) {
                Text("Refresh interval: \(Int(refreshInterval))s")
            }
        }
        .padding()
        #if os(macOS)
        .frame(width: 350, height: 100)
        #endif
    }
}

#Preview {
    ContentView()
}
