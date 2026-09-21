The async test launches work without awaiting or checking its result. Its assertion only checks a constant. Ensure completion is awaited and a wrong returned value fails.

Repair the tests while preserving production API and behavior. Tests must catch a broken implementation, pass correct behavior, and work in parallel. No network or sleeps. Use the provided injected seams.
