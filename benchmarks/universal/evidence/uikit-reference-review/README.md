# Local reference approval and strict re-evaluation

The user explicitly approved the recorded iPhone 18 Pro / iOS 27 light-mode reference in this conversation. approval.json binds that approval to the exact existing reference and environment hashes. It does not approve a hosted reference or authorize baseline promotion, production integration, merge or publication.

Re-evaluating the unchanged saved local baseline and candidate with this approval still returns requires-review: the original baseline does not qualify as known-good because its typography fails. No checks were weakened; knownGood remains null. evaluation.json hashes the original report and records the decision. This is a re-evaluation, not another native run.
