import test from 'node:test';
import assert from 'node:assert/strict';
import {PreviewSessions} from '../dist/previews.js';

test('simultaneous starts share one owned viewer and stop waits for startup',async()=>{
  let starts=0,closes=0,release;
  const gate=new Promise(resolve=>release=resolve);
  const sessions=new PreviewSessions(async()=>{starts++;await gate;return {url:'local',close:async()=>{closes++;}};});
  const first=sessions.start('device'),second=sessions.start('device');
  const stop=sessions.stop('device');
  release();
  assert.equal(await first,await second);await stop;
  assert.equal(starts,1);assert.equal(closes,1);
  await sessions.shutdown();assert.equal(closes,1);
});
test('concurrent capacity is bounded and shutdown closes pending viewer',async()=>{
  let closes=0;
  const sessions=new PreviewSessions(async id=>({url:id,close:async()=>{closes++;}}));
  const results=await Promise.allSettled(['a','b','c','d'].map(id=>sessions.start(id)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,3);
  await sessions.shutdown();assert.equal(closes,3);
  await assert.rejects(()=>sessions.start('e'),/shutting down/);
});
test('shutdown during startup cannot orphan its listener',async()=>{
  let release,started,closes=0;
  const entered=new Promise(resolve=>started=resolve);
  const gate=new Promise(resolve=>release=resolve);
  const sessions=new PreviewSessions(async()=>{started();await gate;return {url:'local',close:async()=>{closes++;}};});
  const opening=sessions.start('device');await entered;
  const closing=sessions.shutdown();release();await opening;await closing;
  assert.equal(closes,1);
});
