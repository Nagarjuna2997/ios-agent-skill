import {test} from 'node:test';import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {htmlToIR} from '../../../mcp-server/dist/app-ir/html.js';
import {annotateTextRegions} from '../../../mcp-server/dist/app-ir/typography.js';
import {comparePNGs} from '../../../mcp-server/dist/app-ir/compare.js';
import {captureDOMTypography} from './dom-typography.mjs';
test('DOM ranges retain text identity without changing pixels or measuring disclosure decoration',async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:220,height:500},deviceScaleFactor:1});
  const html='<body style="font-family:system-ui"><p>Same</p><p>Same</p><h1>A long heading that wraps across lines</h1><details><summary>Open details</summary><p>Hidden text</p></details></body>';
  const ir=htmlToIR(html);await page.setContent(html);const before=await page.screenshot();
  await page.setContent(annotateTextRegions(html,ir));const after=await page.screenshot();assert.equal(comparePNGs(before,after).report.meanAbsoluteChannelError,0);
  const capture=await captureDOMTypography(page);assert.equal(capture.regions.length,4);assert.notEqual(capture.regions[0].id,capture.regions[1].id);
  assert.ok(capture.regions[2].lines.length>1);assert.deepEqual(capture.regions[3].lines.flat(),[0,1]);assert.equal(capture.regions[3].text,'Open details');
 }finally{await browser.close();}
});
