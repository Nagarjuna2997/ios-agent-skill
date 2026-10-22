import { z } from 'zod';

const Manifest=z.array(z.object({testIdentifier:z.string(),attachments:z.array(z.object({
 exportedFileName:z.string(),suggestedHumanReadableName:z.string(),deviceId:z.string(),isAssociatedWithFailure:z.boolean()
}))}));
/** Require one successful, pinned-device capture from the test that asserts app state.
 * Never substitute a generic simulator screenshot or an attachment from another test.
 */
export function selectVerifiedCapture(value:unknown,deviceId:string,testStatus:string,kind: 'collapsed'|'typography' = 'collapsed'):string {
 if(testStatus!=='passed')throw Error('Capture requires passing native tests');
 const captures=Manifest.parse(value).filter(t=>t.testIdentifier==='InteractionTests/testMeasuredGeometry()')
  .flatMap(t=>t.attachments).filter(a=>a.suggestedHumanReadableName.startsWith('verified-'+kind+'_'));
 if(captures.length!==1)throw Error('Expected exactly one verified collapsed-state capture');
 const capture=captures[0];
 if(capture.deviceId!==deviceId||capture.isAssociatedWithFailure)throw Error('Capture device or test outcome mismatch');
 if(!/^[a-zA-Z0-9-]+\.png$/.test(capture.exportedFileName))throw Error('Invalid exported capture filename');
 return capture.exportedFileName;
}
