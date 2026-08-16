#!/usr/bin/env node
import { run } from "./commands.js";

process.exitCode = run(process.argv.slice(2));
