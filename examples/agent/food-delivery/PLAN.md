# FoodDash: build plan

A food delivery app where users sign in with Apple or email, browse nearby restaurants on a list or map, build a cart, and pay at checkout using StoreKit. After ordering, they follow progress with a Live Activity on the Lock Screen and Dynamic Island, and review past orders on a dashboard.

Target toolchain: Xcode not detected; simulator: none detected.

## Screens

| Screen | Reached from | Purpose |
|---|---|---|
| Splash (`splash`) | navigation | Animated logo shown at launch before entering the app. |
| Sign In (`sign-in`) | navigation | Sign in with Apple or with email and password, or create an account. |
| Restaurants (`restaurants`) | tab bar | Browse restaurants as a list or on a map and open a menu. |
| Menu (`restaurant-menu`) | navigation | Show a restaurant's dishes and add items to the cart. |
| Cart (`cart`) | tab bar | Review items, change quantities and proceed to checkout. |
| Checkout (`checkout`) | navigation | Confirm the order total and delivery address, then pay with StoreKit. |
| Order Status (`order-status`) | tab bar | Track the current order's progress, mirrored in a Live Activity. |
| Past Orders (`dashboard`) | tab bar | Dashboard of past orders with spending stats and a history list. |
| Account (`account`) | tab bar | Profile, appearance setting and sign out. |

Navigation: tabs.

## Data model

- **Restaurant**: id: String, name: String, cuisine: String, latitude: Double, longitude: Double, rating: Double?, imageURL: URL?
- **MenuItem**: id: String, restaurantId: String, name: String, details: String?, priceCents: Int
- **CartItem** (stored on device with SwiftData): id: UUID, menuItemId: String, restaurantId: String, name: String, priceCents: Int, quantity: Int
- **Order** (stored on device with SwiftData): id: UUID, restaurantName: String, totalCents: Int, placedAt: Date, status: String, itemSummary: String, transactionId: String?

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| Launch screen and animated splash | Launch screen and animated logo splash into the app. | Apple-native | lottie-animation | free: Apple frameworks only | nothing | Built with the app | untested |
| Lottie animation | Optional richer logo animation on the splash screen. | third-party | swiftui-animations, rive-animation | free: Open-source package (Apache 2.0); designing animations may need paid tools | nothing | Built with the app | untested |
| Accessibility baseline | 44 pt tap targets, Reduce Motion aware animation and Dynamic Type spacing. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Keychain storage | Stores the session securely on the device. | Apple-native | cryptokit-encryption | free: Apple frameworks only | nothing | Built with the app | untested |
| Sign in with Apple | Sign in with Apple is required alongside the email option. | Apple-native | email-password-auth, passkeys, google-sign-in, firebase-auth, supabase-auth-sdk | subscription: Free to build and run in the simulator; the Sign in with Apple capability on a device and App Store distribution need an Apple Developer Program membership | nothing | Built with the app | untested |
| Email and password sign-in (Supabase Auth REST) | Email and password sign up and sign in. | third-party | sign-in-with-apple, firebase-auth, supabase-auth-sdk, amplify-auth, appwrite-auth, passkeys | usage-based: Supabase has a free tier and paid plans; check current limits on its pricing page | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Built with placeholder keys; works after you add credentials | untested |
| MapKit map with places | Shows restaurants as markers on a map. | Apple-native | google-maps, mapbox, location-services | free: Apple frameworks only | nothing | Built with the app | untested |
| Location (when in use) | Sorts restaurants by distance from the user's current location. | Apple-native | mapkit-map | free: Apple frameworks only | nothing | Built with the app | untested |
| HTTP client (URLSession) | Loads restaurants and menus and submits orders. | Apple-native | rest-api-client | free: Apple frameworks only | nothing | Built with the app | untested |
| Your REST API | Points the app at the restaurant and order server once its address is supplied. | Apple-native | supabase-backend, firebase-firestore, cloudkit-database | usage-based: The client is free; hosting your API is billed by your provider | `API_BASE_URL` | Built with placeholder keys; works after you add credentials | untested |
| SwiftData local persistence | Keeps the cart and order history across relaunches. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| StoreKit 2 subscriptions and paywall | Closest module for StoreKit purchases at checkout (not a subscription; needs adapting). | Apple-native | revenuecat, storekit-one-time-purchase, superwall-paywalls, adapty | usage-based: Apple keeps a commission on digital sales; selling requires an Apple Developer Program membership and paid-apps agreement | nothing | Built with the app | untested |
| Live Activity | Shows delivery progress on the Lock Screen and Dynamic Island. | Apple-native | home-screen-widget, push-notifications | free: Apple frameworks only; server-driven updates need push notifications and a backend | nothing | Built with the app | untested |
| Local notifications and reminders | Alerts the user when the order status changes. | Apple-native | push-notifications, firebase-messaging, onesignal | free: Apple frameworks only | nothing | Built with the app | untested |
| Swift Charts dashboard | Spending stats and trends on the past orders dashboard. | Apple-native | dgcharts | free: Apple frameworks only | nothing | Built with the app | untested |
| Haptic feedback | Feedback on add to cart and successful payment. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Appearance setting (light, dark, system) | Light, dark or system appearance choice. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | Provides the app icon. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| Brand colors (asset catalog) | Brand colors with light and dark variants. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| Privacy manifest | Required privacy declarations before App Store submission. | Apple-native | keychain-storage | free: Apple requirement, no cost | nothing | Built with the app | untested |
| WebSocket realtime updates | Live order status updates from the server (no built module yet). | Apple-native | none | free: Apple frameworks only; your server is separate | `WEBSOCKET_URL` | Not built: no module yet | planned |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

| Capability | Item | Amount | Verified |
|---|---|---|---|
| sign-in-with-apple | Apple Developer Program membership (needed to distribute; not needed for simulator builds) | $99.00 per year | yes (2026-10-02) |
| storekit2-paywall | Apple Developer Program membership (needed to distribute; not needed for simulator builds) | $99.00 per year | yes (2026-10-02) |

Totals from priced items: $0.00 one-time, $0.00 per month, $198.00 per year.

Not included in the totals (usage-based or no confirmed price):

- email-password-auth: usage-based, Supabase has a free tier and paid plans; check current limits on its pricing page
- rest-api-client: usage-based, The client is free; hosting your API is billed by your provider

## Assumptions

- StoreKit 2 is used for checkout because it was requested; real food orders normally require Apple Pay or a card processor under App Store rules, so this should be reviewed before release.
- A server of your own supplies restaurants, menus and order status; sample data is used until its address is set.
- Live order status is simulated locally until a real-time server is connected.
- Sign in with Apple and email accounts are both available and the session is kept in the Keychain.
- Cart and order history are stored on the device only, with no iCloud sync.
- The Account screen is the fifth top-level tab; the splash, sign-in, menu and checkout screens are not tabs.
- Delivery is to a single saved address entered at checkout.
