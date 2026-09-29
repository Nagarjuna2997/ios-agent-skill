import {parseArgs} from 'node:util';
import {boundedFile} from './input.js';
import {templates,profiles} from './catalog.js';
import {generateSet,inspectSet,previewSet,exportSet,localizeSet,recipeSchema} from './studio.js';
export async function screenshotCLI(args:string[]){
 const {values,positionals}=parseArgs({args,allowPositionals:true,strict:true,options:{config:{type:'string'},input:{type:'string'},output:{type:'string'},set:{type:'string'},template:{type:'string'},locale:{type:'string'},copy:{type:'string'},profile:{type:'string'}}});
 if(positionals.length!==1)throw Error('Usage: screenshots list|generate|variants|preview|inspect|export|localize [--config recipe.json] [--input DIR --output NEW_DIR]');
 const command=positionals[0];let result:unknown;
 if(command==='list')result={templates,profiles};
 else if(command==='generate'||command==='variants'){
  const supplied=values.config?JSON.parse((await boundedFile(values.config,256*1024)).toString()):{};
  const recipe=recipeSchema.parse({...supplied,...(values.input?{inputDirectory:values.input}:{}),...(values.output?{outputDirectory:values.output}:{}),...(values.template?{templates:values.template.split(',')}:{}),...(values.locale?{locale:values.locale}:{}),...(values.profile?{profile:values.profile}:{})});
  if(command==='variants'&&recipe.templates.length<2)throw Error('Supply multiple templates with --template minimal,dark-premium,gradient.');result=await generateSet(recipe);
 }else{
  if(!values.set)throw Error('--set DIR is required.');
  if(command==='inspect')result=await inspectSet(values.set);
  else if(command==='preview')result=await previewSet(values.set);
  else if(command==='export'){if(!values.output)throw Error('--output NEW_DIR is required.');result=await exportSet(values.set,values.output);}
  else if(command==='localize'){if(!values.output||!values.copy||!values.locale)throw Error('Supply --output NEW_DIR --copy translated.json --locale LOCALE.');result=await localizeSet(values.set,values.locale,JSON.parse((await boundedFile(values.copy,256*1024)).toString()),values.output);}
  else throw Error('Unknown Screenshot Studio command.');
 }
 console.log(JSON.stringify(result,null,2));if(result&&typeof result==='object'&&'passed' in result&&result.passed===false)process.exitCode=1;
}
