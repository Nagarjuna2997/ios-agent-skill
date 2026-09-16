# GameKit

## Context

Load this when a task names **GameKit** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/gamekit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Enable players to interact with friends, compare leaderboard ranks, earn achievements, and participate in multiplayer games.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `GameKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 3.0 | — | No |
| iPadOS | 3.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 3.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Initializing and configuring Game Center](https://developer.apple.com/documentation/gamekit/initializing-and-configuring-game-center)
- [Authenticating a player](https://developer.apple.com/documentation/gamekit/authenticating-a-player)
- [Improving the player experience for games with large downloads](https://developer.apple.com/documentation/gamekit/improving-the-player-experience-for-games-with-large-downloads)
- [Game Center Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.game-center)

### Players

- [Connecting players with their friends in your game](https://developer.apple.com/documentation/gamekit/connecting-players-with-their-friends-in-your-game)
- [Saving the player’s game data to an iCloud account](https://developer.apple.com/documentation/gamekit/saving-the-player-s-game-data-to-an-icloud-account)
- [Protecting the player’s privacy using scoped identifiers](https://developer.apple.com/documentation/gamekit/protecting-the-player-s-privacy-using-scoped-identifiers)
- [GKLocalPlayer](https://developer.apple.com/documentation/gamekit/gklocalplayer)
- [GKPlayer](https://developer.apple.com/documentation/gamekit/gkplayer)
- [GKBasePlayer](https://developer.apple.com/documentation/gamekit/gkbaseplayer)
- [GKLocalPlayerListener](https://developer.apple.com/documentation/gamekit/gklocalplayerlistener)
- [GKPlayerAuthenticationDidChangeNotificationName](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/gkplayerauthenticationdidchangenotificationname)
- [GKPlayerDidChangeNotificationName](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/gkplayerdidchangenotificationname)

### Game Center interfaces

- [Adding an access point to your game](https://developer.apple.com/documentation/gamekit/adding-an-access-point-to-your-game)
- [Displaying the Game Center dashboard](https://developer.apple.com/documentation/gamekit/displaying-the-game-center-dashboard)
- [GKAccessPoint](https://developer.apple.com/documentation/gamekit/gkaccesspoint)
- [GKDialogController](https://developer.apple.com/documentation/gamekit/gkdialogcontroller)
- [GKViewController](https://developer.apple.com/documentation/gamekit/gkviewcontroller)

### Leaderboards

- [Encourage progress and competition with leaderboards](https://developer.apple.com/documentation/gamekit/encourage-progress-and-competition-with-leaderboards)
- [Creating recurring leaderboards](https://developer.apple.com/documentation/gamekit/creating-recurring-leaderboards)
- [Adding Recurring Leaderboards to Your Game](https://developer.apple.com/documentation/gamekit/adding-recurring-leaderboards-to-your-game)
- [GKLeaderboard](https://developer.apple.com/documentation/gamekit/gkleaderboard)
- [GKLeaderboardSet](https://developer.apple.com/documentation/gamekit/gkleaderboardset)
- [GKLeaderboardScore](https://developer.apple.com/documentation/gamekit/gkleaderboardscore)

### Achievements

- [Rewarding players with achievements](https://developer.apple.com/documentation/gamekit/rewarding-players-with-achievements)
- [GKAchievement](https://developer.apple.com/documentation/gamekit/gkachievement)
- [GKAchievementDescription](https://developer.apple.com/documentation/gamekit/gkachievementdescription)

### Challenges

- [Creating engaging challenges from leaderboards](https://developer.apple.com/documentation/gamekit/creating-engaging-challenges-from-leaderboards)
- [Choosing a leaderboard for your challenges](https://developer.apple.com/documentation/gamekit/choosing-a-leaderboard-for-your-challenges)
- [GKChallengeDefinition](https://developer.apple.com/documentation/gamekit/gkchallengedefinition)
- [GKShowChallengeBanners](https://developer.apple.com/documentation/bundleresources/information-property-list/gkshowchallengebanners) — deprecated

### Activities

- [Creating activities for your game](https://developer.apple.com/documentation/gamekit/creating-activities-for-your-game)
- [GKGameActivity](https://developer.apple.com/documentation/gamekit/gkgameactivity)
- [GKGameActivityDefinition](https://developer.apple.com/documentation/gamekit/gkgameactivitydefinition)
- [GKGameActivityListener](https://developer.apple.com/documentation/gamekit/gkgameactivitylistener)

### Real-time games

- [Creating real-time games](https://developer.apple.com/documentation/gamekit/creating-real-time-games)
- [Finding multiple players for a game](https://developer.apple.com/documentation/gamekit/finding-multiple-players-for-a-game)
- [Exchanging data between players in real-time games](https://developer.apple.com/documentation/gamekit/exchanging-data-between-players-in-real-time-games)
- [Adding voice chat to multiplayer games](https://developer.apple.com/documentation/gamekit/adding-voice-chat-to-multiplayer-games)
- [Finding players for custom server-based games](https://developer.apple.com/documentation/gamekit/finding-players-for-custom-server-based-games)
- [Matchmaking rules](https://developer.apple.com/documentation/gamekit/matchmaking-rules)
- [GKMatchRequest](https://developer.apple.com/documentation/gamekit/gkmatchrequest)
- [GKMatchmaker](https://developer.apple.com/documentation/gamekit/gkmatchmaker)
- [GKMatchmakerViewController](https://developer.apple.com/documentation/gamekit/gkmatchmakerviewcontroller)
- [GKInviteEventListener](https://developer.apple.com/documentation/gamekit/gkinviteeventlistener)
- [GKInvite](https://developer.apple.com/documentation/gamekit/gkinvite)
- [GKMatch](https://developer.apple.com/documentation/gamekit/gkmatch)

### Turn-based games

- [Creating turn-based games](https://developer.apple.com/documentation/gamekit/creating-turn-based-games)
- [Starting turn-based matches and passing turns between players](https://developer.apple.com/documentation/gamekit/starting-turn-based-matches-and-passing-turns-between-players)
- [Sending messages to players in turn-based games](https://developer.apple.com/documentation/gamekit/sending-messages-to-players-in-turn-based-games)
- [Exchanging data between players in turn-based games](https://developer.apple.com/documentation/gamekit/exchanging-data-between-players-in-turn-based-games)
- [GKTurnBasedMatchmakerViewController](https://developer.apple.com/documentation/gamekit/gkturnbasedmatchmakerviewcontroller)
- [GKTurnBasedMatch](https://developer.apple.com/documentation/gamekit/gkturnbasedmatch)
- [GKTurnBasedParticipant](https://developer.apple.com/documentation/gamekit/gkturnbasedparticipant)
- [GKTurnBasedEventListener](https://developer.apple.com/documentation/gamekit/gkturnbasedeventlistener)
- [GKTurnBasedExchange](https://developer.apple.com/documentation/gamekit/gkturnbasedexchange)
- [GKTurnBasedExchangeReply](https://developer.apple.com/documentation/gamekit/gkturnbasedexchangereply)
- [GKGameCenterBadgingDisabled](https://developer.apple.com/documentation/bundleresources/information-property-list/gkgamecenterbadgingdisabled)

### Errors

- [GKError](https://developer.apple.com/documentation/gamekit/gkerror)
- [GKError.Code](https://developer.apple.com/documentation/gamekit/gkerror/code)
- [GKErrorDomain](https://developer.apple.com/documentation/gamekit/gkerrordomain)

### Deprecated

- [Deprecated symbols](https://developer.apple.com/documentation/gamekit/deprecated-symbols)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
