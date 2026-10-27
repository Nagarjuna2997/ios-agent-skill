import SwiftUI

struct RootView: View {
    @State private var routePath: [String] = []
    @State private var state_node_state_1 = false;
    @ScaledMetric(relativeTo: .body) private var scaled_node_screen_1_node_3: CGFloat = 32
    @ScaledMetric(relativeTo: .body) private var scaled_node_screen_2_node_3: CGFloat = 32
    @ScaledMetric(relativeTo: .body) private var scaled_node_screen_3_node_3: CGFloat = 32
    var body: some View {
        NavigationStack(path: $routePath) {
            routeScreen("screen-1")
                .navigationDestination(for: String.self) { destination in routeScreen(destination) }
        }
    }

    @ViewBuilder private func routeScreen(_ destination: String) -> some View {
        switch destination {
        case "screen-1":
            ScrollView { node_screen_1_node_1 }
        
                .navigationBarTitleDisplayMode(.inline)
        case "screen-2":
            ScrollView { node_screen_2_node_1 }
        
                .navigationBarTitleDisplayMode(.inline)
        case "screen-3":
            ScrollView { node_screen_3_node_1 }
        
                .navigationBarTitleDisplayMode(.inline)
        default: EmptyView()
        }
    }

    private var node_screen_1_node_3: some View {
        Text(verbatim: "Trail journal")
        .font(.system(size: scaled_node_screen_1_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-1-node-3")
    }

    private var node_screen_1_node_4: some View {
        Text(verbatim: (state_node_state_1 ? "Walk saved" : "No saved walk"))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-1-node-4")
    }

    private var node_screen_1_node_5: some View {
        Button { state_node_state_1.toggle() } label: { Text(verbatim: "Toggle saved walk") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-1-node-5")
    }

    private var node_screen_1_node_6: some View {
        NavigationLink(value: "screen-2") { Text(verbatim: "Open Cedar Loop").frame(minHeight: 44) }
        .buttonStyle(.bordered)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-1-node-6")
    }

    private var node_screen_1_node_2: some View {
        VStack(alignment: .leading, spacing: 16) {
            node_screen_1_node_3
            node_screen_1_node_4
            node_screen_1_node_5
            node_screen_1_node_6
        }
        .foregroundStyle(Color(red: 0.08235294117647059, green: 0.21568627450980393, blue: 0.17647058823529413))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9568627450980393, green: 0.9647058823529412, blue: 0.9372549019607843))
    }

    private var node_screen_1_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_screen_1_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_screen_2_node_3: some View {
        Text(verbatim: "Cedar Loop")
        .font(.system(size: scaled_node_screen_2_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-2-node-3")
    }

    private var node_screen_2_node_4: some View {
        Text(verbatim: "A quiet woodland route.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-2-node-4")
    }

    private var node_screen_2_node_5: some View {
        NavigationLink(value: "screen-3") { Text(verbatim: "Read field notes").frame(minHeight: 44) }
        .buttonStyle(.bordered)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-2-node-5")
    }

    private var node_screen_2_node_2: some View {
        VStack(alignment: .leading, spacing: 16) {
            node_screen_2_node_3
            node_screen_2_node_4
            node_screen_2_node_5
        }
        .foregroundStyle(Color(red: 0.08235294117647059, green: 0.21568627450980393, blue: 0.17647058823529413))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9568627450980393, green: 0.9647058823529412, blue: 0.9372549019607843))
    }

    private var node_screen_2_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_screen_2_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_screen_3_node_3: some View {
        Text(verbatim: "Field notes")
        .font(.system(size: scaled_node_screen_3_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-3-node-3")
    }

    private var node_screen_3_node_4: some View {
        Text(verbatim: "Stay on the marked path.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("screen-3-node-4")
    }

    private var node_screen_3_node_2: some View {
        VStack(alignment: .leading, spacing: 16) {
            node_screen_3_node_3
            node_screen_3_node_4
        }
        .foregroundStyle(Color(red: 0.08235294117647059, green: 0.21568627450980393, blue: 0.17647058823529413))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9568627450980393, green: 0.9647058823529412, blue: 0.9372549019607843))
    }

    private var node_screen_3_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_screen_3_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}



#Preview { RootView() }
