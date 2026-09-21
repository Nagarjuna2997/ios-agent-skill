import fs from 'node:fs/promises';
import path from 'node:path';
import {project,ids,openstep,plist} from '../../mcp-server/test/helpers/launch-project.js';
export async function create(root,id,reference=false){
 await fs.mkdir(root,{recursive:true});
 const dictionary=['image-case','image-payload','overlap','valid-empty','valid-generated','valid-namespace','valid-intro'].includes(id);
 const plain=['valid-empty','valid-generated','valid-intro'].includes(id);
 const info=dictionary?{UILaunchScreen:plain?{}:{UIImageName:id==='valid-namespace'?'Brand/Logo':'Logo',UIColorName:'Background'}}:{UILaunchStoryboardName:'LaunchScreen'};
 const data=await project(root,{info});
 const write=(p,s)=>fs.writeFile(path.join(root,p),s);
 const logo=id==='valid-namespace'?'Brand/Logo':'Logo';
 await fs.mkdir(path.join(root,`Assets.xcassets/${logo}.imageset`),{recursive:true});
 await write(`Assets.xcassets/${logo}.imageset/Contents.json`,JSON.stringify({images:[{idiom:'universal',filename:'logo.png'}],info:{author:'xcode',version:1}}));
 await write(`Assets.xcassets/${logo}.imageset/logo.png`,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64'));
 await fs.mkdir(path.join(root,'Assets.xcassets/Background.colorset'));
 await write('Assets.xcassets/Background.colorset/Contents.json',JSON.stringify({colors:[{idiom:'universal',color:{'color-space':'srgb',components:{red:'1',green:'1',blue:'1',alpha:'1'}}}],info:{author:'xcode',version:1}}));
 if(id==='valid-namespace')await write('Assets.xcassets/Brand/Contents.json',JSON.stringify({info:{author:'xcode',version:1},properties:{'provides-namespace':true}}));
 if(id==='valid-intro')await write('Intro.swift','import SwiftUI\nstruct AnimatedIntro: View { var body: some View { Text("Welcome").transition(.opacity) } }\n');
 if(id==='valid-generated'){Object.assign(data.objects[ids.config].buildSettings,{GENERATE_INFOPLIST_FILE:'YES',INFOPLIST_FILE:'',INFOPLIST_KEY_UILaunchScreen_Generation:'YES'});await fs.unlink(path.join(root,'Info.plist'));}
 if(id==='release-reference'){
  const release='000000000000000000000050';data.objects[release]=structuredClone(data.objects[ids.config]);data.objects[release].name='Release';data.objects[ids.list].buildConfigurations.push(release);
  const pr='000000000000000000000051';data.objects[pr]=structuredClone(data.objects[ids.projectConfig]);data.objects[pr].name='Release';data.objects[ids.projectList].buildConfigurations.push(pr);
  Object.assign(data.objects[ids.config].buildSettings,{GENERATE_INFOPLIST_FILE:'YES',INFOPLIST_KEY_UILaunchStoryboardName:'LaunchScreen'});
  Object.assign(data.objects[release].buildSettings,{GENERATE_INFOPLIST_FILE:'YES',INFOPLIST_KEY_UILaunchStoryboardName:reference?'LaunchScreen':'RetiredLaunch'});
 }
 if(!reference){
  if(id==='stale-storyboard'){info.UILaunchStoryboardName='RetiredLaunch';}
  if(id==='image-case')info.UILaunchScreen.UIImageName='logo';
  if(id==='overlap')info.UILaunchStoryboardName='LaunchScreen';
  if(id==='target-membership')data.objects[ids.resources].files=data.objects[ids.resources].files.filter(k=>!data.objects[data.objects[k].fileRef].path.endsWith('.storyboard'));
  if(id==='image-payload')await write('Assets.xcassets/Logo.imageset/Contents.json',JSON.stringify({images:[{idiom:'universal',filename:'retired.png'}],info:{author:'xcode',version:1}}));
  if(id==='interactive-launch'||id==='initial-controller'){
   let s=await fs.readFile(path.join(root,'LaunchScreen.storyboard'),'utf8');
   if(id==='initial-controller')s=s.replace('initialViewController="launch"','initialViewController="retired"');
   else s=s.replace('<viewController id="launch"','<viewController customClass="AnimatedLaunch" id="launch"').replace('</viewController>','<connections><outlet property="model" destination="root" id="outlet"/></connections><userDefinedRuntimeAttributes><userDefinedRuntimeAttribute type="boolean" keyPath="hidden"><bool key="value" value="YES"/></userDefinedRuntimeAttribute></userDefinedRuntimeAttributes></viewController>');
   await write('LaunchScreen.storyboard',s);
  }
 }
 if(id!=='valid-generated'){
  const original=plist.parse(await fs.readFile(path.join(root,'Info.plist'),'utf8'));for(const key of Object.keys(original))if(key.startsWith('UILaunch'))delete original[key];
  await write('Info.plist',plist.build({...original,...info}));
 }
 await write('App.xcodeproj/project.pbxproj',openstep(data));
 // A decoy unreferenced launch file must not influence target resolution.
 await write('UnusedLaunch.storyboard','<not-a-launch-screen/>');
}
if(process.argv[1]===new URL(import.meta.url).pathname)await create(path.resolve(process.argv[2]),process.argv[3],process.argv.includes('--reference'));
