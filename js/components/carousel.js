// Generic scroll-snap carousel: prev/next arrows (hidden when nothing overflows),
// auto-advance on small screens, pause on hover/touch/focus, respects reduced motion.
function initCarousels() {
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
