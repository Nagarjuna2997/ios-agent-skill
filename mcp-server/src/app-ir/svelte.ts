// Static Svelte markup only. No compilation, scripts, runes or package loading.
import {basename} from 'node:path';
import {htmlToIR,readBoundedFile} from './html.js';
import {parseStaticMarkup} from './static-markup.js';
import {AppIRSchema,type AppIR} from './schema.js';
export async function importSvelte(file:string,name='ImportedApp'):Promise<AppIR>{
  return svelteToIR(new TextDecoder('utf-8',{fatal:true}).decode(await readBoundedFile(file)),basename(file),name);
}
export function svelteToIR(source:string,sourcePath='App.svelte',name='ImportedApp'):AppIR{
  // Braces introduce Svelte expressions/blocks, including inside attributes.
  // Literal braces can be encoded as HTML entities. No expression is guessed.
  if(/[{}]/.test(source))throw Error('Svelte expressions and blocks require an explicit mapping');
  parseStaticMarkup(source);
  const ir=htmlToIR(source,sourcePath,name);ir.sources[0]!.adapter='svelte-static@1';
  return AppIRSchema.parse(ir);
}
