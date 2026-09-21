Parameterized page-count tests omit boundary values. Ten items fit a page; zero or negative item counts have zero pages. Cover boundaries independently of implementation.

Repair the tests while preserving production API and behavior. Tests must catch a broken implementation, pass correct behavior, and work in parallel. No network or sleeps. Use the provided injected seams.
