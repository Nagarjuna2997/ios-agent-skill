import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lookupBuild, connectToken } from '../dist/release/testflight-status.js';

const identity={bundleId:'org.example.test',version:'2.0',build:'48'};
const app={type:'apps',id:'123',attributes:{bundleId:identity.bundleId}};
const version={type:'preReleaseVersions',id:'v',attributes:{version:'2.0',platform:'IOS'}};
const beta={type:'buildBetaDetails',id:'b',attributes:{internalBuildState:'READY_FOR_BETA_TESTING',externalBuildState:'WAITING_FOR_BETA_REVIEW'}};
const relation=({type,id})=>({data:{type,id}});
const build={type:'builds',id:'444',attributes:{version:'48',expired:false,processingState:'VALID'},relationships:{app:relation(app),preReleaseVersion:relation(version),buildBetaDetail:relation(beta)}};
const builds={data:[build],included:[version,beta]};
function get(result=builds,apps={data:[app]}){
  return lookupBuild(identity,()=>'fake', async(url,options)=>{
    assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(url.origin,'https://api.appstoreconnect.apple.com');
    const q=url.searchParams;
    if(url.pathname==='/v1/apps'){assert.equal(q.get('filter[bundleId]'),identity.bundleId);return Response.json(apps);}
    assert.equal(url.pathname,'/v1/builds');assert.equal(q.get('filter[app]'),app.id);assert.equal(q.get('filter[version]'),identity.build);
    assert.equal(q.get('filter[preReleaseVersion.version]'),identity.version);assert.equal(q.get('filter[preReleaseVersion.platform]'),'IOS');
    return Response.json(result);
  });
}
test('correlates the exact build and distinguishes internal and external testing',async()=>{
  const r=await get();assert.equal(r.buildId,'444');assert.equal(r.status,'READY_FOR_INTERNAL_TESTING');assert.equal(r.externalBuildState,'WAITING_FOR_BETA_REVIEW');
});
test('absent, ambiguous and mismatched ASC responses never establish readiness',async()=>{
  assert.equal((await get({data:[]})).status,'NOT_VISIBLE');
  for(const result of [{...builds,links:{next:'https://other.test'}},{...builds,data:[build,build]},
    {...builds,included:[{...version,attributes:{version:'2.1',platform:'IOS'}},beta]}, {...builds,included:[version]},
    {...builds,data:[{...build,attributes:{...build.attributes,version:'47'}}]}]) assert.equal((await get(result)).status,'UNKNOWN');
  assert.equal((await lookupBuild(identity,()=>'fake',async()=>new Response(null,{status:403}))).status,'UNKNOWN');
});
test('reports terminal processing, expiry and export compliance independently',async()=>{
  for(const [processingState,expired,status] of [['INVALID',false,'INVALID'],['FAILED',false,'INVALID'],['PROCESSING',false,'PROCESSING'],['VALID',true,'EXPIRED']]){
    assert.equal((await get({...builds,data:[{...build,attributes:{...build.attributes,processingState,expired}}]})).status,status);
  }
  assert.equal((await get({...builds,included:[version,{...beta,attributes:{internalBuildState:'MISSING_EXPORT_COMPLIANCE'}}]})).status,'EXPORT_COMPLIANCE');
});
test('ASC token signature, expiration and read-only scopes',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'asc-status-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const {publicKey,privateKey}=generateKeyPairSync('ec',{namedCurve:'P-256'});
  const path=join(dir,'private.p8');await writeFile(path,privateKey.export({format:'pem',type:'pkcs8'}));
  const env={ASC_KEY_PATH:path,ASC_KEY_ID:'K',ASC_ISSUER_ID:'I'};
  const requests=[];
  const result=await lookupBuild(identity,url=>connectToken(env,url),async(url,options)=>{
    const [header,payload,sig]=options.headers.Authorization.slice('Bearer '.length).split('.');
    assert.ok(verify('sha256',Buffer.from(header+'.'+payload),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(sig,'base64url')));
    const claims=JSON.parse(Buffer.from(payload,'base64url'));
    assert.equal(claims.exp-claims.iat,300);
    assert.deepEqual(claims.scope,[`GET ${url.pathname}${url.search}`]);
    requests.push(claims.scope[0]);
    return Response.json(url.pathname==='/v1/apps'?{data:[app]}:builds);
  });
  assert.equal(result.status,'READY_FOR_INTERNAL_TESTING');
  assert.equal(requests.length,2);
  assert.notEqual(requests[0],requests[1]);
  for(const url of ['https://example.com/v1/apps?limit=1','https://api.appstoreconnect.apple.com/v1/apps',
                    'https://api.appstoreconnect.apple.com/v1/apps?limit=1','https://api.appstoreconnect.apple.com/v1/builds?filter[app]=123',
                    'https://api.appstoreconnect.apple.com/v1/users?limit=1']) {
    await assert.rejects(connectToken(env,new URL(url)),/scoped token/);
  }
});
test('failure to sign a particular request reports unknown without sending that request',async()=>{
  let calls=0;
  const result=await lookupBuild(identity,url=>{
    if(url.pathname==='/v1/builds')throw Error('sensitive key error');
    return 'first-token';
  },async()=>{calls++;return Response.json({data:[app]});});
  assert.equal(calls,1);assert.equal(result.status,'UNKNOWN');assert.match(result.reason,/credentials unavailable/);
  assert.doesNotMatch(JSON.stringify(result),/sensitive key error|first-token/);
});
