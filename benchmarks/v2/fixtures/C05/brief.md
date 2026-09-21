A cancelled worker must clean up and never commit after cancellation. A normal run commits once and also cleans up. The injected gate controls completion without timing assumptions.

Preserve the public API and documented behavior. Use offline synthetic inputs only. Do not weaken compiler checks, bypass isolation safety or remove functionality. Different correct implementations are welcome.
