#if os(iOS)
import AppTrackingTransparency

/// Request only after a deliberate user action and only if the app actually tracks.
/// The host app must provide NSUserTrackingUsageDescription and review Apple's
/// regional requirements. A result of .notDetermined is not authorization.
@MainActor
public enum TrackingAuthorization {
    public static func request(preferExpanded: Bool) async -> ATTrackingManager.AuthorizationStatus {
        if #available(iOS 27.2, *) {
            return await ATTrackingManager.requestTrackingAuthorization(
                preferExpandedInterface: preferExpanded,
                additionalInformationAction: nil
            )
        }
        return await ATTrackingManager.requestTrackingAuthorization()
    }
}
#endif
