(() => {
  const root = document.querySelector('#community');
  if (!root) return;
  const input = root.querySelector('#mention-search');
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const groups = [...root.querySelectorAll('.mention-group')];
  let category = 'All';
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const group of groups) {
      let visible = 0;
      for (const card of group.querySelectorAll('.card')) {
        const match = (category === 'All' || category === group.getAttribute('aria-label')) && card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible++;
      }
      group.hidden = !visible;
      count += visible;
    }
    root.querySelector('#mention-count').textContent = `${count} verified ${count === 1 ? 'mention' : 'mentions'}`;
    root.querySelector('#mention-empty').hidden = count !== 0;
  };
  for (const button of buttons) button.addEventListener('click', () => {
    category = button.dataset.filter;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    update();
  });
  input.addEventListener('input', update);
  root.querySelector('.community-tools').hidden = false;
  update();
})();
