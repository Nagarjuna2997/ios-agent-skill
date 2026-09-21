"""Trusted evaluator. Never exported to an agent workspace."""
import json,pathlib,shutil,re

def evaluate(fixture,work,logs,meta,simulator,command):
 # Require an explicitly installed runtime. Never sign or contact Apple services.
 if not simulator:return 'unsupported',logs,'explicit simulator required'
 inventory=command(['xcrun','simctl','list','devices','available','--json'],work)
 if inventory['exit']!=0:return 'unsupported',[inventory],'Simulator tooling unavailable'
 devices=[d for group in json.loads(inventory['stdout'])['devices'].values() for d in group]
 if not any(d['udid']==simulator for d in devices):return 'unsupported',logs,'requested runtime/device unavailable'
 project=work/'Fixture.xcodeproj';settings=command(['xcodebuild','-project',str(project),'-scheme','Fixture','-sdk','iphonesimulator','-showBuildSettings','-json','-disableAutomaticPackageResolution'],work,60);logs.append(settings)
 if settings['exit']!=0:return 'fail',logs,'project settings cannot resolve offline'
 values=json.loads(settings['stdout']);app=next((x['buildSettings'] for x in values if x['target']=='Fixture'),None)
 if not app:return 'fail',logs,'missing app target'
 if meta['id']=='B04' and app.get('IPHONEOS_DEPLOYMENT_TARGET')!='16.0':return 'fail',logs,'minimum deployment target must stay iOS 16.0'
 if meta['id']=='B05' and app.get('CODE_SIGNING_ALLOWED')!='NO':return 'fail',logs,'Simulator configuration unnecessarily enables signing'
 # Test files are installed only in a separate evaluator copy after agent shutdown.
 shutil.copy2(fixture/'oracle/Check.swift',work/'UITests/FixtureUITests.swift')
 args=['xcodebuild','test','-project',str(project),'-scheme','Fixture','-sdk','iphonesimulator','-destination','platform=iOS Simulator,id='+simulator,'-derivedDataPath',str(work/'.derived'),'-resultBundlePath',str(work/'Acceptance.xcresult'),'-parallel-testing-enabled','NO','-disableAutomaticPackageResolution','CODE_SIGNING_ALLOWED=NO','CODE_SIGNING_REQUIRED=NO','CODE_SIGN_IDENTITY=','SWIFT_VERSION=6.0','SWIFT_STRICT_CONCURRENCY=complete']
 logs.append(command(args,work,240))
 result=logs[-1]
 output=result['stdout']+result['stderr']
 if result['status']!='completed' or re.search(r'failed to initialize|Timed out while loading Accessibility|Unable to boot|Early unexpected exit',output,re.I):return 'infrastructure_error',logs,'Simulator/test-runner startup or timeout; not a code verdict'
 if result['exit']!=0 and meta['id'] not in ['B03','B04'] and not re.search(r'Test Case .+testContract.+failed',output):return 'infrastructure_error',logs,'No completed behavioral acceptance test'
 return ('pass' if result['exit']==0 and '** TEST SUCCEEDED **' in result['stdout']+result['stderr'] else 'fail'),logs,'unsigned Simulator build and accessibility/lifecycle behavior'
