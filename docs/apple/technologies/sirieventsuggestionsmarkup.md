# Siri Event Suggestions Markup

## Context

Load this when a task names **Siri Event Suggestions Markup** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Update users’ calendars and inform suggestions from Siri with reservation data embedded in email and webpages.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Siri Event Suggestions Markup`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Siri Event Suggestions Markup | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Providing Trusted Data](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/providing-trusted-data)
- [Checking Your Reservation Markup](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/checking-your-reservation-markup)

### Transportation

- [FlightReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/flightreservation)
- [TrainReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/trainreservation)
- [BusReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/busreservation)
- [BoatReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/boatreservation)
- [RentalCarReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/rentalcarreservation)

### Food, Lodging, and Events

- [EventReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/eventreservation)
- [FoodEstablishmentReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/foodestablishmentreservation)
- [LodgingReservation](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/lodgingreservation)

### Common Reservation Data

- [Person](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/person)
- [Ticket](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/ticket)
- [Seat](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/seat)
- [Organization](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/organization)
- [Place](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/place)
- [PostalAddress](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/postaladdress)

### Basic Data Types

- [@context](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/@context)
- [dateTimeISO8601](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/datetimeiso8601)
- [reservationId](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/reservationid)
- [reservationStatus](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/reservationstatus)
- [URL](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/url)
- [telephone](https://developer.apple.com/documentation/sirieventsuggestionsmarkup/telephone)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
