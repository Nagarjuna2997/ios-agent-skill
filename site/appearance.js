'use strict';
(() => {
  const control=document.querySelector('.appearance-toggle');
  if(!control)return;
  let dark=false;
  try {dark=localStorage.getItem('ios-agent-appearance')==='dark';}catch{}
  function render(){
    document.documentElement.dataset.appearance=dark?'dark':'light';
    control.setAttribute('aria-pressed',String(dark));
    control.setAttribute('aria-label',dark?'Use light appearance':'Use dark appearance');
    control.querySelector('img').src=`assets/icons/${dark?'sun':'moon'}.svg`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#101113':'#f5f5f7');
  }
  render();control.hidden=false;
  control.addEventListener('click',()=>{dark=!dark;render();try{localStorage.setItem('ios-agent-appearance',dark?'dark':'light');}catch{}});
})();
