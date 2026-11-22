import assert from 'node:assert/strict';
import test from 'node:test';
import { comparisonConditions, normalizeSetup } from '../screen-setup.mjs';

const basic = {name:'Checkout',profile:'dark-large',orientation:'portrait',locale:'fr-ca',taps:['open-cart'],visible:'cart-total'};
test('canonicalizes screen setups and isolates saved tap sequences from callers',()=>{
  const input = {...basic,taps:[...basic.taps]};
  const setup = normalizeSetup(input);
  input.taps.pop();
  assert.equal(setup.locale,'fr-CA');
  assert.deepEqual(setup.taps,['open-cart']);
  for(const edit of [{orientation:'unknown'},{locale:'en;cmd'},{profile:'constructor'},{taps:['a.b']},{taps:Array(13).fill('a')},{visible:''},{args:[]}])
    assert.throws(()=>normalizeSetup({...basic,...edit}));
});
test('capture comparisons refuse mixed or different conditions, including navigation order',()=>{
  const before = {udid:'device',captureProfile:{profile:'dark-large'},screenSetup:normalizeSetup(basic)};
  assert.match(comparisonConditions(before,{...before,screenSetup:{...before.screenSetup,name:'Renamed'}}),/same screen setup/);
  for(const edit of [{locale:'en-US'},{orientation:'landscapeRight'},{visible:'total'},{taps:['other-link']}]){
    assert.throws(()=>comparisonConditions(before,{...before,screenSetup:{...before.screenSetup,...edit}}),/settings differ/);
  }
  assert.throws(()=>comparisonConditions(before,{udid:'device'}),/settings differ/);
  assert.throws(()=>comparisonConditions(before,{...before,udid:'different'}),/simulator/);
  assert.match(comparisonConditions({},{}),/not pinned/);
});
