import {readFile} from 'node:fs/promises';
import {swiftString} from '../../../mcp-server/dist/app-ir/swiftui.js';
export async function applyUIKitCandidate(source,ir,ids){
 if(!ids.length||new Set(ids).size!==ids.length)throw Error('Select distinct text node IDs');
 const parents=new Map();for(const node of ir.nodes)for(const child of node.children)parents.set(child,node);
 for(const id of ids){
  const node=ir.nodes.find(n=>n.id===id);if(!node||node.kind!=='text'||!node.style.fontSize)throw Error('Candidate requires a text node with explicit scaled size');
  const chain=[];for(let n=node;n;n=parents.get(n.id))chain.unshift(n);
  const inherited=Object.assign({},...chain.map(n=>Object.fromEntries(Object.entries(n.style).filter(([k])=>['foreground','bold','centered'].includes(k)))));
  if(!inherited.foreground)throw Error('Candidate requires resolved source color');
  const hex=inherited.foreground;const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const old=`MeasuredText(nodeID: ${swiftString(id)}, content: ${swiftString(node.text)})`;
  if(source.split(old).length!==2)throw Error('Expected exactly one generated text expression');
  source=source.replace(old,`FidelityNativeText(nodeID: ${swiftString(id)}, content: ${swiftString(node.text)}, size: scaled_node_${id.replaceAll('-','_')}, bold: ${!!node.style.bold}, color: UIColor(red: ${rgb[0]}, green: ${rgb[1]}, blue: ${rgb[2]}, alpha: 1), centered: ${!!inherited.centered})`);
 }
 return source.replace('import SwiftUI','import SwiftUI\nimport UIKit')+'\n'+await readFile(new URL('./UIKitText.swift',import.meta.url),'utf8');
}
