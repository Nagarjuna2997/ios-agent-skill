import AuthenticationServices
import SwiftUI

enum PasskeyError: LocalizedError {
    case notConfigured
    case unexpectedResult

    var errorDescription: String? {
        switch self {
        case .notConfigured: "Passkeys are not set up yet. Add ASSOCIATED_DOMAIN to .env and rebuild."
        case .unexpectedResult: "The system returned an unexpected sign-in result."
        }
    }
}

/// The fields a WebAuthn server needs, as base64url-ready raw data.
struct PasskeyCredential: Sendable, Equatable {
    var credentialID: Data
    var clientDataJSON: Data
    var attestationObject: Data?
    var authenticatorData: Data?
    var signature: Data?
    var userID: Data?
}

@MainActor
struct PasskeyService {
    let relyingParty: String

    static func fromBundle(_ bundle: Bundle = .main) -> PasskeyService? {
        guard let domain = bundle.object(forInfoDictionaryKey: "ASSOCIATED_DOMAIN") as? String,
              !domain.isEmpty, domain != "REPLACE_ME", domain.contains(".") else { return nil }
        return PasskeyService(relyingParty: domain)
    }

    func register(userName: String, userID: Data, challenge: Data, using controller: AuthorizationController) async throws -> PasskeyCredential {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: relyingParty)
        let request = provider.createCredentialRegistrationRequest(challenge: challenge, name: userName, userID: userID)
        switch try await controller.performRequests([request]) {
        case .passkeyRegistration(let registration):
            return PasskeyCredential(credentialID: registration.credentialID, clientDataJSON: registration.rawClientDataJSON, attestationObject: registration.rawAttestationObject)
        default:
            throw PasskeyError.unexpectedResult
        }
    }

    func signIn(challenge: Data, using controller: AuthorizationController) async throws -> PasskeyCredential {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: relyingParty)
        let request = provider.createCredentialAssertionRequest(challenge: challenge)
        switch try await controller.performRequests([request]) {
        case .passkeyAssertion(let assertion):
            return PasskeyCredential(credentialID: assertion.credentialID, clientDataJSON: assertion.rawClientDataJSON, authenticatorData: assertion.rawAuthenticatorData, signature: assertion.signature, userID: assertion.userID)
        default:
            throw PasskeyError.unexpectedResult
        }
    }
}
