# Group Activities

## Context

Load this when a task names **Group Activities** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/groupactivities) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create app-specific activities your users can share and experience together.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Group Activities`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 12.0 | — | No |
| tvOS | 15.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.group-session](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.group-session)

### Activity definition

- [Defining your app’s SharePlay activities](https://developer.apple.com/documentation/groupactivities/defining-your-apps-shareplay-activities)
- [Supporting coordinated media playback](https://developer.apple.com/documentation/avfoundation/supporting-coordinated-media-playback)
- [GroupActivity](https://developer.apple.com/documentation/groupactivities/groupactivity)
- [GroupActivityMetadata](https://developer.apple.com/documentation/groupactivities/groupactivitymetadata)
- [GroupActivityActivationResult](https://developer.apple.com/documentation/groupactivities/groupactivityactivationresult)
- [GroupActivityTransferRepresentation](https://developer.apple.com/documentation/groupactivities/groupactivitytransferrepresentation)

### Interface presentation

- [Presenting SharePlay activities from your app’s UI](https://developer.apple.com/documentation/groupactivities/promoting-shareplay-activities-from-your-apps-ui)
- [GroupActivitySharingController](https://developer.apple.com/documentation/groupactivities/groupactivitysharingcontroller-4gtfk)
- [GroupActivitySharingController](https://developer.apple.com/documentation/groupactivities/groupactivitysharingcontroller-ybcy)

### Session management

- [Joining and managing a shared activity](https://developer.apple.com/documentation/groupactivities/joining-and-managing-a-shared-activity)
- [Drawing content in a group session](https://developer.apple.com/documentation/groupactivities/drawing-content-in-a-group-session)
- [GroupSession](https://developer.apple.com/documentation/groupactivities/groupsession)
- [CustomMessageIdentifiable](https://developer.apple.com/documentation/groupactivities/custommessageidentifiable)
- [Participant](https://developer.apple.com/documentation/groupactivities/participant)

### Spatial activities

- [Configure your visionOS app for sharing with people nearby](https://developer.apple.com/documentation/groupactivities/configure-your-app-for-sharing-with-people-nearby)
- [Adding spatial Persona support to an activity](https://developer.apple.com/documentation/groupactivities/adding-spatial-persona-support-to-an-activity)
- [Implementing SharePlay for immersive spaces in visionOS](https://developer.apple.com/documentation/visionos/implementing-shareplay-for-immersive-spaces-in-visionos)
- [SystemCoordinator](https://developer.apple.com/documentation/groupactivities/systemcoordinator)
- [SystemCoordinator.ParticipantState](https://developer.apple.com/documentation/groupactivities/systemcoordinator/participantstate)
- [groupActivityAssociation(_:)](https://developer.apple.com/documentation/swiftui/view/groupactivityassociation(_:))
- [GroupActivityAssociationInteraction](https://developer.apple.com/documentation/groupactivities/groupactivityassociationinteraction)
- [GroupActivityAssociationKind](https://developer.apple.com/documentation/groupactivities/groupactivityassociationkind)

### Custom spatial templates

- [Building a guessing game for visionOS](https://developer.apple.com/documentation/groupactivities/building-a-guessing-game-for-visionos)
- [SpatialTemplate](https://developer.apple.com/documentation/groupactivities/spatialtemplate)
- [SpatialTemplatePreference](https://developer.apple.com/documentation/groupactivities/spatialtemplatepreference)
- [SpatialTemplateSeatElement](https://developer.apple.com/documentation/groupactivities/spatialtemplateseatelement)
- [SpatialTemplateElement](https://developer.apple.com/documentation/groupactivities/spatialtemplateelement)
- [SpatialTemplateElementPosition](https://developer.apple.com/documentation/groupactivities/spatialtemplateelementposition)
- [SpatialTemplateElementDirection](https://developer.apple.com/documentation/groupactivities/spatialtemplateelementdirection)
- [SpatialTemplateRole](https://developer.apple.com/documentation/groupactivities/spatialtemplaterole)

### File and data transfer

- [Creating a collaborative photo gallery with SharePlay](https://developer.apple.com/documentation/groupactivities/creating-a-collaborative-photo-gallery-with-shareplay)
- [Synchronizing data during a SharePlay activity](https://developer.apple.com/documentation/groupactivities/synchronizing-data-during-a-shareplay-activity)
- [GroupSessionMessenger](https://developer.apple.com/documentation/groupactivities/groupsessionmessenger)
- [GroupSessionJournal](https://developer.apple.com/documentation/groupactivities/groupsessionjournal)

### System status

- [GroupStateObserver](https://developer.apple.com/documentation/groupactivities/groupstateobserver)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
