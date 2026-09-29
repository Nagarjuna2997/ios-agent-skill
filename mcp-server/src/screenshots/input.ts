import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PNG} from 'pngjs';
import jpeg from 'jpeg-js';
export const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
export async function boundedFile(path:string,max=24*1024*1024){const s=await lstat(path);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error('Expected a bounded regular local file, not a symlink.');const b=await readFile(path);if(b.length>max)throw Error('Input grew beyond limit.');return b;}
export async function imageInput(path:string){
 const bytes=await boundedFile(path);let width=0,height=0,pixels:Buffer;
 if(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a'){
  if(bytes.length<33||bytes.toString('ascii',12,16)!=='IHDR')throw Error('Malformed PNG.');
  width=bytes.readUInt32BE(16);height=bytes.readUInt32BE(20);checkDimensions(width,height);
  for(let p=8;p+12<=bytes.length;){const len=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);if(len>bytes.length-p-12)throw Error('Malformed PNG chunk.');if(['acTL','iCCP'].includes(type))throw Error('Animated/profiled PNG unsupported; supply a static sRGB capture.');p+=len+12;}
  pixels=PNG.sync.read(bytes,{checkCRC:true}).data;
 } else if(bytes[0]===255&&bytes[1]===216){
  // jpeg-js bounds allocation before decoding; orientation metadata must be normalized by the caller.
  if(bytes.includes(Buffer.from('Exif\0\0'))||bytes.includes(Buffer.from('ICC_PROFILE')))throw Error('Normalize JPEG orientation/profile to sRGB before importing.');
  const d=jpeg.decode(bytes,{useTArray:true,maxResolutionInMP:16,maxMemoryUsageInMB:128});width=d.width;height=d.height;checkDimensions(width,height);pixels=Buffer.from(d.data);
 }else throw Error('Unsupported image format. Supply PNG or JPEG, never SVG or a URL.');
 // Flatten only transparency onto white; retain dimensions and record this normalization.
 let transparent=false;
 for(let i=0;i<pixels.length;i+=4){const a=pixels[i+3]!/255;if(a<1)transparent=true;for(let c=0;c<3;c++)pixels[i+c]=Math.round(pixels[i+c]!*a+255*(1-a));pixels[i+3]=255;}
 const png=rgbPNG(width,height,pixels);
 return {width,height,hash:hash(bytes),dataURL:'data:image/png;base64,'+png.toString('base64'),transparent};
}
function checkDimensions(w:number,h:number){if(!w||!h||w>8192||h>8192||w*h>16_000_000)throw Error('Image dimensions exceed the 16 megapixel limit.');}
export function rgbPNG(width:number,height:number,pixels:Uint8Array){const png=new PNG({width,height});png.data=Buffer.from(pixels);return PNG.sync.write(png,{colorType:2,inputColorType:6});}
