/** Classify key formats without authenticating or returning their contents. */
export function jwtRole(value:string):string|undefined {
 if(value.length>8192||!/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(value))return;
 try {const data=JSON.parse(Buffer.from(value.split('.')[1],'base64url').toString());return typeof data.role==='string'?data.role:undefined;}catch{return;}
}
export function clientSafeKey(value:string):boolean {return /^sb_publishable_[\w-]+$/.test(value)||jwtRole(value)==='anon';}
export function privilegedKey(value:string):boolean {return /^sb_secret_[\w-]{12,}$/.test(value)||jwtRole(value)==='service_role'||/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(value);}
export function placeholder(value:string):boolean {return !value||/^(?:<.*>|your[_-].*|example|placeholder|changeme|dummy|test|fake|sample|\$\{.*\})$/i.test(value);}
