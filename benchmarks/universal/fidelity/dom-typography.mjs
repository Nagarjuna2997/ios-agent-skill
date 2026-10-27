// Executed in the local, script-free reference document. No OCR or inserted word spans.
export async function captureDOMTypography(page){
 return page.evaluate(()=>{
  const regions=[];
  for(const element of document.querySelectorAll('[data-app-ir-node]')){
   let hidden=false;
   for(let parent=element.parentElement;parent;parent=parent.parentElement){
    if(parent.tagName==='DETAILS'&&!parent.open&&element!==parent.querySelector(':scope > summary'))hidden=true;
   }
   if(hidden||!element.getClientRects().length)continue;
   if(element.childNodes.length!==1||element.firstChild.nodeType!==Node.TEXT_NODE)throw Error('Expected a plain-text region');
   const text=element.textContent,words=[...text.matchAll(/\S+/g)],lines=[];
   let y=null;
   for(const [index,word] of words.entries()){
    const range=document.createRange();range.setStart(element.firstChild,word.index);range.setEnd(element.firstChild,word.index+word[0].length);
    const rects=[...range.getClientRects()];if(rects.length!==1)throw Error('Split source word is unsupported');
    if(y===null||Math.abs(rects[0].top-y)>0.5){lines.push([]);y=rects[0].top;}
    lines.at(-1).push(index);
   }
   regions.push({id:element.getAttribute('data-app-ir-node'),text:words.map(w=>w[0]).join(' '),lines,truncated:false});
  }
  return {version:1,regions};
 });
}
