import test from 'node:test';
import assert from 'node:assert/strict';
import {applyUIKitCandidate} from './uikit-candidate.mjs';
import {importHTML} from '../../../mcp-server/dist/app-ir/html.js';
import {renderSwiftUI} from '../../../mcp-server/dist/app-ir/swiftui.js';
import {fileURLToPath} from 'node:url';
const ir=await importHTML(fileURLToPath(new URL('../html-disclosure/index.html',import.meta.url)),'FieldNotes');
const original=renderSwiftUI(ir,{instrumentTypography:true}).source;
test('benchmark patch preserves original and resolves source tokens without matching heading words',async()=>{
 const changed=structuredClone(ir);changed.nodes.find(n=>n.id==='node-5').text='Different quoted "words" and punctuation!';
 const source=renderSwiftUI(changed,{instrumentTypography:true}).source;
 const output=await applyUIKitCandidate(source,changed,['node-5']);
 assert.ok(output.includes('Different quoted \\"words\\" and punctuation!'));
 assert.ok(output.includes('color: UIColor(red: 0.1411764705882353'));
 assert.ok(output.includes('size: scaled_node_node_5'));
 assert.equal(renderSwiftUI(ir,{instrumentTypography:true}).source,original);
 assert.ok(!original.includes('FidelityNativeText'));
});
test('invalid selections and stale generated expressions fail closed',async()=>{
 for(const ids of [[],['node-5','node-5'],['node-999'],['node-1']])await assert.rejects(applyUIKitCandidate(original,ir,ids));
 await assert.rejects(applyUIKitCandidate('import SwiftUI',ir,['node-5']));
});
test('explicit-size regular text does not acquire ancestor bold weight',async()=>{
 const changed=structuredClone(ir);const node=changed.nodes.find(n=>n.id==='node-5');delete node.style.bold;
 changed.nodes.find(n=>n.children.includes(node.id)).style.bold=true;
 const output=await applyUIKitCandidate(renderSwiftUI(changed,{instrumentTypography:true}).source,changed,['node-5']);
 assert.ok(output.includes('size: scaled_node_node_5, bold: false'));
});
