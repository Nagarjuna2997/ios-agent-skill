import {reconcileFiles} from './reconcile.js';
import { importSvelte } from './svelte.js';
import { importVue } from './vue.js';
import { importReact } from './react.js';
import { resolve } from 'node:path';
import { AppIRSchema, sha256 } from './schema.js';
import { importHTML, readBoundedFile } from './html.js';
import { generateProject } from './swiftui.js';
export async function appIRCLI(args: string[]): Promise<number> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('ios-agent-mcp app-ir reconcile BASE_SWIFT LOCAL_SWIFT GENERATED_SWIFT NEW_REVIEW_DIRECTORY\nios-agent-mcp app-ir inspect-svelte SVELTE_FILE [AppName]\nios-agent-mcp app-ir inspect-vue VUE_FILE [AppName]\nios-agent-mcp app-ir inspect-react TSX_FILE [AppName]\nios-agent-mcp app-ir inspect HTML_FILE [AppName]\nios-agent-mcp app-ir validate IR_JSON\nios-agent-mcp app-ir generate IR_JSON NEW_DIRECTORY\nExperimental local HTML inline-style, Vue static-template SFC, Svelte static markup and bounded local React TSX module subsets. Vue scripts, stylesheets, directives and interpolation are unsupported. React supports bounded literal props/expressions, same-file or explicitly imported local components, boolean state/button actions, controlled single-line text inputs with literal clear/reset actions, direct state/setter props and explicit flat MemoryRouter routes. Erased interfaces, type aliases, declaration-level import type, matching primitive hook annotations and input event annotations are accepted without typechecking. Other imports, hooks and dynamic behavior are rejected. inspect prints IR; generate rejects unsupported markup and existing destinations. No scripts, downloads, builds or publication are run by import.'); return 0;
  }
  if(args[0]==='reconcile'){
    if(args.length!==5)throw Error('Use app-ir reconcile BASE_SWIFT LOCAL_SWIFT GENERATED_SWIFT NEW_REVIEW_DIRECTORY');
    const report=await reconcileFiles(args[1]!,args[2]!,args[3]!,args[4]!);console.log(JSON.stringify(report,null,2));return report.outcome==='conflict'?2:0;
  }
  const [command,file,extra] = args;
  if (!file || args.length > 3 || !['inspect','inspect-react','inspect-vue','inspect-svelte','validate','generate'].includes(command ?? '') || (command === 'validate' && extra)) throw Error('Use app-ir --help');
  if (command === 'inspect-svelte') { console.log(JSON.stringify(await importSvelte(resolve(file),extra),null,2)); return 0; }
  if (command === 'inspect-vue') { console.log(JSON.stringify(await importVue(resolve(file),extra),null,2)); return 0; }
  if (command === 'inspect-react') { console.log(JSON.stringify(await importReact(resolve(file),extra),null,2)); return 0; }
  if (command === 'inspect') { console.log(JSON.stringify(await importHTML(resolve(file),extra),null,2)); return 0; }
  const ir = AppIRSchema.parse(JSON.parse((await readBoundedFile(resolve(file))).toString('utf8')));
  if (command === 'validate') { console.log(JSON.stringify({valid:true,schemaVersion:ir.schemaVersion,sha256:sha256(JSON.stringify(ir)),limitations:ir.limitations.length})); return 0; }
  if (!extra) throw Error('Provide a new output directory');
  console.log(JSON.stringify(await generateProject(ir,extra),null,2)); return 0;
}
