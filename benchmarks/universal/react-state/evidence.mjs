import {join} from 'node:path';
import {randomUUID} from 'node:crypto';

// Keep the raw result bundle in the integrity contract, not just its derived summary.
export async function testEvidence({root,folder,key,journal,runTests,record,exportAttachments,files,expectedTests}) {
 return journal.stage(key,async()=>{
  const tests=await runTests();await record(tests);
  const validTests=tests.status==='passed'&&Number.isInteger(tests.passed)&&tests.passed>0&&tests.failed===0&&tests.skipped===0;
  const attachments=join(root,key+'-attachments-'+randomUUID());
  let exportError;
  let resultBundle;
  if(typeof tests.resultBundle==='string'&&tests.resultBundle){
   resultBundle=join(folder,tests.resultBundle);
   try{await exportAttachments(resultBundle,attachments);await record(tests,{attachments});}
   catch(error){exportError=error;await record(tests,{attachmentError:error.message});}
  }else{
   exportError=Error('Native result bundle unavailable');
   await record(tests,{attachmentError:exportError.message});
  }
  // Failed runs retain screenshots but never get a completed checkpoint. Keep
  // the test failure primary even if xcresult attachment export also failed.
  if(!validTests)throw Error('Native tests failed or unavailable: '+key);
  if(expectedTests!==undefined&&(!Number.isInteger(expectedTests)||expectedTests<1||tests.passed!==expectedTests))throw Error('Native test count differs from fixture contract: '+key);
  if(exportError)throw exportError;
  return {value:{tests,attachments},files:[join(folder,tests.logPath),...await files(resultBundle),...await files(attachments)]};
 });
}
