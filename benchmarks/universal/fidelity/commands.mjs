// Only local benchmark setup commands use this recorder. Never pass credentials.
export async function runSetupCommand(runner,command,args,record){
 const timeoutMs=command==='xcrun'&&args[0]==='simctl'&&args[1]==='bootstatus'?300000:120000;
 const result=await runner.run(command,args,{timeoutMs});
 const evidence={command,args,timeoutMs,exitCode:result.exitCode,timedOut:result.timedOut,durationMs:result.durationMs,spawnError:result.spawnError??null,stdout:result.stdout.slice(-8000),stderr:result.stderr.slice(-8000)};
 await record(evidence);
 if(result.timedOut||result.spawnError||result.exitCode!==0)throw Object.assign(new Error(`Setup command failed: ${JSON.stringify(evidence)}`),{setupEvidence:evidence});
 return result.stdout.trim();
}

export function classifyRunFailure(phase,message,interruptAfter,code){
 if(interruptAfter && message===`Injected interruption after ${interruptAfter}`)return 'interrupted';
 if(code==='FIDELITY_SIMULATOR_DISCOVERY')return 'infrastructure_failure';
 return phase==='environment-setup'||phase==='simulator-setup'?'infrastructure_failure':'verification_failure';
}

// Preserve runner options and results; record only the credential-free discovery command.
export function withSimulatorDiscoveryEvidence(runner,record){
 return {async run(command,args,options){
  const result=await runner.run(command,args,options);
  if(command==='xcrun'&&JSON.stringify(args)===JSON.stringify(['simctl','list','devices','available','--json'])){
   await record({command,args,exitCode:result.exitCode,timedOut:result.timedOut,durationMs:result.durationMs,spawnError:result.spawnError??null,stdout:result.stdout.slice(-8000),stderr:result.stderr.slice(-8000)});
   if(result.exitCode!==0||result.timedOut||result.spawnError){
    const error=new Error('Simulator discovery failed; see simulator-discovery.jsonl');
    error.code='FIDELITY_SIMULATOR_DISCOVERY';throw error;
   }
  }
  return result;
 }};
}

export function candidateFailureEvidence(error){
 return {phase:'verification',category:classifyRunFailure('app-verification',error.message,null,error.code),message:String(error.message).slice(0,2000)};
}

// A cold simulator can still be migrating when the first bounded wait expires.
// Wait once more on the SAME owned device; never retry app builds or assertions.
export async function waitForSimulator(command,udid,recordRecovery){
 const args=['simctl','bootstatus',udid,'-b'];
 try{return await command('xcrun',args);}
 catch(error){
  const e=error.setupEvidence;
  if(!e?.timedOut||e.spawnError||e.command!=='xcrun'||JSON.stringify(e.args)!==JSON.stringify(args))throw error;
  await recordRecovery({kind:'simulator-boot-wait',reason:'initial-bootstatus-timeout',simulator:udid,attempt:2,maxAttempts:2});
  return await command('xcrun',args);
 }
}
