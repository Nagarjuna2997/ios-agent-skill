# Apple Documentation Coverage Status

## Context

Load this when asked what is covered, what remains, or whether the repository includes every Apple technology.

## Verified directory coverage

Snapshot date: **2026-09-10**.

- **405/405 unique technology entries** from Apple’s live technology directory, from Accelerate through XPC.
- **400 Apple-hosted DocC landing pages** retrieved successfully.
- **5 external resources** linked by Apple checked successfully at their actual destinations.
- **83 entries reuse existing authored guides**, preserving those implementations.
- **322 dedicated technology reference pages** added for the other entries.
- **11,500 API/topic links** extracted from the landing-page topic groups.
- One canonical record per technology URL; repeated category appearances are merged.

Read [All Apple Technologies](all-technologies.md) for the full list. The canonical snapshot is `docs/apple/technologies.json`. The offline validator checks uniqueness, source counts, guide routes, and generated content. The refresh command reads the current directory and technology landing pages; it stops if a source cannot be retrieved.

## Coverage levels

| Layer | Status |
|---|---|
| Every technology in the checked live directory | Cataloged and routed to a local guide |
| Landing-page metadata and topic links | Recorded for all 400 Apple-hosted entries |
| External resources in the directory | Canonical destination checked for all 5 entries |
| Existing app-development implementations | Preserved; their separate curated catalog is `frameworks.json` |
| Every linked symbol/article fetched or copied | Not claimed |
| Compiled integration/sample for every technology | Not claimed |
| Hardware, entitlements, signing, and runtime validation for every technology | Project-specific; not established by this catalog |

The previous 99/99 selected-framework metric describes the curated app-development subset. It must not be used as the full-directory count. The directory includes frameworks, services, developer tools, release notes, design resources, and legacy technologies, not only importable iOS modules.

## Maintenance

```bash
python3 scripts/sync-apple-technologies.py --check
python3 scripts/sync-apple-technologies.py --refresh
```

After a refresh, review the diff and update dated narrative counts when the directory changes. Follow [the implementation workflow](technology-workflow.md) when using a technology in an application.
