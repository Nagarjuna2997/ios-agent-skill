/** Original vector share cards; regenerate with node scripts/site-discovery/render-series-images.mjs. */
import {Resvg} from '@resvg/resvg-js';
import {fs,path,SITE,esc} from './lib.mjs';
const cards=[
 ['Orientation','Start with a checkable idea.','#3978dc',['IDEA','BRIEF','EVIDENCE']],
 ['Your first app','One screen. One working loop.','#437b60',['SCREEN','BUILD','SIMULATOR']],
 ['Reliable agents','Give every claim a checkpoint.','#795ac0',['PLAN','CHECK','REPAIR']],
 ['Real features','Connect behavior to data.','#25838a',['VIEW','STATE','STORE']],
 ['Design & assets','Turn visual decisions into tokens.','#d16a46',['COLOR','TYPE','ASSETS']],
 ['Quality & testing','Make success observable.','#46764b',['UNIT','UI','EVIDENCE']],
 ['Shipping','Take a verified build to release.','#385db0',['ARCHIVE','VALIDATE','RELEASE']],
 ['Pro workflows','Coordinate work without losing context.','#995774',['BRANCH','REVIEW','INTEGRATE']],
 ['Tips & tricks','Smaller steps. Better feedback.','#a27720',['FOCUS','INSPECT','REFINE']]
];
const out=path.join(SITE,'assets/series');fs.mkdirSync(out,{recursive:true});
for(const [n,[title,subtitle,color,labels]] of cards.entries()){
 const shapes=[
 '<circle cx="940" cy="258" r="112" fill="none" stroke="currentColor" stroke-width="4"/><path d="m940 160 30 100-30 96-30-96Z" fill="currentColor"/>',
 '<rect x="859" y="121" width="162" height="274" rx="30" fill="white" stroke="currentColor" stroke-width="8"/><rect x="895" y="140" width="90" height="12" rx="6" fill="currentColor"/><path d="m898 262 29 29 58-65" fill="none" stroke="currentColor" stroke-width="10"/>',
 '<path d="M870 194a92 92 0 1 1-14 112M852 152l18 42 43-18" fill="none" stroke="currentColor" stroke-width="12"/><path d="m910 257 25 27 45-53" fill="none" stroke="currentColor" stroke-width="9"/>',
 '<path d="M870 204h140M940 204v110" stroke="currentColor" stroke-width="8"/><rect x="819" y="154" width="90" height="90" rx="20" fill="currentColor"/><rect x="970" y="154" width="90" height="90" rx="20" fill="currentColor" opacity=".65"/><rect x="896" y="290" width="90" height="90" rx="20" fill="currentColor" opacity=".4"/>',
 '<rect x="825" y="160" width="155" height="195" rx="24" fill="currentColor" transform="rotate(-15 900 250)"/><rect x="915" y="173" width="135" height="195" rx="24" fill="#f5b38c" transform="rotate(12 980 270)"/><circle cx="981" cy="230" r="30" fill="#fff5df"/><path d="M951 295h62m-62 24h44" stroke="#654333" stroke-width="7"/>',
 '<rect x="843" y="146" width="196" height="220" rx="24" fill="white" stroke="currentColor" stroke-width="5"/>'+[205,260,315].map(y=>`<path d="m871 ${y} 12 12 23-29m22 10h73" fill="none" stroke="currentColor" stroke-width="7"/>`).join(''),
 '<path d="m837 218 103-59 103 59v121l-103 59-103-59Z" fill="currentColor" opacity=".8"/><path d="m837 218 103 59 103-59m-103 59v121m-52-208 104 59" fill="none" stroke="#fff" stroke-width="5"/>',
 '<path d="M853 187h167v142H853Zm0 0 167 142m0-142L853 329" fill="none" stroke="currentColor" stroke-width="5"/>'+[[853,187],[1020,187],[853,329],[1020,329]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="28" fill="currentColor"/>`).join(''),
 '<path d="M905 307c0-32-53-54-53-105a88 88 0 0 1 176 0c0 51-53 73-53 105Zm0 25h70m-57 26h44" fill="none" stroke="currentColor" stroke-width="9"/><path d="m936 180-24 46h39l-14 40" fill="none" stroke="currentColor" stroke-width="8"/>'
 ];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f5f3ed"/><circle cx="950" cy="260" r="230" fill="${color}" opacity=".08"/><g font-family="Arial, Helvetica, sans-serif"><text x="64" y="80" font-size="19" letter-spacing="3" fill="#66645e">iOS AGENT SKILL / GUIDED SERIES</text><text x="64" y="185" font-size="22" fill="${color}">LEVEL ${n.toString().padStart(2,'0')}</text><text x="64" y="259" font-size="53" font-weight="700" fill="#202320">${esc(title)}</text><text x="64" y="315" font-size="25" fill="#5c625c">${esc(subtitle)}</text><g color="${color}">${shapes[n]}</g>${labels.map((label,i)=>`<rect x="${64+i*365}" y="465" width="330" height="88" rx="22" fill="white"/><circle cx="${96+i*365}" cy="509" r="13" fill="${color}"/><text x="${123+i*365}" y="517" font-size="20" fill="#343a34">${label}</text>${i<2?`<path d="m${405+i*365} 509h14m-5-5 5 5-5 5" fill="none" stroke="${color}" stroke-width="2"/>`:''}`).join('')}</g></svg>`;
 fs.writeFileSync(path.join(out,`level-${n}.svg`),svg);
 fs.writeFileSync(path.join(out,`level-${n}.png`),new Resvg(svg).render().asPng());
}
console.log('Rendered nine level-specific 1200×630 share cards.');
