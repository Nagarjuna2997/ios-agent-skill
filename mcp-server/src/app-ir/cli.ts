import { resolve } from 'node:path';
import { AppIRSchema, sha256 } from './schema.js';
import { importHTML, readBoundedFile } from './html.js';
import { generateProject } from './swiftui.js';
export async function appIRCLI(args: string[]): Promise<number> {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('ios-agent-mcp app-ir inspect HTML_FILE [AppName]\nios-agent-mcp app-ir validate IR_JSON\nios-agent-mcp app-ir generate IR_JSON NEW_DIRECTORY\nExperimental local HTML inline-style subset. inspect prints IR; generate rejects unsupported markup and existing destinations. No scripts, downloads, builds or publication are run by import.'); return 0;
  }
  const [command,file,extra] = args;
  if (!file || args.length > 3 || !['inspect','validate','generate'].includes(command ?? '') || (command === 'validate' && extra)) throw Error('Use app-ir --help');
  if (command === 'inspect') { console.log(JSON.stringify(await importHTML(resolve(file),extra),null,2)); return 0; }
  const ir = AppIRSchema.parse(JSON.parse((await readBoundedFile(resolve(file))).toString('utf8')));
  if (command === 'validate') { console.log(JSON.stringify({valid:true,schemaVersion:ir.schemaVersion,sha256:sha256(JSON.stringify(ir)),limitations:ir.limitations.length})); return 0; }
  if (!extra) throw Error('Provide a new output directory');
  console.log(JSON.stringify(await generateProject(ir,extra),null,2)); return 0;
}
