import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ProviderFailure,type Adapter} from './providers.js';
export const appleSource=`import Foundation
import FoundationModels
@main struct LocalModel {
 static func main() async {
  guard #available(macOS 26.0, *) else { print("unavailable"); return }
  let model = SystemLanguageModel.default
  guard model.isAvailable else { print("unavailable"); return }
  if CommandLine.arguments.contains("--check") { print("available"); return }
  let input = FileHandle.standardInput.readDataToEndOfFile()
  guard let prompt = String(data: input, encoding: .utf8) else { print("invalid-input"); return }
  do { let result = try await LanguageModelSession(model: model).respond(to: prompt); print(result.content) }
  catch { print("generation-failed"); exit(1) }
 }
}`;
export function appleAdapter():Adapter {
 async function run(check:boolean,prompt='',signal?:AbortSignal){
  if(process.platform!=='darwin')throw new ProviderFailure('provider-switchable','apple-requires-macos');
  const dir=await mkdtemp(join(tmpdir(),'ios-agent-local-model-'));const source=join(dir,'main.swift');const binary=join(dir,'model');
  const execute=(cmd:string,args:string[],input='')=>new Promise<string>((resolve,reject)=>{
   const child=spawn(cmd,args,{stdio:['pipe','pipe','pipe'],signal});let output='';let size=0;let excessive=false;
   const timer=setTimeout(()=>child.kill('SIGKILL'),90000);
   child.stdout.on('data',chunk=>{size+=chunk.length;if(size>1_000_000){excessive=true;child.kill('SIGKILL');}else output+=chunk;});child.stderr.on('data',()=>{});
   child.on('error',()=>{clearTimeout(timer);reject(new ProviderFailure('provider-switchable','apple-toolchain-unavailable'));});
   child.on('close',code=>{clearTimeout(timer);if(code!==0||excessive)reject(new ProviderFailure('provider-switchable','apple-model-unavailable'));else resolve(output.trim());});child.stdin.on('error',()=>{});child.stdin.end(input);
  });
  try{await writeFile(source,appleSource,{mode:0o600});await execute('/usr/bin/xcrun',['swiftc','-parse-as-library',source,'-o',binary]);return await execute(binary,check?['--check']:[],prompt);}finally{await rm(dir,{recursive:true,force:true});}
 }
 return {provider:'apple',async list(signal){if(await run(true,'',signal)!=='available')throw new ProviderFailure('provider-switchable','apple-model-unavailable');return ['system-default'];},async generate(model,prompt,signal){const text=await run(false,prompt,signal);if(text==='unavailable')throw new ProviderFailure('provider-switchable','apple-model-unavailable');return {provider:'apple',model,text,usage:null};}};
}
