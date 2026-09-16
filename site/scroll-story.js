'use strict';
(() => {
  const story=document.getElementById('story');
  if(!story)return;
  const steps=[...story.querySelectorAll('[data-story-step]')];
  const slides=[...story.querySelectorAll('[data-story-slide]')];
  const links=[...story.querySelectorAll('[data-chapter-link]')];
  const desktop=matchMedia('(min-width:901px) and (min-height:681px) and (prefers-reduced-motion:no-preference)');
  let frame=0;
  function update(){
    frame=0;
    // Normal page scroll controls the story; never intercept wheel, touch or keyboard.
    const target=innerHeight*.48;
    let active=0,nearest=Infinity;
    steps.forEach((step,index)=>{const rect=step.getBoundingClientRect();const distance=Math.abs(rect.top+rect.height/2-target);if(distance<nearest){nearest=distance;active=index;}});
    steps.forEach((step,index)=>step.classList.toggle('is-current',index===active));
    slides.forEach((slide,index)=>slide.classList.toggle('is-active',index===active));
    links.forEach((link,index)=>{if(index===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function mode(){story.classList.toggle('story-enhanced',desktop.matches);schedule();}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  desktop.addEventListener('change',mode);
  mode();
})();
