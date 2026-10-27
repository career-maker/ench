// Gallery: category filter chips + accessible lightbox (native <dialog>, arrows, Esc, swipe).
function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const dialog = document.querySelector('.lightbox');
  if (!grid || !dialog) return;
  document.documentElement.classList.add('js-gallery');
  const items = [...grid.querySelectorAll('.gallery__item')];
  const chips = [...document.querySelectorAll('.gallery__chip')];
  const empty = document.querySelector('.gallery__empty');
  const img = dialog.querySelector('.lightbox__img');
  const text = dialog.querySelector('.lightbox__text');
  const count = dialog.querySelector('.lightbox__count');
  let visible = items;
  let index = 0;
  let opener = null;

  const applyFilter = (key) => {
    chips.forEach((c) => {
      const on = c.dataset.filter === key;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    items.forEach((it) => {
      const show = key === 'all' || it.dataset.cat === key;
      it.hidden = !show;
      it.classList.remove('is-in');
      if (show) requestAnimationFrame(() => requestAnimationFrame(() => it.classList.add('is-in')));
    });
    visible = items.filter((it) => !it.hidden);
    if (empty) empty.hidden = visible.length > 0;
  };
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));

  // staggered entrance as tiles scroll into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.08 });
    items.forEach((it, i) => { it.style.setProperty('--d', `${(i % 6) * 70}ms`); io.observe(it); });
  } else {
    items.forEach((it) => it.classList.add('is-in'));
  }

  const show = (i) => {
    index = (i + visible.length) % visible.length;
    const btn = visible[index].querySelector('.gallery__btn');
    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.src = btn.dataset.full;
    img.alt = btn.querySelector('img').alt;
    text.textContent = '';
    count.textContent = `${index + 1} / ${visible.length}`;
  };
  const open = (btn) => {
    opener = btn;
    index = Math.max(0, visible.indexOf(btn.closest('.gallery__item')));
    show(index);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.body.classList.add('is-lightbox');
  };
  const close = () => {
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  };
  grid.addEventListener('click', (e) => { const b = e.target.closest('.gallery__btn'); if (b) open(b); });
  dialog.addEventListener('close', () => { document.body.classList.remove('is-lightbox'); if (opener) opener.focus(); });
  dialog.querySelector('.lightbox__close').addEventListener('click', close);
  dialog.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lightbox__nav--next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // click on backdrop
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  let startX = 0;
  dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}
