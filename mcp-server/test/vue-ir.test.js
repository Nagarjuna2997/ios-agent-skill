import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vueToIR} from '../dist/app-ir/vue.js';
import {htmlToIR} from '../dist/app-ir/html.js';
import {sha256} from '../dist/app-ir/schema.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const markup='<main style="padding:20px"><h1>🌲 Café</h1><details><summary>More</summary><p>Walk outside</p></details></main>';
test('Vue static template reuses HTML IR and native generator with original Unicode provenance',()=>{
 const source='<!-- 🌲 -->\n<template>\n'+markup+'\n</template>\n';const ir=vueToIR(source);
 assert.equal(ir.sources[0].adapter,'vue-static@1');assert.equal(ir.sources[0].sha256,sha256(source));assert.equal(ir.limitations.length,0);
 assert.equal(renderSwiftUI(ir).source,renderSwiftUI(htmlToIR('\n'+markup+'\n','App.vue')).source);
 const heading=ir.nodes.find(n=>n.text==='🌲 Café');const range=heading.evidence[0];assert.equal(Buffer.from(source).subarray(range.start,range.end).toString(),'<h1>🌲 Café</h1>');
 assert.deepEqual(vueToIR(source),ir);
});
for(const [name,source] of Object.entries({script:'<template><p>Hi</p></template><script setup>throw Error("never run")</script>',css:'<template><p>Hi</p></template><style>p{color:red}</style>',multiple:'<template><p>A</p></template><template><p>B</p></template>',external:'<template src="./secret.html"></template>',pug:'<template lang="pug">p Hi</template>',unclosed:'<template><p>Hi</p>',interpolation:'<template><p>{{ secret }}</p></template>',outside:'executeMe()<template><p>Hi</p></template>'}))test(`Vue rejects unsupported ${name}`,()=>assert.throws(()=>vueToIR(source)));
for(const attribute of ['v-if="ready"','v-for="x in items"',':style="styles"','@click="save"','v-html="unsafe"','v-model="name"'])test(`Vue rejects generation for directive ${attribute}`,()=>{
 const ir=vueToIR(`<template><p ${attribute}>Hello</p></template>`);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir));
});
test('Vue custom components and nested slot templates are not silently flattened',()=>{
 for(const child of ['<widget-card></widget-card>','<template #default><p>Slot</p></template>']){const ir=vueToIR(`<template><main>${child}</main></template>`);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir));}
});

test('PascalCase components cannot become lowercase HTML tags',()=>{for(const tag of ['Main','P','Details','MyCard'])assert.throws(()=>vueToIR(`<template><${tag}>Component</${tag}></template>`),/component tags/);});
test('Vue CLI inspect produces validated IR from the checked-in fixture',async()=>{
 const {spawnSync}=await import('node:child_process');
 const r=spawnSync(process.execPath,['dist/unified.js','app-ir','inspect-vue','../benchmarks/universal/vue-static/App.vue','QuietWalk'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);const ir=JSON.parse(r.stdout);assert.equal(ir.name,'QuietWalk');assert.equal(ir.sources[0].adapter,'vue-static@1');assert.equal(ir.limitations.length,0);assert.match(renderSwiftUI(ir).source,/A quiet afternoon/);
});

test('Vue rejects implied endings, unmatched closings and HTML reparenting',()=>{
 for(const source of ['<template><p>Hello</template>','<template><main><p>Hello</p></Other></main></template>','<template><p style="color:#FF0000"><div>Red in Vue</div></p></template>','<template><main><p>A</p></main></template></main>'])assert.throws(()=>vueToIR(source));
});
test('Vue tokenizer preserves quoted angle brackets and comments without treating them as tags',()=>{
 const ir=vueToIR('<template><!-- <p>fake</p> --><main><p id="a>b">Literal &lt;tag&gt;</p></main></template>');assert.equal(ir.limitations.length,0);assert.ok(ir.nodes.some(n=>n.text==='Literal <tag>'));
});
