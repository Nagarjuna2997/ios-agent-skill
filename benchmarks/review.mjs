// Standalone benchmark scorer; uses shipped analyzers, not the draft review CLI.
import { readSwiftFiles, readProjectContext, resolveProjectRoot } from '../mcp-server/dist/scan.js';
import { analyzeConcurrency } from '../mcp-server/dist/analyzers/concurrency.js';
import { analyzeArchitecture } from '../mcp-server/dist/analyzers/architecture.js';
import { analyzeSwiftUI } from '../mcp-server/dist/analyzers/swiftui.js';
import { analyzeAvailability } from '../mcp-server/dist/analyzers/availability.js';
import { analyzeMemory } from '../mcp-server/dist/analyzers/memory.js';
import { analyzeSecurity } from '../mcp-server/dist/analyzers/security.js';
import { analyzePerformance } from '../mcp-server/dist/analyzers/performance.js';
import { analyzeTesting, analyzeTestCoverage } from '../mcp-server/dist/analyzers/testing.js';
import { analyzeAppStore, analyzeProjectLevelAppStore } from '../mcp-server/dist/analyzers/appstore.js';
import { analyzeAppIntents } from '../mcp-server/dist/analyzers/app-intents.js';
const root = await resolveProjectRoot(process.argv[2]);
const files=await readSwiftFiles(root), context=await readProjectContext(root);
const findings=[...files.flatMap(f=>[...analyzeConcurrency(f),...analyzeArchitecture(f),...analyzeSwiftUI(f),...analyzeAvailability(f),...analyzeMemory(f),...analyzeSecurity(f),...analyzePerformance(f),...analyzeTesting(f),...analyzeAppStore(f,context)]),...analyzeAppIntents(files),...analyzeTestCoverage(files),...analyzeProjectLevelAppStore(context)];
console.log(JSON.stringify({findings}));
