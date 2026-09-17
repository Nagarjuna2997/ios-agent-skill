'use strict';
(() => {
  const controls = [...document.querySelectorAll('.appearance-toggle')];
  if (!controls.length) return;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { preference = localStorage.getItem('ios-agent-appearance'); } catch {}
  let dark = preference === 'dark' || (preference !== 'light' && system.matches);
  function render() {
    document.documentElement.dataset.appearance = dark ? 'dark' : 'light';
    for (const control of controls) {
      control.setAttribute('aria-pressed', String(dark));
      control.setAttribute('aria-label', dark ? 'Use light appearance' : 'Use dark appearance');
      control.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      const symbol = document.createElement('span');
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = dark ? '☀' : '☾';
      control.replaceChildren(symbol);
      control.hidden = false;
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101113' : '#f5f5f7');
  }
  render();
  for (const control of controls) control.addEventListener('click', () => {
    dark = !dark;
    preference = dark ? 'dark' : 'light';
    render();
    try { localStorage.setItem('ios-agent-appearance', preference); } catch {}
  });
  system.addEventListener('change', () => { if (!preference) { dark = system.matches; render(); } });
  window.addEventListener('storage', event => {
    if (event.key !== 'ios-agent-appearance') return;
    preference = event.newValue;
    dark = preference === 'dark' || (preference !== 'light' && system.matches);
    render();
  });
})();
