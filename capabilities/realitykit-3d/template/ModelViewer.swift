import RealityKit
import SwiftUI

/// A 3D model in an ordinary screen, without AR. Pass nil to show a generated placeholder shape.
struct ModelViewer: View {
    let modelName: String?
    @State private var loadError: String?

    var body: some View {
        RealityView { content in
            content.camera = .virtual

            let camera = PerspectiveCamera()
            camera.camera.fieldOfViewInDegrees = 45
            camera.look(at: .zero, from: [0, 0.25, 0.9], relativeTo: nil)
            content.add(camera)
            content.add(Self.lightRig())

            let model = await loadModel()
            content.add(model)
        }
        .realityViewCameraControls(.orbit)
        .overlay(alignment: .bottom) {
            if let loadError {
                Text(loadError)
                    .font(.footnote)
                    .padding(8)
                    .background(.regularMaterial, in: .capsule)
                    .padding()
            }
        }
        .accessibilityElement()
        .accessibilityLabel(Text(modelName.map { "3D model of \($0)" } ?? "3D model"))
        .accessibilityHint(Text("Drag to rotate"))
    }

    @MainActor
    private func loadModel() async -> Entity {
        if let modelName {
            do {
                let entity = try await Entity(named: modelName)
                Self.fit(entity, size: 0.4)
                return entity
            } catch {
                loadError = "Could not load \(modelName); showing a placeholder."
            }
        }
        return Self.placeholder()
    }

    private static func placeholder() -> Entity {
        var material = PhysicallyBasedMaterial()
        material.baseColor = .init(tint: .systemOrange)
        material.roughness = 0.35
        return ModelEntity(mesh: .generateBox(size: 0.3, cornerRadius: 0.04), materials: [material])
    }

    /// Scales and centers an entity so its largest side is `size` metres.
    private static func fit(_ entity: Entity, size: Float) {
        let bounds = entity.visualBounds(relativeTo: nil)
        let largest = max(bounds.extents.x, bounds.extents.y, bounds.extents.z)
        guard largest > 0 else { return }
        let scale = size / largest
        entity.scale = SIMD3(repeating: scale)
        entity.position = -bounds.center * scale
    }

    private static func lightRig() -> Entity {
        let rig = Entity()
        let key = DirectionalLight()
        key.light.intensity = 2_500
        key.look(at: .zero, from: [1.2, 1.8, 1.4], relativeTo: nil)
        rig.addChild(key)
        let fill = DirectionalLight()
        fill.light.intensity = 800
        fill.look(at: .zero, from: [-1.5, 0.4, 1.0], relativeTo: nil)
        rig.addChild(fill)
        return rig
    }
}

#Preview {
    ModelViewer(modelName: nil)
        .frame(height: 320)
}
