// Classic scripts (not ES modules) so the site also works when opened via file://.
initNavigation();
initStickyHeader();
initFooterAccordion();
initForms();
initAnimation();
initGallery();
initCarousels();
initHeritageStyle();

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
