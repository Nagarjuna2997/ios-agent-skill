export type LocalFile = {path:string;title:string;kind:string;hash:string;characters:number;headings:{title:string;offset:number}[]};
export type Library = {schemaVersion:number;files:LocalFile[];blobs:Record<string,string>};
export function buildLibrary(root:string):Library;
export function searchLibrary(library:Library,query:string,limit?:number,kind?:string):{path:string;title:string;kind:string;characters:number;score:number}[];
export function readLibrary(library:Library,path:string,offset?:number,maxChars?:number):object;
