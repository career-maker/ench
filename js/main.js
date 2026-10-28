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

// Preloader: once the page has loaded (min. 600 ms so it is seen), the green circle expands and the page appears.
(() => {
  const root = document.documentElement;
  const pre = document.querySelector('.preloader');
  if (!pre) return root.classList.remove('is-loading');
  const t0 = performance.now();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setTimeout(() => {
      pre.classList.add('is-expanding');
      setTimeout(() => { pre.classList.add('is-hidden'); root.classList.remove('is-loading'); }, 1100);
    }, Math.max(0, 600 - (performance.now() - t0)));
  };
  if (document.readyState === 'complete') finish(); else addEventListener('load', finish);
  setTimeout(finish, 5000); // failsafe if a resource hangs
})();
