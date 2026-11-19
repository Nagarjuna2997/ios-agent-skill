/** Pure, deterministic release proposals. No file, process, credential or network access. */
import { z } from 'zod';
import { Analysis, Claim, Question } from './model.js';
import { redactText } from './text.js';

export const FieldStatus = z.enum(['AUTO_GENERATED','INFERRED_NEEDS_CONFIRMATION','USER_REQUIRED','NOT_APPLICABLE','UNKNOWN','REMOTE_ONLY']);
export const FieldSchema = z.object({status:FieldStatus,value:z.union([z.string(),z.boolean(),z.array(z.string()),z.null()]),evidence:z.array(z.string()),reason:z.string(),reviewRequired:z.boolean()}).strict();
export type Field = z.infer<typeof FieldSchema>;
export type DraftFields = Record<string,Field>;
const labels: Record<string,string> = {pdf:'PDF documents','document-scanning':'Document scanning',camera:'Camera access',photos:'Photo selection or library access',microphone:'Audio recording',location:'Location access',contacts:'Contacts access',health:'Health data access',networking:'Network communication',storekit:'In-app purchases',authentication:'Authentication','sign-in-with-apple':'Sign in with Apple',notifications:'Notifications',cloud:'Cloud integration',tracking:'Tracking-related APIs',analytics:'Analytics integration',search:'Search',canvas:'Drawing canvas','local-storage':'Local persistence','web-content':'Embedded web content',messaging:'Message composition',cryptography:'Cryptography','user-identifiers':'Device or advertising identifiers'};
const union = (items: Claim[]) => [...new Set(items.flatMap(x=>x.evidence))].sort();
const field = (status:Field['status'],value:Field['value'],evidence:string[]=[],reason='',reviewRequired=true):Field => ({status,value,evidence:[...new Set(evidence)].sort(),reason,reviewRequired});
export interface ProductSummary {
  name: Field; bundleIdentifier:Field; purpose:Field;
  features:{id:string;label:string;confidence:'Low';evidence:string[]}[];
  audienceCandidates:Field; permissions:Field[]; capabilities:Field[];
  navigation:Field[]; screens:Field[]; userIntent:Field;
  confidence:'Low'; limitations:string[];
}
/** Future providers receive only this vocabulary, never source, paths, names, intent or local prose. */
export interface GenerationContext { featureIds:string[]; audienceIds:string[]; }
export interface TextGenerationProvider {
  readonly id: string;
  readonly locality: 'local';
  generate(context:Readonly<GenerationContext>): Partial<Record<'subtitle'|'description'|'promotionalText'|'keywords',string>>;
}
export const deterministicProvider: TextGenerationProvider = {
  id:'deterministic-v1',locality:'local',
  generate({featureIds}) {
    const userFacing=featureIds.filter(id=>['pdf','document-scanning','search','canvas'].includes(id)).map(id=>labels[id]!);
    if (!userFacing.length) return {};
    return {subtitle:userFacing[0]!.slice(0,30),description:'Draft based on static project evidence. Candidate capabilities: '+userFacing.join(', ')+'. Confirm these features are reachable in the release build before using this text.',promotionalText:'Explore '+userFacing.join(', ').toLowerCase()+'.',keywords:userFacing.join(',').toLowerCase().slice(0,100)};
  }
};
export interface ReleaseProposal {
  schemaVersion:2; summary:ProductSummary; metadata:DraftFields;
  privacy:{items:{id:string;status:Field['status'];evidence:string[];purpose:Field;collection:Field}[];declarations:Field[];requiredReasonAPIs:Field[];limitations:string[]};
  review:{notes:Field;credentials:Field;ageRating:DraftFields;exportCompliance:DraftFields};
  validation:{status:'BLOCKED'|'PREPARED_USER_INPUT_REQUIRED';checks:Record<string,{status:string;evidence:string[];detail:string}>};
  questions:Question[]; generation:{provider:string;status:'LOCAL_DETERMINISTIC'|'FALLBACK';dataSent:'NONE'};
}
export function proposeRelease(analysis:Analysis):ReleaseProposal {
  const {model}=analysis, all=[...model.claims,...model.features], by=(id:string)=>all.find(c=>c.id===id), matching=(prefix:string)=>model.claims.filter(c=>c.id.startsWith(prefix));
  const fact=(id:string)=>{const c=by(id);return field(c?.value!=null?'INFERRED_NEEDS_CONFIRMATION':'UNKNOWN',c?.value??null,c?.evidence, c?.limitations.join(' ')||'Not established.');};
  const features=model.features.filter(f=>f.evidence.length&&labels[f.id]).map(f=>({id:f.id,label:labels[f.id]!,confidence:'Low' as const,evidence:f.evidence}));
  const audience=matching('intent:audience:');
  const purposeCandidates=features.filter(f=>['pdf','document-scanning','search','canvas'].includes(f.id));
  const summary:ProductSummary={name:fact('productName'),bundleIdentifier:fact('bundleIdentifier'),purpose:field(purposeCandidates.length?'INFERRED_NEEDS_CONFIRMATION':'UNKNOWN',purposeCandidates.length?'Candidate workflow: '+purposeCandidates.map(f=>f.label.toLowerCase()).join(', '):null,purposeCandidates.flatMap(f=>f.evidence),'Lexical capabilities do not establish the app’s primary purpose.'),features,audienceCandidates:field(audience.length?'INFERRED_NEEDS_CONFIRMATION':'UNKNOWN',audience.map(c=>String(c.value)),union(audience),'Developer intent, not independently established audience.'),permissions:matching('permission:').map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.id.slice(11),c.evidence,'Usage string declaration only; purpose prose withheld.')),capabilities:matching('entitlement:').map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.id.slice(12),c.evidence,'Declared entitlement, not provisioning or runtime validation.')),navigation:matching('navigation:').map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.id.slice(11),c.evidence,'Navigation syntax only; routes are not proven reachable.')),screens:model.screens.map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.value,c.evidence,c.limitations.join(' '))),userIntent:fact('intent:context'),confidence:'Low',limitations:[...model.coverage,'Static inspection cannot establish shipping behavior, complete data flow or the full product purpose.']};
  const metadata:DraftFields={};
  const generated=deterministicProvider.generate({featureIds:features.map(f=>f.id),audienceIds:audience.map(c=>String(c.value))});
  for(const id of ['subtitle','description','promotionalText','keywords','whatsNew','primaryCategory','secondaryCategory','reviewNotes']) {
    const existing=by('local-metadata:'+id), value=generated[id as keyof typeof generated];
    metadata[id]=existing?field('INFERRED_NEEDS_CONFIRMATION',existing.value,existing.evidence,'Preserved local draft; not approved or independently verified.'):
      value?field('AUTO_GENERATED',redactText(value),purposeCandidates.flatMap(f=>f.evidence),'Deterministic proposal from API candidates; review before use.'):
      field(id==='whatsNew'?'USER_REQUIRED':'UNKNOWN',null,[],id==='whatsNew'?'No verified release-change history supplied. Do not invent improvements.':'Insufficient evidence for useful text.');
  }
  for(const id of ['privacyPolicyURL','supportURL','copyright','reviewContact','demoCredentials']) metadata[id]=field('USER_REQUIRED',null,[],'Provide or confirm separately; credentials must not be stored in this package.');
  metadata.remoteListing=field('REMOTE_ONLY',null,[],'App Store Connect listing has not been read.',false);
  const productivity=features.filter(f=>['pdf','document-scanning','canvas'].includes(f.id));
  if(metadata.primaryCategory!.status==='UNKNOWN' && productivity.length)metadata.primaryCategory=field('INFERRED_NEEDS_CONFIRMATION','Productivity',productivity.flatMap(f=>f.evidence),'Document/drawing API indicators; confirm the primary user experience.');
  if(metadata.secondaryCategory!.status==='UNKNOWN'&&audience.some(c=>c.value==='students')&&productivity.length)metadata.secondaryCategory=field('INFERRED_NEEDS_CONFIRMATION','Education',productivity.flatMap(f=>f.evidence),'Optional recommendation combining developer audience intent and document/drawing evidence.');
  const topics:Record<string,{features:string[];keys:string[];purpose:string}>={
    camera:{features:['camera','document-scanning'],keys:['NSCameraUsageDescription'],purpose:'Camera access; document scanning is only a candidate when scanning APIs are present.'},
    photos:{features:['photos'],keys:['NSPhotoLibraryUsageDescription','NSPhotoLibraryAddUsageDescription'],purpose:'Photo selection or library access; picker use alone does not prove broad library authorization.'},
    microphone:{features:['microphone'],keys:['NSMicrophoneUsageDescription'],purpose:'Potential audio capture.'},
    location:{features:['location'],keys:['NSLocationWhenInUseUsageDescription','NSLocationAlwaysAndWhenInUseUsageDescription'],purpose:'Potential location access.'},
    contacts:{features:['contacts'],keys:['NSContactsUsageDescription'],purpose:'Potential contacts access.'},health:{features:['health'],keys:['NSHealthShareUsageDescription','NSHealthUpdateUsageDescription'],purpose:'Potential health access.'},
    identifiers:{features:['user-identifiers','authentication','sign-in-with-apple'],keys:[],purpose:'Potential identity-related processing; account requirement unknown.'},
    network:{features:['networking','cloud'],keys:[],purpose:'Network capability; transported data unknown.'},
    webContent:{features:['web-content'],keys:[],purpose:'Web content indicator; destinations and transmitted data are unknown.'},
    messaging:{features:['messaging'],keys:[],purpose:'Message-composition indicator; actual use and content are unknown.'},
    analytics:{features:['analytics'],keys:[],purpose:'Analytics indicator; events and SDK configuration unknown.'},
    tracking:{features:['tracking'],keys:['NSUserTrackingUsageDescription'],purpose:'Tracking-related indicator; actual tracking requires confirmation.'}
  };
  const privacy:ReleaseProposal['privacy']={items:[],declarations:matching('manifest-').concat(matching('privacy-manifest:')).map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.value,c.evidence,'Manifest declaration, not a verified privacy answer.')),requiredReasonAPIs:matching('required-reason').map(c=>field('INFERRED_NEEDS_CONFIRMATION',c.value,c.evidence,'Review actual API use and applicable reason; no reason selected automatically.')),limitations:['No App Privacy form is finalized.','Static absence does not establish no collection.','SDK internals, server retention and runtime traffic are not inspected.']};
  for(const [id,t] of Object.entries(topics)) {
    const claims=all.filter(c=>t.features.includes(c.id)||t.keys.includes(c.id.replace(/^permission:/,'')));
    const sdks=matching('dependency:').filter(c=> id==='analytics'?/FirebaseAnalytics|Mixpanel|Amplitude|AppCenterAnalytics/i.test(c.id):id==='tracking'?/GoogleMobileAds|AdSupport|AppTrackingTransparency|Facebook/i.test(c.id):false);
    if(!claims.length&&!sdks.length)continue;
    const evidence=union([...claims,...sdks]);
    privacy.items.push({id,status:'INFERRED_NEEDS_CONFIRMATION',evidence,purpose:field('INFERRED_NEEDS_CONFIRMATION',t.purpose,evidence),collection:field('UNKNOWN',null,evidence,'Whether data leaves the device, is retained, linked, sold or shared cannot be proven here.')});
  }
  const authConflict=all.some(c=>c.id==='intent:no-account'&&c.status==='CONFLICTING');
  const noAccount=by('intent:no-account')?.status==='DEVELOPER_CONFIRMED';
  const notes=metadata.reviewNotes!.value?metadata.reviewNotes!:field('AUTO_GENERATED',[
    'Draft for developer review. Runtime navigation has not been verified.',
    purposeCandidates.length?'Candidate functionality to demonstrate: '+purposeCandidates.map(f=>f.label).join(', ')+'.':'Describe the main functionality and exact steps to reach it.',
    noAccount?'The developer states no account is required; verify on the release build.':'Confirm whether review requires sign-in or restricted access. Provide any demo credentials through a secure channel, not this package.'
  ].join('\n'),purposeCandidates.flatMap(f=>f.evidence),'Not verified reviewer instructions.');
  metadata.reviewNotes=notes;
  const ageRating:DraftFields={};
  for(const id of ['userGeneratedContent','messaging','unrestrictedWebAccess','gambling','violence','matureContent','socialNetworking']) {
    const hit=features.filter(f=>id==='unrestrictedWebAccess'?f.id==='web-content':id==='messaging'?f.id==='messaging':false);
    ageRating[id]=field(hit.length?'INFERRED_NEEDS_CONFIRMATION':'UNKNOWN',hit.length?'Related API indicator present; restrictions and actual content are unknown.':null,hit.flatMap(f=>f.evidence),'Do not infer absence, frequency or an age rating from source absence.');
  }
  const crypto=features.filter(f=>['cryptography','networking','cloud'].includes(f.id));
  const cryptoDeps=matching('dependency:').filter(c=>/Crypto|OpenSSL|BoringSSL|Sodium/i.test(c.id));
  const exportCompliance:DraftFields={summary:field(crypto.length||cryptoDeps.length?'INFERRED_NEEDS_CONFIRMATION':'UNKNOWN',crypto.length||cryptoDeps.length?'Encryption or networking indicators are present. Determine actual encryption use, exemptions and required documentation with the developer.':null,[...crypto.flatMap(f=>f.evidence),...union(cryptoDeps)],'No export classification or legal determination.'),usesNonExemptEncryption:field('USER_REQUIRED',null,[],'Developer must determine the applicable export-compliance answer.')};
  const questions=analysis.questions.filter(q=>!['data-handling','signing','auth-access','auth-conflict'].includes(q.id));
  const add=(id:string,domain:string,question:string,claims:string[]=[],evidence:string[]=[],priority:1|2|3=2)=>questions.push({id,domain,question,claims,evidence:[...new Set(evidence)].sort(),priority});
  if(authConflict)add('auth-conflict','review','Product intent mentions no required account but authentication evidence is present. Is sign-in optional, required or excluded?',[],union(all.filter(c=>['authentication','sign-in-with-apple','intent:no-account'].includes(c.id))),1);
  else if(!noAccount)add('auth-access','review','Does this release require an account or restricted access? If yes, arrange secure reviewer access; do not put credentials in the package.');
  if(privacy.items.length||privacy.declarations.length||matching('dependency:').length)add('data-handling','privacy','Confirm data handling for '+(privacy.items.map(x=>x.id).join(', ')||'bundled declarations and SDKs')+': what leaves the device, purposes, retention, linkage and third-party sharing?',[],[...privacy.items.flatMap(x=>x.evidence),...privacy.declarations.flatMap(x=>x.evidence),...union(matching('dependency:'))],1);
  else add('privacy-practices','privacy','No supported sensitive indicators were detected. Confirm actual app and third-party data practices; this does not prove no collection.');
  add('store-details','metadata','Provide the privacy-policy and support URLs, rights-holder information and review contact separately. Do not include credentials.');
  add('metadata-review','metadata','Review the draft text, primary purpose and category recommendations; supply unresolved fields and verified release changes.');
  add('age-rating','age-rating','Confirm content, user interaction and web-access answers for the shipping app; no numeric age rating is inferred.',[],Object.values(ageRating).flatMap(f=>f.evidence));
  add('export-compliance','compliance','Confirm encryption use, exemption eligibility and required export documentation; static indicators cannot decide this.',[],exportCompliance.summary!.evidence);
  add('build-test-signing','validation','Run and retain release build, test and signing verification. Configuration alone is not proof.');
  const checks:ReleaseProposal['validation']['checks']={};
  const check=(id:string,status:string,detail:string,evidence:string[]=[])=>{checks[id]={status,detail,evidence};};
  check('project',model.status==='BLOCKED'?'BLOCKED':'INSPECTED','Selected target/configuration static inspection.');
  for(const id of ['build','tests','signing'])check(id,'NOT_CHECKED','No build, tests, archive or signing operation is executed.');
  for(const [id,key] of [['launchScreen','launch-screen'],['appIcon','app-icon-resource'],['version','version'],['buildNumber','build']])check(id,by(key)?.status==='OBSERVED'?'INSPECTED':'UNKNOWN','Static evidence only; not runtime or distribution certification.',by(key)?.evidence);
  check('entitlements',matching('entitlement:').length&&!by('entitlements')&&!model.coverage.includes('entitlements-unreadable')?'INSPECTED':'UNKNOWN','Declared keys only; entitlement resolution and provisioning need independent validation.',union(matching('entitlement:')));
  check('capabilities',summary.capabilities.length?'INSPECTED':'UNKNOWN','Entitlement declarations only, not enabled service verification.',union(matching('entitlement:')));
  if(matching('launch-finding:').length)check('launchScreen','NEEDS_REVIEW','Launch-screen findings need review.',union(matching('launch-finding:')));
  for(const id of ['metadata','privacy','ageRating','exportCompliance'])check(id,'NEEDS_CONFIRMATION','Local proposal requires developer review.');
  for(const [id,limit] of Object.entries({subtitle:30,description:4000,promotionalText:170,keywords:100,whatsNew:4000})){
    const value=metadata[id]!.value;
    if(typeof value==='string'&&[...value].length>limit){
      check('metadata:'+id,'NEEDS_REVIEW','Draft exceeds '+limit+' characters; preserved for editing.',metadata[id]!.evidence);
      add('length:'+id,'metadata','Shorten '+id+' to at most '+limit+' characters.',[],metadata[id]!.evidence);
    }
  }
  return {schemaVersion:2,summary,metadata,privacy,review:{notes,credentials:field('USER_REQUIRED',null,[],noAccount?'Developer states no account is required, but release-build access must still be verified. Never serialize credentials.':'Never fabricate or serialize reviewer credentials.'),ageRating,exportCompliance},validation:{status:model.status==='BLOCKED'?'BLOCKED':'PREPARED_USER_INPUT_REQUIRED',checks},questions:questions.sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id,'en')),generation:{provider:deterministicProvider.id,status:Object.keys(generated).length?'LOCAL_DETERMINISTIC':'FALLBACK',dataSent:'NONE'}};
}

/** Validate proposal shape and evidence links independently of artifact hashes. */
export function validateProposal(value:unknown,analysis:Pick<Analysis,'model'>):ReleaseProposal {
  const item=z.object({id:z.string(),status:FieldStatus,evidence:z.array(z.string()),purpose:FieldSchema,collection:FieldSchema}).strict();
  const fields=z.record(FieldSchema);
  const shape=z.object({schemaVersion:z.literal(2),summary:z.object({name:FieldSchema,bundleIdentifier:FieldSchema,purpose:FieldSchema,features:z.array(z.object({id:z.string(),label:z.string(),confidence:z.literal('Low'),evidence:z.array(z.string())}).strict()),audienceCandidates:FieldSchema,permissions:z.array(FieldSchema),capabilities:z.array(FieldSchema),navigation:z.array(FieldSchema),screens:z.array(FieldSchema),userIntent:FieldSchema,confidence:z.literal('Low'),limitations:z.array(z.string())}).strict(),metadata:fields,privacy:z.object({items:z.array(item),declarations:z.array(FieldSchema),requiredReasonAPIs:z.array(FieldSchema),limitations:z.array(z.string())}).strict(),review:z.object({notes:FieldSchema,credentials:FieldSchema,ageRating:fields,exportCompliance:fields}).strict(),validation:z.object({status:z.enum(['BLOCKED','PREPARED_USER_INPUT_REQUIRED']),checks:z.record(z.object({status:z.string(),evidence:z.array(z.string()),detail:z.string()}).strict())}).strict(),questions:z.array(z.object({id:z.string(),priority:z.union([z.literal(1),z.literal(2),z.literal(3)]),domain:z.string(),question:z.string(),claims:z.array(z.string()),evidence:z.array(z.string())}).strict()),generation:z.object({provider:z.string(),status:z.enum(['LOCAL_DETERMINISTIC','FALLBACK']),dataSent:z.literal('NONE')}).strict()});
  const result=shape.parse(value) as ReleaseProposal;
  const ids=new Set(analysis.model.evidence.map(e=>e.id));
  function visit(v:unknown){if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(k==='evidence'&&Array.isArray(x)&&x.some(id=>!ids.has(id)))throw Error('Proposal references missing evidence');visit(x);}}
  visit(result);
  for(const key of ['subtitle','description','promotionalText','keywords','whatsNew','primaryCategory','secondaryCategory','reviewNotes','privacyPolicyURL','supportURL','copyright','reviewContact','demoCredentials','remoteListing'])if(!result.metadata[key])throw Error('Missing metadata field');
  if(result.review.credentials.value!==null||result.metadata.demoCredentials!.value!==null)throw Error('Credentials cannot be packaged');
  return result;
}
