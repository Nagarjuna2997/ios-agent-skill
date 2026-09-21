The async test returns before its assertion runs. Ensure completion is awaited and a wrong returned value fails.

Repair the tests while preserving production API and behavior. Tests must catch a broken implementation, pass correct behavior, and work in parallel. No network or sleeps. Use the provided injected seams.
