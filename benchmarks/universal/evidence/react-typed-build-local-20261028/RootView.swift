import SwiftUI

struct RootView: View {

    @ScaledMetric(relativeTo: .body) private var scaled_node_node_4: CGFloat = 32
    var body: some View {
        ScrollView { node_node_1 }
        
    }

    private var node_node_4: some View {
        Text(verbatim: "Typed native card")
        .font(.system(size: scaled_node_node_4, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        Text(verbatim: "Types stay in source; behavior comes from the supported expressions.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_3: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_4
            node_node_5
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9333333333333333, green: 0.9568627450980393, blue: 0.9333333333333333))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_3
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}



#Preview { RootView() }
