import fs from 'node:fs/promises';
import path from 'node:path';
import * as plist from 'plist';
export const ids={project:'000000000000000000000001',target:'000000000000000000000002',plist:'000000000000000000000003',config:'000000000000000000000004',list:'000000000000000000000005',projectConfig:'000000000000000000000006',projectList:'000000000000000000000007',resources:'000000000000000000000008',group:'000000000000000000000009',sources:'000000000000000000000010',source:'000000000000000000000011',sourceBuild:'000000000000000000000012',product:'000000000000000000000013',products:'000000000000000000000014'};
export function openstep(v){if(Array.isArray(v))return '('+v.map(openstep).join(',')+')';if(v&&typeof v==='object')return '{'+Object.entries(v).map(([k,v])=>JSON.stringify(k)+' = '+openstep(v)+';').join('\n')+'}';return JSON.stringify(String(v));}
export const storyboard=`<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="23501" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="launch">
<device id="retina6_12" orientation="portrait" appearance="light"/>
<dependencies><plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="23502"/><capability name="Safe area layout guides" minToolsVersion="9.0"/><capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/></dependencies>
<scenes><scene sceneID="scene"><objects><viewController id="launch" sceneMemberID="viewController"><view key="view" contentMode="scaleToFill" id="root"><rect key="frame" x="0.0" y="0.0" width="393" height="852"/><viewLayoutGuide key="safeArea" id="safe"/><color key="backgroundColor" red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/></view></viewController><placeholder placeholderIdentifier="IBFirstResponder" id="responder" userLabel="First Responder" sceneMemberID="firstResponder"/></objects></scene></scenes></document>`;
export async function project(root,{info={UILaunchStoryboardName:'LaunchScreen'},settings={},resources=['LaunchScreen.storyboard','Assets.xcassets']}={}){
 const objects={
  [ids.project]:{isa:'PBXProject',buildConfigurationList:ids.projectList,compatibilityVersion:'Xcode 14.0',developmentRegion:'en',knownRegions:['en','Base'],mainGroup:ids.group,productRefGroup:ids.products,projectDirPath:'',projectRoot:'',targets:[ids.target]},
  [ids.target]:{isa:'PBXNativeTarget',name:'LaunchFixture',productName:'LaunchFixture',productType:'com.apple.product-type.application',productReference:ids.product,buildConfigurationList:ids.list,buildPhases:[ids.sources,ids.resources],buildRules:[],dependencies:[]},
  [ids.group]:{isa:'PBXGroup',sourceTree:'<group>',children:[ids.source,ids.products]},
  [ids.products]:{isa:'PBXGroup',name:'Products',sourceTree:'<group>',children:[ids.product]},
  [ids.product]:{isa:'PBXFileReference',explicitFileType:'wrapper.application',path:'LaunchFixture.app',sourceTree:'BUILT_PRODUCTS_DIR'},
  [ids.source]:{isa:'PBXFileReference',lastKnownFileType:'sourcecode.swift',path:'App.swift',sourceTree:'SOURCE_ROOT'},
  [ids.sourceBuild]:{isa:'PBXBuildFile',fileRef:ids.source},
  [ids.sources]:{isa:'PBXSourcesBuildPhase',buildActionMask:2147483647,files:[ids.sourceBuild],runOnlyForDeploymentPostprocessing:0},
  [ids.list]:{isa:'XCConfigurationList',buildConfigurations:[ids.config],defaultConfigurationIsVisible:0,defaultConfigurationName:'Debug'},
  [ids.projectList]:{isa:'XCConfigurationList',buildConfigurations:[ids.projectConfig],defaultConfigurationIsVisible:0,defaultConfigurationName:'Debug'},
  [ids.config]:{isa:'XCBuildConfiguration',name:'Debug',buildSettings:{SDKROOT:'iphoneos',IPHONEOS_DEPLOYMENT_TARGET:'17.0',INFOPLIST_FILE:'Info.plist',PRODUCT_BUNDLE_IDENTIFIER:'org.example.LaunchFixture',PRODUCT_NAME:'$(TARGET_NAME)',ALWAYS_SEARCH_USER_PATHS:'NO',SWIFT_VERSION:'6.0',CODE_SIGNING_ALLOWED:'NO',TARGETED_DEVICE_FAMILY:'1,2',...settings}},
  [ids.projectConfig]:{isa:'XCBuildConfiguration',name:'Debug',buildSettings:{}},
  [ids.resources]:{isa:'PBXResourcesBuildPhase',buildActionMask:2147483647,runOnlyForDeploymentPostprocessing:0,files:[]},
 };
 for(let i=0;i<resources.length;i++){const r=(100+i*2).toString(16).padStart(24,'0'),b=(101+i*2).toString(16).padStart(24,'0');objects[r]={isa:'PBXFileReference',path:resources[i],sourceTree:'SOURCE_ROOT',lastKnownFileType:resources[i].endsWith('.xcassets')?'folder.assetcatalog':'file.storyboard'};objects[b]={isa:'PBXBuildFile',fileRef:r};objects[ids.resources].files.push(b);objects[ids.group].children.push(r);}
 const data={archiveVersion:1,classes:{},objectVersion:56,objects,rootObject:ids.project};
 await fs.mkdir(path.join(root,'App.xcodeproj'),{recursive:true});
 await fs.writeFile(path.join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 await fs.writeFile(path.join(root,'Info.plist'),plist.build({CFBundleIdentifier:'$(PRODUCT_BUNDLE_IDENTIFIER)',CFBundleExecutable:'$(EXECUTABLE_NAME)',CFBundleName:'$(PRODUCT_NAME)',CFBundlePackageType:'APPL',CFBundleVersion:'1',CFBundleShortVersionString:'1.0',...info}));
 await fs.writeFile(path.join(root,'LaunchScreen.storyboard'),storyboard);
 await fs.mkdir(path.join(root,'Assets.xcassets'),{recursive:true});
 await fs.writeFile(path.join(root,'Assets.xcassets/Contents.json'),JSON.stringify({info:{author:'xcode',version:1}}));
 await fs.writeFile(path.join(root,'App.swift'),'import SwiftUI\n@main struct FixtureApp: App { var body: some Scene { WindowGroup { Text("Ready") } } }\n');
 return data;
}

export {plist};
export {XMLParser,XMLValidator} from 'fast-xml-parser';
