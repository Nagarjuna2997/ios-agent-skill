import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateSet,localizeSet} from '../mcp-server/dist/screenshots/studio.js';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const output=process.argv[2];if(!output)throw Error('Supply a NEW local output root.');await mkdir(resolve(output));
const recipe=JSON.parse(await readFile('samples/ScreenshotStudio/recipe.json'));
const english=await generateSet({...recipe,outputDirectory:join(resolve(output),'english')});
const spanish=await localizeSet(english.outputDirectory,'es-ES',JSON.parse(await readFile('samples/ScreenshotStudio/es-ES.json')),join(resolve(output),'spanish'));
for(const r of [english,spanish])if(!r.validation.passed||r.count!==15)throw Error(JSON.stringify(r));
const records=[];for(const r of [english,spanish]){const m=JSON.parse(await readFile(r.manifest));records.push({locale:m.recipe.locale,renderer:m.renderer,profileSource:m.profileSource,entries:m.entries,validation:r.validation});}
await writeFile(join(resolve(output),'evidence.json'),JSON.stringify({generatedAt:new Date().toISOString(),sample:'ReadingList repository simulator captures; supplied English and Spanish copy',sets:records},null,2)+'\n');
console.log(JSON.stringify({images:30,english,spanish},null,2));
