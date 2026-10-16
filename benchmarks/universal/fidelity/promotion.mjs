import {seedKnownGood} from '../../../mcp-server/dist/app-ir/known-good.js';
// Reference review and permission to promote are separate decisions.
export function promotionRequested(value){
 if(value===undefined||value==='')return false;
 if(value==='1')return true;
 throw Error('FIDELITY_PROMOTE_KNOWN_GOOD must be omitted or explicitly 1');
}
export function authorizedKnownGood(requested,evidence,policy,approval){
 if(requested!==true)return null;
 return seedKnownGood(evidence,policy,approval);
}
