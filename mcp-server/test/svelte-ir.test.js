import {test} from 'node:test';
import assert from 'node:assert/strict';
import {svelteToIR} from '../dist/app-ir/svelte.js';
import {htmlToIR} from '../dist/app-ir/html.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
test('static Svelte shares native output with HTML and preserves original byte ranges',()=>{
 const source='<main style="padding:20px"><h1>🌲 Café</h1><details><summary>Route</summary><p>Walk slowly</p></details></main>';
 const ir=svelteToIR(source);assert.equal(ir.sources[0].adapter,'svelte-static@1');assert.equal(renderSwiftUI(ir).source,renderSwiftUI(htmlToIR(source)).source);
 const e=ir.nodes.find(n=>n.text==='🌲 Café').evidence[0];assert.equal(Buffer.from(source).subarray(e.start,e.end).toString(),'<h1>🌲 Café</h1>');
});
for(const source of ['<script>throw Error("never run")</script><p>Hello</p>','<style>p {color:red}</style><p>Hello</p>','<p>{name}</p>','{#if visible}<p>Hi</p>{/if}','<p title={value}>Hi</p>','<MyCard></MyCard>','<p>Hi','<p><div>Reparent</div></p>'])test('Svelte rejects '+source,()=>assert.throws(()=>svelteToIR(source)));
for(const attr of ['on:click="save"','bind:value="name"','use:action','class:active="yes"','transition:fade','animate:flip'])test('Svelte directive blocks generation: '+attr,()=>{const ir=svelteToIR(`<main ${attr}><p>Hello</p></main>`);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir));});
test('Svelte special elements and assets cannot be silently discarded',()=>{for(const source of ['<svelte:head><p>Title</p></svelte:head>','<svelte:component></svelte:component>','<img src="remote.png">']){const ir=svelteToIR(source);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir));}});
test('encoded literal braces remain literal text',()=>{const ir=svelteToIR('<p>&#123;literal&#125;</p>');assert.equal(ir.limitations.length,0);assert.ok(ir.nodes.some(n=>n.text==='{literal}'));});
