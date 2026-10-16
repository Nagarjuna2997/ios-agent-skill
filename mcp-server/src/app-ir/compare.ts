import { PNG } from 'pngjs';
import { sha256 } from './schema.js';
export interface Crop { x: number; y: number; width: number; height: number }
function decode(bytes: Buffer): PNG {
  if (bytes.length < 24 || bytes.length > 20_000_000 || bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error('Expected PNG under 20 MB');
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  if (!w || !h || w*h > 16_000_000) throw Error('PNG dimensions exceed pixel budget');
  return PNG.sync.read(bytes);
}
function region(png: PNG, crop?: Crop): Crop {
  const r=crop ?? {x:0,y:0,width:png.width,height:png.height};
  if (!Object.values(r).every(Number.isInteger) || r.x<0 || r.y<0 || r.width<=0 || r.height<=0 || r.x+r.width>png.width || r.y+r.height>png.height) throw Error('Crop is outside PNG');
  return r;
}
/** Raw pixels are evidence, never proof of equivalent behavior or visual quality. No silent resizing. */
export function comparePNGs(reference: Buffer, native: Buffer, crops?: {reference: Crop; native: Crop}) {
  const a=decode(reference),b=decode(native),ar=region(a,crops?.reference),br=region(b,crops?.native);
  if(ar.width!==br.width || ar.height!==br.height) throw Error('Image regions differ in dimensions; provide explicit equal-size crops');
  let error=0,changed=0;
  const diff=new PNG({width:ar.width,height:ar.height});
  for(let y=0;y<ar.height;y++) for(let x=0;x<ar.width;x++) {
    const ai=((ar.y+y)*a.width+ar.x+x)*4,bi=((br.y+y)*b.width+br.x+x)*4,di=(y*ar.width+x)*4;
    let max=0;
    for(let c=0;c<4;c++){const delta=Math.abs(a.data[ai+c]!-b.data[bi+c]!);error+=delta;max=Math.max(max,delta);if(c<3)diff.data[di+c]=delta;}
    diff.data[di+3]=255;if(max>8)changed++;
  }
  return {report:{schemaVersion:1,referenceHash:sha256(reference),nativeHash:sha256(native),referenceRegion:ar,nativeRegion:br,
    meanAbsoluteChannelError:error/(ar.width*ar.height*4*255),changedPixelFraction:changed/(ar.width*ar.height),channelThreshold:8,
    verdict:'requires-review',limitations:['Pixel differences include font rasterization and native control rendering.','No functional, accessibility or perceptual equivalence inferred.','No resizing, registration or hidden cropping performed.']},diff:PNG.sync.write(diff)};
}
