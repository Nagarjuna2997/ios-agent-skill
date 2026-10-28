import SwiftUI

struct RootView: View {
    @State private var expanded_node_node_7 = false;
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_3: CGFloat = 32
    var body: some View {
        ScrollView { node_node_1 }
        
    }

    private var node_node_3: some View {
        Text(verbatim: "Trail summary")
        .font(.system(size: scaled_node_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-3")
    }

    private var node_node_5: some View {
        Text(verbatim: "Cedar Loop")
        .fontWeight(.bold)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_6: some View {
        Text(verbatim: "6 km")
        .accessibilityIdentifier("node-6")
    }

    private var node_node_4: some View {
        HStack(alignment: .center, spacing: 16) {
            node_node_5
            node_node_6
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.8980392156862745, green: 0.9333333333333333, blue: 0.8666666666666667))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var node_node_8: some View {
        Text(verbatim: "Bring water and follow the marked path.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-8")
    }

    private var node_node_7: some View {
        DisclosureGroup(isExpanded: $expanded_node_node_7) {
            node_node_8
        } label: { Text(verbatim: "Trail details") }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-7")
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_3
            node_node_4
            node_node_7
        }
        .padding(20)
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
