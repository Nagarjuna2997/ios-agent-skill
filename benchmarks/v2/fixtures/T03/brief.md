Replace clock-dependent coverage with deterministic injected time. Expiry is false before the deadline, true exactly at it and afterward.

Repair the tests while preserving production API and behavior. Tests must catch a broken implementation, pass correct behavior, and work in parallel. No network or sleeps. Use the provided injected seams.
