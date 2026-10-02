import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var selection: MapPlace.ID?\n    var body: some View {\n        PlacesMap(places: [MapPlace(id: \"1\", name: \"A\", latitude: 1, longitude: 2)], selection: $selection)\n    }\n}\n",
  }),
);
