// Classic scripts (not ES modules) so the site also works when opened via file://.
initNavigation();
initStickyHeader();
initFooterAccordion();
initForms();
initAnimation();
initGallery();
initCarousels();

// Floating contact widgets: shown only once the hero has scrolled out of view.
(() => {
  const box = document.querySelector('.float-contact');
  if (!box) return;
  const hero = document.querySelector('.hero');
  const update = () => box.classList.toggle('is-on', !hero || hero.getBoundingClientRect().bottom < 80);
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
})();

// Preloader: stays at least 1.6 s from navigation start (so the animation reads), leaves on window load, always gone by 6 s.
(() => {
  const pre = document.querySelector('.preloader');
  if (!pre) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return pre.remove();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    pre.classList.add('is-exit');
    setTimeout(() => pre.remove(), 800);
  };
  const at = (ms, fn) => setTimeout(fn, Math.max(0, ms - performance.now()));
  if (document.readyState === 'complete') at(1600, finish); else addEventListener('load', () => at(1600, finish));
  at(6000, finish); // failsafe if a resource hangs
})();
