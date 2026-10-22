import {join} from 'node:path';
import {randomUUID} from 'node:crypto';

// Keep the raw result bundle in the integrity contract, not just its derived summary.
export async function testEvidence({root,folder,key,journal,runTests,record,exportAttachments,files,expectedTests}) {
 return journal.stage(key,async()=>{
  const tests=await runTests();await record(tests);
  if(tests.status!=='passed'||!Number.isInteger(tests.passed)||tests.passed<1||tests.failed!==0||tests.skipped!==0)throw Error('Native tests failed or unavailable: '+key);
  if(expectedTests!==undefined&&(!Number.isInteger(expectedTests)||expectedTests<1||tests.passed!==expectedTests))throw Error('Native test count differs from fixture contract: '+key);
  const attachments=join(root,key+'-attachments-'+randomUUID());
  const resultBundle=join(folder,tests.resultBundle);
  await exportAttachments(resultBundle,attachments);
  return {value:{tests,attachments},files:[join(folder,tests.logPath),...await files(resultBundle),...await files(attachments)]};
 });
}
