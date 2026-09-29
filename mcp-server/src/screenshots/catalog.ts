export const profileSource={checked:'2026-09-29',url:'https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications',note:'Accepted pixel profiles, not a determination of which device classes your app must supply. Recheck Apple before submission.'};
export const profiles={
 'iphone-portrait':{width:1260,height:2736,family:'iPhone'},
 'iphone-landscape':{width:2736,height:1260,family:'iPhone'},
 'ipad-portrait':{width:2064,height:2752,family:'iPad'},
 'ipad-landscape':{width:2752,height:2064,family:'iPad'},
} as const;
export type Layout='hero'|'feature'|'split'|'floating'|'card'|'full-bleed'|'comparison'|'multi-device';
export const templates=[
 {id:'minimal',layout:'hero',background:'solid',description:'Centered headline and a generous single device.'},
 {id:'dark-premium',layout:'floating',background:'radial',description:'Dark field, offset typography and floating neutral frame.'},
 {id:'gradient',layout:'feature',background:'gradient',description:'Color gradient, inset headline panel and feature badge.'},
 {id:'editorial',layout:'split',background:'solid',description:'Side-by-side text and screenshot composition.'},
 {id:'feature-card',layout:'card',background:'solid',description:'Layered paper card with contained screenshot.'},
 {id:'full-bleed',layout:'full-bleed',background:'solid',description:'Large contained screenshot with an opaque safe text panel.'},
 {id:'comparison',layout:'comparison',background:'solid',description:'Two explicitly supplied screenshots with equal visual weight.'},
 {id:'multi-device',layout:'multi-device',background:'radial',description:'Two or three supplied screenshots in individual neutral frames.'},
] as const;
export function getTemplate(id:string){const t=templates.find(t=>t.id===id);if(!t)throw Error('Unknown screenshot template. Use list_screenshot_templates.');return {...t,textPositions:t.layout==='split'?['side']:['top'],devicePlacement:t.layout,safeTextRegion:'Inset opaque panel; text never overlays supplied UI.',calloutSupport:true,recommendedCount:[3,6],supportedLayouts:[t.layout]};}
