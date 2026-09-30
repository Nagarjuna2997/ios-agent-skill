#!/usr/bin/env node
import { run } from "./commands.js";

if (process.argv[2] === 'docs') {
  // The unified package owns the documentation backend; never fetch/install implicitly.
  const {spawn} = await import('node:child_process');
  const child = spawn('ios-agent-mcp', process.argv.slice(2), {stdio:'inherit'});
  child.on('error', () => {console.error('Install ios-agent-mcp to use docs commands.');process.exitCode=1;});
  child.on('exit', code => {process.exitCode=code ?? 1;});
} else process.exitCode = run(process.argv.slice(2));
