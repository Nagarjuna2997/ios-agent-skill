Parallel tests share a mutable counter and depend on execution order. Give every test isolated state and check the full increment sequence.

Repair the tests while preserving production API and behavior. Tests must catch a broken implementation, pass correct behavior, and work in parallel. No network or sleeps. Use the provided injected seams.
