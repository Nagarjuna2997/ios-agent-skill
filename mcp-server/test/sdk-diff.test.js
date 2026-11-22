import test from 'node:test';
import assert from 'node:assert/strict';
import { diffSDKs, parseGraph, compareGraphs } from '../dist/apple-docs/sdk-diff.js';
import { exampleMatcher } from '../dist/knowledge.js';

const symbol = (id, name, signature, availability = []) => ({
  identifier: { precise: id }, pathComponents: ['Product', name],
  declarationFragments: [{ spelling: signature }], availability,
});
const graph = (...symbols) => parseGraph({ module: { name: 'StoreKit' }, symbols }, 'StoreKit');

test('paired SDK graphs identify signature and availability changes, removals and additions', () => {
  const old = graph(symbol('s:1','buy()','func buy()'),symbol('s:2','legacy','var legacy: Bool'),
    symbol('s:4','renew','func renew()'));
  const fresh = graph(symbol('s:1','buy()','func buy() async'),symbol('s:3','group','var group: Bool'),
    symbol('s:4','renew','func renew()', [{domain:'iOS',deprecated:{major:27}}]));
  const result = compareGraphs(old,fresh,0,t => t === 'legacy' ? ['samples/Store/Example.swift'] : []);
  assert.deepEqual(result.totals, {added:1,removed:1,changed:2});
  assert.deepEqual(result.changes.find(x => x.id === 's:2').exampleCandidates, ['samples/Store/Example.swift']);
  assert.equal(result.changes.find(x => x.id === 's:4').after.availability[0].deprecated.major,27);
  assert.equal(result.nextOffset,null);
});

test('availability reordering and object key ordering do not invent changes', () => {
  const a = [{domain:'iOS',introduced:{major:17,minor:1}},{domain:'tvOS',isUnconditionallyUnavailable:true}];
  const b = [a[1],{introduced:{minor:1,major:17},domain:'iOS'}];
  assert.deepEqual(compareGraphs(graph(symbol('sym','buy','func buy()',a)),
    graph(symbol('sym','buy','func buy()',b)),0,()=>[]).changes,[]);
});

test('deterministic pages preserve full counts and cap output', () => {
  const values = Array.from({length:30},(_,i)=>symbol('s:'+i,'f'+i,'func f'+i+'()'));
  const first = compareGraphs(graph(),graph(...values),0,()=>[]);
  const second = compareGraphs(graph(),graph(...values.reverse()),first.nextOffset,()=>[]);
  assert.equal(first.changes.length,24);
  assert.equal(second.nextOffset,null);
  assert.equal(second.totals.added,30);
  assert.equal(new Set([...first.changes,...second.changes].map(x=>x.id)).size,30);
});

test('invalid, ambiguous, or unavailable installations cannot manufacture a comparison',async()=>{
  const options={framework:'StoreKit',from:'Xcode.app',to:'Other.app'};
  assert.equal((await diffSDKs([],options)).status,'needs_distinct_installations');
  await assert.rejects(diffSDKs([],{...options,framework:'../private'}));
  assert.throws(()=>parseGraph({module:{name:'UIKit'},symbols:[]},'StoreKit'),/Unexpected/);
});

test('example candidates use exact Swift identifiers and per-framework imports',()=>{
  const candidates = exampleMatcher('StoreKit');
  assert.ok(candidates('supportsMultiSeatPurchase').some(p=>p.endsWith('/GroupSubscription.swift')));
  assert.deepEqual(candidates('portsMultiSeatPurchase'),[]);
});
