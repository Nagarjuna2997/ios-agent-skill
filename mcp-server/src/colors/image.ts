import {lstat,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {hex} from './math.js';
const require=createRequire(import.meta.url);
// Reuse the already bundled asset CLI's PNG decoder; no extra image service.
const decoder=createRequire(require.resolve('@nagarjuna2002/ios-agent/dist/index.js')).resolve('pngjs');
/** Explicit local PNG only; bound dimensions before the decoder allocates pixels. */
export async function samplePNG(path:string){
 const info=await lstat(path);
 if(!info.isFile()||info.isSymbolicLink()||info.size>4*1024*1024)throw Error('Use a regular PNG file under 4 MiB, not a symlink.');
 const data=await readFile(path);
 if(data.length<33||data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||data.toString('ascii',12,16)!=='IHDR'||data.readUInt32BE(8)!==13)throw Error('Expected PNG.');
 const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
 if(!width||!height||width>1024||height>1024)throw Error('PNG dimensions must be at most 1024 × 1024.');
 // Profiles require color-managed conversion, which this decoder does not perform.
 for(let i=8;i+12<=data.length;){const length=data.readUInt32BE(i),type=data.toString('ascii',i+4,i+8);if(length>data.length-i-12)throw Error('Malformed PNG chunk.');if(type==='IHDR'&&i!==8)throw Error('Duplicate PNG header.');if(type==='acTL')throw Error('Animated PNG is unsupported.');if(type==='iCCP'||type==='cHRM')throw Error('Convert the image to unprofiled sRGB PNG before sampling.');if(type==='gAMA'&&length===4&&Math.abs(data.readUInt32BE(i+8)-45455)>2)throw Error('Unsupported PNG gamma; convert to sRGB.');i+=length+12;}
 const png=require(decoder).PNG.sync.read(data) as {width:number;height:number;data:Buffer};
 const colors=new Map<string,number>();
 const step=Math.max(1,Math.ceil(width*height/16384));
 for(let pixel=0;pixel<width*height;pixel+=step){const i=pixel*4;if(png.data[i+3]!==255)continue;const c=hex([png.data[i]/255,png.data[i+1]/255,png.data[i+2]/255]);colors.set(c,(colors.get(c)||0)+1);}
 return [...colors].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,4096).map(([color,weight])=>({color,weight}));
}
