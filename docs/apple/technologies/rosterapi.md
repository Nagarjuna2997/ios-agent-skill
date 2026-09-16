# Roster API

## Context

Load this when a task names **Roster API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/rosterapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Read information about people and classes from an Apple School Manager organization.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Roster API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Roster API | 1.0.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Obtaining information about people and classes](https://developer.apple.com/documentation/rosterapi/obtaining-information-about-people-and-classes)
- [Validating with the Roster API test scope](https://developer.apple.com/documentation/rosterapi/validating-with-the-roster-api-test-scope)

### Authentication

- [Integrating with Roster API and Sign in with Apple](https://developer.apple.com/documentation/rosterapi/integrating-with-roster-api-and-sign-in-with-apple)

### Information about users

- [Read a user](https://developer.apple.com/documentation/rosterapi/returns-a-specific-user-in-an-apple-school-manager-organization)
- [User](https://developer.apple.com/documentation/rosterapi/user)
- [RoleLocation](https://developer.apple.com/documentation/rosterapi/rolelocation)
- [List users](https://developer.apple.com/documentation/rosterapi/returns-a-list-of-users-in-an-apple-school-manager-organization)
- [List users in a class](https://developer.apple.com/documentation/rosterapi/returns-a-users-for-an-apple-school-manager-class)
- [Users](https://developer.apple.com/documentation/rosterapi/users)

### Information about classes

- [Read a class](https://developer.apple.com/documentation/rosterapi/returns-a-specific-class-in-an-apple-school-manager-organization.)
- [Class](https://developer.apple.com/documentation/rosterapi/class)
- [List classes](https://developer.apple.com/documentation/rosterapi/returns-a-list-of-classes-for-an-apple-school-manager-organization)
- [Classes](https://developer.apple.com/documentation/rosterapi/classes)

### Information about locations

- [Read a location](https://developer.apple.com/documentation/rosterapi/returns-a-specific-location-in-an-apple-school-manager-organization)
- [Location](https://developer.apple.com/documentation/rosterapi/location)
- [List locations](https://developer.apple.com/documentation/rosterapi/returns-a-list-of-locations-for-an-apple-school-manager-organization)
- [Locations](https://developer.apple.com/documentation/rosterapi/locations)

### Information about the organization

- [Read the organization](https://developer.apple.com/documentation/rosterapi/returns-organization-infrmation)
- [Organization](https://developer.apple.com/documentation/rosterapi/organization)
- [Domain](https://developer.apple.com/documentation/rosterapi/domain)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
