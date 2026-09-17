(() => {
 const input = document.getElementById('guide-search');
 const cards = [...document.querySelectorAll('[data-guide]')];
 const status = document.getElementById('guide-count');
 function filter() {
  const query = input.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const card of cards) {
   card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
   if (!card.hidden) count++;
  }
  status.textContent = `${count} guides${query ? ' match your search' : ' available'}`;
 }
 input.addEventListener('input', filter); filter();
})();
