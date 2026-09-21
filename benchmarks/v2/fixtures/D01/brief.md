Migrate the disk-backed V1 notebook store to V2, renaming Note.title to name without losing the existing notes, notebook or relationship. Do not delete/recreate stores or use an in-memory substitute.

Preserve the public API and documented behavior. Use offline synthetic inputs only. Do not weaken compiler checks, bypass isolation safety or remove functionality. Different correct implementations are welcome.
