import {docsService,searchSDK} from './service.js';
import {discover} from './discovery.js';
// Never forward raw compiler output. Only documented SDK symbol candidates leave this process.
export function diagnosticSymbols(text:string){return [...new Set([...text.matchAll(/(?:cannot find|has no member|unavailable:|renamed to)\s+['"]([A-Za-z][A-Za-z0-9_]{2,80})['"]/g)].map(x=>x[1]))].slice(0,3);}
export async function groundRepair(outputs:string[]){
 const symbols=diagnosticSymbols(outputs.join('\n'));if(!symbols.length)return [];
 const i=await discover();const x=i.installations.find(x=>x.active);if(!x)return [];
 const results:unknown[]=[];
 for(const symbol of symbols)for(const framework of ['SwiftUI','UIKit','AppKit','Foundation','StoreKit','RealityKit']){
 if((await searchSDK(x.developer,symbol,framework)).length){results.push(await docsService.query({query:framework+'.'+symbol,framework,online:false},'availability'));break;}}
 return results;
}
