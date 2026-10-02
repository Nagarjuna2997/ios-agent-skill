import LocalAuthentication
import SwiftUI

protocol BiometricAuthenticating: Sendable {
    func authenticate(reason: String) async -> Result<Void, BiometricError>
}

enum BiometricError: LocalizedError, Equatable {
    case notAvailable
    case cancelled
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .notAvailable: "Set a device passcode to use the lock."
        case .cancelled: "Unlock was cancelled."
        case .failed(let message): message
        }
    }
}

struct LocalBiometricAuthenticator: BiometricAuthenticating {
    func authenticate(reason: String) async -> Result<Void, BiometricError> {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            return .failure(.notAvailable)
        }
        do {
            _ = try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason)
            return .success(())
        } catch let error as LAError where [.userCancel, .systemCancel, .appCancel].contains(error.code) {
            return .failure(.cancelled)
        } catch {
            return .failure(.failed(error.localizedDescription))
        }
    }
}

struct PreviewBiometricAuthenticator: BiometricAuthenticating {
    var result: Result<Void, BiometricError> = .success(())
    func authenticate(reason: String) async -> Result<Void, BiometricError> { result }
}

private struct BiometricLockModifier: ViewModifier {
    let isEnabled: Bool
    let authenticator: any BiometricAuthenticating
    @Environment(\.scenePhase) private var scenePhase
    @State private var isUnlocked = false
    @State private var message: String?

    func body(content: Content) -> some View {
        if !isEnabled || isUnlocked {
            content
                .onChange(of: scenePhase) { _, phase in
                    if phase == .background { isUnlocked = false }
                }
        } else {
            LockedView(message: message) {
                Task { await unlock() }
            }
            .task { await unlock() }
        }
    }

    private func unlock() async {
        switch await authenticator.authenticate(reason: "Unlock to see your information.") {
        case .success:
            message = nil
            isUnlocked = true
        case .failure(let error):
            message = error.localizedDescription
        }
    }
}

struct LockedView: View {
    var message: String?
    let unlock: () -> Void

    var body: some View {
        ContentUnavailableView {
            Label("Locked", systemImage: "lock.fill")
        } description: {
            Text(message ?? "Authenticate to continue.")
        } actions: {
            Button("Unlock", action: unlock)
                .buttonStyle(.borderedProminent)
        }
    }
}

extension View {
    func biometricLock(isEnabled: Bool, authenticator: any BiometricAuthenticating = LocalBiometricAuthenticator()) -> some View {
        modifier(BiometricLockModifier(isEnabled: isEnabled, authenticator: authenticator))
    }
}

#Preview {
    Text("Private content")
        .biometricLock(isEnabled: true, authenticator: PreviewBiometricAuthenticator(result: .failure(.cancelled)))
}
