import { createPrivateKey, sign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';

export interface BuildIdentity { bundleId: string; version: string; build: string }
const resource = z.object({type:z.string(),id:z.string().min(1),attributes:z.record(z.unknown()).optional(),
  relationships:z.record(z.object({data:z.object({type:z.string(),id:z.string()}).nullable().optional()})).optional()});
const page = z.object({data:z.array(resource),included:z.array(resource).optional(),links:z.object({next:z.string().nullish()}).optional()});

const apiOrigin = 'https://api.appstoreconnect.apple.com';
export type StatusToken = (request: URL) => string | Promise<string>;

export async function connectToken(env: NodeJS.ProcessEnv, request: URL) {
  const filters = request.searchParams;
  const exactApp = request.pathname === '/v1/apps' && filters.get('filter[bundleId]');
  const exactBuild = request.pathname === '/v1/builds' && filters.get('filter[app]') &&
    filters.get('filter[version]') && filters.get('filter[preReleaseVersion.version]') &&
    filters.get('filter[preReleaseVersion.platform]') === 'IOS';
  if (request.origin !== apiOrigin || request.username || request.password || request.hash ||
      !(exactApp || exactBuild)) {
    throw Error('A scoped token requires an App Store Connect status request for one app or build.');
  }
  if(!env.ASC_KEY_ID || !env.ASC_ISSUER_ID || !env.ASC_KEY_PATH) throw Error('Set ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH for a read-only status lookup.');
  const key=createPrivateKey(await readFile(env.ASC_KEY_PATH));
  if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1') throw Error('Expected an App Store Connect P-256 private key');
  const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
  const now=Math.floor(Date.now()/1000);
  const payload=encode({alg:'ES256',kid:env.ASC_KEY_ID,typ:'JWT'})+'.'+encode({iss:env.ASC_ISSUER_ID,iat:now,exp:now+300,aud:'appstoreconnect-v1',scope:[`GET ${request.pathname}${request.search}`]});
  return payload+'.'+sign('sha256',Buffer.from(payload),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
}

class LookupError extends Error { constructor(readonly http:number){ super('App Store Connect HTTP '+http); } }

class CredentialError extends Error {}

export async function lookupBuild(identity:BuildIdentity, token:StatusToken, transport:typeof fetch=fetch) {
  const get=async(path:string,params:Record<string,string>)=>{
    const url=new URL('/v1/'+path,apiOrigin);
    url.search=new URLSearchParams(params).toString();
    let bearer:string;
    try { bearer=await token(new URL(url)); } catch { throw new CredentialError(); }
    const response=await transport(url,{method:'GET',headers:{Authorization:'Bearer '+bearer},redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new LookupError(response.status);
    return page.parse(await response.json());
  };
  try {
    const apps=await get('apps',{'filter[bundleId]':identity.bundleId,'fields[apps]':'bundleId',limit:'2'});
    if(apps.links?.next||apps.data.length!==1||apps.data[0].type!=='apps'||apps.data[0].attributes?.bundleId!==identity.bundleId)
      return {status:'UNKNOWN',reason:'App is missing, ambiguous, or inaccessible for these credentials.'};
    const appId=apps.data[0].id;
    const builds=await get('builds',{'filter[app]':appId,'filter[version]':identity.build,'filter[preReleaseVersion.version]':identity.version,
      'filter[preReleaseVersion.platform]':'IOS',include:'app,preReleaseVersion,buildBetaDetail',
      'fields[builds]':'version,expired,processingState,app,preReleaseVersion,buildBetaDetail','fields[apps]':'bundleId','fields[preReleaseVersions]':'version,platform','fields[buildBetaDetails]':'internalBuildState,externalBuildState',limit:'2'});
    if(!builds.data.length&&!builds.links?.next)return {status:'NOT_VISIBLE',reason:'No matching build is visible yet. The local upload attempt remains reserved.'};
    const build=builds.data[0];
    const related=(key:string,type:string)=>{
      const rel=build?.relationships?.[key]?.data;
      return rel?.type===type?builds.included?.find(item=>item.type===type&&item.id===rel.id)?.attributes:undefined;
    };
    const version=related('preReleaseVersion','preReleaseVersions');
    const app=build?.relationships?.app?.data;
    if(builds.links?.next || builds.data.length!==1 || build.type!=='builds' || app?.type!=='apps'||app.id!==appId||
       version?.version!==identity.version || version.platform!=='IOS'|| build.attributes?.version!==identity.build)
      return {status:'UNKNOWN',reason:'Returned build identity was incomplete or ambiguous.'};
    const processing=build.attributes.processingState;
    const beta=related('buildBetaDetail','buildBetaDetails');
    const internal=typeof beta?.internalBuildState==='string'?beta.internalBuildState:null;
    const external=typeof beta?.externalBuildState==='string'?beta.externalBuildState:null;
    let status='UNKNOWN';
    if(processing==='FAILED'||processing==='INVALID')status='INVALID';
    else if(processing==='PROCESSING')status='PROCESSING';
    else if(processing==='VALID'){
      if(build.attributes.expired===true||internal==='EXPIRED')status='EXPIRED';
      else if(internal==='PROCESSING_EXCEPTION')status='INVALID';
      else if(internal==='MISSING_EXPORT_COMPLIANCE'||internal==='IN_EXPORT_COMPLIANCE_REVIEW')status='EXPORT_COMPLIANCE';
      else if((internal==='READY_FOR_BETA_TESTING'||internal==='IN_BETA_TESTING')&&build.attributes.expired===false)status='READY_FOR_INTERNAL_TESTING';
      else if(internal==='PROCESSING')status='PROCESSING';
    }
    return {status,buildId:build.id,processingState:typeof processing==='string'?processing:null,internalBuildState:internal,externalBuildState:external};
  }catch(e){
    if(e instanceof CredentialError)return {status:'UNKNOWN',reason:'App Store Connect credentials unavailable. Configure ASC_KEY_PATH, ASC_KEY_ID and ASC_ISSUER_ID.'};
    return {status:'UNKNOWN',reason:e instanceof LookupError?e.message:'Response unavailable or invalid. The upload attempt remains reserved.'};
  }
}
