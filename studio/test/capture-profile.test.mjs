import {test} from 'node:test';import assert from 'node:assert/strict';
import {withCaptureProfile} from '../capture-profile.mjs';
function fake(){const state={appearance:'dark',content_size:'accessibility-large'},calls=[];return {state,calls,runner:{async run(c,a){const key=a[3],value=a[4];calls.push([...a]);if(value)state[key]=value;return {exitCode:0,stdout:value?'':state[key],stderr:''};}}};}
test('capture profile verifies requested settings and restores original settings',async()=>{
 const f=fake(),records=[];const value=await withCaptureProfile({runner:f.runner,udid:'owned',profile:'light-xxxl',record:async r=>records.push(r)},async()=>{assert.deepEqual(f.state,{appearance:'light',content_size:'extra-extra-extra-large'});return 'captured';});
 assert.equal(value,'captured');assert.deepEqual(f.state,{appearance:'dark',content_size:'accessibility-large'});assert.equal(records.at(-1).restored,true);
});
test('capture failure still restores and remains a failure',async()=>{
 const f=fake();await assert.rejects(withCaptureProfile({runner:f.runner,udid:'owned',profile:'light-large'},async()=>{throw Error('capture failure');}),/capture failure/);assert.equal(f.state.appearance,'dark');
});
test('unknown original settings are never changed',async()=>{
 const f=fake();f.state.appearance='unknown';await assert.rejects(withCaptureProfile({runner:f.runner,udid:'owned',profile:'light-large'},async()=>assert.fail()),/Cannot safely restore/);assert.ok(f.calls.every(a=>a.length===4));
});
test('cleanup uses independent runner after cancellation and restoration failure cannot pass',async()=>{
 const f=fake();let aborted=false;const runner={run:(...a)=>{if(aborted)throw Error('aborted');return f.runner.run(...a);}};
 await assert.rejects(withCaptureProfile({runner,cleanupRunner:f.runner,udid:'owned',profile:'light-large'},async()=>{aborted=true;throw Error('cancelled');}),/cancelled/);assert.equal(f.state.appearance,'dark');
 const g=fake();await assert.rejects(withCaptureProfile({runner:g.runner,cleanupRunner:{run:async()=>{throw Error('restore error');}},udid:'owned',profile:'light-large'},async()=>42),/restoration failed/);
});
test('prototype keys and non-string profiles are refused before commands',async()=>{
 for(const profile of ['__proto__','constructor',['light-large'],null]){const f=fake();await assert.rejects(withCaptureProfile({runner:f.runner,udid:'owned',profile},async()=>assert.fail()),/Unknown capture profile/);assert.equal(f.calls.length,0);}
});
