import test from 'node:test';
import assert from 'node:assert/strict';
import {allProbeCapturesInvariant} from './probe-integrity.mjs';
test('both sizes must have exact-zero measurement interference',()=>{
 const row={large:{probeComparison:{meanAbsoluteChannelError:0}},xxxl:{probeComparison:{meanAbsoluteChannelError:0}}};
 assert.equal(allProbeCapturesInvariant(row),true);
 row.xxxl.probeComparison.meanAbsoluteChannelError=0.0000001;
 assert.equal(allProbeCapturesInvariant(row),false);
 delete row.xxxl;assert.equal(allProbeCapturesInvariant(row),false);
});
