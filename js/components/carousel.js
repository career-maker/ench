// Generic scroll-snap carousel: prev/next arrows (hidden when nothing overflows),
// auto-advance on small screens, pause on hover/touch/focus, respects reduced motion.
function initCarousels() {
  // A grid marked data-auto-carousel="N" becomes a carousel once it holds more than N items.
  document.querySelectorAll('[data-auto-carousel]').forEach((grid) => {
    if (grid.children.length <= Number(grid.dataset.autoCarousel)) return;
    const root = document.createElement('div');
    root.className = 'carousel carousel--tiles';
    root.setAttribute('data-carousel', '');
    root.innerHTML = '<div class="carousel__viewport" tabindex="0" role="group" aria-roledescription="carousel" aria-label="' + (grid.getAttribute('aria-label') || 'Carousel') + '"><div class="carousel__track"></div></div>' +
      '<div class="carousel__nav"><button class="carousel__btn" type="button" data-dir="-1" aria-label="Previous"><span aria-hidden="true"></span></button><button class="carousel__btn carousel__btn--next" type="button" data-dir="1" aria-label="Next"><span aria-hidden="true"></span></button></div>';
    root.querySelector('.carousel__track').append(...grid.children);
    grid.replaceWith(root);
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 991.98px)');
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const viewport = root.querySelector('.carousel__viewport');
    const track = root.querySelector('.carousel__track');
    const prev = root.querySelector('[data-dir="-1"]');
    const next = root.querySelector('[data-dir="1"]');
    if (!viewport || !track) return;
    const step = () => {
      const first = track.children[0];
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return first.getBoundingClientRect().width + gap;
    };
    const maxScroll = () => viewport.scrollWidth - viewport.clientWidth;
    const update = () => {
      const overflow = maxScroll() > 4;
      root.classList.toggle('has-overflow', overflow);
      if (prev) prev.disabled = viewport.scrollLeft <= 2;
      if (next) next.disabled = viewport.scrollLeft >= maxScroll() - 2;
    };
    const go = (dir) => viewport.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    viewport.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    // auto-advance on small screens only; loops back to the first card
    let timer = null;
    let paused = false;
    const tick = () => {
      if (paused || !small.matches || reduce || maxScroll() <= 4) return;
      if (viewport.scrollLeft >= maxScroll() - 2) viewport.scrollTo({ left: 0, behavior: 'smooth' });
      else go(1);
    };
    const start = () => { if (!timer && !reduce) timer = setInterval(tick, 3200); };
    const stop = () => { clearInterval(timer); timer = null; };
    ['pointerenter', 'touchstart', 'focusin'].forEach((ev) => root.addEventListener(ev, () => { paused = true; }, { passive: true }));
    ['pointerleave', 'touchend', 'focusout'].forEach((ev) => root.addEventListener(ev, () => { paused = false; }, { passive: true }));
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
    update();
  });
}
