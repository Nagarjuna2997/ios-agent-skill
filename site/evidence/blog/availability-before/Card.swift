import SwiftUI

struct Card: View {
    var body: some View {
        if #available(iOS 27.0, *) {
            Text("Reading").glassEffect()
        } else {
            Text("Reading")
        }
    }
}
