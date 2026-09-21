A failed cache write must retain the previous complete file and remove temporary files. Use the injected writer; it can write a prefix and then fail. Successful writes replace the data.

Preserve the public API and documented behavior. Use offline synthetic inputs only. Do not weaken compiler checks, bypass isolation safety or remove functionality. Different correct implementations are welcome.
