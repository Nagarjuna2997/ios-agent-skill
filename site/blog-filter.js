(() => {
  const filters = document.querySelector('.blog-filters');
  if (!filters) return;
  const buttons = [...filters.querySelectorAll('button[data-category]')];
  const cards = [...document.querySelectorAll('[data-article-category]')];
  const status = document.getElementById('blog-result-count');
  function select(category) {
    let count = 0;
    for (const card of cards) {
      card.hidden = category !== 'All' && card.dataset.articleCategory !== category;
      if (!card.hidden) count++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.category === category));
    status.textContent = `${count} ${count === 1 ? 'article' : 'articles'}${category === 'All' ? ' across all categories' : ` in ${category}`}`;
  }
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (button && filters.contains(button)) select(button.dataset.category);
  });
  filters.hidden = false;
  select('All');
})();
