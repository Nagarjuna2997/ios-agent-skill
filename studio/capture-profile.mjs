// Temporary, verified simulator settings. Never treats pixels as a fidelity pass.
export const captureProfiles = Object.freeze({
 'light-large':{appearance:'light',contentSize:'large'},
 'dark-large':{appearance:'dark',contentSize:'large'},
 'light-xxxl':{appearance:'light',contentSize:'extra-extra-extra-large'},
 'dark-xxxl':{appearance:'dark',contentSize:'extra-extra-extra-large'},
});
const sizes=new Set(['extra-small','small','medium','large','extra-large','extra-extra-large','extra-extra-extra-large','accessibility-medium','accessibility-large','accessibility-extra-large','accessibility-extra-extra-large','accessibility-extra-extra-extra-large']);
export async function withCaptureProfile({runner,cleanupRunner=runner,udid,profile,record=async()=>{}},action){
 const requested=typeof profile==='string'&&Object.hasOwn(captureProfiles,profile)?captureProfiles[profile]:null;if(!requested)throw Error('Unknown capture profile');
 const command=async(r,key,value)=>{const result=await r.run('xcrun',['simctl','ui',udid,key,...(value?[value]:[])],{timeoutMs:30000});if(result.exitCode!==0||result.timedOut||result.spawnError)throw Error('Simulator setting failed: '+key);return result.stdout.trim();};
 const read=async r=>({appearance:await command(r,'appearance'),contentSize:await command(r,'content_size')});
 const original=await read(runner);
 if(!['light','dark'].includes(original.appearance)||!sizes.has(original.contentSize))throw Error('Cannot safely restore unknown simulator settings');
 const evidence={profile,requested:{...requested},original,applied:false,restored:false};
 let value,failure;const restoreErrors=[];
 try{
  await command(runner,'appearance',requested.appearance);await command(runner,'content_size',requested.contentSize);
  const actual=await read(runner);if(actual.appearance!==requested.appearance||actual.contentSize!==requested.contentSize)throw Error('Simulator capture settings did not take effect');
  evidence.applied=true;await record({...evidence});value=await action();
 }catch(error){failure=error;}
 finally{
  for(const [key,val] of [['appearance',original.appearance],['content_size',original.contentSize]])try{await command(cleanupRunner,key,val);}catch(error){restoreErrors.push(error);}
  try{const actual=await read(cleanupRunner);if(actual.appearance!==original.appearance||actual.contentSize!==original.contentSize)throw Error('Simulator restoration did not take effect');}catch(error){restoreErrors.push(error);}
  evidence.restored=restoreErrors.length===0;await record({...evidence});
 }
 if(restoreErrors.length)throw new AggregateError([...(failure?[failure]:[]),...restoreErrors],'Simulator settings restoration failed'+(failure?'; capture also failed':''));
 if(failure)throw failure;return value;
}
