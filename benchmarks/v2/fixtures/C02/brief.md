Transfer independently owned integer payloads to an accumulator safely under Swift 6. Concurrent inputs 1...n must sum correctly; do not mark mutable shared objects unchecked Sendable.

Preserve the public API and documented behavior. Use offline synthetic inputs only. Do not weaken compiler checks, bypass isolation safety or remove functionality. Different correct implementations are welcome.
