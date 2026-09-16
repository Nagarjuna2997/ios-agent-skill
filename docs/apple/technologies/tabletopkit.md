# TabletopKit

## Context

Load this when a task names **TabletopKit** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/tabletopkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create multiplayer spatial games on a virtual table surface and use FaceTime to invite players.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TabletopKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| visionOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating tabletop games](https://developer.apple.com/documentation/tabletopkit/creating-tabletop-games)
- [Synchronizing group gameplay with TabletopKit](https://developer.apple.com/documentation/tabletopkit/synchronizing-group-gameplay-with-tabletopkit)
- [TabletopGame](https://developer.apple.com/documentation/tabletopkit/tabletopgame)
- [TableSetup](https://developer.apple.com/documentation/tabletopkit/tablesetup)
- [Tabletop](https://developer.apple.com/documentation/tabletopkit/tabletop)
- [EntityTabletop](https://developer.apple.com/documentation/tabletopkit/entitytabletop)
- [TabletopShape](https://developer.apple.com/documentation/tabletopkit/tabletopshape)

### Seats

- [TableState](https://developer.apple.com/documentation/tabletopkit/tablestate)
- [TableSeat](https://developer.apple.com/documentation/tabletopkit/tableseat)
- [EntityTableSeat](https://developer.apple.com/documentation/tabletopkit/entitytableseat)
- [TableSeatIdentifier](https://developer.apple.com/documentation/tabletopkit/tableseatidentifier)
- [TableSeatState](https://developer.apple.com/documentation/tabletopkit/tableseatstate)
- [SeatState](https://developer.apple.com/documentation/tabletopkit/seatstate)

### Equipment

- [Implementing playing card overlap and physical characteristics](https://developer.apple.com/documentation/tabletopkit/implementing-playing-card-overlap-and-physical-characteristics)
- [Equipment](https://developer.apple.com/documentation/tabletopkit/equipment)
- [EquipmentCollection](https://developer.apple.com/documentation/tabletopkit/equipmentcollection)
- [EntityEquipment](https://developer.apple.com/documentation/tabletopkit/entityequipment)
- [EquipmentIdentifier](https://developer.apple.com/documentation/tabletopkit/equipmentidentifier)
- [EquipmentState](https://developer.apple.com/documentation/tabletopkit/equipmentstate)
- [EquipmentStateCollection](https://developer.apple.com/documentation/tabletopkit/equipmentstatecollection)
- [BaseEquipmentState](https://developer.apple.com/documentation/tabletopkit/baseequipmentstate)
- [CustomEquipmentState](https://developer.apple.com/documentation/tabletopkit/customequipmentstate)
- [MutableEquipmentState](https://developer.apple.com/documentation/tabletopkit/mutableequipmentstate)
- [CardState](https://developer.apple.com/documentation/tabletopkit/cardstate)
- [DieState](https://developer.apple.com/documentation/tabletopkit/diestate)
- [RawValueState](https://developer.apple.com/documentation/tabletopkit/rawvaluestate)
- [ControllingSeats](https://developer.apple.com/documentation/tabletopkit/controllingseats)

### Equipment layout

- [EquipmentLayout](https://developer.apple.com/documentation/tabletopkit/equipmentlayout)
- [DefaultEquipmentLayout](https://developer.apple.com/documentation/tabletopkit/defaultequipmentlayout)
- [EquipmentPose2D](https://developer.apple.com/documentation/tabletopkit/equipmentpose2d)
- [EquipmentPose3D](https://developer.apple.com/documentation/tabletopkit/equipmentpose3d)

### Score counters

- [ScoreCounter](https://developer.apple.com/documentation/tabletopkit/scorecounter)
- [CounterCollection](https://developer.apple.com/documentation/tabletopkit/countercollection)

### Players

- [Player](https://developer.apple.com/documentation/tabletopkit/player)
- [PlayerIdentifier](https://developer.apple.com/documentation/tabletopkit/playeridentifier)

### Actions

- [TabletopAction](https://developer.apple.com/documentation/tabletopkit/tabletopaction)
- [MoveEquipmentAction](https://developer.apple.com/documentation/tabletopkit/moveequipmentaction)
- [UpdateEquipmentAction](https://developer.apple.com/documentation/tabletopkit/updateequipmentaction)
- [SetTurnAction](https://developer.apple.com/documentation/tabletopkit/setturnaction)
- [UpdateCounterAction](https://developer.apple.com/documentation/tabletopkit/updatecounteraction)
- [CreateBookmarkAction](https://developer.apple.com/documentation/tabletopkit/createbookmarkaction)
- [CustomAction](https://developer.apple.com/documentation/tabletopkit/customaction)

### Interactions

- [Simulating dice rolls as a component for your game](https://developer.apple.com/documentation/tabletopkit/simulating-dice-rolls-as-a-component-for-your-game)
- [TabletopInteraction](https://developer.apple.com/documentation/tabletopkit/tabletopinteraction)
- [TossableRepresentation](https://developer.apple.com/documentation/tabletopkit/tossablerepresentation)
- [TableSnapshot](https://developer.apple.com/documentation/tabletopkit/tablesnapshot)
- [TableVisualState](https://developer.apple.com/documentation/tabletopkit/tablevisualstate)
- [TableCursor](https://developer.apple.com/documentation/tabletopkit/tablecursor)
- [TableCursorIdentifier](https://developer.apple.com/documentation/tabletopkit/tablecursoridentifier)

### Bookmarks

- [StateBookmark](https://developer.apple.com/documentation/tabletopkit/statebookmark)
- [StateBookmarkIdentifier](https://developer.apple.com/documentation/tabletopkit/statebookmarkidentifier)

### Multiplayer network session

- [TabletopNetworkSession](https://developer.apple.com/documentation/tabletopkit/tabletopnetworksession)
- [TabletopNetworkSessionCoordinator](https://developer.apple.com/documentation/tabletopkit/tabletopnetworksessioncoordinator)
- [TabletopSendMessageResult](https://developer.apple.com/documentation/tabletopkit/tabletopsendmessageresult)

### Debugging

- [DebugDrawOptions](https://developer.apple.com/documentation/tabletopkit/debugdrawoptions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
