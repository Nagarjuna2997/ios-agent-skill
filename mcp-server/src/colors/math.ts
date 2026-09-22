/** sRGB output; OKLab matrices from Björn Ottosson's published OKLab definition. */
export type RGB = [number, number, number];
export type LCH = [number, number, number];
export function rgb(hex: string): RGB {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error('Expected opaque sRGB #RRGGBB.');
  return [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255) as RGB;
}
export const linear = (c: number): number => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4;
const encoded = (c: number): number => c <= .0031308 ? 12.92*c : 1.055*c**(1/2.4)-.055;
export function hex(values: RGB): string { return '#'+values.map(c => Math.round(Math.max(0,Math.min(1,c))*255).toString(16).padStart(2,'0')).join('').toUpperCase(); }
export function luminance(color: string): number { const [r,g,b]=rgb(color).map(linear);return .2126*r+.7152*g+.0722*b; }
export function contrast(a: string,b: string): number {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function toLCH(color: string): LCH {
 const [r,g,b]=rgb(color).map(linear);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 const L=.2104542553*l+.793617785*m-.0040720468*s,a=1.9779984951*l-2.428592205*m+.4505937099*s,bb=.0259040371*l+.7827717662*m-.808675766*s;
 return [L,Math.hypot(a,bb),(Math.atan2(bb,a)*180/Math.PI+360)%360];
}
function raw([L,C,H]:LCH):RGB {
 const a=C*Math.cos(H*Math.PI/180),b=C*Math.sin(H*Math.PI/180);
 const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
 return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];
}
export function fromLCH(L:number,C:number,H:number):string {
 if (![L,C,H].every(Number.isFinite)||L<0||L>1||C<0) throw new Error('Invalid OKLCH components.');
 let lo=0,hi=C;
 const inGamut=(c:number)=>raw([L,c,H]).every(x=>x>=-1e-7&&x<=1+1e-7);
 if (!inGamut(C)) {for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(inGamut(mid))lo=mid;else hi=mid;}C=lo;}
 return hex(raw([L,C,H]).map(encoded) as RGB);
}
export function legible(seed:string,backgrounds:string[],minimum:number):string {
 if(backgrounds.every(b=>contrast(seed,b)>=minimum))return seed;
 const [L,C,H]=toLCH(seed);let best:string|undefined,distance=Infinity;
 for(let i=0;i<=1000;i++){const light=i/1000,color=fromLCH(light,C,H);if(Math.abs(light-L)<distance&&backgrounds.every(b=>contrast(color,b)>=minimum)){best=color;distance=Math.abs(light-L);}}
 if(!best)throw new Error('No single foreground meets contrast on all requested backgrounds.');return best;
}
export function onColor(bg:string):string{return contrast('#FFFFFF',bg)>=contrast('#000000',bg)?'#FFFFFF':'#000000';}
export const TONES=[50,100,200,300,400,500,600,700,800,900,950] as const;
export function scale(seed:string):Record<string,string>{const [,C,H]=toLCH(seed);return Object.fromEntries(TONES.map((t,i)=>[t,fromLCH([.98,.95,.89,.82,.73,.64,.54,.44,.34,.24,.15][i],C*Math.sin(Math.PI*(i+1)/12),H)]));}
