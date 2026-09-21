Owner.run returns its current value while alive. Releasing the owner must deallocate it even after its callback is retained elsewhere.

Preserve the public API and documented behavior. Use offline synthetic inputs only. Do not weaken compiler checks, bypass isolation safety or remove functionality. Different correct implementations are welcome.
