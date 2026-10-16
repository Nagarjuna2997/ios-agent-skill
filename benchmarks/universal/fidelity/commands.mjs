// Only local benchmark setup commands use this recorder. Never pass credentials.
export async function runSetupCommand(runner,command,args,record){
 const result=await runner.run(command,args,{timeoutMs:120000});
 const evidence={command,args,exitCode:result.exitCode,timedOut:result.timedOut,durationMs:result.durationMs,spawnError:result.spawnError??null,stdout:result.stdout.slice(-8000),stderr:result.stderr.slice(-8000)};
 await record(evidence);
 if(result.timedOut||result.spawnError||result.exitCode!==0)throw Error(`Setup command failed: ${JSON.stringify(evidence)}`);
 return result.stdout.trim();
}

export function classifyRunFailure(phase,message,interruptAfter){
 if(interruptAfter && message===`Injected interruption after ${interruptAfter}`)return 'interrupted';
 return phase==='environment-setup'||phase==='simulator-setup'?'infrastructure_failure':'verification_failure';
}
