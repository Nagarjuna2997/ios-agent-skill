import {writeFileSync} from 'node:fs';
import {generateColorSystem} from '../../mcp-server/dist/colors/generate.js';
const palette=generateColorSystem({description:'Minimal finance app for young professionals',category:'finance',mood:['calm','trustworthy','premium'],family:'Blue'});
writeFileSync(new URL('./Sources/ColorSystem/palette.json',import.meta.url),JSON.stringify(palette,null,2)+'\n');
writeFileSync(new URL('./design-tokens.json',import.meta.url),JSON.stringify(palette.assetTokens,null,2)+'\n');
