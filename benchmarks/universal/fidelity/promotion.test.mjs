import {test} from 'node:test';import assert from 'node:assert/strict';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {promotionRequested,authorizedKnownGood} from './promotion.mjs';
const h='a'.repeat(64);const p={version:1,maxMeanError:.1,maxChangedFraction:.2,maxLineBreakMismatches:0,minimumImprovement:.001};
const baseline={version:1,sourceHash:h,referenceHash:h,screenshotHash:h,artifactsHash:h,pins:{device:'device',os:'os',xcode:'xcode',appearance:'light',contentSize:'large',locale:'en',orientation:'portrait',state:'collapsed',width:100,height:100,scale:1,fontConfiguration:'system',referenceRenderer:'browser',normalizationHash:h},build:'passed',functionality:'passed',accessibility:'passed',layout:'passed',typography:'passed',testsPassed:2,accessibilityIssues:0,clippedElements:0,lineBreakMismatches:0,meanError:.05,changedFraction:.1};
const approval={version:1,referenceHash:h,pinsHash:sha256(JSON.stringify(baseline.pins)),reviewer:'Test reviewer',reviewedAt:'2026-10-15T00:00:00Z',decision:'approved'};

test('reference approval alone does not authorize known-good promotion',()=>{
 assert.equal(authorizedKnownGood(false,baseline,p,approval),null);
 assert.equal(authorizedKnownGood('1',baseline,p,approval),null);
 assert.equal(promotionRequested(undefined),false);assert.equal(promotionRequested(''),false);
});
test('explicit opt-in cannot bypass approval or quality checks',()=>{
 assert.equal(promotionRequested('1'),true);assert.deepEqual(authorizedKnownGood(true,baseline,p,approval),baseline);
 assert.throws(()=>authorizedKnownGood(true,baseline,p),/approval/);
 assert.throws(()=>authorizedKnownGood(true,{...baseline,typography:'failed'},p,approval),/verified good/);
 for(const value of ['true','0','yes'])assert.throws(()=>promotionRequested(value));
});
