// Independent fixture contract checker. Does NOT import or score with the launch analyzer.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {plist,ids,XMLParser,XMLValidator} from '../../mcp-server/test/helpers/launch-project.js';
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@_'});
export async function evaluate(root,id){
 const failures=[];const require=(ok,why)=>{if(!ok)failures.push(why);};
 try{
 const data=plist.parseOpenStep(await fs.readFile(path.join(root,'App.xcodeproj/project.pbxproj'),'utf8'));
 const o=data.objects,target=o[ids.target];require(target?.productType==='com.apple.product-type.application','App target preserved');
 const resources=(o[ids.resources]?.files||[]).map(k=>o[o[k]?.fileRef]?.path).filter(Boolean);
 const dictionary=['image-case','image-payload','overlap','valid-empty','valid-generated','valid-namespace','valid-intro'].includes(id);
 const plain=['valid-empty','valid-generated','valid-intro'].includes(id);
 for(const cfgId of o[ids.list].buildConfigurations){
  const settings=o[cfgId].buildSettings;let info={};
  if(settings.INFOPLIST_FILE)info=plist.parse(await fs.readFile(path.join(root,settings.INFOPLIST_FILE),'utf8'));
  if(settings.GENERATE_INFOPLIST_FILE==='YES'){
   for(const [k,v]of Object.entries(settings))if(k.startsWith('INFOPLIST_KEY_')&&k!=='INFOPLIST_KEY_UILaunchScreen_Generation')info[k.slice(14)]=v;
   if(settings.INFOPLIST_KEY_UILaunchScreen_Generation==='YES')info.UILaunchScreen??={};
  }
  if(dictionary){
   require(info.UILaunchScreen&&typeof info.UILaunchScreen==='object','Dictionary launch retained');
   require(!info.UILaunchStoryboardName,'No obsolete storyboard mechanism');
   if(!plain){
    const launch=info.UILaunchScreen||{};
    require(resources.includes('Assets.xcassets'),'Catalog target membership');
    const wanted=id==='valid-namespace'?'Brand/Logo':'Logo';
    require(launch.UIImageName===wanted,'Intended case-sensitive logo name retained');
    require(launch.UIColorName==='Background','Intended background retained');
    const set=path.join(root,'Assets.xcassets',wanted+'.imageset');
    const image=JSON.parse(await fs.readFile(path.join(set,'Contents.json'),'utf8'));
    require(image.images.some(i=>i.filename),'Image has a payload');
    for(const i of image.images.filter(i=>i.filename)){const payload=await fs.readFile(path.join(set,i.filename));const expected=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');require(createHash('sha256').update(payload).digest('hex')===createHash('sha256').update(expected).digest('hex'),'Original logo payload preserved');}
    const color=JSON.parse(await fs.readFile(path.join(root,'Assets.xcassets/Background.colorset/Contents.json'),'utf8'));require(color.colors?.length===1&&['red','green','blue','alpha'].every(k=>Number(color.colors[0].color?.components?.[k])===1),'Original white background preserved');
    if(id==='valid-namespace'){const group=JSON.parse(await fs.readFile(path.join(root,'Assets.xcassets/Brand/Contents.json'),'utf8'));require(group.properties?.['provides-namespace']===true,'Namespace preserved');}
   }else require(Object.keys(info.UILaunchScreen||{}).length===0,'Intentionally plain screen retained');
  }else{
   const name=info.UILaunchStoryboardName;require(typeof name==='string','Launch storyboard configured');
   const p=resources.find(p=>p.endsWith('.storyboard')&&path.basename(p,'.storyboard')===name?.replace(/\.storyboard$/,''));require(p,'Selected storyboard belongs to target');
   if(p){
    const text=await fs.readFile(path.join(root,p),'utf8');require(XMLValidator.validate(text)===true,'Storyboard XML valid');
    const doc=parser.parse(text).document;require(doc?.['@_launchScreen']==='YES','Static launch document retained');
    const nodes=[];function visit(o){if(!o||typeof o!=='object')return;for(const [k,v]of Object.entries(o))for(const n of Array.isArray(v)?v:[v])if(n&&typeof n==='object'){nodes.push([k,n]);visit(n);}}visit(doc);
    require(nodes.some(([k,n])=>k==='viewController'&&n['@_id']===doc?.['@_initialViewController']),'Initial controller resolves');
    require(!nodes.some(([,n])=>n['@_customClass']),'No custom launch classes');
    require(!nodes.some(([k])=>['action','outlet','outletCollection','userDefinedRuntimeAttribute','webView'].includes(k)),'No executable launch behavior');
    require(nodes.some(([k,n])=>k==='color'&&n['@_key']==='backgroundColor'&&Number(n['@_red'])===1&&Number(n['@_green'])===1&&Number(n['@_blue'])===1),'Intended static background retained');
   }
  }
 }
 require(o[ids.list].buildConfigurations.length===(id==='release-reference'?2:1),'Build configurations preserved');
 const app=await fs.readFile(path.join(root,'App.swift'),'utf8');require(app.includes('Text("Ready")'),'App screen retained');
 }catch(e){failures.push('Unresolved fixture contract: '+e.message);}
 return {pass:failures.length===0,failures};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const result=await evaluate(path.resolve(process.argv[2]),process.argv[3]);console.log(JSON.stringify(result));process.exitCode=result.pass?0:1;}
