import {chromium} from '../benchmarks/universal/fidelity/node_modules/playwright/index.mjs';
import {serve} from './server.mjs';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';
const root=await mkdtemp(join(tmpdir(),'universal-ui-'));const app=await serve({port:0,root,repo:resolve('.')});const browser=await chromium.launch({...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),headless:true});
try{const page=await browser.newPage({viewport:{width:1200,height:900}});await page.goto(app.origin+'/universal');await page.getByRole('button',{name:'Inspect source',exact:true}).click();await page.getByRole('button',{name:'Generate new Xcode project',exact:true}).click();await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('generated-unverified'));await page.locator('#name').fill('SecondApp');await page.getByRole('button',{name:'Inspect source',exact:true}).click();await page.waitForFunction(()=>document.getElementById('title').textContent==='SecondApp');
let release;const hold=new Promise(r=>release=r);
await page.route('**/api/universal/*/source',async route=>{await hold;await route.continue();});
await page.getByRole('button',{name:'ImportedApp · html · generated-unverified',exact:true}).click();
await page.getByRole('button',{name:'SecondApp · html · inspected',exact:true}).click();release();
await page.waitForFunction(()=>document.getElementById('title').textContent==='SecondApp'&&!document.getElementById('generate').disabled);await page.unroute('**/api/universal/*/source');
await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(tmpdir(),'universal-studio-ui.png'),fullPage:true});console.log('Browser import and real project generation passed');}finally{await browser.close();await new Promise(r=>app.server.close(r));await rm(root,{recursive:true,force:true});}
