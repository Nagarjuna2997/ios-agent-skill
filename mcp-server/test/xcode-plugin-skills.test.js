import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {listPluginSkills,readPluginSkill} from '../dist/apple-docs/plugin-skills.js';

async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'apple-plugin-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'.claude-plugin'));await mkdir(join(root,'skills','swiftui','references'),{recursive:true});
 await writeFile(join(root,'.claude-plugin','plugin.json'),JSON.stringify({name:'xcode-integration'}));
 await writeFile(join(root,'skills','swiftui','SKILL.md'),'Example guidance '+ 'x'.repeat(9000));
 await writeFile(join(root,'skills','swiftui','references','layout.md'),'Reference');
 const execute=async(cmd,args)=>args[0]==='agent'?root:'Xcode 27.2\nBuild version 27B52';return {root,execute};
}
test('discovers installed skills and returns bounded, versioned, hashed data',async t=>{
 const {execute}=await fixture(t);const list=await listPluginSkills(execute,'darwin');assert.deepEqual(list.skills,['swiftui']);assert.match(list.xcode,/27.2/);
 const a=await readPluginSkill('swiftui','SKILL.md',0,execute,'darwin');assert.equal(a.content.length,8000);assert.equal(a.nextOffset,8000);assert.match(a.sha256,/^[a-f0-9]{64}$/);assert.match(a.note,/not instructions/);
 const b=await readPluginSkill('swiftui','SKILL.md',a.nextOffset,execute,'darwin');assert.equal(b.nextOffset,null);assert.equal(b.sha256,a.sha256);
 const c=await readPluginSkill('swiftui','references/layout.md',0,execute,'darwin');assert.equal(c.content,'Reference');
});
test('unavailable environments and invalid paths are not treated as success',async t=>{
 const {root,execute}=await fixture(t);assert.equal((await listPluginSkills(execute,'linux')).status,'unavailable');
 await assert.rejects(readPluginSkill('../secret','SKILL.md',0,execute,'darwin'));
 await assert.rejects(readPluginSkill('swiftui','../secret.md',0,execute,'darwin'));
 await symlink('/etc/passwd',join(root,'skills','swiftui','references','unsafe.md'));assert.equal((await readPluginSkill('swiftui','references/unsafe.md',0,execute,'darwin')).status,'unavailable');
 await writeFile(join(root,'skills','swiftui','references','large.md'),'a'.repeat(256001));assert.equal((await readPluginSkill('swiftui','references/large.md',0,execute,'darwin')).status,'unavailable');
});
